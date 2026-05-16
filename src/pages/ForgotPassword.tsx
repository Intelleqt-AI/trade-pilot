import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Mail, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/apiClient';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const { user } = useAuth();
  if (user) return <Navigate to="/trades-crm" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await apiRequest('/api/v1/tradepilot/auth/forgot-password/', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }, true);
      setSent(true);
    } catch (err: any) {
      const errors = err.response?.data?.errors || {};
      setError(errors.email?.[0] || err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-[#002B45] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#1A9D8F] translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#FF6B00] -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative z-10">
          <img
            src="/lovable-uploads/7a0926c1-fceb-4602-bd62-9abc593c1b6a.png"
            alt="Trade Pilot"
            className="h-16 w-auto brightness-0 invert"
          />
        </div>
        <div className="relative z-10 space-y-4">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Reset your <span className="text-[#1A9D8F]">password</span>
          </h2>
          <p className="text-white/60 text-lg leading-relaxed">
            Enter your email and we'll send you a secure link to reset your password.
          </p>
        </div>
        <p className="relative z-10 text-white/30 text-sm">
          © {new Date().getFullYear()} Trade Pilot. All rights reserved.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24 bg-white">
        <div className="w-full max-w-md mx-auto">
          <div className="lg:hidden mb-10">
            <img
              src="/lovable-uploads/7a0926c1-fceb-4602-bd62-9abc593c1b6a.png"
              alt="Trade Pilot"
              className="h-12 w-auto"
            />
          </div>

          {sent ? (
            <div className="text-center space-y-5">
              <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-green-600" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-[#002B45]">Check your inbox</h1>
                <p className="text-gray-500 text-sm">
                  If <span className="font-medium text-gray-800">{email}</span> is registered,
                  you'll receive a reset link shortly.
                </p>
              </div>
              <p className="text-xs text-gray-400">
                Didn't get it? Check your spam folder or{' '}
                <button
                  type="button"
                  className="text-[#1A9D8F] hover:underline font-medium"
                  onClick={() => setSent(false)}
                >
                  try again
                </button>
              </p>
              <Link
                to="/login"
                className="block text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#002B45]">Forgot password?</h1>
                <p className="text-gray-500 mt-2">Enter your email and we'll send you a reset link.</p>
              </div>

              {error && (
                <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(''); }}
                      placeholder="name@example.com"
                      autoComplete="email"
                      autoFocus
                      disabled={loading}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A9D8F]/30 focus:border-[#1A9D8F] transition-all duration-200 text-sm disabled:opacity-60"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#1A9D8F] hover:bg-[#157a6e] text-white font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                  ) : (
                    'Send reset link'
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500">
                Remember it?{' '}
                <Link to="/login" className="font-medium text-[#1A9D8F] hover:text-[#157a6e] transition-colors">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
