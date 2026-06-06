import { useState } from 'react'
import {
  ShieldCheck, Lock, LockOpen, Bot, UploadCloud, FileImage,
  Plus, Copy, Check, Loader2, AlertCircle, CheckCircle2,
  ChevronRight, Cpu, ScanSearch
} from 'lucide-react'
import './App.css'

const API = 'http://localhost:8000/api'

function FileDropZone({ accept, label, onFile, file }) {
  const [dragging, setDragging] = useState(false)
  const id = `fz-${label.replace(/\s+/g, '-')}`

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) onFile(dropped)
  }

  return (
    <div
      className={`dropzone${dragging ? ' dragging' : ''}${file ? ' has-file' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => document.getElementById(id).click()}
    >
      <input
        id={id}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={(e) => e.target.files[0] && onFile(e.target.files[0])}
      />
      {file ? (
        <>
          <FileImage size={28} className="dz-icon" />
          <span className="dz-name">{file.name}</span>
          <span className="dz-size">{(file.size / 1024).toFixed(1)} KB</span>
        </>
      ) : (
        <>
          <UploadCloud size={28} className="dz-plus" />
          <span className="dz-label">{label}</span>
          <span className="dz-hint">Click or drag & drop</span>
        </>
      )}
    </div>
  )
}

function Alert({ type, msg }) {
  if (!msg) return null
  return (
    <div className={`alert alert-${type}`}>
      {type === 'error'   ? <AlertCircle  size={15} /> : <CheckCircle2 size={15} />}
      {msg}
    </div>
  )
}

// ── Encode ────────────────────────────────────────────────────────────────────

function EncodeSection() {
  const [image, setImage]       = useState(null)
  const [secret, setSecret]     = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [alert, setAlert]       = useState({ type: '', msg: '' })

  const handleEncode = async () => {
    if (!image || !secret || !password) {
      setAlert({ type: 'error', msg: 'All three fields are required.' })
      return
    }
    setLoading(true)
    setAlert({ type: '', msg: '' })
    const form = new FormData()
    form.append('image', image)
    form.append('secret', secret)
    form.append('password', password)
    try {
      const res = await fetch(`${API}/encode/`, { method: 'POST', body: form })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Encoding failed.')
      }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = 'stego_output.png'; a.click()
      URL.revokeObjectURL(url)
      setAlert({ type: 'success', msg: 'Secret embedded! Stego image downloaded.' })
    } catch (e) {
      setAlert({ type: 'error', msg: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="section">
      <div className="section-header">
        <Lock size={28} className="s-icon" />
        <div>
          <h2>Encode Secret</h2>
          <p>Encrypt your secret with AES-256-GCM, then hide it inside an image via LSB steganography.</p>
        </div>
      </div>

      <div className="form-stack">
        <div className="field">
          <label>Carrier Image</label>
          <FileDropZone accept="image/*" label="Drop carrier image here" onFile={setImage} file={image} />
        </div>
        <div className="field">
          <label>Secret</label>
          <textarea
            rows={4}
            placeholder="Your password, API key, private note..."
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Master Password</label>
          <input
            type="password"
            placeholder="Used for AES-256-GCM encryption"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span className="hint">This password encrypts your secret before embedding. Never share it.</span>
        </div>
      </div>

      <Alert type={alert.type} msg={alert.msg} />

      <button className="btn-primary" onClick={handleEncode} disabled={loading}>
        {loading ? <Loader2 size={16} className="spin" /> : <Lock size={16} />}
        {loading ? 'Encoding...' : 'Encode & Download'}
      </button>
    </div>
  )
}

// ── Decode ────────────────────────────────────────────────────────────────────

function DecodeSection() {
  const [image, setImage]       = useState(null)
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState(null)
  const [alert, setAlert]       = useState({ type: '', msg: '' })
  const [copied, setCopied]     = useState(false)

  const handleDecode = async () => {
    if (!image || !password) {
      setAlert({ type: 'error', msg: 'Image and password are required.' })
      return
    }
    setLoading(true)
    setResult(null)
    setAlert({ type: '', msg: '' })
    const form = new FormData()
    form.append('image', image)
    form.append('password', password)
    try {
      const res  = await fetch(`${API}/decode/`, { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Decoding failed.')
      setResult(data.secret)
      setAlert({ type: 'success', msg: 'Secret successfully extracted and decrypted!' })
    } catch (e) {
      setAlert({ type: 'error', msg: e.message })
    } finally {
      setLoading(false)
    }
  }

  const copy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }


  return (
    <div className="section">
      <div className="section-header">
        <LockOpen size={28} className="s-icon" />
        <div>
          <h2>Decode Secret</h2>
          <p>Extract the hidden payload from a stego image and decrypt it with your master password.</p>
        </div>
      </div>

      <div className="form-stack">
        <div className="field">
          <label>Stego Image</label>
          <FileDropZone accept="image/*" label="Drop stego image here" onFile={setImage} file={image} />
        </div>
        <div className="field">
          <label>Master Password</label>
          <input
            type="password"
            placeholder="The password used when encoding"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      <Alert type={alert.type} msg={alert.msg} />

      <button className="btn-primary" onClick={handleDecode} disabled={loading}>
        {loading ? <Loader2 size={16} className="spin" /> : <LockOpen size={16} />}
        {loading ? 'Decoding...' : 'Decode Secret'}
      </button>

      {result !== null && (
        <div className="result-box">
          <div className="result-top">
            <span>Recovered Secret</span>
            <button className="btn-copy" onClick={copy}>
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="result-text">{result}</pre>
        </div>
      )}
    </div>
  )
}

// ── Analyze ───────────────────────────────────────────────────────────────────

function ScoreBar({ score }) {
  const color = score >= 80 ? '#10b981' : score >= 65 ? '#6366f1' : score >= 45 ? '#f59e0b' : '#ef4444'
  return (
    <div className="score-track">
      <div className="score-fill" style={{ width: `${score}%`, background: color }} />
    </div>
  )
}

function AnalyzeSection() {
  const [images, setImages]   = useState([])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [alert, setAlert]     = useState({ type: '', msg: '' })

  const handleAnalyze = async () => {
    if (!images.length) {
      setAlert({ type: 'error', msg: 'Upload at least one image.' })
      return
    }
    setLoading(true)
    setResults(null)
    setAlert({ type: '', msg: '' })
    const form = new FormData()
    images.forEach((img) => form.append('images', img))
    try {
      const res  = await fetch(`${API}/analyze/`, { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed.')
      setResults(data)
      setAlert({ type: 'success', msg: `Analyzed ${data.total} image${data.total !== 1 ? 's' : ''}.` })
    } catch (e) {
      setAlert({ type: 'error', msg: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="section">
      <div className="section-header">
        <ScanSearch size={28} className="s-icon" />
        <div>
          <h2>AI Carrier Analysis</h2>
          <p>Score images by entropy, chi-square uniformity, and noise variance to find the best hiding carrier.</p>
        </div>
      </div>

      <div className="field">
        <label>Upload Images (up to 10)</label>
        <label className="multi-upload">
          <input
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => { setImages(Array.from(e.target.files).slice(0, 10)); setResults(null) }}
          />
          <UploadCloud size={28} className="dz-plus" />
          <span className="dz-label">
            {images.length ? `${images.length} image${images.length !== 1 ? 's' : ''} selected` : 'Click to select images'}
          </span>
        </label>
      </div>

      {images.length > 0 && (
        <div className="chips">
          {images.map((f, i) => <span key={i} className="chip">{f.name}</span>)}
        </div>
      )}

      <Alert type={alert.type} msg={alert.msg} />

      <button className="btn-primary" onClick={handleAnalyze} disabled={loading}>
        {loading ? <Loader2 size={16} className="spin" /> : <ScanSearch size={16} />}
        {loading ? 'Analyzing...' : 'Analyze Carriers'}
      </button>

      {results && (
        <div className="analyze-results">
          {results.recommended && (
            <div className="rec-banner">
              <div className="rec-left">
                <span className="rec-tag">AI Recommendation</span>
                <span className="rec-file">{results.recommended.filename}</span>
              </div>
              <div className="rec-right">
                <span className="rec-score">{results.recommended.score}<small>/100</small></span>
                <span className="rec-note">{results.recommended.recommendation}</span>
              </div>
            </div>
          )}

          <div className="cards-grid">
            {results.results.map((r, i) => (
              <div key={i} className={`card${i === 0 ? ' card-top' : ''}`}>
                {i === 0 && <span className="top-badge">Best Carrier</span>}
                <div className="card-head">
                  <span className="card-fname" title={r.filename}>{r.filename}</span>
                  <span className={`rating r-${r.rating?.toLowerCase()}`}>{r.rating}</span>
                </div>
                {r.error ? (
                  <p className="card-err">{r.error}</p>
                ) : (
                  <>
                    <div className="card-score-row">
                      <span className="card-score-num">{r.score}/100</span>
                      <ScoreBar score={r.score} />
                    </div>
                    <div className="metrics">
                      <div className="metric"><span>Entropy</span><strong>{r.metrics?.entropy}</strong></div>
                      <div className="metric"><span>Chi²</span><strong>{r.metrics?.chi_square}</strong></div>
                      <div className="metric"><span>Capacity</span><strong>{r.capacity?.kb} KB</strong></div>
                      <div className="metric"><span>Size</span><strong>{r.dimensions}</strong></div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Shell ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'encode',  label: 'Encode',     Icon: Lock      },
  { id: 'decode',  label: 'Decode',     Icon: LockOpen  },
  { id: 'analyze', label: 'AI Analyze', Icon: ScanSearch },
]

export default function App() {
  const [tab, setTab] = useState('encode')

  return (
    <div className="app">
      <header className="header">
        <div className="logo-block">
          <ShieldCheck size={40} className="logo-glyph" />
          <div>
            <h1>StegoVault</h1>
            <p>AI-Powered Steganographic Secret Manager</p>
          </div>
        </div>
        <div className="tech-badges">
          <span className="tbadge">AES-256-GCM</span>
          <span className="tbadge">LSB Stego</span>
          <span className="tbadge">AI Scoring</span>
        </div>
      </header>

      <nav className="tabs">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`tab${tab === id ? ' active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </nav>

      <main className="main">
        {tab === 'encode'  && <EncodeSection />}
        {tab === 'decode'  && <DecodeSection />}
        {tab === 'analyze' && <AnalyzeSection />}
      </main>

      <footer className="footer">
        AES-256-GCM encryption · LSB steganography · AI carrier scoring
      </footer>
    </div>
  )
}
