import { useEffect, useState } from 'react'
import SearchBar from './components/SearchBar.jsx'
import ChatViewer from './components/ChatViewer.jsx'
import LoginScreen from './components/LoginScreen.jsx'
import { API_URL } from './config/api.js'

const CLEARED_UNTIL_STORAGE_KEY = 'chat-history-viewer-cleared-until'
const SESSION_STORAGE_KEY = 'chat-history-viewer-session-started'

function getStoredClearedUntil() {
  try {
    const storedValue = window.localStorage.getItem(CLEARED_UNTIL_STORAGE_KEY)
    const parsedValue = JSON.parse(storedValue || '{}')

    return parsedValue && typeof parsedValue === 'object' ? parsedValue : {}
  } catch {
    return {}
  }
}

function saveStoredClearedUntil(value) {
  window.localStorage.setItem(CLEARED_UNTIL_STORAGE_KEY, JSON.stringify(value))
}

function getTimestampTime(timestamp) {
  const time = new Date(timestamp).getTime()
  return Number.isNaN(time) ? 0 : time
}

function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function isFetchNetworkError(error) {
  return error instanceof TypeError && error.message === 'Failed to fetch'
}

async function fetchWithRetry(url, options = {}) {
  const maxAttempts = options.maxAttempts || 3
  const retryDelayMs = options.retryDelayMs || 800

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await fetch(url)
    } catch (error) {
      const shouldRetry = isFetchNetworkError(error) && attempt < maxAttempts

      if (!shouldRetry) {
        throw error
      }

      await sleep(retryDelayMs * attempt)
    }
  }
}

export default function App() {
  const [sessionStarted, setSessionStarted] = useState(
    () => window.localStorage.getItem(SESSION_STORAGE_KEY) === 'true'
  )
  const [phoneInput, setPhoneInput] = useState('')
  const [telefono, setTelefono] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [clearedUntilByPhone, setClearedUntilByPhone] = useState(getStoredClearedUntil)

  const fetchMessages = async (telefonoActual) => {
    if (!telefonoActual || loading) return

    setLoaded(true)
    setLoading(true)
    setError('')

    try {
      if (!API_URL) {
        throw new Error('VITE_API_URL no esta configurada')
      }

      console.log('Fetching...')

      const queryParams = new URLSearchParams({ telefono: telefonoActual })
      const res = await fetchWithRetry(`${API_URL}?${queryParams.toString()}`)

      console.log('HTTP status:', res.status)

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data = await res.json()

      console.log('Response data:', data)

      const mensajesTransformados = Array.isArray(data)
        ? data
            .map((item) => ({
              tipo: item.tipo,
              mensaje: item.mensaje,
              role: item.tipo,
              content: item.mensaje,
              timestamp: item.timestamp,
            }))
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        : []
      const clearedUntil = clearedUntilByPhone[telefonoActual] || 0
      const mensajesVisibles = mensajesTransformados.filter(
        (message) => getTimestampTime(message.timestamp) > clearedUntil
      )

      setMessages(mensajesVisibles)
    } catch (error) {
      console.error('Fetch error:', error)
      setLoaded(false)
      setError(
        isFetchNetworkError(error)
          ? 'No se pudo conectar con el servidor. Intenta de nuevo en unos segundos.'
          : 'Error consultando el historial'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!telefono || loaded) return
    fetchMessages(telefono)
  }, [telefono])

  function handleSearch(event) {
    event.preventDefault()

    if (loading) return

    const normalizedPhone = phoneInput.trim()
    setHasSearched(true)

    if (!normalizedPhone) {
      setError('Ingresa un numero de telefono para buscar.')
      setTelefono('')
      setMessages([])
      setLoaded(false)
      return
    }

    if (normalizedPhone === telefono) {
      fetchMessages(normalizedPhone)
      return
    }

    setLoaded(false)
    setTelefono(normalizedPhone)
  }

  function handleRetry() {
    if (!telefono || loading) return
    setLoaded(false)
    fetchMessages(telefono)
  }

  function handleClearChat() {
    if (telefono && messages.length > 0) {
      const latestVisibleTimestamp = Math.max(
        ...messages.map((message) => getTimestampTime(message.timestamp))
      )
      const updatedClearedUntil = {
        ...clearedUntilByPhone,
        [telefono]: latestVisibleTimestamp,
      }

      setClearedUntilByPhone(updatedClearedUntil)
      saveStoredClearedUntil(updatedClearedUntil)
    }

    setMessages([])
  }

  function handleLogin({ keepSession }) {
    if (keepSession) {
      window.localStorage.setItem(SESSION_STORAGE_KEY, 'true')
    }

    setSessionStarted(true)
  }

  function handleLogout() {
    window.localStorage.removeItem(SESSION_STORAGE_KEY)
    setSessionStarted(false)
    setPhoneInput('')
    setTelefono('')
    setMessages([])
    setError('')
    setHasSearched(false)
    setLoaded(false)
  }

  if (!sessionStarted) {
    return <LoginScreen onLogin={handleLogin} />
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

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-[#075e54] px-5 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-sm transition hover:bg-[#064b43]"
            >
              Salir
            </button>
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
          onClear={handleClearChat}
        />
      </div>
    </main>
  )
}
