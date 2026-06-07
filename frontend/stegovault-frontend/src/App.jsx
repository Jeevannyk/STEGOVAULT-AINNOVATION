import { useState, useRef } from 'react'
import {
  ShieldCheck, Lock, LockOpen, ScanSearch, BarChart3,
  UploadCloud, FileImage, Copy, Check, Loader2, AlertCircle,
  CheckCircle2, Globe, Tag, Palette, Settings, Activity,
  Eye, EyeOff, TrendingUp, Database, MoreHorizontal, Edit3, Trash2, Link,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid,
} from 'recharts'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert as ShadAlert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import './App.css'

const API = 'http://localhost:8000/api'

// ── FileDropZone ────────────────────────────────────────────────────────────

function FileDropZone({ accept, label, onFile, file }) {
  const [dragging, setDragging] = useState(false)
  const id = useRef(`fz-${Math.random().toString(36).slice(2)}`)
  return (
    <div
      className={cn('dropzone', dragging && 'dragging', file && 'has-file')}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) onFile(f) }}
      onClick={() => document.getElementById(id.current).click()}
    >
      <input id={id.current} type="file" accept={accept} style={{ display: 'none' }}
        onChange={e => e.target.files[0] && onFile(e.target.files[0])} />
      {file ? (
        <>
          <FileImage size={28} className="dz-icon" />
          <span className="dz-name">{file.name}</span>
          <span className="dz-size">{(file.size / 1024).toFixed(1)} KB</span>
        </>
      ) : (
        <>
          <UploadCloud size={32} className="dz-plus" />
          <span className="dz-label">{label}</span>
          <span className="dz-hint">Click or drag &amp; drop</span>
        </>
      )}
    </div>
  )
}

// ── AlertMsg ────────────────────────────────────────────────────────────────

