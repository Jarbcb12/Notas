const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const { ensureEvaluationOwnership, ensureStudentOwnership, getGroupGradebook } = require("../services/group.service");

async function upsertGrade(req, res) {
  const { studentId, evaluationId } = req.params;
  const { value } = req.body;

  if (value === undefined || value === null || Number(value) < 0 || Number(value) > 5) {
    throw new AppError("La nota debe estar entre 0.0 y 5.0");
  }

  const student = await ensureStudentOwnership(studentId, req.user.userId);
  const evaluation = await ensureEvaluationOwnership(evaluationId, req.user.userId);

  if (student.groupId !== evaluation.groupId) {
    throw new AppError("La evaluacion y el estudiante no pertenecen al mismo grupo");
  }

  const grade = await prisma.grade.upsert({
    where: {
      studentId_evaluationId: {
        studentId,
        evaluationId
      }
    },
    update: { value: Number(value) },
    create: { studentId, evaluationId, value: Number(value) }
  });

  const gradebook = await getGroupGradebook(student.groupId, req.user.userId);
  const updatedStudent = gradebook.students.find((item) => item.id === studentId);

  return res.json({
    grade: {
      id: grade.id,
      value: Number(grade.value)
    },
    student: updatedStudent
  });
}

module.exports = {
  upsertGrade
};
