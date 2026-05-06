import { useEffect, useState } from 'react'
import SearchBar from './components/SearchBar.jsx'
import ChatViewer from './components/ChatViewer.jsx'

const API_URL = 'https://wmkiek2xldnbjg4aew6lrp7z3e0xlcka.lambda-url.us-east-1.on.aws/'

export default function App() {
  const [phoneInput, setPhoneInput] = useState('')
  const [telefono, setTelefono] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const fetchMessages = async () => {
    setLoading(true)
    setError('')

    try {
      console.log('Fetching...')

      const res = await fetch(`${API_URL}?telefono=${telefono}`)

      console.log('HTTP status:', res.status)

      const data = await res.json()

      console.log('Response data:', data)

      setMessages(Array.isArray(data) ? [...data] : [])
    } catch (error) {
      console.error('Fetch error:', error)
      setError('Error conectando con el servidor')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!telefono) return
    fetchMessages()
  }, [telefono])

  function handleSearch(event) {
    event.preventDefault()

    const normalizedPhone = phoneInput.trim()
    setHasSearched(true)

    if (!normalizedPhone) {
      setError('Ingresa un numero de telefono para buscar.')
      setTelefono('')
      return
    }

    setTelefono(normalizedPhone)
  }

  function handleRetry() {
    if (!telefono || loading) return
    fetchMessages()
  }

  return (
    <main className="min-h-screen bg-[#ece5dd] px-4 py-6 text-slate-900 antialiased sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col gap-5">
        <header className="rounded-2xl border border-white/70 bg-white/85 px-5 py-5 shadow-xl shadow-stone-300/40 backdrop-blur md:px-7">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                WhatsApp
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                Chat History Viewer
              </h1>
            </div>

            <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-100">
              {messages.length} mensajes
            </div>
          </div>
        </header>

        <SearchBar
          telefono={phoneInput}
          startDate={startDate}
          endDate={endDate}
          loading={loading}
          onTelefonoChange={setPhoneInput}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onSubmit={handleSearch}
        />

        {error && (
          <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>
            {telefono && (
              <button
                type="button"
                onClick={handleRetry}
                disabled={loading}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-red-600 px-4 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                Reintentar
              </button>
            )}
          </div>
        )}

        <ChatViewer
          messages={messages}
          loading={loading}
          hasSearched={hasSearched}
          telefono={telefono}
        />
      </div>
    </main>
  )
}
