import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "./App";

const authState = vi.hoisted(() => ({
  token: null
}));

vi.mock("./context/AuthContext", () => ({
  useAuth: () => authState
}));

vi.mock("./pages/LoginPage", () => ({
  default: () => <div>Inicia sesion</div>
}));

vi.mock("./pages/RegisterPage", () => ({
  default: () => <div>Crear cuenta</div>
}));

vi.mock("./pages/DashboardPage", () => ({
  default: () => <div>Gestion visual de notas y evaluaciones</div>
}));

test("redirects guests to login", () => {
  authState.token = null;

  render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByText(/inicia sesion/i)).toBeInTheDocument();
});

test("redirects authenticated users to dashboard", () => {
  authState.token = "demo-token";

  render(
    <MemoryRouter initialEntries={["/login"]}>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByText(/gestion visual de notas y evaluaciones/i)).toBeInTheDocument();
});
