const PDFDocument = require("pdfkit");
const XLSX = require("xlsx");
const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const { getGroupGradebook, ensureGroupOwnership } = require("../services/group.service");
const { toNumber } = require("../utils/gradebook");

function buildRows(gradebook) {
  return gradebook.students.map((student) => {
    const row = {
      Estudiante: student.fullName,
      Identificacion: student.identification || "-"
    };

    gradebook.evaluations.forEach((evaluation) => {
      const grade = student.grades.find((item) => item.evaluationId === evaluation.id);
      row[`${evaluation.name} (${evaluation.percentage}%)`] = grade?.value ?? "";
    });

    row["Nota final"] = student.finalGrade;
    return row;
  });
}

async function exportExcel(req, res) {
  const gradebook = await getGroupGradebook(req.params.groupId, req.user.userId);
  const rows = buildRows(gradebook);

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);

  XLSX.utils.book_append_sheet(workbook, worksheet, "Notas");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="${gradebook.name}.xlsx"`);
  return res.send(buffer);
}

async function exportPdf(req, res) {
  const gradebook = await getGroupGradebook(req.params.groupId, req.user.userId);
  const doc = new PDFDocument({ margin: 40, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${gradebook.name}.pdf"`);

  doc.pipe(res);

  doc.fontSize(18).text(`Reporte de notas - ${gradebook.name}`);
  doc.moveDown();
  doc.fontSize(10).text(`Porcentaje total configurado: ${gradebook.totalPercentage}%`);
  doc.moveDown();

  gradebook.students.forEach((student) => {
    doc.fontSize(12).text(`${student.fullName} - Nota final: ${student.finalGrade}`);
    gradebook.evaluations.forEach((evaluation) => {
      const grade = student.grades.find((item) => item.evaluationId === evaluation.id);
      doc.fontSize(10).text(`  ${evaluation.name} (${evaluation.percentage}%): ${grade?.value ?? "Sin nota"}`);
    });
    doc.moveDown(0.5);
  });

  doc.end();
}

function parseEvaluationHeader(header) {
  const match = String(header || "")
    .trim()
    .match(/^(.*)\s+\(([\d.,]+)%\)$/);

  if (!match) {
    return null;
  }

  return {
    name: match[1].trim(),
    percentage: Number(match[2].replace(",", "."))
  };
}

async function importExcel(req, res) {
  const { groupId } = req.params;
  const teacherId = req.user.userId;

  await ensureGroupOwnership(groupId, teacherId);

  if (!req.file?.buffer) {
    throw new AppError("Debes adjuntar un archivo Excel", 400);
  }

  const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    throw new AppError("El archivo no contiene hojas legibles", 400);
  }

  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  if (!rows.length) {
    throw new AppError("El archivo no contiene datos para importar", 400);
  }

  const headers = Object.keys(rows[0]);
  const fixedHeaders = ["Estudiante", "Identificacion"];
  const evaluationHeaders = headers.filter(
    (header) => !fixedHeaders.includes(header) && String(header).trim().toLowerCase() !== "nota final"
  );

  if (!evaluationHeaders.length) {
    throw new AppError("El archivo debe incluir al menos una columna de evaluacion con formato Nombre (20%)", 400);
  }

  const parsedEvaluations = evaluationHeaders.map((header, index) => {
    const parsed = parseEvaluationHeader(header);

    if (!parsed) {
      throw new AppError(`La columna "${header}" no tiene el formato requerido Nombre (20%)`, 400);
    }

    return {
      ...parsed,
      order: index + 1
    };
  });

  const importedStudents = [];
  const createdEvaluations = [];

  await prisma.$transaction(async (tx) => {
    const existingEvaluations = await tx.evaluation.findMany({
      where: { groupId },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }]
    });

    let totalPercentage = existingEvaluations.reduce((acc, item) => acc + toNumber(item.percentage), 0);
    const evaluationMap = new Map(existingEvaluations.map((evaluation) => [evaluation.name.toLowerCase(), evaluation]));

    for (const incoming of parsedEvaluations) {
      const key = incoming.name.toLowerCase();
      let evaluation = evaluationMap.get(key);

      if (!evaluation) {
        if (totalPercentage + incoming.percentage > 100) {
          throw new AppError(
            `La importacion supera el 100% al intentar crear la evaluacion ${incoming.name}`,
            400
          );
        }

        evaluation = await tx.evaluation.create({
          data: {
            groupId,
            name: incoming.name,
            percentage: incoming.percentage,
            type: "CUSTOM",
            order: existingEvaluations.length + createdEvaluations.length + 1
          }
        });

        createdEvaluations.push(evaluation.name);
        evaluationMap.set(key, evaluation);
        totalPercentage += incoming.percentage;
      }
    }

    for (const row of rows) {
      const fullName = String(row.Estudiante || "").trim();
      const identification = String(row.Identificacion || "").trim();

      if (!fullName) {
        continue;
      }

      let student = null;

      if (identification) {
        student = await tx.student.findFirst({
          where: {
            groupId,
            identification
          }
        });
      }

      if (!student) {
        student = await tx.student.findFirst({
          where: {
            groupId,
            fullName
          }
        });
      }

      if (!student) {
        student = await tx.student.create({
          data: {
            groupId,
            fullName,
            identification: identification || null
          }
        });
      } else if (identification && !student.identification) {
        student = await tx.student.update({
          where: { id: student.id },
          data: { identification }
        });
      }

      importedStudents.push(student.id);

      for (const header of evaluationHeaders) {
        const parsedEvaluation = parseEvaluationHeader(header);
        const evaluation = evaluationMap.get(parsedEvaluation.name.toLowerCase());
        const rawValue = row[header];

        if (rawValue === "" || rawValue === null || rawValue === undefined) {
          continue;
        }

        const value = Number(String(rawValue).replace(",", "."));

        if (Number.isNaN(value) || value < 0 || value > 5) {
          throw new AppError(`La nota "${rawValue}" del estudiante ${fullName} esta fuera del rango 0.0 a 5.0`, 400);
        }

        await tx.grade.upsert({
          where: {
            studentId_evaluationId: {
              studentId: student.id,
              evaluationId: evaluation.id
            }
          },
          update: { value },
          create: {
            studentId: student.id,
            evaluationId: evaluation.id,
            value
          }
        });
      }
    }
  });

  return res.json({
    message: "Importacion completada correctamente",
    summary: {
      rowsProcessed: rows.length,
      studentsTouched: new Set(importedStudents).size,
      evaluationsCreated: createdEvaluations
    }
  });
}

module.exports = {
  exportExcel,
  exportPdf,
  importExcel
};
