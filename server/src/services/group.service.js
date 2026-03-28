const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const { calculateWeightedFinal, getPerformanceColor, toNumber } = require("../utils/gradebook");

async function ensureGroupOwnership(groupId, teacherId) {
  const group = await prisma.group.findFirst({
    where: { id: groupId, teacherId }
  });

  if (!group) {
    throw new AppError("Grupo no encontrado", 404);
  }

  return group;
}

async function ensureStudentOwnership(studentId, teacherId) {
  const student = await prisma.student.findFirst({
    where: {
      id: studentId,
      group: { teacherId }
    },
    include: { group: true }
  });

  if (!student) {
    throw new AppError("Estudiante no encontrado", 404);
  }

  return student;
}

async function ensureEvaluationOwnership(evaluationId, teacherId) {
  const evaluation = await prisma.evaluation.findFirst({
    where: {
      id: evaluationId,
      group: { teacherId }
    },
    include: { group: true }
  });

  if (!evaluation) {
    throw new AppError("Evaluacion no encontrada", 404);
  }

  return evaluation;
}

async function getGroupGradebook(groupId, teacherId) {
  await ensureGroupOwnership(groupId, teacherId);

  const group = await prisma.group.findFirst({
    where: { id: groupId, teacherId },
    include: {
      students: {
        orderBy: { fullName: "asc" },
        include: {
          grades: true
        }
      },
      evaluations: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }]
      }
    }
  });

  const totalPercentage = group.evaluations.reduce(
    (acc, evaluation) => acc + toNumber(evaluation.percentage),
    0
  );

  const students = group.students.map((student) => {
    const finalGrade = calculateWeightedFinal(student.grades, group.evaluations);

    return {
      id: student.id,
      fullName: student.fullName,
      identification: student.identification,
      grades: student.grades.map((grade) => ({
        id: grade.id,
        evaluationId: grade.evaluationId,
        value: Number(grade.value)
      })),
      finalGrade,
      performance: getPerformanceColor(finalGrade)
    };
  });

  return {
    id: group.id,
    name: group.name,
    description: group.description,
    totalPercentage: Number(totalPercentage.toFixed(2)),
    evaluationStatus: totalPercentage === 100 ? "complete" : totalPercentage < 100 ? "incomplete" : "overflow",
    evaluations: group.evaluations.map((evaluation) => ({
      id: evaluation.id,
      name: evaluation.name,
      percentage: Number(evaluation.percentage),
      type: evaluation.type,
      order: evaluation.order
    })),
    students
  };
}

async function validateEvaluationPercentage(groupId, nextPercentage, currentEvaluationId = null) {
  const evaluations = await prisma.evaluation.findMany({
    where: {
      groupId,
      ...(currentEvaluationId ? { id: { not: currentEvaluationId } } : {})
    }
  });

  const total = evaluations.reduce((acc, evaluation) => acc + toNumber(evaluation.percentage), 0);

  if (total + toNumber(nextPercentage) > 100) {
    throw new AppError("La suma de porcentajes no puede superar el 100%", 400);
  }
}

module.exports = {
  ensureGroupOwnership,
  ensureStudentOwnership,
  ensureEvaluationOwnership,
  getGroupGradebook,
  validateEvaluationPercentage
};
