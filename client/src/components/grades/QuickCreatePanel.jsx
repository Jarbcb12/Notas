import { useState } from "react";

const initialStudent = { fullName: "", identification: "" };
const initialEvaluation = { name: "", percentage: "", type: "CUSTOM", order: 0 };

function QuickCreatePanel({ onCreateStudent, onCreateEvaluation }) {
  const [student, setStudent] = useState(initialStudent);
  const [evaluation, setEvaluation] = useState(initialEvaluation);

  async function handleStudentSubmit(event) {
    event.preventDefault();
    await onCreateStudent(student);
    setStudent(initialStudent);
  }

  async function handleEvaluationSubmit(event) {
    event.preventDefault();
    await onCreateEvaluation({
      ...evaluation,
      percentage: Number(evaluation.percentage),
      order: Number(evaluation.order)
    });
    setEvaluation(initialEvaluation);
  }

  return (
    <section className="grid gap-5 xl:grid-cols-2">
      <form className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft" onSubmit={handleStudentSubmit}>
        <h3 className="font-display text-xl font-semibold text-ink">Agregar estudiante</h3>
        <div className="mt-4 grid gap-3">
          <input
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-400 focus:bg-white"
            placeholder="Nombre completo"
            value={student.fullName}
            onChange={(event) => setStudent((current) => ({ ...current, fullName: event.target.value }))}
          />
          <input
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-400 focus:bg-white"
            placeholder="Identificacion opcional"
            value={student.identification}
            onChange={(event) => setStudent((current) => ({ ...current, identification: event.target.value }))}
          />
          <button className="rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800" type="submit">
            Guardar estudiante
          </button>
        </div>
      </form>

      <form className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft" onSubmit={handleEvaluationSubmit}>
        <h3 className="font-display text-xl font-semibold text-ink">Agregar evaluacion</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-400 focus:bg-white md:col-span-2"
            placeholder="Nombre de la actividad"
            value={evaluation.name}
            onChange={(event) => setEvaluation((current) => ({ ...current, name: event.target.value }))}
          />
          <input
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-400 focus:bg-white"
            placeholder="Porcentaje"
            type="number"
            min="0"
            max="100"
            value={evaluation.percentage}
            onChange={(event) => setEvaluation((current) => ({ ...current, percentage: event.target.value }))}
          />
          <select
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-400 focus:bg-white"
            value={evaluation.type}
            onChange={(event) => setEvaluation((current) => ({ ...current, type: event.target.value }))}
          >
            <option value="CUSTOM">Personalizada</option>
            <option value="HOMEWORK">Tarea</option>
            <option value="QUIZ">Quiz</option>
            <option value="EXAM">Parcial</option>
            <option value="PROJECT">Proyecto</option>
          </select>
          <button className="rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 md:col-span-2" type="submit">
            Guardar evaluacion
          </button>
        </div>
      </form>
    </section>
  );
}

export default QuickCreatePanel;
