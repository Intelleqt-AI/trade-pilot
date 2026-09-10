import { useState } from "react"
import { Eye, EyeOff, Lock, Mail, Loader2, ArrowRight } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "@/lib/toast"
import { Logo } from "@/components/trade-pilot/Logo"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    try {
      const res: any = await signIn(email, password)
      const user = res?.data?.user
      if (user?.user_type === 'trade') {
        navigate('/trades-crm')
      } else {
        navigate('/dashboard')
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.errors?.detail || 'Invalid email or password.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-navy-800 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-teal-500 translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-orange-500 -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative z-10">
          <Logo onDark />
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Connect with the best <span className="text-teal-400">tradespeople</span> in your area
            </h2>
            <p className="mt-4 text-white/60 text-lg leading-relaxed">
              Thousands of verified trades professionals. Post a job, get quotes, get it done.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { value: '10,000+', label: 'Verified Trades' },
              { value: '50,000+', label: 'Jobs Completed' },
              { value: '4.9★', label: 'Average Rating' },
              { value: '£0', label: 'Free to Post' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-teal-400">{stat.value}</div>
                <div className="text-sm text-white/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/30 text-sm">
          © {new Date().getFullYear()} Trade Pilot. All rights reserved.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24 bg-background">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <Logo onDark={false} />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground mt-2">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder-gray-400 focus:outline-none focus:ring-[3px] focus:ring-primary/25 focus:border-primary transition-all duration-200 text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-border bg-background text-foreground placeholder-gray-400 focus:outline-none focus:ring-[3px] focus:ring-primary/25 focus:border-primary transition-all duration-200 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-primary hover:bg-teal-600 text-white font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-sm hover:shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs text-muted-foreground bg-background px-3">
              Don't have an account?
            </div>
          </div>

          {/* Sign up CTA */}
          <Link
            to="/trades/join"
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl border-2 border-secondary text-secondary font-semibold text-sm hover:bg-secondary hover:text-secondary-foreground transition-all duration-200"
          >
            Create Trade Professional account
            <ArrowRight className="w-4 h-4" />
          </Link>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By signing in you agree to our{' '}
            <Link to="/terms" className="underline hover:text-foreground">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
