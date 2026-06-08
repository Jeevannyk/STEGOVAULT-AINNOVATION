import { useState, useRef, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck, Lock, LockOpen, ScanSearch, BarChart3,
  UploadCloud, FileImage, Copy, Check, Loader2,
  CheckCircle2, Globe, KeyRound, Sparkles, Settings2, Activity,
  Eye, EyeOff, TrendingUp, TrendingDown, Database, MoreHorizontal,
  Pencil, Trash2, ArrowRight, ArrowLeft, ImageIcon,
  HardDrive, Clock, Layers,
} from 'lucide-react'
import {
  XAxis, YAxis, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid,
} from 'recharts'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { AppSidebar } from '@/components/app-sidebar'
import { AuthPages } from '@/components/auth-pages'
import { useAuth } from '@/auth'
import { API } from '@/config'
import './App.css'

const EASE = [0.22, 1, 0.36, 1]
const VAULT_CAP = 50

// ── helpers ──────────────────────────────────────────────────────────────

function scorePassword(pw) {
  if (!pw) return 0
  let s = 0
  if (pw.length >= 8) s++
  if (pw.length >= 14) s++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++
  return Math.min(s, 4)
}
const PW_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']
const PW_COLORS = ['var(--muted)', 'var(--destructive)', 'var(--warning)', 'var(--info)', 'var(--success)']

function fmtDate() {
  return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
}

// ── ImageDropZone (large preview) ─────────────────────────────────────────

function ImageDropZone({ file, onFile, label = 'Drop an image, or click to browse' }) {
  const [dragging, setDragging] = useState(false)
  const id = useRef(`fz-${Math.random().toString(36).slice(2)}`)
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => { if (url) URL.revokeObjectURL(url) }, [url])

  const pick = () => document.getElementById(id.current).click()

  if (file && url) {
    return (
      <div className="rounded-[var(--radius)] border border-border bg-muted/30 overflow-hidden">
        <div className="relative flex items-center justify-center bg-[repeating-conic-gradient(var(--muted)_0%_25%,transparent_0%_50%)] bg-[length:18px_18px] p-4 min-h-[200px]">
          <img src={url} alt={file.name}
            className="max-h-[260px] max-w-full rounded-md object-contain shadow-md" />
        </div>
        <div className="flex items-center gap-3 px-4 py-3 border-t border-border">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
            <ImageIcon size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium truncate">{file.name}</p>
            <p className="text-[12px] text-muted-foreground tabular-nums">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <input id={id.current} type="file" accept="image/*" className="hidden"
            onChange={e => e.target.files[0] && onFile(e.target.files[0])} />
          <Button variant="outline" size="sm" className="text-[12px]" onClick={pick}>Replace</Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn('dropzone', dragging && 'dragging')}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) onFile(f) }}
      onClick={pick}
    >
      <input id={id.current} type="file" accept="image/*" className="hidden"
        onChange={e => e.target.files[0] && onFile(e.target.files[0])} />
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <UploadCloud size={22} className="dz-plus" />
      </div>
      <span className="dz-label">{label}</span>
      <span className="dz-hint">PNG, JPG or WebP · up to 10 MB</span>
    </div>
  )
}

// ── PasswordInput ──────────────────────────────────────────────────────────

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
        className={cn('h-10 pr-10', className)}
      />
      <button
        type="button"
        aria-label={show ? 'Hide password' : 'Show password'}
        onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {show ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
      </button>
    </div>
  )
}

// ── PasswordStrength meter ──────────────────────────────────────────────────

function PasswordStrength({ score }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex gap-1.5 flex-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              initial={false}
              animate={{ scaleX: i <= score ? 1 : 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              style={{ originX: 0, background: i <= score ? PW_COLORS[score] : 'transparent' }}
            />
          </div>
        ))}
      </div>
      <span className="text-[12px] font-medium tabular-nums min-w-[42px] text-right"
        style={{ color: score ? PW_COLORS[score] : 'var(--muted-foreground)' }}>
        {score ? PW_LABELS[score] : '—'}
      </span>
    </div>
  )
}

// ── SecurityRing ────────────────────────────────────────────────────────────

function SecurityRing({ score, size = 132 }) {
  const r = (size - 16) / 2
  const c = 2 * Math.PI * r
  const color = score >= 80 ? 'var(--chart-1)' : score >= 60 ? 'var(--chart-2)' : 'var(--chart-3)'
  const label = score >= 80 ? 'Strong' : score >= 60 ? 'Good' : 'Fair'
  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={8} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - score / 100) }}
          transition={{ duration: 0.8, ease: EASE }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-[28px] font-semibold tabular-nums leading-none tracking-tight">{score}</span>
        <span className="text-[11px] font-medium mt-1" style={{ color }}>{label}</span>
      </div>
    </div>
  )
}

