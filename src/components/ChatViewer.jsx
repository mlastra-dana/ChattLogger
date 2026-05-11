import { useEffect, useRef } from 'react'

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
        className={`relative max-w-[70%] rounded-[18px] px-3.5 py-2.5 text-sm shadow-sm ring-1 ${
          isEntrada
            ? 'rounded-tr-sm border-r-4 border-emerald-500 bg-[#DCF8C6] text-slate-950 shadow-emerald-950/10 ring-emerald-900/5'
            : 'rounded-tl-sm border-l-4 border-slate-300 bg-white text-slate-900 shadow-slate-900/10 ring-slate-900/5'
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

export default function ChatViewer({ messages, loading, hasSearched, telefono }) {
  const endRef = useRef(null)
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
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  return (
    <section className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/70 bg-[#efeae2] shadow-2xl shadow-stone-400/30">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="border-b border-stone-200/80 bg-[#f0f2f5]/95 px-5 py-4 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white shadow-sm">
              WA
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-slate-950">
                {telefono || 'Conversacion'}
              </h2>
              <p className="text-sm text-slate-500">{safeMessages.length} mensajes</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={!canExport}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-white px-3 text-xs font-bold uppercase tracking-[0.08em] text-slate-700 shadow-sm ring-1 ring-black/5 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:shadow-none"
            >
              CSV
            </button>
            <button
              type="button"
              onClick={handleExportJson}
              disabled={!canExport}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-white px-3 text-xs font-bold uppercase tracking-[0.08em] text-slate-700 shadow-sm ring-1 ring-black/5 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:shadow-none"
            >
              JSON
            </button>
            <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm ring-1 ring-black/5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.14)]" />
              Monitor
            </div>
          </div>
        </div>
      </div>

      <div className="h-[58vh] overflow-y-auto scroll-smooth bg-[#ece5dd] bg-[radial-gradient(circle_at_16px_16px,rgba(255,255,255,0.38)_1.5px,transparent_1.5px),linear-gradient(135deg,rgba(255,255,255,0.24)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.24)_50%,rgba(255,255,255,0.24)_75%,transparent_75%,transparent)] bg-[length:34px_34px,42px_42px] px-4 py-5 sm:h-[62vh] sm:px-7">
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
