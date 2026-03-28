import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/layout/AuthShell";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form);
      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "No fue posible iniciar sesion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Inicia sesion"
      subtitle="Entra a tu panel para gestionar grupos, evaluaciones y notas."
      footerText="Aun no tienes cuenta?"
      footerLink="Crear cuenta"
      footerHref="/register"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          className="auth-input"
          placeholder="Correo electronico"
          type="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
        />
        <input
          className="auth-input"
          placeholder="Contrasena"
          type="password"
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
        />
        {error ? <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p> : null}
        <button className="auth-button" disabled={loading} type="submit">
          {loading ? "Ingresando..." : "Entrar al panel"}
        </button>
      </form>
      <p className="mt-6 text-xs text-slate-500">
        Demo sugerido: <span className="text-slate-300">profe@demo.com / Profesor123*</span>
      </p>
      <Link className="mt-4 inline-flex text-sm text-brand-300 hover:text-brand-200" to="/register">
        Crear una cuenta nueva
      </Link>
    </AuthShell>
  );
}

export default LoginPage;
