import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPasswordRequest } from "../api/authApi";
import AuthShell from "../components/layout/AuthShell";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const data = await forgotPasswordRequest({ email });
      setMessage(data.debugResetUrl ? `${data.message} En desarrollo: ${data.debugResetUrl}` : data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "No fue posible procesar la solicitud");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Recupera tu acceso"
      subtitle="Escribe tu correo y te enviaremos un enlace para crear una nueva contrasena."
      footerText="Recordaste tu acceso?"
      footerLink="Volver al login"
      footerHref="/login"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          className="auth-input"
          placeholder="Correo electronico"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        {message ? <p className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{message}</p> : null}
        {error ? <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p> : null}
        <button className="auth-button" disabled={loading} type="submit">
          {loading ? "Enviando..." : "Enviar enlace"}
        </button>
      </form>
      <Link className="mt-4 inline-flex text-sm text-brand-300 hover:text-brand-200" to="/login">
        Volver a iniciar sesion
      </Link>
    </AuthShell>
  );
}

export default ForgotPasswordPage;
