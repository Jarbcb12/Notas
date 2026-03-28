const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const { ensureGroupOwnership, getGroupGradebook } = require("../services/group.service");

async function listGroups(req, res) {
  const groups = await prisma.group.findMany({
    where: { teacherId: req.user.userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          students: true,
          evaluations: true
        }
      }
    }
  });

  return res.json(groups);
}

async function createGroup(req, res) {
  const { name, description } = req.body;

  if (!name?.trim()) {
    throw new AppError("El nombre del grupo es obligatorio");
  }

  const group = await prisma.group.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      teacherId: req.user.userId
    }
  });

  return res.status(201).json(group);
}

async function updateGroup(req, res) {
  await ensureGroupOwnership(req.params.groupId, req.user.userId);

  const { name, description } = req.body;

  const group = await prisma.group.update({
    where: { id: req.params.groupId },
    data: {
      name: name?.trim(),
      description: description?.trim() || null
    }
  });

  return res.json(group);
}

async function deleteGroup(req, res) {
  await ensureGroupOwnership(req.params.groupId, req.user.userId);

  await prisma.group.delete({ where: { id: req.params.groupId } });

  return res.status(204).send();
}

async function getGroupDetail(req, res) {
  const data = await getGroupGradebook(req.params.groupId, req.user.userId);
  return res.json(data);
}

module.exports = {
  listGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupDetail
};