function AlertMsg({ type, msg }) {
  if (!msg) return null
  const isError = type === 'error'
  return (
    <ShadAlert className={cn(
      'py-2.5 px-3 [&>svg]:top-2.5',
      isError
        ? 'border-[#ff4444]/25 bg-[#ff4444]/8 text-[#ff6666] [&>svg]:text-[#ff6666]'
        : 'border-[#00ff41]/25 bg-[#00ff41]/8 text-[#00ff41] [&>svg]:text-[#00ff41]'
    )}>
      {isError
        ? <AlertCircle className="h-3.5 w-3.5 shrink-0" />
        : <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
      <AlertDescription className="text-[12px] font-medium">{msg}</AlertDescription>
    </ShadAlert>
  )
}

// ── PasswordInput ───────────────────────────────────────────────────────────

function PasswordInput({ id, value, onChange, placeholder, autoComplete, className }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={cn('h-10 text-[13px] pr-10', className)}
      />
      <button
        type="button"
        aria-label={show ? 'Hide password' : 'Show password'}
        onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors touch-manipulation"
      >
        {show ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
      </button>
    </div>
  )
}

// ── AdvancedOptions ─────────────────────────────────────────────────────────

function AdvancedOptions() {
  const [open, setOpen] = useState(false)
  const [domain, setDomain] = useState('')
  const [stegoPass, setStegoPass] = useState('')
  const [aiLevel, setAiLevel] = useState('standard')
  return (
    <div className="adv-wrap">
      <button className="adv-toggle" type="button" onClick={() => setOpen(o => !o)}>
        <span className="adv-label-row"><Settings size={13} /> Advanced Stego Options</span>
        <Switch
          checked={open}
          className="scale-75 data-[state=checked]:bg-[#00ff41] pointer-events-none"
          aria-hidden="true"
          tabIndex={-1}
        />
      </button>
      <div className={cn('adv-body', open && 'open')}>
        <div className="adv-inner">
          <div className="space-y-1.5">
            <Label htmlFor="adv-domain" className="field-label"><Globe size={11} /> Custom Extraction Domain</Label>
            <Input
              id="adv-domain"
              placeholder="e.g. extract.yourdomain.com"
              value={domain}
              onChange={e => setDomain(e.target.value)}
              className="h-10 text-[13px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="adv-stego-pass" className="field-label"><Palette size={11} /> Embedding Stego Password</Label>
            <PasswordInput
              id="adv-stego-pass"
              placeholder="Secondary password for steganographic layer"
              value={stegoPass}
              onChange={e => setStegoPass(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="adv-ai-level" className="field-label"><Tag size={11} /> AI Obfuscation Level</Label>
            <Select value={aiLevel} onValueChange={setAiLevel}>
              <SelectTrigger id="adv-ai-level" className="h-10 text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="off"      className="text-[13px]">Off — no obfuscation</SelectItem>
                <SelectItem value="standard" className="text-[13px]">Standard — light noise injection</SelectItem>
                <SelectItem value="enhanced" className="text-[13px]">Enhanced — frequency-domain masking</SelectItem>
                <SelectItem value="maximum"  className="text-[13px]">Maximum — full adversarial cover</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── RowActions ──────────────────────────────────────────────────────────────

function RowActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Row actions"
          className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <MoreHorizontal size={15} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem className="gap-2 text-[12px]"><Eye size={13} /> View</DropdownMenuItem>
        <DropdownMenuItem className="gap-2 text-[12px]"><Copy size={13} /> Download</DropdownMenuItem>
        <DropdownMenuItem className="gap-2 text-[12px]"><Edit3 size={13} /> Edit</DropdownMenuItem>
        <DropdownMenuItem className="gap-2 text-[12px]"><Link size={13} /> Set Custom Domain</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 text-[12px] text-destructive focus:text-destructive focus:bg-destructive/10">
          <Trash2 size={13} /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ── SecretManagementTable ───────────────────────────────────────────────────

const MOCK_SECRETS = [
  { id: 1, hash: 'sv_7f3ac891d2b4', date: 'Jun 07, 2026', enc: 'AES-256-GCM' },
  { id: 2, hash: 'sv_2b8cc4d2f91a', date: 'Jun 05, 2026', enc: 'AES-256-GCM' },
  { id: 3, hash: 'sv_9d1ef33a0c72', date: 'Jun 03, 2026', enc: 'AES-256-GCM' },
  { id: 4, hash: 'sv_4a2bca7f8e31', date: 'Jun 01, 2026', enc: 'AES-256-GCM' },
]

function SecretManagementTable() {
  return (
    <Card>
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Database size={15} className="text-[#00ff41] opacity-70" />
          <CardTitle className="text-[13px] font-semibold">Secret Management</CardTitle>
        </div>
        <Badge variant="secondary" className="text-[10px] rounded-full px-2">
          {MOCK_SECRETS.length} items
        </Badge>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-[10px] font-bold uppercase tracking-widest h-9">Secret Name / Hash</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest h-9">Date Created</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest h-9">Encryption</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest h-9 w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_SECRETS.map(row => (
              <TableRow key={row.id} className="border-border/40">
                <TableCell>
                  <div className="flex items-center gap-2 font-mono text-[12px]">
                    <FileImage size={13} className="text-muted-foreground/40 shrink-0" />
                    {row.hash}
                  </div>
                </TableCell>
                <TableCell className="text-[12px] text-muted-foreground tabular-nums whitespace-nowrap">
                  {row.date}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-bold text-[#00ff41] bg-[#00ff41]/8 border-[#00ff41]/20 rounded-sm px-2"
                  >
                    {row.enc}
                  </Badge>
                </TableCell>
                <TableCell><RowActions /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// ── EncodeView ──────────────────────────────────────────────────────────────

function EncodeModal() {
  const [image, setImage]       = useState(null)
  const [secret, setSecret]     = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [alert, setAlert]       = useState({ type: '', msg: '' })

  const handleEncode = async () => {
    if (!image)    { setAlert({ type: 'error', msg: 'Carrier image is required.' }); return }
    if (!secret)   { setAlert({ type: 'error', msg: 'Secret message is required.' }); return }
    if (!password) { setAlert({ type: 'error', msg: 'Master password is required.' }); return }
    setLoading(true); setAlert({ type: '', msg: '' })
    const form = new FormData()
    form.append('image', image); form.append('secret', secret); form.append('password', password)
    try {
      const res = await fetch(`${API}/encode/`, { method: 'POST', body: form })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Encoding failed.') }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'stego_output.png'; a.click(); URL.revokeObjectURL(url)
      setAlert({ type: 'success', msg: 'Secret embedded! Stego image downloaded.' })
    } catch (e) {
      setAlert({ type: 'error', msg: e.message })
    } finally { setLoading(false) }
  }

  return (
    <Card className="max-w-2xl overflow-hidden">
      <div className="h-px bg-gradient-to-r from-transparent via-[#00ff41]/40 to-transparent" />
      <CardHeader className="px-5 py-3.5 flex flex-row items-center justify-between space-y-0 border-b border-border/50">
        <div className="flex items-center gap-3">
          <ShieldCheck size={22} className="text-[#00ff41]" />
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#00ff41] mb-0.5">
              Steganography Engine
            </p>
            <CardTitle className="text-[13px] font-bold tracking-tight">AI-Powered Steg Manager</CardTitle>
          </div>
        </div>
        <Badge className="text-[11px] font-semibold bg-[#00ff41]/10 text-[#00ff41] border-[#00ff41]/30 rounded-sm gap-1.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff41] shadow-[0_0_6px_#00ff41] animate-pulse inline-block" />
          Active
        </Badge>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-4 flex flex-col gap-4">
        <div className="space-y-1.5">
          <Label className="field-label">
            Carrier Image<span aria-hidden="true" className="text-destructive ml-0.5">*</span>
          </Label>
          <FileDropZone accept="image/*" label="Drop carrier image here" onFile={setImage} file={image} />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="encode-secret" className="field-label">
              Secret<span aria-hidden="true" className="text-destructive ml-0.5">*</span>
            </Label>
            <span className="text-[11px] text-muted-foreground/60">Encrypted with AES-256-GCM</span>
          </div>
          <Textarea
            id="encode-secret"
            rows={4}
            placeholder="Your password, API key, private note…"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            className="text-[13px] resize-y min-h-[90px]"
            aria-required="true"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="encode-password" className="field-label">
            Master Password<span aria-hidden="true" className="text-destructive ml-0.5">*</span>
          </Label>
          <PasswordInput
            id="encode-password"
            placeholder="Used for AES-256-GCM encryption"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <p className="text-[11px] text-muted-foreground/60">
            Never share this password — it encrypts your secret before embedding.
          </p>
        </div>
        <AdvancedOptions />
        <AlertMsg type={alert.type} msg={alert.msg} />
        <Button
          onClick={handleEncode}
          disabled={loading}
          aria-busy={loading}
          className="w-full h-10 bg-[#00ff41] hover:bg-[#39ff7a] active:scale-[0.98] text-black font-bold text-[13px] transition-all shadow-[0_0_18px_rgba(0,255,65,0.35)] hover:shadow-[0_0_28px_rgba(0,255,65,0.5)] disabled:opacity-40"
        >
          {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Lock size={16} aria-hidden="true" />}
          {loading ? 'Encoding…' : 'Encode & Download'}
        </Button>
      </CardContent>
    </Card>
  )
}

function EncodeView() {
  return (
    <div className="encode-view">
      <EncodeModal />
      <SecretManagementTable />
    </div>
  )
}

// ── DecodeView ──────────────────────────────────────────────────────────────

function DecodeView() {
  const [image, setImage]       = useState(null)
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState(null)
  const [alert, setAlert]       = useState({ type: '', msg: '' })
  const [copied, setCopied]     = useState(false)

  const handleDecode = async () => {
    if (!image)    { setAlert({ type: 'error', msg: 'Stego image is required.' }); return }
    if (!password) { setAlert({ type: 'error', msg: 'Master password is required.' }); return }
    setLoading(true); setResult(null); setAlert({ type: '', msg: '' })
    const form = new FormData()
    form.append('image', image); form.append('password', password)
    try {
      const res  = await fetch(`${API}/decode/`, { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Decoding failed.')
      setResult(data.secret)
      setAlert({ type: 'success', msg: 'Secret successfully extracted and decrypted!' })
    } catch (e) { setAlert({ type: 'error', msg: e.message }) }
    finally { setLoading(false) }
  }

  const copy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="section-view">
      <Card>
        <CardHeader className="px-5 pt-5 pb-0">
          <div className="flex items-start gap-3">
            <LockOpen size={22} className="text-[#00ff41] shrink-0 mt-0.5 opacity-90" />
            <div>
              <CardTitle className="text-[15px] font-bold tracking-tight mb-1">Decode Secret</CardTitle>
              <CardDescription className="text-[12px] leading-relaxed">
                Extract the hidden payload from a stego image and decrypt it with your master password.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label className="field-label">
              Stego Image<span aria-hidden="true" className="text-destructive ml-0.5">*</span>
            </Label>
            <FileDropZone accept="image/*" label="Drop stego image here" onFile={setImage} file={image} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="decode-password" className="field-label">
              Master Password<span aria-hidden="true" className="text-destructive ml-0.5">*</span>
            </Label>
            <PasswordInput
              id="decode-password"
              placeholder="The password used when encoding"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <AlertMsg type={alert.type} msg={alert.msg} />
          <Button
            onClick={handleDecode}
            disabled={loading}
            aria-busy={loading}
            className="self-start h-10 px-5 bg-[#00ff41] hover:bg-[#39ff7a] active:scale-[0.98] text-black font-semibold text-[13px] shadow-[0_0_14px_rgba(0,255,65,0.3)] disabled:opacity-40"
          >
            {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <LockOpen size={16} aria-hidden="true" />}
            {loading ? 'Decoding…' : 'Decode Secret'}
          </Button>
          {result !== null && (
            <div className="rounded-sm border border-[#00ff41]/20 overflow-hidden">
              <div className="flex justify-between items-center px-3 py-2 bg-[#00ff41]/5 border-b border-[#00ff41]/15">
                <span className="text-[11px] font-semibold text-[#00ff41]">// RECOVERED SECRET</span>
                <Button variant="ghost" size="sm" onClick={copy}
                  className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1">
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <pre className="p-3 font-mono text-[12px] whitespace-pre-wrap break-all leading-relaxed bg-muted/30">
                {result}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ── AnalyzeView ─────────────────────────────────────────────────────────────

const RATING_CLASSES = {
  excellent: 'border-[#00ff41]/30 bg-[#00ff41]/8 text-[#00ff41]',
  good:      'border-[#00ff41]/20 bg-[#00ff41]/5 text-[#4ade80]',
  fair:      'border-[#ffaa00]/25 bg-[#ffaa00]/8 text-[#ffaa00]',
  poor:      'border-[#ff4444]/20 bg-[#ff4444]/8 text-[#ff6666]',
  error:     'border-[#ff4444]/20 bg-[#ff4444]/8 text-[#ff6666]',
}

function scoreColor(s) {
  return s >= 80 ? '#00ff41' : s >= 65 ? '#4ade80' : s >= 45 ? '#ffaa00' : '#ff4444'
}

function AnalyzeView() {
  const [images, setImages]   = useState([])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [alert, setAlert]     = useState({ type: '', msg: '' })

  const handleAnalyze = async () => {
    if (!images.length) { setAlert({ type: 'error', msg: 'Upload at least one image.' }); return }
    setLoading(true); setResults(null); setAlert({ type: '', msg: '' })
    const form = new FormData()
    images.forEach(img => form.append('images', img))
    try {
      const res  = await fetch(`${API}/analyze/`, { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed.')
      setResults(data)
      setAlert({ type: 'success', msg: `Analyzed ${data.total} image${data.total !== 1 ? 's' : ''}.` })
    } catch (e) { setAlert({ type: 'error', msg: e.message }) }
    finally { setLoading(false) }
  }

  return (
    <div className="section-view">
      <Card>
        <CardHeader className="px-5 pt-5 pb-0">
          <div className="flex items-start gap-3">
            <ScanSearch size={22} className="text-[#00ff41] shrink-0 mt-0.5 opacity-90" />
            <div>
              <CardTitle className="text-[15px] font-bold tracking-tight mb-1">AI Carrier Analysis</CardTitle>
              <CardDescription className="text-[12px] leading-relaxed">
                Score images by entropy, chi-square uniformity, and noise variance to find the best hiding carrier.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="analyze-images" className="field-label">
              Upload Images (up to 10)<span aria-hidden="true" className="text-destructive ml-0.5">*</span>
            </Label>
            <label htmlFor="analyze-images" className="multi-upload">
              <input id="analyze-images" type="file" accept="image/*" multiple style={{ display: 'none' }}
                onChange={e => { setImages(Array.from(e.target.files).slice(0, 10)); setResults(null) }} />
              <UploadCloud size={28} className="dz-plus" />
              <span className="dz-label">
                {images.length
                  ? `${images.length} image${images.length !== 1 ? 's' : ''} selected`
                  : 'Click to select images'}
              </span>
            </label>
          </div>
          {images.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {images.map((f, i) => (
                <Badge key={i} variant="secondary" className="text-[11px] rounded-full max-w-[170px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {f.name}
                </Badge>
              ))}
            </div>
          )}
          <AlertMsg type={alert.type} msg={alert.msg} />
          <Button
            onClick={handleAnalyze}
            disabled={loading}
            aria-busy={loading}
            className="self-start h-10 px-5 bg-[#00ff41] hover:bg-[#39ff7a] active:scale-[0.98] text-black font-semibold text-[13px] shadow-[0_0_14px_rgba(0,255,65,0.3)] disabled:opacity-40"
          >
            {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <ScanSearch size={16} aria-hidden="true" />}
            {loading ? 'Analyzing…' : 'Analyze Carriers'}
          </Button>

          {results && (
            <div className="flex flex-col gap-3">
              {results.recommended && (
                <div className="flex justify-between items-center bg-[#00ff41]/5 border border-[#00ff41]/20 rounded-sm px-4 py-3 flex-wrap gap-2.5">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-[#00ff41] uppercase tracking-widest">
                      // AI Recommendation
                    </span>
                    <span className="text-[13px] font-semibold">{results.recommended.filename}</span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-2xl font-extrabold text-[#00ff41] leading-none tabular-nums">
                      {results.recommended.score}
                      <small className="text-[11px] font-medium text-muted-foreground">/100</small>
                    </span>
                    <span className="text-[11px] text-muted-foreground max-w-[220px] text-right leading-snug">
                      {results.recommended.recommendation}
                    </span>
                  </div>
                </div>
              )}
              <div className="cards-grid">
                {results.results.map((r, i) => (
                  <Card key={i} className={cn('relative', i === 0 && 'border-[#00ff41]/25 shadow-[0_0_12px_rgba(0,255,65,0.08)]')}>
                    {i === 0 && (
                      <Badge className="absolute -top-2 left-2.5 text-[10px] font-bold uppercase tracking-wider bg-[#00ff41] text-black border-0 rounded-sm">
                        Best Carrier
                      </Badge>
                    )}
                    <CardContent className="p-3 flex flex-col gap-2 mt-1">
                      <div className="flex justify-between items-center gap-1.5">
                        <span className="text-[12px] font-medium overflow-hidden text-ellipsis whitespace-nowrap max-w-[130px]"
                          title={r.filename}>{r.filename}</span>
                        <Badge variant="outline" className={cn('text-[10px] font-bold rounded-full shrink-0',
                          RATING_CLASSES[r.rating?.toLowerCase()] ?? 'border-border')}>
                          {r.rating}
                        </Badge>
                      </div>
                      {r.error ? (
                        <p className="text-[12px] text-destructive">{r.error}</p>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-bold tabular-nums min-w-[34px]">{r.score}/100</span>
                            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                              <div className="h-full rounded-full score-bar"
                                style={{ width: `${r.score}%`, background: scoreColor(r.score) }} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            {[
                              ['Entropy',  r.metrics?.entropy],
                              ['Chi²',     r.metrics?.chi_square],
                              ['Capacity', `${r.capacity?.kb} KB`],
                              ['Size',     r.dimensions],
                            ].map(([k, v]) => (
                              <div key={k} className="bg-muted/50 rounded p-1.5 flex flex-col gap-0.5">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{k}</span>
                                <strong className="text-[12px] font-semibold tabular-nums">{v}</strong>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ── Analytics ───────────────────────────────────────────────────────────────

const linkPerfData = [
  { month: 'Jan', views: 380, clicks: 220, downloads: 140 },
  { month: 'Feb', views: 520, clicks: 310, downloads: 190 },
  { month: 'Mar', views: 480, clicks: 280, downloads: 165 },
  { month: 'Apr', views: 650, clicks: 420, downloads: 240 },
  { month: 'May', views: 590, clicks: 370, downloads: 210 },
  { month: 'Jun', views: 740, clicks: 490, downloads: 290 },
]
const capacityData = [{ name: 'Used', value: 63 }, { name: 'Free', value: 37 }]
const activityData = [
  { day: 'Mon', encodes: 12, decodes: 8  },
  { day: 'Tue', encodes: 19, decodes: 14 },
  { day: 'Wed', encodes: 8,  decodes: 6  },
  { day: 'Thu', encodes: 24, decodes: 18 },
  { day: 'Fri', encodes: 17, decodes: 11 },
  { day: 'Sat', encodes: 6,  decodes: 4  },
  { day: 'Sun', encodes: 9,  decodes: 7  },
]
const GEO_DATA = [
  { region: 'North America', pct: 34 },
  { region: 'Europe',        pct: 28 },
  { region: 'Asia Pacific',  pct: 24 },
  { region: 'South America', pct: 9  },
  { region: 'Africa',        pct: 5  },
]
const TT = { background: '#050d05', border: '1px solid rgba(0,255,65,0.2)', borderRadius: 2, color: '#d4f5d4', fontSize: 12, fontFamily: 'monospace' }

function StatCard({ Icon, label, value, change, color }) {
  const isPos = change.startsWith('+')
  return (
    <Card>
      <CardContent className="p-3.5 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-muted border border-border/50 flex items-center justify-center shrink-0"
          style={{ color }}>
          <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[22px] font-extrabold leading-none tabular-nums tracking-tight">{value}</div>
          <div className="text-[11px] text-muted-foreground mt-1">{label}</div>
        </div>
        <Badge className={cn(
          'text-[11px] font-semibold rounded-full self-start border-0',
          isPos ? 'text-[#00ff41] bg-[#00ff41]/8' : 'text-[#ff6666] bg-[#ff4444]/8'
        )}>{change}</Badge>
      </CardContent>
    </Card>
  )
}

function WorldMap() {
  return (
    <Card>
      <CardHeader className="px-4 py-3 flex flex-row items-center space-y-0">
        <div className="flex items-center gap-1.5 text-[12px] font-bold">
          <Globe size={14} className="text-muted-foreground" /> Geographic Distribution
        </div>
      </CardHeader>
      <CardContent className="p-3 flex flex-col gap-3">
        <svg viewBox="0 0 280 130" className="w-full rounded">
          <rect width="280" height="130" fill="#020802" rx="2" />
          {[26,52,78,104].map(y => <line key={y} x1="0" y1={y} x2="280" y2={y} stroke="#fff" strokeOpacity="0.04" strokeWidth="0.5" />)}
          {[56,112,168,224].map(x => <line key={x} x1={x} y1="0" x2={x} y2="130" stroke="#fff" strokeOpacity="0.04" strokeWidth="0.5" />)}
          <path d="M18,18 C28,14 48,16 56,26 C62,36 56,54 46,60 C36,66 20,60 16,48 C10,36 12,22 18,18Z" fill="#00ff41" opacity="0.18"/>
          <path d="M36,72 C44,68 54,72 58,84 C62,98 56,114 46,118 C36,120 28,112 26,100 C24,86 28,76 36,72Z" fill="#00ff41" opacity="0.12"/>
          <path d="M106,14 C116,10 128,12 132,20 C136,28 130,38 120,42 C110,44 102,38 100,28 C98,18 102,16 106,14Z" fill="#00ff41" opacity="0.22"/>
          <path d="M108,46 C118,42 130,46 134,60 C138,76 134,96 122,102 C110,106 102,98 100,84 C96,68 102,50 108,46Z" fill="#00ff41" opacity="0.14"/>
          <path d="M136,36 C144,32 154,36 156,46 C158,58 150,66 142,64 C134,62 130,54 132,44 C132,40 134,38 136,36Z" fill="#00ff41" opacity="0.16"/>
          <path d="M146,12 C176,8 218,10 226,22 C234,34 228,50 210,56 C192,62 164,58 148,48 C136,40 136,16 146,12Z" fill="#00ff41" opacity="0.17"/>
          <path d="M160,58 C170,54 180,60 182,72 C184,86 176,98 166,100 C156,100 150,90 152,76 C152,66 156,60 160,58Z" fill="#00ff41" opacity="0.14"/>
          <path d="M208,54 C220,48 232,54 234,66 C236,78 228,86 218,84 C208,82 202,74 206,62 C206,58 208,56 208,54Z" fill="#00ff41" opacity="0.12"/>
          <path d="M206,86 C220,80 238,84 242,98 C246,112 236,124 222,124 C208,124 198,114 200,100 C200,92 204,88 206,86Z" fill="#00ff41" opacity="0.14"/>
          <circle cx="36"  cy="38" r="3.5" fill="#00ff41" opacity="0.9"/>
          <circle cx="36"  cy="38" r="7"   fill="none" stroke="#00ff41" strokeOpacity="0.35" strokeWidth="1"/>
          <circle cx="118" cy="26" r="2.8" fill="#00ff41" opacity="0.85"/>
          <circle cx="118" cy="26" r="5.5" fill="none" stroke="#00ff41" strokeOpacity="0.25" strokeWidth="0.8"/>
          <circle cx="178" cy="28" r="2.4" fill="#00ff41" opacity="0.8"/>
          <circle cx="178" cy="28" r="5"   fill="none" stroke="#00ff41" strokeOpacity="0.2" strokeWidth="0.8"/>
          <circle cx="220" cy="20" r="2"   fill="#00ff41" opacity="0.75"/>
          <circle cx="44"  cy="94" r="1.8" fill="#00ff41" opacity="0.65"/>
        </svg>
        <div className="flex flex-col gap-1.5">
          {GEO_DATA.map(g => (
            <div key={g.region} className="flex items-center gap-2 text-[11px]">
              <span className="text-muted-foreground min-w-[110px] whitespace-nowrap">{g.region}</span>
              <div className="flex-1 h-[3px] bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-[#00ff41]/60 rounded-full"
                  style={{ width: `${g.pct * 2.5}%` }} />
              </div>
              <span className="text-muted-foreground/50 min-w-[28px] text-right tabular-nums">{g.pct}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function AnalyticsView() {
  return (
    <div className="analytics-view">
      <div className="stats-row">
        <StatCard Icon={Eye}      label="Total Views"     value="12,487" change="+18%" color="#00ff41" />
        <StatCard Icon={Lock}     label="Total Encodes"   value="3,284"  change="+12%" color="#4ade80" />
        <StatCard Icon={LockOpen} label="Total Decodes"   value="2,156"  change="+9%"  color="#00cc33" />
        <StatCard Icon={Activity} label="Active Sessions" value="142"    change="+24%" color="#ffaa00" />
      </div>

      <div className="charts-grid">
        <Card className="chart-wide p-4 flex flex-col gap-3" role="figure"
          aria-label="Link Performance: bar chart showing monthly views, clicks, and downloads — June leads with 740 views, 490 clicks, 290 downloads">
          <div className="flex items-center justify-between flex-wrap gap-1.5">
            <div className="flex items-center gap-1.5 text-[12px] font-bold">
              <TrendingUp size={14} className="text-muted-foreground" aria-hidden="true" /> Link Performance
            </div>
            <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground" aria-hidden="true">
              {[['#00ff41','Views'],['#4ade80','Clicks'],['#00cc33','Downloads']].map(([c,l]) => (
                <span key={l}><span className="inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle" style={{ background: c }} />{l}</span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={linkPerfData} barGap={3} barCategoryGap="32%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,65,0.08)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#3d7a3d', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#3d7a3d', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
              <ReTooltip contentStyle={TT} cursor={{ fill: '#ffffff06' }} />
              <Bar dataKey="views"     fill="#00ff41" radius={[2,2,0,0]} />
              <Bar dataKey="clicks"    fill="#4ade80" radius={[2,2,0,0]} />
              <Bar dataKey="downloads" fill="#00cc33" radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4 flex flex-col gap-3" role="figure"
          aria-label="Vault Capacity: donut chart showing 63% storage used, 37% free">
          <div className="flex items-center gap-1.5 text-[12px] font-bold">
            <Database size={14} className="text-muted-foreground" aria-hidden="true" /> Vault Capacity
          </div>
          <div className="flex items-center gap-3.5 flex-1">
            <div className="relative inline-flex items-center justify-center shrink-0">
              <PieChart width={130} height={130}>
                <Pie data={capacityData} cx={61} cy={61} innerRadius={38} outerRadius={56} dataKey="value" strokeWidth={0}>
                  <Cell fill="#00ff41" />
                  <Cell fill="#0a1a0a" />
                </Pie>
              </PieChart>
              <div className="absolute flex flex-col items-center pointer-events-none">
                <span className="text-[20px] font-extrabold leading-none tabular-nums tracking-tight">63%</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Used</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 text-[12px]">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff41] inline-block" /> Used (63%)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0a1a0a] border border-[#00ff41]/20 inline-block" /> Free (37%)
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 flex flex-col gap-3" role="figure"
          aria-label="Weekly Activity: area chart showing encode and decode operations — Thursday peaks at 24 encodes and 18 decodes">
          <div className="flex items-center justify-between flex-wrap gap-1.5">
            <div className="flex items-center gap-1.5 text-[12px] font-bold">
              <Activity size={14} className="text-muted-foreground" aria-hidden="true" /> Weekly Activity
            </div>
            <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground">
              <span><span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00ff41] mr-1 align-middle" />Encodes</span>
              <span><span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ffaa00] mr-1 align-middle" />Decodes</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={activityData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gEnc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#00ff41" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00ff41" stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="gDec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#ffaa00" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#ffaa00" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,65,0.08)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#3d7a3d', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#3d7a3d', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
              <ReTooltip contentStyle={TT} cursor={{ stroke: '#ffffff10' }} />
              <Area type="monotone" dataKey="encodes" stroke="#00ff41" strokeWidth={2} fill="url(#gEnc)" />
              <Area type="monotone" dataKey="decodes" stroke="#ffaa00" strokeWidth={2} fill="url(#gDec)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <WorldMap />
      </div>
    </div>
  )
}

// ── App Shell ───────────────────────────────────────────────────────────────

const TAB_TITLES = {
  encode:    'Encode Secret',
  decode:    'Decode Secret',
  analyze:   'AI Carrier Analysis',
  analytics: 'Analytics Dashboard',
}

export default function App() {
  const [tab, setTab] = useState('encode')
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar activeTab={tab} onTabChange={setTab} />
        <SidebarInset>

          <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border/50 px-4">
            <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
            <Separator orientation="vertical" className="h-4 mx-1" />
            <ShieldCheck size={16} className="text-[#00ff41]" />
            <span className="text-[13px] font-semibold">{TAB_TITLES[tab]}</span>
            <div className="ml-auto flex items-center gap-1.5">
              {['AES-256-GCM', 'LSB STEGO', 'AI ANALYSIS'].map(b => (
                <Badge key={b} variant="secondary"
                  className="text-[10px] font-semibold tracking-widest uppercase rounded-full hidden sm:flex">
                  {b}
                </Badge>
              ))}
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            <div className="sv-content tab-view-enter" key={tab}>
              {tab === 'encode'    && <EncodeView />}
              {tab === 'decode'    && <DecodeView />}
              {tab === 'analyze'   && <AnalyzeView />}
              {tab === 'analytics' && <AnalyticsView />}
            </div>
          </div>

          <footer className="text-center text-[11px] text-muted-foreground/40 py-3 border-t border-border/50">
            AES-256-GCM encryption · LSB steganography · AI carrier scoring
          </footer>

        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
