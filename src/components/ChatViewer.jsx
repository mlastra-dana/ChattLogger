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

function formatDateSeparator(timestamp) {
  const date = parseDate(timestamp)
  if (!date) return 'Fecha no disponible'

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function getDateKey(timestamp) {
  const date = parseDate(timestamp)
  if (!date) return 'unknown'

  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

function groupMessagesByDate(messages) {
  return messages.reduce((groups, message) => {
    const key = getDateKey(message.timestamp)
    const lastGroup = groups[groups.length - 1]

    if (lastGroup?.key === key) {
      lastGroup.messages.push(message)
      return groups
    }

    groups.push({
      key,
      label: formatDateSeparator(message.timestamp),
      messages: [message],
    })

    return groups
  }, [])
}

function ChatBubble({ message }) {
  const isIncoming = message.tipo === 'entrada'

  return (
    <div className={`flex animate-[fadeIn_180ms_ease-out] ${isIncoming ? 'justify-start' : 'justify-end'}`}>
      <article
        className={`relative max-w-[70%] rounded-[18px] px-3.5 py-2.5 shadow-sm ring-1 ${
          isIncoming
            ? 'rounded-tl-sm border-l-4 border-emerald-500 bg-[#DCF8C6] text-slate-950 shadow-emerald-950/10 ring-emerald-900/5'
            : 'rounded-tr-sm border-r-4 border-slate-300 bg-white text-slate-900 shadow-slate-900/10 ring-slate-900/5'
        }`}
      >
        <p className="whitespace-pre-wrap break-words pr-1 text-[15px] leading-6">
          {message.mensaje}
        </p>
        <div className="mt-1.5 flex items-center justify-end gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${isIncoming ? 'bg-emerald-600/50' : 'bg-slate-400/70'}`}
            aria-hidden="true"
          />
          <time className="text-xs font-medium text-slate-500">
            {formatTimestamp(message.timestamp)}
          </time>
        </div>
      </article>
    </div>
  )
}

function DateSeparator({ label }) {
  return (
    <div className="sticky top-3 z-10 flex justify-center py-2">
      <span className="rounded-full bg-white/85 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-slate-500 shadow-sm ring-1 ring-black/5 backdrop-blur">
        {label}
      </span>
    </div>
  )
}

export default function ChatViewer({ messages, loading, hasSearched, telefono }) {
  const endRef = useRef(null)
  const groupedMessages = groupMessagesByDate(messages)

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
              <p className="text-sm text-slate-500">{messages.length} mensajes</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm ring-1 ring-black/5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.14)]" />
            Monitor
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
        ) : messages.length > 0 ? (
          <div className="flex flex-col gap-2">
            {groupedMessages.map((group) => (
              <div key={group.key} className="flex flex-col gap-2.5">
                <DateSeparator label={group.label} />
                {group.messages.map((message, index) => (
                  <ChatBubble
                    key={`${message.timestamp}-${message.tipo}-${index}`}
                    message={message}
                  />
                ))}
              </div>
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
