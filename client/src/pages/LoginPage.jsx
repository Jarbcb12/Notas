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
      <div className="mt-5 flex flex-col items-start gap-3 text-sm">
        <Link className="inline-flex text-slate-400 hover:text-slate-200" to="/forgot-password">
          Olvide mi contrasena
        </Link>
        <Link className="inline-flex text-brand-300 hover:text-brand-200" to="/register">
          Crear una cuenta nueva
        </Link>
      </div>
    </AuthShell>
  );
}

export default LoginPage;
