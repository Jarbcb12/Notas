import { ArrowDownAZ, FileSpreadsheet, FileText, Plus, Upload } from "lucide-react";

function GradebookToolbar({
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  onCreateStudent,
  onCreateEvaluation,
  onExport,
  onImport
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-1 flex-col gap-3 md:flex-row">
        <input
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-400 focus:bg-white"
          placeholder="Buscar estudiante por nombre o identificacion"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <div className="relative min-w-56">
          <ArrowDownAZ className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select
            className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-brand-400 focus:bg-white"
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value)}
          >
            <option value="name">Ordenar por nombre</option>
            <option value="final-desc">Nota final descendente</option>
            <option value="final-asc">Nota final ascendente</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button className="toolbar-button" onClick={onCreateStudent} type="button">
          <Plus size={16} />
          Estudiante
        </button>
        <button className="toolbar-button" onClick={onCreateEvaluation} type="button">
          <Plus size={16} />
          Evaluacion
        </button>
        <button className="toolbar-button" onClick={() => onExport("excel")} type="button">
          <FileSpreadsheet size={16} />
          Excel
        </button>
        <label className="toolbar-button cursor-pointer">
          <Upload size={16} />
          Importar
          <input
            className="hidden"
            type="file"
            accept=".xlsx,.xls"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onImport(file);
                event.target.value = "";
              }
            }}
          />
        </label>
        <button className="toolbar-button" onClick={() => onExport("pdf")} type="button">
          <FileText size={16} />
          PDF
        </button>
      </div>
    </div>
  );
}

export default GradebookToolbar;
