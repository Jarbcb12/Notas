import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resetPasswordRequest } from "../api/authApi";
import AuthShell from "../components/layout/AuthShell";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("El enlace de recuperacion es invalido o esta incompleto.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contrasenas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const data = await resetPasswordRequest({ token, password });
      setMessage(data.message);
      setPassword("");
      setConfirmPassword("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "No fue posible actualizar la contrasena");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Nueva contrasena"
      subtitle="Crea una contrasena segura para volver a entrar a tu cuenta."
      footerText="Ya terminaste?"
      footerLink="Ir al login"
      footerHref="/login"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          className="auth-input"
          placeholder="Nueva contrasena"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <input
          className="auth-input"
          placeholder="Confirmar contrasena"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
        {message ? <p className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{message}</p> : null}
        {error ? <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p> : null}
        <button className="auth-button" disabled={loading} type="submit">
          {loading ? "Actualizando..." : "Guardar nueva contrasena"}
        </button>
      </form>
      <Link className="mt-4 inline-flex text-sm text-brand-300 hover:text-brand-200" to="/login">
        Volver al login
      </Link>
    </AuthShell>
  );
}

export default ResetPasswordPage;
