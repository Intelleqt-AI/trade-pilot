import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Eye, EyeOff, Lock, Mail, User, Hammer } from "lucide-react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { isDemoMode, DEMO_CREDENTIALS } from "@/lib/mockData"

const LoginForm = ({ 
  type, 
  email, 
  setEmail, 
  password, 
  setPassword, 
  showPassword, 
  setShowPassword, 
  loading 
}: { 
  type: string
  email: string
  setEmail: (val: string) => void
  password: string
  setPassword: (val: string) => void
  showPassword: boolean
  setShowPassword: (val: boolean) => void
  loading: boolean
}) => (
  <div className="space-y-4 pt-4">
    <div className="space-y-2">
      <Label htmlFor={`${type}-email`}>Email Address</Label>
      <div className="relative">
        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          id={`${type}-email`}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          className="pl-9"
          required
        />
      </div>
    </div>
    
    <div className="space-y-2">
      <Label htmlFor={`${type}-password`}>Password</Label>
      <div className="relative">
        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          id={`${type}-password`}
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="pl-9 pr-9"
          required
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
    </div>

    <Button type="submit" className="w-full bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 transition-all duration-300 transform hover:scale-[1.02]" disabled={loading}>
      {loading ? 'Signing in...' : 'Sign In'}
    </Button>

    <div className="mt-6 text-center">
      <p className="text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link 
          to={type === 'trade' ? '/trades/join' : '/join'} 
          className="text-primary font-medium hover:underline"
        >
          Sign up as a {type === 'trade' ? 'Trade' : 'Customer'}
        </Link>
      </p>
    </div>
  </div>
)

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [justLoggedIn, setJustLoggedIn] = useState(false)
  const [searchParams] = useSearchParams()
  const initialType = searchParams.get('type') === 'trade' ? 'trade' : 'customer'
  const [activeTab, setActiveTab] = useState(initialType)
  
  const navigate = useNavigate()
  const { signIn, loading, profile, user } = useAuth()

  // Redirect after successful login and profile load
  useEffect(() => {
    if (justLoggedIn && user && profile) {
      if (profile.role === 'trade') {
        navigate('/trades-crm')
      } else {
        navigate('/find-tradespeople')
      }
      setJustLoggedIn(false)
    }
  }, [justLoggedIn, user, profile, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) return

    const { data, error } = await signIn(email, password)
    
    if (data && !error) {
      setJustLoggedIn(true)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-secondary/5 via-background to-primary/5">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="mb-8">
          <Link to="/" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to home</span>
          </Link>
        </div>

        <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm ring-1 ring-black/5">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl font-bold ">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Sign in to manage your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={initialType} onValueChange={(val) => {
              setActiveTab(val);
            }} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-muted/50 rounded-lg">
                <TabsTrigger value="customer" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-md transition-all">
                  <User className="w-4 h-4 mr-2" />
                  Customer
                </TabsTrigger>
                <TabsTrigger value="trade" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-md transition-all">
                  <Hammer className="w-4 h-4 mr-2" />
                  Trade
                </TabsTrigger>
              </TabsList>

              <TabsContent value="customer" className="mt-0 focus-visible:ring-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-medium text-secondary">Customer Login</h3>
                    <p className="text-sm text-muted-foreground">Find and book trusted tradespeople</p>
                  </div>
                  {isDemoMode() && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                      <p className="font-medium text-amber-800 mb-1">Demo Credentials:</p>
                      <p className="text-amber-700">Email: <code className="bg-amber-100 px-1 rounded">{DEMO_CREDENTIALS.customer.email}</code></p>
                      <p className="text-amber-700">Password: <code className="bg-amber-100 px-1 rounded">{DEMO_CREDENTIALS.customer.password}</code></p>
                    </div>
                  )}
                  <LoginForm 
                    type="customer"
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    loading={loading}
                  />
                </form>
              </TabsContent>

              <TabsContent value="trade" className="mt-0 focus-visible:ring-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-medium text-secondary">Trade Professional</h3>
                    <p className="text-sm text-muted-foreground">Manage your business and leads</p>
                  </div>
                  {isDemoMode() && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                      <p className="font-medium text-amber-800 mb-1">Demo Credentials:</p>
                      <p className="text-amber-700">Email: <code className="bg-amber-100 px-1 rounded">{DEMO_CREDENTIALS.trade.email}</code></p>
                      <p className="text-amber-700">Password: <code className="bg-amber-100 px-1 rounded">{DEMO_CREDENTIALS.trade.password}</code></p>
                    </div>
                  )}
                  <LoginForm 
                    type="trade"
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    loading={loading}
                  />
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Login