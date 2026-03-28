function toNumber(value) {
  return Number(value || 0);
}

function calculateWeightedFinal(grades, evaluations) {
  const gradeMap = new Map(grades.map((grade) => [grade.evaluationId, toNumber(grade.value)]));

  const total = evaluations.reduce((acc, evaluation) => {
    const score = gradeMap.get(evaluation.id) || 0;
    return acc + score * (toNumber(evaluation.percentage) / 100);
  }, 0);

  return Number(total.toFixed(2));
}

function getPerformanceColor(grade) {
  if (grade <= 2.9) return "danger";
  if (grade <= 4.0) return "warning";
  return "success";
}

module.exports = {
  calculateWeightedFinal,
  getPerformanceColor,
  toNumber
};
