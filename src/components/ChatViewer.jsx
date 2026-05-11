import { useEffect, useRef, useState } from 'react'

function parseDate(timestamp) {
  const date = new Date(timestamp)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatTimestamp(timestamp) {
  const date = parseDate(timestamp)
  if (!date) return timestamp

  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(timestamp))
  } catch {
    return timestamp
  }
}

function sanitizeFilePart(value) {
  return String(value || 'chat')
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'chat'
}

function getMessageExportRow(msg) {
  const tipo = msg.tipo || msg.role || 'entrada'
  const mensaje = msg.mensaje || msg.content || ''

  return {
    timestamp: msg.timestamp || '',
    tipo,
    mensaje,
  }
}

function downloadFile({ content, filename, type }) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function escapeCsvValue(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`
}

function ChatBubble({ msg }) {
  const tipo = msg.tipo || msg.role || 'entrada'
  const isEntrada = tipo === 'entrada' || tipo === 'user'
  const text = msg.mensaje || msg.content || '[sin texto]'

  return (
    <div className={`mb-2 flex animate-[fadeIn_180ms_ease-out] ${isEntrada ? 'justify-end' : 'justify-start'}`}>
      <article
        className={`relative max-w-[82%] rounded-lg px-3.5 py-2 text-sm shadow-sm ring-1 sm:max-w-[70%] ${
          isEntrada
            ? 'rounded-tr-none bg-[#d9fdd3] text-slate-950 shadow-emerald-950/10 ring-emerald-900/5'
            : 'rounded-tl-none bg-white text-slate-900 shadow-slate-900/10 ring-slate-900/5'
        }`}
      >
        <p className="whitespace-pre-wrap break-words pr-1 text-[15px] leading-6">
          {text}
        </p>
        <div className="mt-1.5 flex items-center justify-end gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${isEntrada ? 'bg-emerald-600/50' : 'bg-slate-400/70'}`}
            aria-hidden="true"
          />
          <time className="text-xs font-medium text-slate-500">
            {formatTimestamp(msg.timestamp)}
          </time>
        </div>
      </article>
    </div>
  )
}

export default function ChatViewer({ messages, loading, hasSearched, telefono, onClear }) {
  const endRef = useRef(null)
  const [exportOpen, setExportOpen] = useState(false)
  const safeMessages = [...messages]
  const canExport = safeMessages.length > 0

  function handleExportJson() {
    if (!canExport) return

    const rows = safeMessages.map(getMessageExportRow)
    const filename = `chat-${sanitizeFilePart(telefono)}.json`

    downloadFile({
      content: JSON.stringify(rows, null, 2),
      filename,
      type: 'application/json;charset=utf-8',
    })
    setExportOpen(false)
  }

  function handleExportCsv() {
    if (!canExport) return

    const rows = safeMessages.map(getMessageExportRow)
    const header = ['timestamp', 'tipo', 'mensaje']
    const body = rows.map((row) =>
      header.map((field) => escapeCsvValue(row[field])).join(',')
    )
    const filename = `chat-${sanitizeFilePart(telefono)}.csv`

    downloadFile({
      content: [header.join(','), ...body].join('\n'),
      filename,
      type: 'text/csv;charset=utf-8',
    })
    setExportOpen(false)
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  return (
    <section className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-black/10 bg-[#efeae2] shadow-2xl shadow-stone-400/30">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="border-b border-[#075e54]/70 bg-[#075e54] px-4 py-3 text-white shadow-md sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#25d366] text-sm font-bold text-[#075e54] shadow-sm">
              WA
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-white">
                {telefono || 'Conversacion'}
              </h2>
              <p className="text-sm text-white/75">{safeMessages.length} mensajes</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onClear}
              disabled={!canExport}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-white/10 px-3.5 text-xs font-bold uppercase tracking-[0.08em] text-white ring-1 ring-white/15 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:text-white/35 disabled:ring-white/10"
            >
              Limpiar
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setExportOpen((current) => !current)}
                disabled={!canExport}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-white px-3.5 text-xs font-bold uppercase tracking-[0.08em] text-[#075e54] shadow-sm transition hover:bg-[#f0f2f5] disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/45 disabled:shadow-none"
                aria-expanded={exportOpen}
              >
                Exportar
              </button>

              {exportOpen && (
                <div className="absolute right-0 top-11 z-20 w-44 overflow-hidden rounded-lg bg-white py-1 text-sm text-slate-800 shadow-xl ring-1 ring-black/10">
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="block w-full px-4 py-2.5 text-left font-semibold transition hover:bg-[#f0f2f5]"
                  >
                    Descargar CSV
                  </button>
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="block w-full px-4 py-2.5 text-left font-semibold transition hover:bg-[#f0f2f5]"
                  >
                    Descargar JSON
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="h-[58vh] overflow-y-auto scroll-smooth bg-[#efeae2] bg-[radial-gradient(circle_at_16px_16px,rgba(255,255,255,0.32)_1.5px,transparent_1.5px),linear-gradient(135deg,rgba(255,255,255,0.22)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.22)_50%,rgba(255,255,255,0.22)_75%,transparent_75%,transparent)] bg-[length:34px_34px,42px_42px] px-4 py-5 sm:h-[62vh] sm:px-7">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="rounded-2xl bg-white/90 px-5 py-4 text-center shadow-lg">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
              <p className="mt-3 text-sm font-semibold text-slate-600">
                Cargando conversacion...
              </p>
            </div>
          </div>
        ) : safeMessages.length > 0 ? (
          <div className="flex flex-col gap-2">
            {safeMessages.map((msg, index) => (
              <ChatBubble
                key={`${msg.timestamp || 'sin-timestamp'}-${index}`}
                msg={msg}
              />
            ))}
            <div ref={endRef} />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-sm rounded-2xl bg-white/92 px-6 py-7 text-center shadow-xl ring-1 ring-black/5 backdrop-blur">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-lg font-bold text-emerald-700">
                WA
              </div>
              <p className="text-lg font-bold text-slate-950">
                {hasSearched
                  ? 'No hay actividad para este numero en el rango seleccionado'
                  : 'Busca una conversacion'}
              </p>
              {!hasSearched && (
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Ingresa un telefono para visualizar el historial.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
