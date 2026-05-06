import { useEffect, useMemo, useState } from 'react'
import SearchBar from './components/SearchBar.jsx'
import ChatViewer from './components/ChatViewer.jsx'

const API_URL = 'https://wmkiek2xldnbjg4aew6lrp7z3e0xlcka.lambda-url.us-east-1.on.aws/'

async function fetchChat(telefono) {
  const normalizedPhone = telefono.trim()
  const url = `${API_URL}?telefono=${encodeURIComponent(normalizedPhone)}`

  try {
    console.log('Fetching...')
    console.log('URL:', url)

    const response = await fetch(url)

    console.log('HTTP status:', response.status)

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`)
    }

    const data = await response.json()

    console.log('Response data:', data)

    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Fetch error:', error)
    return null
  }
}

function isInsideDateRange(message, startDate, endDate) {
  const messageDate = new Date(message.timestamp)

  if (Number.isNaN(messageDate.getTime())) {
    return false
  }

  if (startDate) {
    const start = new Date(`${startDate}T00:00:00`)
    if (messageDate < start) return false
  }

  if (endDate) {
    const end = new Date(`${endDate}T23:59:59.999`)
    if (messageDate > end) return false
  }

  return true
}

export default function App() {
  const [telefono, setTelefono] = useState('')
  const [searchedPhone, setSearchedPhone] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const filteredMessages = useMemo(() => {
    return messages
      .filter((message) => isInsideDateRange(message, startDate, endDate))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  }, [messages, startDate, endDate])

  useEffect(() => {
    if (!searchedPhone) return

    setLoading(true)
    setError('')

    async function loadMessages() {
      try {
        const data = await fetchChat(searchedPhone)

        if (data === null) {
          setMessages([])
          setError('Error conectando con el servidor')
          return
        }

        setMessages(Array.isArray(data) ? data : [])
      } catch (requestError) {
        console.error('Fetch error:', requestError)
        setMessages([])
        setError('Error conectando con el servidor')
      } finally {
        setLoading(false)
      }
    }

    loadMessages()
  }, [searchedPhone, retryCount])

  function handleSearch(event) {
    event.preventDefault()

    const normalizedPhone = telefono.trim()
    setHasSearched(true)

    if (!normalizedPhone) {
      setError('Ingresa un numero de telefono para buscar.')
      setMessages([])
      setSearchedPhone('')
      return
    }

    if (normalizedPhone === searchedPhone) {
      setRetryCount((currentCount) => currentCount + 1)
    } else {
      setSearchedPhone(normalizedPhone)
    }
  }

  function handleRetry() {
    if (!searchedPhone) return

    setRetryCount((currentCount) => currentCount + 1)
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
              {filteredMessages.length} mensajes
            </div>
          </div>
        </header>

        <SearchBar
          telefono={telefono}
          startDate={startDate}
          endDate={endDate}
          loading={loading}
          onTelefonoChange={setTelefono}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onSubmit={handleSearch}
        />

        {error && (
          <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>
            {searchedPhone && (
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
          messages={filteredMessages}
          loading={loading}
          hasSearched={hasSearched}
          telefono={searchedPhone}
        />
      </div>
    </main>
  )
}