// ── Step indicator ──────────────────────────────────────────────────────────

const STEPS = [
  { n: 1, label: 'Upload',     icon: ImageIcon },
  { n: 2, label: 'Secret',     icon: KeyRound  },
  { n: 3, label: 'Encryption', icon: Lock      },
  { n: 4, label: 'Generate',   icon: ShieldCheck },
]

function StepIndicator({ step, onJump, maxReached }) {
  return (
    <div className="flex items-center">
      {STEPS.map((s, i) => {
        const done = s.n < step
        const active = s.n === step
        const reachable = s.n <= maxReached
        return (
          <div key={s.n} className="flex items-center flex-1 last:flex-none">
            <button
              type="button"
              disabled={!reachable}
              onClick={() => reachable && onJump(s.n)}
              className={cn(
                'group flex items-center gap-2.5 transition-opacity',
                !reachable && 'cursor-not-allowed opacity-50',
                reachable && 'cursor-pointer'
              )}
            >
              <span className={cn(
                'flex size-8 items-center justify-center rounded-full border text-[13px] font-semibold transition-colors shrink-0',
                done && 'border-primary bg-primary text-primary-foreground',
                active && 'border-primary text-primary bg-primary/10',
                !done && !active && 'border-border text-muted-foreground'
              )}>
                {done ? <Check size={15} /> : s.n}
              </span>
              <span className={cn(
                'text-[13px] font-medium hidden sm:block transition-colors',
                active ? 'text-foreground' : 'text-muted-foreground'
              )}>{s.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className="mx-3 h-px flex-1 bg-border relative overflow-hidden">
                <motion.div className="absolute inset-0 bg-primary"
                  initial={false} animate={{ scaleX: done ? 1 : 0 }}
                  transition={{ duration: 0.35, ease: EASE }} style={{ originX: 0 }} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

const stepVariants = {
  enter: dir => ({ opacity: 0, x: dir > 0 ? 28 : -28 }),
  center: { opacity: 1, x: 0 },
  exit: dir => ({ opacity: 0, x: dir > 0 ? -28 : 28 }),
}

// ── EncodeWizard ────────────────────────────────────────────────────────────

function EncodeWizard({ onSuccess }) {
  const [step, setStep]     = useState(1)
  const [dir, setDir]       = useState(1)
  const [maxReached, setMax] = useState(1)
  const [image, setImage]       = useState(null)
  const [secret, setSecret]     = useState('')
  const [password, setPassword] = useState('')
  const [aiLevel, setAiLevel]   = useState('standard')
  const [domain, setDomain]     = useState('')
  const [advOpen, setAdvOpen]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(null)

  const pwScore = scorePassword(password)
  const securityScore = useMemo(() => {
    let s = 40 // AES-256-GCM baseline
    s += pwScore * 12
    if (aiLevel === 'standard') s += 4
    else if (aiLevel === 'enhanced') s += 8
    else if (aiLevel === 'maximum') s += 12
    return Math.min(s, 100)
  }, [pwScore, aiLevel])

  const canAdvance = step === 1 ? !!image : step === 2 ? secret.trim().length > 0 : step === 3 ? password.length > 0 : true

  const go = (n) => {
    setDir(n > step ? 1 : -1)
    setStep(n)
    setMax(m => Math.max(m, n))
  }
  const next = () => canAdvance && go(Math.min(step + 1, 4))
  const back = () => go(Math.max(step - 1, 1))

  const reset = () => {
    setImage(null); setSecret(''); setPassword(''); setAiLevel('standard'); setDomain('')
    setAdvOpen(false); setDone(null); setStep(1); setMax(1); setDir(-1)
  }

  const handleEncode = async () => {
    setLoading(true)
    const form = new FormData()
    form.append('image', image); form.append('secret', secret); form.append('password', password)
    try {
      const res = await fetch(`${API}/encode/`, { method: 'POST', body: form })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Encoding failed.') }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'stego_output.png'; a.click(); URL.revokeObjectURL(url)
      const hash = 'sv_' + Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 6)
      const entry = { id: Date.now(), hash, label: image.name, date: fmtDate(), enc: 'AES-256-GCM' }
      onSuccess(entry)
      setDone({ hash, score: securityScore })
      toast.success('Secret embedded', { description: 'Your stego image was downloaded securely.' })
    } catch (e) {
      toast.error('Encoding failed', { description: e.message })
    } finally { setLoading(false) }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border">
        <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          <ShieldCheck size={18} />
        </div>
        <CardTitle className="text-[15px]">Encode a secret</CardTitle>
        <CardDescription className="text-[13px]">
          Hide encrypted data inside an ordinary image in four steps.
        </CardDescription>
        <CardAction>
          <Badge variant="secondary" className="gap-1.5 text-[11px] font-medium">
            <span className="size-1.5 rounded-full bg-primary" /> AES-256-GCM
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <div className="px-1 pt-1">
          <StepIndicator step={step} onJump={go} maxReached={done ? 4 : maxReached} />
        </div>

        <Separator />

        <AnimatePresence mode="wait" custom={dir}>
          {done ? (
            <motion.div key="done" custom={dir} variants={stepVariants}
              initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: EASE }}
              className="flex flex-col items-center text-center gap-5 py-6">
              <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="flex size-14 items-center justify-center rounded-full bg-primary/12 text-primary">
                <CheckCircle2 size={30} />
              </motion.div>
              <div className="space-y-1.5">
                <h3 className="text-[17px] font-semibold tracking-tight">Secure image generated</h3>
                <p className="text-[13px] text-muted-foreground max-w-sm">
                  The download has started. Keep your master password safe — it's the only way to recover this secret.
                </p>
              </div>
              <SecurityRing score={done.score} />
              <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2">
                <span className="text-[12px] text-muted-foreground">Reference</span>
                <code className="text-[12px] font-mono text-foreground">{done.hash}</code>
              </div>
              <Button variant="outline" onClick={reset} className="mt-1">
                Encode another secret
              </Button>
            </motion.div>
          ) : (
            <motion.div key={step} custom={dir} variants={stepVariants}
              initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: EASE }}>

              {step === 1 && (
                <div className="flex flex-col gap-3">
                  <div className="space-y-1">
                    <Label className="field-label">Carrier image</Label>
                    <p className="text-[12.5px] text-muted-foreground">
                      Choose a high-detail image — more visual noise means more hiding capacity.
                    </p>
                  </div>
                  <ImageDropZone file={image} onFile={setImage} />
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="secret" className="field-label">Secret payload</Label>
                    <span className="text-[12px] text-muted-foreground tabular-nums">{secret.length} chars</span>
                  </div>
                  <Textarea
                    id="secret" rows={7} autoFocus
                    placeholder="A password, API key, recovery phrase, or private note…"
                    value={secret}
                    onChange={e => setSecret(e.target.value)}
                    className="resize-y min-h-[150px] font-mono text-[13px]"
                  />
                  <p className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                    <Lock size={12} className="text-primary" />
                    Encrypted with AES-256-GCM before it ever touches the image.
                  </p>
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2.5">
                    <Label htmlFor="password" className="field-label">Master password</Label>
                    <PasswordInput
                      id="password" autoComplete="new-password"
                      placeholder="Used to derive the AES-256 key"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    <PasswordStrength score={pwScore} />
                    <p className="text-[12.5px] text-muted-foreground">
                      This password is never sent or stored. Lose it and the secret is unrecoverable.
                    </p>
                  </div>

                  <div className="rounded-[var(--radius)] border border-border">
                    <button type="button" onClick={() => setAdvOpen(o => !o)}
                      className="flex w-full items-center justify-between px-3.5 py-3 text-left">
                      <span className="flex items-center gap-2 text-[13px] font-medium">
                        <Settings2 size={14} className="text-muted-foreground" /> Advanced options
                      </span>
                      <span className="text-[12px] text-muted-foreground">{advOpen ? 'Hide' : 'Show'}</span>
                    </button>
                    <AnimatePresence initial={false}>
                      {advOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: EASE }}
                          className="overflow-hidden">
                          <div className="flex flex-col gap-4 border-t border-border px-3.5 py-4">
                            <div className="space-y-1.5">
                              <Label htmlFor="ai-level" className="field-label">
                                <Sparkles size={12} /> AI obfuscation
                              </Label>
                              <Select value={aiLevel} onValueChange={setAiLevel}>
                                <SelectTrigger id="ai-level" className="h-10"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="off">Off — no obfuscation</SelectItem>
                                  <SelectItem value="standard">Standard — light noise injection</SelectItem>
                                  <SelectItem value="enhanced">Enhanced — frequency-domain masking</SelectItem>
                                  <SelectItem value="maximum">Maximum — adversarial cover</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="domain" className="field-label">
                                <Globe size={12} /> Custom extraction domain
                              </Label>
                              <Input id="domain" placeholder="extract.yourdomain.com"
                                value={domain} onChange={e => setDomain(e.target.value)} className="h-10" />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex-1 flex flex-col gap-2.5">
                    <h3 className="text-[14px] font-semibold">Review &amp; generate</h3>
                    <dl className="flex flex-col gap-2 text-[13px]">
                      {[
                        ['Carrier image', image?.name, ImageIcon],
                        ['Secret length', `${secret.length} characters`, KeyRound],
                        ['Encryption', 'AES-256-GCM', Lock],
                        ['AI obfuscation', aiLevel[0].toUpperCase() + aiLevel.slice(1), Sparkles],
                      ].map(([k, v, Icon]) => (
                        <div key={k} className="flex items-center gap-2.5">
                          <Icon size={14} className="text-muted-foreground shrink-0" />
                          <dt className="text-muted-foreground">{k}</dt>
                          <dd className="ml-auto font-medium truncate max-w-[180px]">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 sm:border-l sm:border-border sm:pl-6">
                    <SecurityRing score={securityScore} />
                    <span className="text-[12px] text-muted-foreground">Security score</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      {!done && (
        <CardFooter className="justify-between">
          <Button variant="ghost" onClick={back} disabled={step === 1 || loading}
            className="gap-1.5 text-muted-foreground">
            <ArrowLeft size={15} /> Back
          </Button>
          {step < 4 ? (
            <Button onClick={next} disabled={!canAdvance} className="gap-1.5">
              Continue <ArrowRight size={15} />
            </Button>
          ) : (
            <Button onClick={handleEncode} disabled={loading} aria-busy={loading} className="gap-2">
              {loading ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
              {loading ? 'Generating…' : 'Generate secure image'}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}

// ── RowActions ──────────────────────────────────────────────────────────────

function RowActions({ entry, onDelete, onEdit }) {
  const [viewOpen, setViewOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [newLabel, setNewLabel] = useState(entry.label || entry.hash)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Row actions"
            className="size-8 text-muted-foreground hover:text-foreground">
            <MoreHorizontal size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem className="gap-2" onClick={() => setTimeout(() => setViewOpen(true), 0)}>
            <Eye size={14} /> View details
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2" onClick={() => setTimeout(() => setEditOpen(true), 0)}>
            <Pencil size={14} /> Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
            onClick={() => { onDelete(entry.id); toast('Secret removed from vault') }}
          >
            <Trash2 size={14} /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Secret details</DialogTitle>
            <DialogDescription>How this entry is stored in your vault.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 text-[13px]">
            {[
              ['Label', entry.label || entry.hash, false],
              ['Reference', entry.hash, true],
              ['Date created', entry.date, false],
            ].map(([k, v, mono]) => (
              <div key={k}>
                <p className="text-[12px] text-muted-foreground mb-1">{k}</p>
                <p className={cn(mono && 'font-mono text-primary break-all')}>{v}</p>
              </div>
            ))}
            <div>
              <p className="text-[12px] text-muted-foreground mb-1.5">Encryption</p>
              <Badge variant="secondary" className="gap-1.5 font-medium">
                <Lock size={11} /> {entry.enc}
              </Badge>
            </div>
            <p className="text-[12px] text-muted-foreground pt-3 border-t border-border">
              The stego image was downloaded at encode time. Re-encode to produce a new copy.
            </p>
          </div>
          <Button variant="outline" className="w-full" onClick={() => setViewOpen(false)}>Close</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename secret</DialogTitle>
            <DialogDescription>Give this entry a label that's easy to recognize.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label className="field-label">Label</Label>
            <Input autoFocus value={newLabel} onChange={e => setNewLabel(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { onEdit(entry.id, newLabel); setEditOpen(false); toast('Secret renamed') } }} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={() => { onEdit(entry.id, newLabel); setEditOpen(false); toast('Secret renamed') }}>
              Save changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ── RecentActivity ──────────────────────────────────────────────────────────

function RecentActivity({ secrets, onDelete, onEdit }) {
  const pct = Math.min(Math.round((secrets.length / VAULT_CAP) * 100), 100)
  return (
    <Card>
      <CardHeader className="border-b border-border">
        <div className="flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Clock size={16} />
        </div>
        <CardTitle className="text-[14px]">Recent activity</CardTitle>
        <CardDescription className="text-[12.5px]">Secrets encoded on this device.</CardDescription>
        <CardAction>
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2">
              <HardDrive size={13} className="text-muted-foreground" />
              <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-[11.5px] text-muted-foreground tabular-nums">{secrets.length}/{VAULT_CAP}</span>
            </div>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        {secrets.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <FileImage size={18} />
            </div>
            <p className="text-[13px] text-muted-foreground">No secrets yet — encode one above to get started.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[12px] pl-6">Secret</TableHead>
                <TableHead className="text-[12px]">Created</TableHead>
                <TableHead className="text-[12px]">Encryption</TableHead>
                <TableHead className="text-[12px] w-12 pr-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {secrets.map(row => (
                <TableRow key={row.id}>
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground shrink-0">
                        <FileImage size={14} />
                      </div>
                      <div className="min-w-0">
                        {row.label && row.label !== row.hash && (
                          <p className="text-[13px] font-medium truncate max-w-[200px]">{row.label}</p>
                        )}
                        <p className="text-[11.5px] font-mono text-muted-foreground">{row.hash}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-[13px] text-muted-foreground tabular-nums whitespace-nowrap">{row.date}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="gap-1.5 font-medium text-[11.5px]">
                      <Lock size={10} /> {row.enc}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-6">
                    <RowActions entry={row} onDelete={onDelete} onEdit={onEdit} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

// ── EncodeView ──────────────────────────────────────────────────────────────

function EncodeView() {
  const [secrets, setSecrets] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sv_secrets') || '[]') } catch { return [] }
  })
  const update = (fn) => setSecrets(prev => {
    const next = fn(prev)
    localStorage.setItem('sv_secrets', JSON.stringify(next))
    return next
  })
  const addSecret  = (entry) => update(prev => [entry, ...prev])
  const delSecret  = (id)    => update(prev => prev.filter(s => s.id !== id))
  const editSecret = (id, label) => update(prev => prev.map(s => s.id === id ? { ...s, label } : s))

  return (
    <div className="encode-view">
      <EncodeWizard onSuccess={addSecret} />
      <RecentActivity secrets={secrets} onDelete={delSecret} onEdit={editSecret} />
    </div>
  )
}

// ── DecodeView ──────────────────────────────────────────────────────────────

function DecodeView() {
  const [image, setImage]       = useState(null)
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState(null)
  const [copied, setCopied]     = useState(false)

  const handleDecode = async () => {
    if (!image)    { toast.error('Stego image required'); return }
    if (!password) { toast.error('Master password required'); return }
    setLoading(true); setResult(null)
    const form = new FormData()
    form.append('image', image); form.append('password', password)
    try {
      const res  = await fetch(`${API}/decode/`, { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Decoding failed.')
      setResult(data.secret)
      toast.success('Secret extracted', { description: 'Decrypted with your master password.' })
    } catch (e) { toast.error('Decoding failed', { description: e.message }) }
    finally { setLoading(false) }
  }

  const copy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    toast('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="section-view">
      <Card>
        <CardHeader>
          <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <LockOpen size={18} />
          </div>
          <CardTitle className="text-[15px]">Decode a secret</CardTitle>
          <CardDescription className="text-[13px]">
            Extract and decrypt the hidden payload from a stego image.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="space-y-2">
            <Label className="field-label">Stego image</Label>
            <ImageDropZone file={image} onFile={setImage} label="Drop the stego image to decode" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="decode-password" className="field-label">Master password</Label>
            <PasswordInput
              id="decode-password" autoComplete="current-password"
              placeholder="The password used when encoding"
              value={password} onChange={e => setPassword(e.target.value)}
            />
          </div>
          <Button onClick={handleDecode} disabled={loading} aria-busy={loading} className="self-start gap-2">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <LockOpen size={15} />}
            {loading ? 'Decrypting…' : 'Decode secret'}
          </Button>

          <AnimatePresence>
            {result !== null && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="rounded-[var(--radius)] border border-border overflow-hidden">
                <div className="flex justify-between items-center px-3.5 py-2.5 bg-muted/40 border-b border-border">
                  <span className="flex items-center gap-1.5 text-[12px] font-medium text-primary">
                    <CheckCircle2 size={13} /> Recovered secret
                  </span>
                  <Button variant="ghost" size="sm" onClick={copy} className="h-7 gap-1.5 text-[12px]">
                    {copied ? <Check size={13} /> : <Copy size={13} />}{copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <pre className="p-3.5 font-mono text-[13px] whitespace-pre-wrap break-all leading-relaxed">{result}</pre>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}

// ── AnalyzeView ─────────────────────────────────────────────────────────────

const RATING_CLASSES = {
  excellent: 'border-primary/30 bg-primary/10 text-primary',
  good:      'border-[color-mix(in_oklch,var(--info)_30%,transparent)] bg-[color-mix(in_oklch,var(--info)_12%,transparent)] text-[var(--info)]',
  fair:      'border-[color-mix(in_oklch,var(--warning)_30%,transparent)] bg-[color-mix(in_oklch,var(--warning)_12%,transparent)] text-[var(--warning)]',
  poor:      'border-destructive/30 bg-destructive/10 text-destructive',
  error:     'border-destructive/30 bg-destructive/10 text-destructive',
}
function scoreColor(s) {
  return s >= 80 ? 'var(--chart-1)' : s >= 60 ? 'var(--chart-2)' : s >= 40 ? 'var(--chart-3)' : 'var(--destructive)'
}

function AnalyzeView() {
  const [images, setImages]   = useState([])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)

  const handleAnalyze = async () => {
    if (!images.length) { toast.error('Upload at least one image'); return }
    setLoading(true); setResults(null)
    const form = new FormData()
    images.forEach(img => form.append('images', img))
    try {
      const res  = await fetch(`${API}/analyze/`, { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed.')
      setResults(data)
      toast.success(`Analyzed ${data.total} image${data.total !== 1 ? 's' : ''}`)
    } catch (e) { toast.error('Analysis failed', { description: e.message }) }
    finally { setLoading(false) }
  }

  return (
    <div className="section-view">
      <Card>
        <CardHeader>
          <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <ScanSearch size={18} />
          </div>
          <CardTitle className="text-[15px]">Carrier analysis</CardTitle>
          <CardDescription className="text-[13px]">
            Score images by entropy, chi-square uniformity, and noise variance to find the best hiding carrier.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="space-y-2">
            <Label htmlFor="analyze-images" className="field-label">Upload images (up to 10)</Label>
            <label htmlFor="analyze-images" className="multi-upload">
              <input id="analyze-images" type="file" accept="image/*" multiple className="hidden"
                onChange={e => { setImages(Array.from(e.target.files).slice(0, 10)); setResults(null) }} />
              <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <UploadCloud size={20} className="dz-plus" />
              </div>
              <span className="dz-label">
                {images.length ? `${images.length} image${images.length !== 1 ? 's' : ''} selected` : 'Click to select images'}
              </span>
            </label>
          </div>
          {images.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {images.map((f, i) => (
                <Badge key={i} variant="secondary" className="text-[11.5px] max-w-[170px] truncate">{f.name}</Badge>
              ))}
            </div>
          )}
          <Button onClick={handleAnalyze} disabled={loading} aria-busy={loading} className="self-start gap-2">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <ScanSearch size={15} />}
            {loading ? 'Analyzing…' : 'Analyze carriers'}
          </Button>

          {results && (
            <div className="flex flex-col gap-4">
              {results.recommended && (
                <div className="flex justify-between items-center rounded-[var(--radius)] border border-primary/25 bg-primary/[0.06] px-4 py-3.5 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-md bg-primary/12 text-primary">
                      <Sparkles size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12px] text-muted-foreground">Recommended carrier</span>
                      <span className="text-[13.5px] font-medium">{results.recommended.filename}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-2xl font-semibold text-primary leading-none tabular-nums">
                      {results.recommended.score}<small className="text-[12px] font-medium text-muted-foreground">/100</small>
                    </span>
                    <span className="text-[11.5px] text-muted-foreground max-w-[220px] text-right leading-snug">
                      {results.recommended.recommendation}
                    </span>
                  </div>
                </div>
              )}
              <div className="cards-grid">
                {results.results.map((r, i) => (
                  <Card key={i} className={cn('relative', i === 0 && 'ring-1 ring-primary/30')}>
                    {i === 0 && (
                      <Badge className="absolute -top-2 left-3 gap-1 text-[10.5px] font-medium">
                        <Check size={11} /> Best
                      </Badge>
                    )}
                    <CardContent className="flex flex-col gap-2.5">
                      <div className="flex justify-between items-center gap-1.5">
                        <span className="text-[13px] font-medium truncate max-w-[140px]" title={r.filename}>{r.filename}</span>
                        <Badge variant="outline" className={cn('text-[10.5px] font-medium', RATING_CLASSES[r.rating?.toLowerCase()] ?? 'border-border')}>
                          {r.rating}
                        </Badge>
                      </div>
                      {r.error ? (
                        <p className="text-[12.5px] text-destructive">{r.error}</p>
                      ) : (
                        <>
                          <div className="flex items-center gap-2.5">
                            <span className="text-[13px] font-semibold tabular-nums min-w-[38px]">{r.score}<span className="text-muted-foreground font-normal">/100</span></span>
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full rounded-full score-bar" style={{ width: `${r.score}%`, background: scoreColor(r.score) }} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            {[
                              ['Entropy',  r.metrics?.entropy],
                              ['Chi²',     r.metrics?.chi_square],
                              ['Capacity', `${r.capacity?.kb} KB`],
                              ['Size',     r.dimensions],
                            ].map(([k, v]) => (
                              <div key={k} className="bg-muted/50 rounded-md p-2 flex flex-col gap-0.5">
                                <span className="text-[10.5px] text-muted-foreground">{k}</span>
                                <strong className="text-[12.5px] font-semibold tabular-nums">{v}</strong>
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

const encodeSeriesConfig = {
  encodes: { label: 'Encodes', color: 'var(--chart-1)' },
}

function loadSecrets() {
  try { return JSON.parse(localStorage.getItem('sv_secrets') || '[]') } catch { return [] }
}
function startOfDay(ms) { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d }
function buildDailySeries(secrets, days) {
  const today = startOfDay(Date.now())
  const buckets = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i)
    buckets.push({ key: d.getTime(), label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), encodes: 0 })
  }
  const idx = new Map(buckets.map(b => [b.key, b]))
  for (const s of secrets) {
    const b = idx.get(startOfDay(s.id ?? Date.now()).getTime())
    if (b) b.encodes++
  }
  return buckets
}

function StatCard({ Icon, label, value, change, subtitle, tone = 'chart-1' }) {
  const hasChange = typeof change === 'string' && change.length > 0
  const isPos = hasChange && !change.startsWith('-')
  const TrendIcon = isPos ? TrendingUp : TrendingDown
  return (
    <Card className="@container/card gap-2.5">
      <CardHeader>
        <CardDescription className="flex items-center gap-1.5 text-[12.5px]">
          <Icon size={14} style={{ color: `var(--${tone})` }} /> {label}
        </CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums tracking-tight @[200px]/card:text-3xl">{value}</CardTitle>
        {hasChange && (
          <CardAction>
            <Badge variant="outline" className={cn('gap-1 text-[11px] font-medium',
              isPos ? 'text-primary border-primary/30' : 'text-destructive border-destructive/30')}>
              <TrendIcon className="size-3" />{change}
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardFooter className="text-[12px] text-muted-foreground">{subtitle}</CardFooter>
    </Card>
  )
}

function EmptyChart({ label, height = 210 }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 text-center" style={{ height }}>
      <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <BarChart3 size={18} />
      </div>
      <p className="text-[13px] text-muted-foreground">{label}</p>
    </div>
  )
}

const SECURITY_LAYERS = [
  { Icon: KeyRound,    title: 'AES-256-GCM',        desc: 'Authenticated encryption of every payload' },
  { Icon: Layers,      title: 'LSB steganography',  desc: 'Payload hidden in least-significant bits' },
  { Icon: ShieldCheck, title: 'Local-only key',     desc: 'Master password never leaves your device' },
  { Icon: Sparkles,    title: 'AI obfuscation',     desc: 'Optional adversarial carrier masking' },
]

function AnalyticsView() {
  const [range, setRange] = useState('14d')
  const secrets = useMemo(loadSecrets, [])
  const DAY = 86400000
  const now = Date.now()

  const total = secrets.length
  const thisWeek = secrets.filter(s => now - (s.id ?? 0) < 7 * DAY).length
  const lastWeek = secrets.filter(s => { const a = now - (s.id ?? 0); return a >= 7 * DAY && a < 14 * DAY }).length
  const weekChange = lastWeek === 0
    ? (thisWeek > 0 ? `+${thisWeek}` : '')
    : `${thisWeek - lastWeek >= 0 ? '+' : ''}${Math.round(((thisWeek - lastWeek) / lastWeek) * 100)}%`
  const vaultPct = Math.min(Math.round((total / VAULT_CAP) * 100), 100)
  const lastMs = total ? secrets.reduce((m, s) => Math.max(m, s.id ?? 0), 0) : 0
  const lastLabel = lastMs ? new Date(lastMs).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'

  const days = range === '7d' ? 7 : range === '30d' ? 30 : 14
  const series = useMemo(() => buildDailySeries(secrets, days), [secrets, days])
  const peak = series.reduce((m, b) => Math.max(m, b.encodes), 0)

  const capacityData = [
    { name: 'Used', value: total },
    { name: 'Free', value: Math.max(VAULT_CAP - total, 1) },
  ]

  return (
    <div className="analytics-view">
      <div className="stats-row">
        <StatCard Icon={Database}  label="Secrets encoded"   value={total}            subtitle="Stored on this device"          tone="chart-1" />
        <StatCard Icon={Lock}      label="Encoded this week" value={thisWeek} change={weekChange} subtitle="vs. previous 7 days"  tone="chart-2" />
        <StatCard Icon={HardDrive} label="Vault used"        value={`${vaultPct}%`}   subtitle={`${total} of ${VAULT_CAP} slots`} tone="chart-3" />
        <StatCard Icon={Clock}     label="Last activity"     value={lastLabel}        subtitle={total ? 'Most recent encode' : 'No activity yet'} tone="chart-4" />
      </div>

      <div className="charts-grid">
        <Card className="chart-wide gap-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[13.5px]">
              <Activity size={15} className="text-muted-foreground" /> Encoding activity
            </CardTitle>
            <CardDescription className="text-[12.5px]">Secrets encoded per day on this device.</CardDescription>
            <CardAction>
              <ToggleGroup value={[range]} onValueChange={v => v[0] && setRange(v[0])}
                variant="outline" size="sm" className="hidden sm:flex">
                {['7d', '14d', '30d'].map(r => (
                  <ToggleGroupItem key={r} value={r} className="text-[12px] px-2.5">{r}</ToggleGroupItem>
                ))}
              </ToggleGroup>
            </CardAction>
          </CardHeader>
          <CardContent>
            {peak === 0 ? (
              <EmptyChart label="No secrets encoded in this range yet." />
            ) : (
              <ChartContainer config={encodeSeriesConfig} className="h-[210px] w-full">
                <AreaChart data={series} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="gEnc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-encodes)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--color-encodes)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} minTickGap={24} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} allowDecimals={false} width={26} />
                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} cursor={{ stroke: 'var(--border)' }} />
                  <Area type="monotone" dataKey="encodes" stroke="var(--color-encodes)" strokeWidth={2} fill="url(#gEnc)" />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="gap-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[13.5px]">
              <Database size={15} className="text-muted-foreground" /> Vault capacity
            </CardTitle>
            <CardDescription className="text-[12.5px]">{total} of {VAULT_CAP} slots used.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4 flex-1">
            <div className="relative inline-flex items-center justify-center shrink-0">
              <PieChart width={132} height={132}>
                <Pie data={capacityData} cx={65} cy={65} innerRadius={40} outerRadius={58} dataKey="value" strokeWidth={0} startAngle={90} endAngle={-270}>
                  <Cell fill="var(--chart-1)" />
                  <Cell fill="var(--muted)" />
                </Pie>
              </PieChart>
              <div className="absolute flex flex-col items-center pointer-events-none">
                <span className="text-[22px] font-semibold tabular-nums tracking-tight">{vaultPct}%</span>
                <span className="text-[11px] text-muted-foreground">Used</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-[13px]">
              <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-[var(--chart-1)]" /> Used · {total}</div>
              <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-muted border border-border" /> Free · {Math.max(VAULT_CAP - total, 0)}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-3 [grid-column:1/-1]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[13.5px]">
              <ShieldCheck size={15} className="text-muted-foreground" /> Security posture
            </CardTitle>
            <CardDescription className="text-[12.5px]">
              Every secret in this vault is protected by the full stack below.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SECURITY_LAYERS.map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 rounded-[var(--radius)] border border-border bg-muted/30 p-3">
                <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
                  <Icon size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium">{title}</p>
                  <p className="text-[12px] text-muted-foreground leading-snug">{desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ── App Shell ───────────────────────────────────────────────────────────────

const TAB_TITLES = {
  encode:    'Encode',
  decode:    'Decode',
  analyze:   'Carrier analysis',
  analytics: 'Analytics',
}

function Dashboard() {
  const [tab, setTab] = useState('encode')
  const { user } = useAuth()
  return (
      <SidebarProvider>
        <AppSidebar activeTab={tab} onTabChange={setTab} user={user} />
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur-md">
            <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
            <Separator orientation="vertical" className="mx-1 h-4" />
            <span className="text-[14px] font-semibold tracking-tight">{TAB_TITLES[tab]}</span>
            <div className="ml-auto flex items-center gap-1.5">
              {['AES-256-GCM', 'LSB', 'AI'].map(b => (
                <Badge key={b} variant="outline" className="hidden text-[11px] font-medium text-muted-foreground sm:flex">{b}</Badge>
              ))}
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            <div className="sv-content">
              <AnimatePresence mode="wait">
                <motion.div key={tab}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: EASE }}>
                  {tab === 'encode'    && <EncodeView />}
                  {tab === 'decode'    && <DecodeView />}
                  {tab === 'analyze'   && <AnalyzeView />}
                  {tab === 'analytics' && <AnalyticsView />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
  )
}

function SplashLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <ShieldCheck size={20} />
        </div>
        <Loader2 size={18} className="animate-spin text-muted-foreground" />
      </div>
    </div>
  )
}

export default function App() {
  const { user, loading } = useAuth()
  return (
    <TooltipProvider delayDuration={300}>
      {loading ? <SplashLoader /> : user ? <Dashboard /> : <AuthPages />}
      <Toaster position="bottom-right" />
    </TooltipProvider>
  )
}
