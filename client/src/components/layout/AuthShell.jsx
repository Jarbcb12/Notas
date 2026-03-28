import { Link } from "react-router-dom";

function AuthShell({ title, subtitle, children, footerText, footerLink, footerHref }) {
  return (
    <div className="min-h-screen bg-slate-950 bg-hero px-4 py-10 font-body text-slate-100">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[32px] border border-white/10 bg-white/5 p-10 shadow-soft backdrop-blur">
          <span className="inline-flex rounded-full border border-brand-300/30 bg-brand-300/10 px-4 py-1 text-sm text-brand-100">
            Plataforma SaaS para docentes
          </span>
          <h1 className="mt-6 max-w-lg font-display text-4xl font-semibold leading-tight text-white">
            Gestiona notas con una experiencia mucho mas clara que una hoja de calculo tradicional.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
            Crea grupos, registra evaluaciones, escribe notas en una tabla interactiva y exporta reportes sin perder el control del promedio ponderado.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <article className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-2xl font-semibold text-white">100%</p>
              <p className="mt-2 text-sm text-slate-300">Validacion de ponderaciones</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-2xl font-semibold text-white">Autosave</p>
              <p className="mt-2 text-sm text-slate-300">Guardado rapido de notas</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-2xl font-semibold text-white">SaaS Ready</p>
              <p className="mt-2 text-sm text-slate-300">Arquitectura preparada para crecer</p>
            </article>
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-slate-900/80 p-8 shadow-soft">
          <h2 className="font-display text-3xl font-semibold text-white">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-6 text-sm text-slate-400">
            {footerText}{" "}
            <Link className="font-semibold text-brand-300 transition hover:text-brand-200" to={footerHref}>
              {footerLink}
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}

export default AuthShell;
