import { BookOpen, Plus, Trash2, Users } from "lucide-react";

function GroupSidebar({
  groups,
  selectedGroupId,
  onSelectGroup,
  onCreateGroup,
  onDeleteGroup,
  loading
}) {
  return (
    <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-600">Grupos</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink">Tus cursos activos</h2>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          onClick={onCreateGroup}
          type="button"
        >
          <Plus size={16} />
          Nuevo
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">Cargando grupos...</div>
        ) : groups.length ? (
          groups.map((group) => {
            const selected = group.id === selectedGroupId;

            return (
              <button
                key={group.id}
                type="button"
                onClick={() => onSelectGroup(group.id)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  selected
                    ? "border-brand-500 bg-brand-50 shadow-sm"
                    : "border-slate-200 bg-slate-50 hover:border-brand-200 hover:bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{group.name}</p>
                    <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <Users size={14} />
                      {group._count.students} estudiantes
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <BookOpen size={14} />
                      {group._count.evaluations} evaluaciones
                    </p>
                  </div>
                  <span
                    className="rounded-full p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteGroup(group.id);
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <Trash2 size={16} />
                  </span>
                </div>
              </button>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
            Aun no tienes grupos. Crea el primero para empezar a registrar estudiantes y notas.
          </div>
        )}
      </div>
    </aside>
  );
}

export default GroupSidebar;
