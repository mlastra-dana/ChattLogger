export default function SearchBar({
  telefono,
  startDate,
  endDate,
  loading,
  onTelefonoChange,
  onStartDateChange,
  onEndDateChange,
  onSubmit,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-4 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-xl shadow-stone-300/30 backdrop-blur md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-end md:p-5"
    >
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
          Telefono
        </span>
        <input
          type="tel"
          value={telefono}
          onChange={(event) => onTelefonoChange(event.target.value)}
          placeholder="584123456789"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-medium text-slate-950 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          autoComplete="tel"
        />
      </label>

      <label className="block">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
          Desde
        </span>
        <input
          type="date"
          value={startDate}
          onChange={(event) => onStartDateChange(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-medium text-slate-950 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        />
      </label>

      <label className="block">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
          Hasta
        </span>
        <input
          type="date"
          value={endDate}
          onChange={(event) => onEndDateChange(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-medium text-slate-950 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-12 items-center justify-center rounded-xl bg-emerald-600 px-6 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
      >
        {loading ? 'Buscando' : 'Buscar'}
      </button>
    </form>
  )
}
