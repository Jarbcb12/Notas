import { useEffect, useRef, useState } from "react";
import { Save } from "lucide-react";

function getPerformanceClasses(value) {
  if (value <= 2.9) return "bg-rose-100 text-rose-700";
  if (value <= 4.0) return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

function GradeCell({ initialValue, onSave }) {
  const [value, setValue] = useState(initialValue ?? "");
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const timeoutRef = useRef();
  const lastSavedValueRef = useRef(initialValue ?? "");

  useEffect(() => {
    const normalized = initialValue ?? "";
    lastSavedValueRef.current = normalized;

    if (!isEditing) {
      setValue(normalized);
    }
  }, [initialValue]);

  async function commit() {
    clearTimeout(timeoutRef.current);

    if (value === "") return;

    const parsed = Number(value);

    if (Number.isNaN(parsed) || parsed < 0 || parsed > 5) {
      setValue(lastSavedValueRef.current);
      setIsEditing(false);
      return;
    }

    const normalizedParsed = String(parsed);
    const normalizedSaved = String(lastSavedValueRef.current ?? "");

    if (normalizedParsed === normalizedSaved) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    try {
      await onSave(parsed);
      lastSavedValueRef.current = parsed;
      setValue(parsed);
    } finally {
      setSaving(false);
      setIsEditing(false);
    }
  }

  return (
    <div className="relative">
      <input
        type="number"
        min="0"
        max="5"
        step="0.1"
        disabled={saving}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onFocus={() => setIsEditing(true)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
          }

          if (event.key === "Escape") {
            clearTimeout(timeoutRef.current);
            setValue(lastSavedValueRef.current);
            setIsEditing(false);
            event.currentTarget.blur();
          }
        }}
        className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-sm text-slate-700 outline-none transition focus:border-brand-400"
      />
      {saving ? <Save size={14} className="absolute -right-1 -top-1 text-brand-600" /> : null}
    </div>
  );
}

function GradebookTable({ evaluations, students, onSaveGrade, isSaving }) {
  if (!students.length || !evaluations.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500 shadow-soft">
        Agrega al menos un estudiante y una evaluacion para activar la tabla interactiva de notas.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead className="bg-slate-950 text-slate-100">
            <tr>
              <th className="sticky left-0 z-20 bg-slate-950 px-4 py-4 text-left text-sm font-semibold">Estudiante</th>
              {evaluations.map((evaluation) => (
                <th key={evaluation.id} className="min-w-36 px-4 py-4 text-center text-sm font-semibold">
                  <div>{evaluation.name}</div>
                  <div className="mt-1 text-xs font-normal text-slate-300">{evaluation.percentage}%</div>
                </th>
              ))}
              <th className="px-4 py-4 text-center text-sm font-semibold">Nota final</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="odd:bg-white even:bg-slate-50/70">
                <td className="sticky left-0 z-10 border-b border-slate-200 bg-inherit px-4 py-4">
                  <p className="font-semibold text-ink">{student.fullName}</p>
                  <p className="text-xs text-slate-500">{student.identification || "Sin identificacion"}</p>
                </td>
                {evaluations.map((evaluation) => {
                  const grade = student.grades.find((item) => item.evaluationId === evaluation.id);

                  return (
                    <td key={evaluation.id} className="border-b border-slate-200 px-4 py-4 text-center">
                      <GradeCell initialValue={grade?.value ?? ""} onSave={(value) => onSaveGrade(student.id, evaluation.id, value)} />
                    </td>
                  );
                })}
                <td className="border-b border-slate-200 px-4 py-4 text-center">
                  <span className={`inline-flex rounded-full px-3 py-2 text-sm font-semibold ${getPerformanceClasses(student.finalGrade)}`}>
                    {student.finalGrade.toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GradebookTable;
