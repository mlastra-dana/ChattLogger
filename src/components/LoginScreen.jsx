import { useState } from 'react'

function isQrCellActive(index) {
  const row = Math.floor(index / 37)
  const column = index % 37
  const finderStarts = [
    [0, 0],
    [0, 30],
    [30, 0],
  ]

  for (const [startRow, startColumn] of finderStarts) {
    const localRow = row - startRow
    const localColumn = column - startColumn

    if (localRow >= 0 && localRow < 7 && localColumn >= 0 && localColumn < 7) {
      return (
        localRow === 0 ||
        localRow === 6 ||
        localColumn === 0 ||
        localColumn === 6 ||
        (localRow >= 2 && localRow <= 4 && localColumn >= 2 && localColumn <= 4)
      )
    }
  }

  if (row === 6 || column === 6) {
    return (row + column) % 2 === 0
  }

  return (
    (row * 7 + column * 11 + row * column) % 10 < 5 ||
    (row + column * 3) % 11 === 0 ||
    (row * 5 + column) % 17 === 0
  )
}

function LoginQr() {
  return (
    <div className="relative grid h-80 w-80 grid-cols-[repeat(37,minmax(0,1fr))] gap-[2px] bg-white p-4 shadow-sm ring-1 ring-black/10">
      {Array.from({ length: 1369 }).map((_, index) => (
        <span
          key={index}
          className={isQrCellActive(index) ? 'bg-[#123c3a]' : 'bg-transparent'}
          aria-hidden="true"
        />
      ))}
      <div className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-black/10">
        <svg
          aria-hidden="true"
          className="h-14 w-14 text-[#123c3a]"
          viewBox="0 0 64 64"
          fill="none"
        >
          <path
            d="M18.3 49.7 20.9 40A18.7 18.7 0 1 1 29 45.9l-10.7 3.8Z"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path
            d="M25 22.5c1.6-1.5 3.3-.7 4.1 1l1.1 2.4c.5 1.1.2 2-.6 2.8l-1 1c1.8 3.4 4.3 5.9 7.7 7.6l1.1-1c.8-.8 1.8-1 2.9-.5l2.5 1.2c1.7.8 2.3 2.6.9 4.1-1.7 1.8-4.1 2.7-6.6 1.9-6.8-2.1-12.2-7.5-14.2-14.3-.7-2.4.2-4.7 2.1-6.2Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  )
}

export default function LoginScreen({ onLogin }) {
  const [keepSession, setKeepSession] = useState(true)

  function handleSubmit(event) {
    event.preventDefault()
    onLogin({ keepSession })
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#efeae2] px-4 py-8 text-slate-950 antialiased sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 top-0 h-56 bg-[#00a884]" aria-hidden="true" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col justify-center">
        <section className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl shadow-stone-500/20">
          <div className="grid gap-8 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-10">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Chat History Viewer
              </h1>

              <ol className="mt-8 space-y-5 text-base font-semibold text-slate-800">
                <li className="flex items-center gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-900 text-sm">
                    1
                  </span>
                  Inicia sesion en este navegador.
                </li>
                <li className="flex items-center gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-900 text-sm">
                    2
                  </span>
                  Ingresa un numero de telefono.
                </li>
                <li className="flex items-center gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-900 text-sm">
                    3
                  </span>
                  Consulta y exporta el historial.
                </li>
              </ol>

              <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={keepSession}
                    onChange={(event) => setKeepSession(event.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 accent-[#25d366]"
                  />
                  Mantener la sesion iniciada en este navegador
                </label>

                <button
                  type="submit"
                  className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#25d366] px-6 text-sm font-black uppercase tracking-[0.12em] text-[#063b33] shadow-lg shadow-emerald-900/15 transition hover:bg-[#20bd5a] sm:w-fit"
                >
                  Iniciar
                </button>
              </form>
            </div>

            <div className="hidden justify-center md:flex">
              <LoginQr />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
