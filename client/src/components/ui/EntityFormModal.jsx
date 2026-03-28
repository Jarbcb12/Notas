import { useEffect, useState } from "react";
import Modal from "./Modal";

const emptyGroup = { name: "", description: "" };
const emptyStudent = { fullName: "", identification: "" };
const emptyEvaluation = { name: "", percentage: "", type: "CUSTOM", order: 0 };

function getInitialState(entityType, initialValues) {
  if (entityType === "group") return { ...emptyGroup, ...initialValues };
  if (entityType === "student") return { ...emptyStudent, ...initialValues };
  return { ...emptyEvaluation, ...initialValues };
}

function EntityFormModal({
  open,
  entityType,
  mode,
  title,
  description,
  initialValues,
  onClose,
  onSubmit
}) {
  const [form, setForm] = useState(getInitialState(entityType, initialValues));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(getInitialState(entityType, initialValues));
    setError("");
    setLoading(false);
  }, [entityType, initialValues, open]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload =
        entityType === "evaluation"
          ? {
              ...form,
              percentage: Number(form.percentage),
              order: Number(form.order) || 0
            }
          : form;

      await onSubmit(payload);
      onClose();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "No fue posible guardar los cambios");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} title={title} description={description} onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {entityType === "group" ? (
          <>
            <input
              className="modal-input"
              placeholder="Nombre del grupo"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
            <textarea
              className="modal-input min-h-28 resize-none"
              placeholder="Descripcion opcional"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            />
          </>
        ) : null}

        {entityType === "student" ? (
          <>
            <input
              className="modal-input"
              placeholder="Nombre completo"
              value={form.fullName}
              onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
            />
            <input
              className="modal-input"
              placeholder="Identificacion opcional"
              value={form.identification}
              onChange={(event) => setForm((current) => ({ ...current, identification: event.target.value }))}
            />
          </>
        ) : null}

        {entityType === "evaluation" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <input
              className="modal-input md:col-span-2"
              placeholder="Nombre de la actividad"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
            <input
              className="modal-input"
              placeholder="Porcentaje"
              type="number"
              min="0"
              max="100"
              value={form.percentage}
              onChange={(event) => setForm((current) => ({ ...current, percentage: event.target.value }))}
            />
            <input
              className="modal-input"
              placeholder="Orden"
              type="number"
              min="0"
              value={form.order}
              onChange={(event) => setForm((current) => ({ ...current, order: event.target.value }))}
            />
            <select
              className="modal-input md:col-span-2"
              value={form.type}
              onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
            >
              <option value="CUSTOM">Personalizada</option>
              <option value="HOMEWORK">Tarea</option>
              <option value="QUIZ">Quiz</option>
              <option value="EXAM">Parcial</option>
              <option value="PROJECT">Proyecto</option>
            </select>
          </div>
        ) : null}

        {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        <div className="flex justify-end gap-3">
          <button className="modal-secondary-button" onClick={onClose} type="button">
            Cancelar
          </button>
          <button className="modal-primary-button" disabled={loading} type="submit">
            {loading ? "Guardando..." : mode === "edit" ? "Guardar cambios" : "Crear"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default EntityFormModal;
