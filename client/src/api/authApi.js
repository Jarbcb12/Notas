import http from "./http";

export async function loginRequest(payload) {
  const { data } = await http.post("/auth/login", payload);
  return data;
}

export async function registerRequest(payload) {
  const { data } = await http.post("/auth/register", payload);
  return data;
}

export async function meRequest() {
  const { data } = await http.get("/auth/me");
  return data;
}

export async function forgotPasswordRequest(payload) {
  const { data } = await http.post("/auth/forgot-password", payload);
  return data;
}

export async function resetPasswordRequest(payload) {
  const { data } = await http.post("/auth/reset-password", payload);
  return data;
}
