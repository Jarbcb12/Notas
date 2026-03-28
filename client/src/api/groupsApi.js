import http from "./http";

export async function getGroups() {
  const { data } = await http.get("/groups");
  return data;
}

export async function createGroup(payload) {
  const { data } = await http.post("/groups", payload);
  return data;
}

export async function updateGroup(groupId, payload) {
  const { data } = await http.put(`/groups/${groupId}`, payload);
  return data;
}

export async function deleteGroup(groupId) {
  await http.delete(`/groups/${groupId}`);
}

export async function getGroupDetail(groupId) {
  const { data } = await http.get(`/groups/${groupId}`);
  return data;
}

export async function createStudent(groupId, payload) {
  const { data } = await http.post(`/groups/${groupId}/students`, payload);
  return data;
}

export async function updateStudent(groupId, studentId, payload) {
  const { data } = await http.put(`/groups/${groupId}/students/${studentId}`, payload);
  return data;
}

export async function deleteStudent(groupId, studentId) {
  await http.delete(`/groups/${groupId}/students/${studentId}`);
}

export async function createEvaluation(groupId, payload) {
  const { data } = await http.post(`/groups/${groupId}/evaluations`, payload);
  return data;
}

export async function updateEvaluation(groupId, evaluationId, payload) {
  const { data } = await http.put(`/groups/${groupId}/evaluations/${evaluationId}`, payload);
  return data;
}

export async function deleteEvaluation(groupId, evaluationId) {
  await http.delete(`/groups/${groupId}/evaluations/${evaluationId}`);
}

export async function saveGrade(groupId, studentId, evaluationId, value) {
  const { data } = await http.put(`/groups/${groupId}/students/${studentId}/evaluations/${evaluationId}/grade`, {
    value
  });
  return data;
}

export async function downloadGroupExport(groupId, format) {
  const response = await http.get(`/groups/${groupId}/export/${format}`, {
    responseType: "blob"
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${groupId}.${format === "excel" ? "xlsx" : "pdf"}`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

export async function importGroupExcel(groupId, file) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await http.post(`/groups/${groupId}/import/excel`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  return data;
}
