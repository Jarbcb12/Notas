import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "../components/layout/AuthShell";
import { useAuth } from "../context/AuthContext";

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(form);
      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "No fue posible crear la cuenta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Crea tu cuenta"
      subtitle="Registra tu perfil como profesor y empieza a organizar tus grupos."
      footerText="Ya tienes cuenta?"
      footerLink="Iniciar sesion"
      footerHref="/login"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          className="auth-input"
          placeholder="Nombre completo"
          value={form.fullName}
          onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
        />
        <input
          className="auth-input"
          placeholder="Correo electronico"
          type="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
        />
        <input
          className="auth-input"
          placeholder="Contrasena segura"
          type="password"
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
        />
        {error ? <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p> : null}
        <button className="auth-button" disabled={loading} type="submit">
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>
    </AuthShell>
  );
}

export default RegisterPage;
