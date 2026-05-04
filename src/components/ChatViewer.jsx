import { useEffect, useRef } from 'react'

function formatTimestamp(timestamp) {
  try {
    return new Intl.DateTimeFormat('es-VE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(timestamp))
  } catch {
    return timestamp
  }
}

function ChatBubble({ message }) {
  const isIncoming = message.tipo === 'entrada'

  return (
    <div className={`flex ${isIncoming ? 'justify-start' : 'justify-end'}`}>
      <article
        className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-md sm:max-w-[68%] ${
          isIncoming
            ? 'rounded-bl-md bg-[#d9fdd3] text-slate-950 shadow-emerald-950/10'
            : 'rounded-br-md bg-white text-slate-900 shadow-slate-900/10'
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-[15px] leading-6">{message.mensaje}</p>
        <time className="mt-2 block text-right text-[11px] font-medium text-slate-500">
          {formatTimestamp(message.timestamp)}
        </time>
      </article>
    </div>
  )
}

export default function ChatViewer({ messages, loading, hasSearched }) {
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  return (
    <section className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/70 bg-[#efeae2] shadow-2xl shadow-stone-400/30">
      <div className="border-b border-stone-200/80 bg-white/85 px-5 py-4 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-950">Conversacion</h2>
            <p className="text-sm text-slate-500">Historial ordenado por fecha</p>
          </div>
          <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.14)]" />
        </div>
      </div>

      <div className="h-[58vh] overflow-y-auto scroll-smooth bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.7),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.25)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.25)_50%,rgba(255,255,255,0.25)_75%,transparent_75%,transparent)] bg-[length:auto,32px_32px] px-4 py-5 sm:h-[62vh] sm:px-6">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="rounded-2xl bg-white/90 px-5 py-4 text-center shadow-lg">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
              <p className="mt-3 text-sm font-semibold text-slate-600">Cargando mensajes...</p>
            </div>
          </div>
        ) : messages.length > 0 ? (
          <div className="space-y-3">
            {messages.map((message, index) => (
              <ChatBubble
                key={`${message.timestamp}-${message.tipo}-${index}`}
                message={message}
              />
            ))}
            <div ref={endRef} />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-sm rounded-2xl bg-white/90 px-6 py-7 text-center shadow-lg">
              <p className="text-lg font-bold text-slate-950">No hay mensajes</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {hasSearched
                  ? 'Prueba otro telefono o ajusta el rango de fechas.'
                  : 'Ingresa un telefono para visualizar el historial.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
