const { Resend } = require("resend");
const env = require("../config/env");

const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;

async function sendPasswordResetEmail({ to, fullName, resetUrl }) {
  if (!resend) {
    console.warn(`Resend no configurado. Link temporal para ${to}: ${resetUrl}`);
    return { skipped: true, resetUrl };
  }

  const { error } = await resend.emails.send({
    from: env.emailFrom,
    to: [to],
    subject: "Recupera tu acceso a Notas SaaS",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h2>Hola, ${fullName}</h2>
        <p>Recibimos una solicitud para restablecer tu contrasena en Notas SaaS.</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;background:#2f8b78;color:#ffffff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700;">
            Restablecer contrasena
          </a>
        </p>
        <p>Este enlace expira en 1 hora.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
      </div>
    `
  });

  if (error) {
    throw new Error(error.message || "No fue posible enviar el correo de recuperacion");
  }

  return { skipped: false };
}

module.exports = {
  sendPasswordResetEmail
};
