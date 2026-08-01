import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL

const mealOptions = [
  { value: 'breakfast', label: 'Breakfast', icon: '☀' },
  { value: 'lunch', label: 'Lunch', icon: '◒' },
  { value: 'dinner', label: 'Dinner', icon: '☾' },
  { value: 'relaxed', label: 'Relaxed', icon: '✦' },
]

const eaterOptions = [
  { value: 'slow', label: 'Slow eater' },
  { value: 'quick', label: 'Quick eater' },
]

const categoryOptions = [
  { value: 'movies', label: 'Movies', icon: '▻' },
  { value: 'comedy', label: 'Comedy', icon: '☺' },
  { value: 'news', label: 'News', icon: '▤' },
  { value: 'sports', label: 'Sports', icon: '◉' },
]

const languageOptions = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'japanese', label: 'Japanese' },
]

const demoRecommendations = [
  {
    title: 'A perfect pick for your meal',
    channel: 'Breve demo recommendation',
    duration: '12:04',
    durationMinutes: 12.07,
    url: 'https://www.youtube.com',
    thumbnail: '',
    reason: 'A short, relevant video that fits comfortably within your eating time.',
  },
]

function OptionGroup({ label, name, options, value, onChange, className = '' }) {
  return (
    <fieldset className={`option-group ${className}`}>
      <legend>{label}</legend>
      <div className="options">
        {options.map((option) => (
          <label className={`choice ${value === option.value ? 'selected' : ''}`} key={option.value}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(event) => onChange(event.target.value)}
            />
            {option.icon && <span className="option-icon" aria-hidden="true">{option.icon}</span>}
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function VideoCard({ video, index }) {
  return (
    <a className="video-card" href={video.url} target="_blank" rel="noreferrer">
      <div className="thumbnail">
        {video.thumbnail ? (
          <img src={video.thumbnail} alt="" />
        ) : (
          <div className="thumbnail-placeholder"><span>▶</span></div>
        )}
        <span className="rank">0{index + 1}</span>
        {video.duration && <span className="duration">{video.duration}</span>}
      </div>
      <div className="video-copy">
        <p className="video-kicker">Recommended for you</p>
        <h3>{video.title}</h3>
        {video.channel && <p className="channel">{video.channel}</p>}
        {video.reason && <p className="reason">{video.reason}</p>}
      </div>
      <span className="arrow" aria-hidden="true">↗</span>
    </a>
  )
}

export default function App() {
  const [eaterType, setEaterType] = useState('quick')
  const [meal, setMeal] = useState('breakfast')
  const [category, setCategory] = useState('comedy')
  const [language, setLanguage] = useState('english')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setHasSearched(true)

    const payload = { meal, eaterType, category, language }

    try {
      if (!API_URL) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        setResults(demoRecommendations)
        setError('Demo mode: add VITE_API_URL to connect your API Gateway endpoint.')
        return
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to find recommendations.')
      setResults(data.recommendations || [])
      if (!data.recommendations?.length) setError('No videos matched this combination. Try another selection.')
    } catch (requestError) {
      setResults([])
      setError(requestError.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Breve home">
          <span className="brand-mark">B</span>
          <span>Breve</span>
        </a>
        <p className="tagline">Stop scrolling. <em>Start watching.</em></p>
        <div className="header-pill"><span className="pulse" /> made for mealtime</div>
      </header>

      <main>
        <section className="hero">
          <p className="eyebrow">Your meal, your moment</p>
          <h1>Find something worth<br /><span>watching.</span></h1>
          <p className="hero-copy">Tell us how you eat. Breve will find a video that ends around the same time you do.</p>
        </section>

        <form className="preference-card" onSubmit={handleSubmit}>
          <div className="form-heading">
            <div>
              <p className="eyebrow">Set the scene</p>
              <h2>What are we watching today?</h2>
            </div>
            <span className="step-label">01 <span>/ 01</span></span>
          </div>

          <OptionGroup label="I am a" name="eaterType" options={eaterOptions} value={eaterType} onChange={setEaterType} className="eater-group" />
          <OptionGroup label="Having" name="meal" options={mealOptions} value={meal} onChange={setMeal} className="meal-group" />
          <OptionGroup label="I want to watch" name="category" options={categoryOptions} value={category} onChange={setCategory} className="category-group" />
          <OptionGroup label="In" name="language" options={languageOptions} value={language} onChange={setLanguage} className="language-group" />

          <div className="submit-row">
            <p className="microcopy">No endless feed. Just five good picks.</p>
            <button className="go-button" type="submit" disabled={loading}>
              {loading ? <><span className="button-spinner" /> Finding picks</> : <>Find my video <span>→</span></>}
            </button>
          </div>
        </form>

        {hasSearched && (
          <section className="results-section" aria-live="polite">
            <div className="results-heading">
              <div>
                <p className="eyebrow">Your mealtime lineup</p>
                <h2>{loading ? 'Looking for your next watch…' : 'Five minutes of less deciding.'}</h2>
              </div>
              {!loading && results.length > 0 && <span className="result-count">{results.length} picks</span>}
            </div>
            {error && <div className={`notice ${results.length ? 'demo-notice' : 'error-notice'}`}>{error}</div>}
            {loading ? (
              <div className="loading-grid">{[1, 2, 3].map((item) => <div className="skeleton" key={item} />)}</div>
            ) : results.length > 0 ? (
              <div className="video-grid">{results.map((video, index) => <VideoCard key={video.videoId || video.url || index} video={video} index={index} />)}</div>
            ) : null}
          </section>
        )}
      </main>

      <footer><span>BREVE</span> A little less scrolling. A little more living.</footer>
    </div>
  )
}
