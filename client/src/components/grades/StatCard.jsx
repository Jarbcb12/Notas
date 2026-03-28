function StatCard({ label, value, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700"
  };

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
      <p className="text-sm text-slate-500">{label}</p>
      <div className={`mt-4 inline-flex rounded-full px-4 py-2 text-lg font-semibold ${tones[tone] || tones.slate}`}>
        {value}
      </div>
    </article>
  );
}

export default StatCard;
