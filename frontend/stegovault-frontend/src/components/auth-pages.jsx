import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck, Loader2, Eye, EyeOff, KeyRound, Layers, ScanSearch, ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/auth'
import { toast } from 'sonner'

const EASE = [0.22, 1, 0.36, 1]

const FEATURES = [
  { Icon: KeyRound,    title: 'AES-256-GCM encryption', desc: 'Authenticated encryption on every payload.' },
  { Icon: Layers,      title: 'LSB steganography',      desc: 'Secrets hidden inside ordinary images.' },
  { Icon: ShieldCheck, title: 'Local-only keys',        desc: 'Your master password never leaves the device.' },
  { Icon: ScanSearch,  title: 'AI carrier analysis',    desc: 'Pick the strongest cover image automatically.' },
]

function strength(pw) {
  if (!pw) return 0
  let s = 0
  if (pw.length >= 8) s++
  if (pw.length >= 14) s++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++
  return Math.min(s, 4)
}
const SLABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']
const SCOLORS = ['var(--muted)', 'var(--destructive)', 'var(--warning)', 'var(--info)', 'var(--success)']

function PasswordField({ id, value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input id={id} type={show ? 'text' : 'password'} value={value} onChange={onChange}
        placeholder={placeholder} autoComplete={autoComplete} className="h-11 pr-10" />
      <button type="button" onClick={() => setShow(s => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  )
}

export function AuthPages() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const isSignup = mode === 'signup'
  const pw = strength(password)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isSignup) {
        await register(name, email, password)
        toast.success('Account created', { description: 'Welcome to StegoVault.' })
      } else {
        await login(email, password)
        toast.success('Welcome back')
      }
    } catch (err) {
      toast.error(isSignup ? 'Could not create account' : 'Could not sign in', { description: err.message })
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* ── Form side ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-9 flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShieldCheck size={18} />
            </div>
            <div className="leading-none">
              <p className="text-[15px] font-semibold tracking-tight">StegoVault</p>
              <p className="mt-1 text-[12px] text-muted-foreground">Secure steganography</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={mode}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: EASE }}>
              <h1 className="text-2xl font-semibold tracking-tight">
                {isSignup ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="mt-1.5 mb-7 text-[14px] text-muted-foreground">
                {isSignup ? 'Start protecting secrets in seconds.' : 'Sign in to access your vault.'}
              </p>

              <form onSubmit={submit} className="flex flex-col gap-4">
                {isSignup && (
                  <div className="space-y-2">
                    <Label htmlFor="auth-name">Name</Label>
                    <Input id="auth-name" value={name} onChange={e => setName(e.target.value)}
                      placeholder="Ada Lovelace" autoComplete="name" className="h-11" />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="auth-email">Email</Label>
                  <Input id="auth-email" type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com" autoComplete="email" className="h-11" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auth-password">Password</Label>
                    {!isSignup && (
                      <button type="button" className="text-[12.5px] text-muted-foreground hover:text-foreground transition-colors">
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <PasswordField id="auth-password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder={isSignup ? 'At least 8 characters' : 'Your password'}
                    autoComplete={isSignup ? 'new-password' : 'current-password'} />
                  {isSignup && password && (
                    <div className="flex items-center gap-2 pt-0.5">
                      <div className="flex flex-1 gap-1">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="h-1 flex-1 rounded-full transition-colors"
                            style={{ background: i <= pw ? SCOLORS[pw] : 'var(--muted)' }} />
                        ))}
                      </div>
                      <span className="text-[11.5px] font-medium" style={{ color: pw ? SCOLORS[pw] : 'var(--muted-foreground)' }}>
                        {pw ? SLABELS[pw] : ''}
                      </span>
                    </div>
                  )}
                </div>
                <Button type="submit" disabled={loading} className="mt-1 h-11 gap-2">
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {isSignup ? 'Create account' : 'Sign in'}
                  {!loading && <ArrowRight size={15} />}
                </Button>
              </form>

              <p className="mt-6 text-center text-[13.5px] text-muted-foreground">
                {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button type="button" onClick={() => setMode(isSignup ? 'login' : 'signup')}
                  className="font-medium text-foreground transition-colors hover:text-primary">
                  {isSignup ? 'Sign in' : 'Sign up'}
                </button>
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Brand side ────────────────────────────────────────────── */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-l border-border p-12 lg:flex">
        <div className="absolute inset-0 -z-10"
          style={{ background: 'radial-gradient(110% 110% at 90% -5%, color-mix(in oklch, var(--primary) 40%, var(--background)) 0%, color-mix(in oklch, var(--primary) 10%, var(--background)) 32%, var(--background) 62%)' }} />
        <div className="absolute inset-0 -z-10 opacity-[0.4]"
          style={{ backgroundImage: 'radial-gradient(color-mix(in oklch, var(--foreground) 8%, transparent) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
        <svg className="absolute -right-24 top-1/2 -z-10 -translate-y-1/2 opacity-30"
          width="600" height="600" viewBox="0 0 600 600" fill="none">
          {[75, 150, 225, 300].map(r => (
            <circle key={r} cx="300" cy="300" r={r} stroke="var(--primary)" strokeWidth="1" />
          ))}
          <circle cx="300" cy="300" r="6" fill="var(--primary)" />
        </svg>

        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary" /> Enterprise-grade steganography
        </div>

        <div>
          <h2 className="max-w-md text-[30px] font-semibold leading-tight tracking-tight">
            Hide what matters, in plain sight.
          </h2>
          <p className="mt-3.5 max-w-sm text-[14.5px] text-muted-foreground leading-relaxed">
            StegoVault encrypts your secrets and embeds them inside ordinary images — undetectable,
            and recoverable only by you.
          </p>
          <div className="mt-9 grid max-w-md gap-3.5">
            {FEATURES.map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 items-center justify-center rounded-md bg-primary/12 text-primary shrink-0">
                  <Icon size={15} />
                </div>
                <div>
                  <p className="text-[13.5px] font-medium">{title}</p>
                  <p className="text-[12.5px] text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[12px] text-muted-foreground">
          AES-256-GCM · LSB steganography · AI carrier scoring
        </p>
      </div>
    </div>
  )
}
