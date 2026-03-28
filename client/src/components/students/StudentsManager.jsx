import { Pencil, Plus, Trash2 } from "lucide-react";

function StudentsManager({ students, onCreate, onEdit, onDelete }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-600">Estudiantes</p>
          <h3 className="mt-2 font-display text-xl font-semibold text-ink">Gestion del grupo</h3>
        </div>
        <button className="toolbar-button" onClick={onCreate} type="button">
          <Plus size={16} />
          Nuevo
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {students.length ? (
          students.map((student) => (
            <article
              key={student.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <div>
                <p className="font-semibold text-ink">{student.fullName}</p>
                <p className="text-sm text-slate-500">{student.identification || "Sin identificacion"}</p>
              </div>
              <div className="flex gap-2">
                <button className="icon-button" onClick={() => onEdit(student)} type="button">
                  <Pencil size={16} />
                </button>
                <button className="icon-button danger" onClick={() => onDelete(student)} type="button">
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            No hay estudiantes registrados en este grupo.
          </div>
        )}
      </div>
    </section>
  );
}

export default StudentsManager;
