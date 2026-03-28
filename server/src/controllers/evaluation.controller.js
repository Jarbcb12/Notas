const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const {
  ensureEvaluationOwnership,
  ensureGroupOwnership,
  validateEvaluationPercentage
} = require("../services/group.service");

async function createEvaluation(req, res) {
  const { groupId } = req.params;
  const { name, percentage, type, order } = req.body;

  await ensureGroupOwnership(groupId, req.user.userId);

  if (!name?.trim()) {
    throw new AppError("El nombre de la evaluacion es obligatorio");
  }

  await validateEvaluationPercentage(groupId, percentage);

  const evaluation = await prisma.evaluation.create({
    data: {
      groupId,
      name: name.trim(),
      percentage,
      type: type || "CUSTOM",
      order: Number(order) || 0
    }
  });

  return res.status(201).json(evaluation);
}

async function updateEvaluation(req, res) {
  const { evaluationId } = req.params;
  const { name, percentage, type, order } = req.body;

  const evaluation = await ensureEvaluationOwnership(evaluationId, req.user.userId);
  await validateEvaluationPercentage(evaluation.groupId, percentage, evaluationId);

  const updated = await prisma.evaluation.update({
    where: { id: evaluationId },
    data: {
      name: name?.trim(),
      percentage,
      type,
      order: Number(order) || 0
    }
  });

  return res.json(updated);
}

async function deleteEvaluation(req, res) {
  await ensureEvaluationOwnership(req.params.evaluationId, req.user.userId);
  await prisma.evaluation.delete({ where: { id: req.params.evaluationId } });
  return res.status(204).send();
}

module.exports = {
  createEvaluation,
  updateEvaluation,
  deleteEvaluation
};
