const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const { ensureGroupOwnership, ensureStudentOwnership } = require("../services/group.service");

async function createStudent(req, res) {
  const { fullName, identification } = req.body;
  const { groupId } = req.params;

  await ensureGroupOwnership(groupId, req.user.userId);

  if (!fullName?.trim()) {
    throw new AppError("El nombre del estudiante es obligatorio");
  }

  const student = await prisma.student.create({
    data: {
      fullName: fullName.trim(),
      identification: identification?.trim() || null,
      groupId
    }
  });

  return res.status(201).json(student);
}

async function updateStudent(req, res) {
  const { studentId } = req.params;
  const { fullName, identification } = req.body;

  await ensureStudentOwnership(studentId, req.user.userId);

  const student = await prisma.student.update({
    where: { id: studentId },
    data: {
      fullName: fullName?.trim(),
      identification: identification?.trim() || null
    }
  });

  return res.json(student);
}

async function deleteStudent(req, res) {
  await ensureStudentOwnership(req.params.studentId, req.user.userId);

  await prisma.student.delete({ where: { id: req.params.studentId } });

  return res.status(204).send();
}

module.exports = {
  createStudent,
  updateStudent,
  deleteStudent
};
