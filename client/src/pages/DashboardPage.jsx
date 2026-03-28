import { useEffect, useMemo, useState } from "react";
import { LogOut, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  createEvaluation,
  createGroup,
  createStudent,
  deleteGroup,
  deleteEvaluation,
  deleteStudent,
  downloadGroupExport,
  getGroupDetail,
  getGroups,
  importGroupExcel,
  saveGrade,
  updateEvaluation,
  updateGroup,
  updateStudent
} from "../api/groupsApi";
import GradebookTable from "../components/grades/GradebookTable";
import GradebookToolbar from "../components/grades/GradebookToolbar";
import EvaluationsManager from "../components/grades/EvaluationsManager";
import StatCard from "../components/grades/StatCard";
import GroupSidebar from "../components/groups/GroupSidebar";
import StudentsManager from "../components/students/StudentsManager";
import EntityFormModal from "../components/ui/EntityFormModal";
import { useAuth } from "../context/AuthContext";

function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [groupDetail, setGroupDetail] = useState(null);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [savingGrade, setSavingGrade] = useState(false);
  const [modalState, setModalState] = useState({ open: false, entityType: "group", mode: "create", data: null });
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      loadGroupDetail(selectedGroupId);
    } else {
      setGroupDetail(null);
    }
  }, [selectedGroupId]);

  async function loadGroups() {
    setLoadingGroups(true);
    try {
      const data = await getGroups();
      setGroups(data);

      if (!selectedGroupId && data.length) {
        setSelectedGroupId(data[0].id);
      }

      if (selectedGroupId && !data.find((item) => item.id === selectedGroupId)) {
        setSelectedGroupId(data[0]?.id || null);
      }
    } finally {
      setLoadingGroups(false);
    }
  }

  async function loadGroupDetail(groupId) {
    setLoadingDetail(true);
    try {
      const data = await getGroupDetail(groupId);
      setGroupDetail(data);
    } finally {
      setLoadingDetail(false);
    }
  }

  async function handleCreateGroup() {
    setModalState({ open: true, entityType: "group", mode: "create", data: null });
  }

  async function handleSubmitGroup(payload) {
    let targetGroupId = selectedGroupId;

    if (modalState.mode === "edit" && modalState.data?.id) {
      const updatedGroup = await updateGroup(modalState.data.id, payload);
      targetGroupId = updatedGroup.id;
    } else {
      const createdGroup = await createGroup(payload);
      targetGroupId = createdGroup.id;
      setSelectedGroupId(createdGroup.id);
    }

    await loadGroups();
    if (targetGroupId) {
      await loadGroupDetail(targetGroupId);
    }
    setFeedback({ type: "success", message: "Grupo guardado correctamente." });
  }

  async function handleDeleteGroup(groupId) {
    const confirmed = window.confirm("Se eliminara el grupo y todos sus datos. Deseas continuar?");
    if (!confirmed) return;
    await deleteGroup(groupId);
    await loadGroups();
    setFeedback({ type: "success", message: "Grupo eliminado correctamente." });
  }

  async function handleCreateStudent(payload) {
    if (!selectedGroupId) return;
    await createStudent(selectedGroupId, payload);
    await Promise.all([loadGroups(), loadGroupDetail(selectedGroupId)]);
    setFeedback({ type: "success", message: "Estudiante guardado correctamente." });
  }

  async function handleUpdateStudent(payload) {
    if (!selectedGroupId || !modalState.data?.id) return;
    await updateStudent(selectedGroupId, modalState.data.id, payload);
    await Promise.all([loadGroups(), loadGroupDetail(selectedGroupId)]);
    setFeedback({ type: "success", message: "Estudiante actualizado correctamente." });
  }

  async function handleDeleteStudent(student) {
    if (!selectedGroupId) return;
    const confirmed = window.confirm(`Se eliminara a ${student.fullName}. Deseas continuar?`);
    if (!confirmed) return;
    await deleteStudent(selectedGroupId, student.id);
    await Promise.all([loadGroups(), loadGroupDetail(selectedGroupId)]);
    setFeedback({ type: "success", message: "Estudiante eliminado correctamente." });
  }

  async function handleCreateEvaluation(payload) {
    if (!selectedGroupId) return;
    await createEvaluation(selectedGroupId, payload);
    await Promise.all([loadGroups(), loadGroupDetail(selectedGroupId)]);
    setFeedback({ type: "success", message: "Evaluacion guardada correctamente." });
  }

  async function handleUpdateEvaluation(payload) {
    if (!selectedGroupId || !modalState.data?.id) return;
    await updateEvaluation(selectedGroupId, modalState.data.id, payload);
    await Promise.all([loadGroups(), loadGroupDetail(selectedGroupId)]);
    setFeedback({ type: "success", message: "Evaluacion actualizada correctamente." });
  }

  async function handleDeleteEvaluation(evaluation) {
    if (!selectedGroupId) return;
    const confirmed = window.confirm(`Se eliminara la evaluacion ${evaluation.name}. Deseas continuar?`);
    if (!confirmed) return;
    await deleteEvaluation(selectedGroupId, evaluation.id);
    await Promise.all([loadGroups(), loadGroupDetail(selectedGroupId)]);
    setFeedback({ type: "success", message: "Evaluacion eliminada correctamente." });
  }

  async function handleSaveGrade(studentId, evaluationId, value) {
    if (!selectedGroupId) return;

    setSavingGrade(true);
    try {
      const response = await saveGrade(selectedGroupId, studentId, evaluationId, value);
      setGroupDetail((current) => {
        if (!current) return current;

        return {
          ...current,
          students: current.students.map((student) =>
            student.id === studentId ? response.student : student
          )
        };
      });
    } finally {
      setSavingGrade(false);
    }
  }

  async function handleExport(format) {
    if (!selectedGroupId) return;
    await downloadGroupExport(selectedGroupId, format);
    setFeedback({ type: "success", message: `Exportacion ${format.toUpperCase()} iniciada.` });
  }

  async function handleImport(file) {
    if (!selectedGroupId) return;

    try {
      const response = await importGroupExcel(selectedGroupId, file);
      await Promise.all([loadGroups(), loadGroupDetail(selectedGroupId)]);
      setFeedback({
        type: "success",
        message: `${response.message} Filas: ${response.summary.rowsProcessed}. Estudiantes afectados: ${response.summary.studentsTouched}.`
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.response?.data?.message || "No fue posible importar el archivo."
      });
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function closeModal() {
    setModalState((current) => ({ ...current, open: false, data: null }));
  }

  function openEditGroup() {
    if (!groupDetail) return;
    setModalState({
      open: true,
      entityType: "group",
      mode: "edit",
      data: {
        id: groupDetail.id,
        name: groupDetail.name,
        description: groupDetail.description || ""
      }
    });
  }

  const filteredStudents = useMemo(() => {
    if (!groupDetail) return [];

    const normalizedSearch = search.toLowerCase().trim();

    let items = groupDetail.students.filter((student) => {
      if (!normalizedSearch) return true;

      return (
        student.fullName.toLowerCase().includes(normalizedSearch) ||
        (student.identification || "").toLowerCase().includes(normalizedSearch)
      );
    });

    if (sortBy === "final-desc") {
      items = [...items].sort((a, b) => b.finalGrade - a.finalGrade);
    } else if (sortBy === "final-asc") {
      items = [...items].sort((a, b) => a.finalGrade - b.finalGrade);
    } else {
      items = [...items].sort((a, b) => a.fullName.localeCompare(b.fullName));
    }

    return items;
  }, [groupDetail, search, sortBy]);

  const statusTone =
    groupDetail?.evaluationStatus === "complete"
      ? "success"
      : groupDetail?.evaluationStatus === "overflow"
        ? "danger"
        : "warning";

  return (
    <div className="min-h-screen bg-[#f4f7f6] px-4 py-6 font-body text-slate-800">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-[32px] bg-ink bg-hero p-6 text-white shadow-soft lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-brand-200">Panel docente</p>
            <h1 className="mt-3 font-display text-3xl font-semibold">Gestion visual de notas y evaluaciones</h1>
            <p className="mt-2 text-sm text-slate-300">
              Bienvenido, {user?.fullName}. Administra tus grupos con una experiencia mas moderna que Excel.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="header-button" onClick={() => selectedGroupId && loadGroupDetail(selectedGroupId)} type="button">
              <RefreshCw size={16} />
              Actualizar
            </button>
            <button className="header-button" onClick={handleLogout} type="button">
              <LogOut size={16} />
              Cerrar sesion
            </button>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
          <GroupSidebar
            groups={groups}
            selectedGroupId={selectedGroupId}
            onSelectGroup={setSelectedGroupId}
            onCreateGroup={handleCreateGroup}
            onDeleteGroup={handleDeleteGroup}
            loading={loadingGroups}
          />

          <main className="space-y-6">
            {groupDetail ? (
              <>
                <section className="grid gap-4 md:grid-cols-3">
                  <StatCard label="Grupo activo" value={groupDetail.name} />
                  <StatCard label="Porcentaje configurado" value={`${groupDetail.totalPercentage}%`} tone={statusTone} />
                  <StatCard label="Estado de la ponderacion" value={groupDetail.evaluationStatus} tone={statusTone} />
                </section>

                <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-600">Resumen del grupo</p>
                      <h2 className="mt-2 font-display text-2xl font-semibold text-ink">{groupDetail.name}</h2>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                        {groupDetail.description || "Agrega una descripcion para identificar mejor este curso, periodo o jornada academica."}
                      </p>
                    </div>
                    <button className="toolbar-button" onClick={openEditGroup} type="button">
                      Editar grupo
                    </button>
                  </div>
                </section>

                <GradebookToolbar
                  search={search}
                  onSearchChange={setSearch}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  onCreateStudent={() => setModalState({ open: true, entityType: "student", mode: "create", data: null })}
                  onCreateEvaluation={() => setModalState({ open: true, entityType: "evaluation", mode: "create", data: null })}
                  onExport={handleExport}
                  onImport={handleImport}
                />

                {feedback ? (
                  <div
                    className={`rounded-[28px] border p-4 text-sm shadow-soft ${
                      feedback.type === "success"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-rose-200 bg-rose-50 text-rose-700"
                    }`}
                  >
                    {feedback.message}
                  </div>
                ) : null}

                {groupDetail.totalPercentage !== 100 ? (
                  <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow-soft">
                    La suma actual de evaluaciones es {groupDetail.totalPercentage}%. Para un promedio final totalmente consistente, completa el 100% del curso.
                  </div>
                ) : null}

                <div className="rounded-[28px] border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500 shadow-soft">
                  Importacion Excel: usa columnas <strong>Estudiante</strong> y <strong>Identificacion</strong>, y luego una columna por evaluacion con formato <strong>Quiz 1 (20%)</strong>.
                  Puedes exportar a Excel, editarlo y volver a importarlo para cargar notas masivamente.
                </div>

                <section className="grid gap-6 xl:grid-cols-2">
                  <StudentsManager
                    students={groupDetail.students}
                    onCreate={() => setModalState({ open: true, entityType: "student", mode: "create", data: null })}
                    onEdit={(student) => setModalState({ open: true, entityType: "student", mode: "edit", data: student })}
                    onDelete={handleDeleteStudent}
                  />
                  <EvaluationsManager
                    evaluations={groupDetail.evaluations}
                    onCreate={() => setModalState({ open: true, entityType: "evaluation", mode: "create", data: null })}
                    onEdit={(evaluation) => setModalState({ open: true, entityType: "evaluation", mode: "edit", data: evaluation })}
                    onDelete={handleDeleteEvaluation}
                  />
                </section>

                {loadingDetail ? (
                  <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-soft">
                    Cargando tabla de notas...
                  </div>
                ) : (
                  <GradebookTable
                    evaluations={groupDetail.evaluations}
                    students={filteredStudents}
                    onSaveGrade={handleSaveGrade}
                    isSaving={savingGrade}
                  />
                )}
              </>
            ) : (
              <section className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-slate-500 shadow-soft">
                Selecciona un grupo o crea uno nuevo para empezar.
              </section>
            )}
          </main>
        </div>
      </div>

      <EntityFormModal
        open={modalState.open}
        entityType={modalState.entityType}
        mode={modalState.mode}
        initialValues={modalState.data}
        onClose={closeModal}
        title={
          modalState.entityType === "group"
            ? modalState.mode === "edit"
              ? "Editar grupo"
              : "Crear grupo"
            : modalState.entityType === "student"
              ? modalState.mode === "edit"
                ? "Editar estudiante"
                : "Crear estudiante"
              : modalState.mode === "edit"
                ? "Editar evaluacion"
                : "Crear evaluacion"
        }
        description={
          modalState.entityType === "group"
            ? "Organiza mejor tus cursos con nombre y descripcion."
            : modalState.entityType === "student"
              ? "Registra o corrige los datos del estudiante dentro del grupo actual."
              : "Define la actividad, su peso porcentual y el orden en la tabla."
        }
        onSubmit={(payload) => {
          if (modalState.entityType === "group") return handleSubmitGroup(payload);
          if (modalState.entityType === "student") {
            return modalState.mode === "edit" ? handleUpdateStudent(payload) : handleCreateStudent(payload);
          }
          return modalState.mode === "edit" ? handleUpdateEvaluation(payload) : handleCreateEvaluation(payload);
        }}
      />
    </div>
  );
}

export default DashboardPage;
