import { useState, useEffect } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/apiClient';
import { Logo } from '@/components/trade-pilot/Logo';

type TokenState = 'validating' | 'valid' | 'invalid';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [tokenState, setTokenState] = useState<TokenState>('validating');
  const [tokenError, setTokenError] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (!token) return;
    apiRequest(`/api/v1/tradepilot/auth/validate-reset-token/?token=${encodeURIComponent(token)}`, {
      method: 'GET',
    }, true)
      .then(() => setTokenState('valid'))
      .catch((err: any) => {
        const errors = err.response?.data?.errors || {};
        const msg =
          errors.token?.[0] ||
          err.response?.data?.message ||
          'This reset link is invalid or has expired.';
        setTokenError(msg);
        setTokenState('invalid');
      });
  }, [token]);

  if (user) return <Navigate to="/trades-crm" replace />;
  if (!token) return <Navigate to="/forgot-password" replace />;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (newPassword.length < 8) errs.newPassword = 'Password must be at least 8 characters.';
    if (newPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      await apiRequest('/api/v1/tradepilot/auth/reset-password/', {
        method: 'POST',
        body: JSON.stringify({ token, new_password: newPassword, confirm_password: confirmPassword }),
      }, true);
      setDone(true);
    } catch (err: any) {
      const errors = err.response?.data?.errors || {};
      const msg =
        errors.token?.[0] ||
        errors.new_password?.[0] ||
        errors.confirm_password?.[0] ||
        errors.non_field_errors?.[0] ||
        err.response?.data?.message ||
        'Something went wrong. Try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const leftPanel = (
    <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-navy-800 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-teal-500 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-orange-500 -translate-x-1/2 translate-y-1/2" />
      </div>
      <div className="relative z-10">
        <Logo onDark />
      </div>
      <div className="relative z-10 space-y-4">
        <h2 className="text-4xl font-bold text-white leading-tight">
          Set a new <span className="text-teal-400">password</span>
        </h2>
        <p className="text-white/60 text-lg leading-relaxed">
          Choose a strong password to keep your account secure.
        </p>
      </div>
      <p className="relative z-10 text-white/30 text-sm">
        © {new Date().getFullYear()} Trade Pilot. All rights reserved.
      </p>
    </div>
  );

  const mobileLogo = (
    <div className="lg:hidden mb-10">
      <Logo onDark={false} />
    </div>
  );

  if (tokenState === 'validating') {
    return (
      <div className="min-h-screen w-full flex">
        {leftPanel}
        <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24 bg-background">
          <div className="w-full max-w-md mx-auto">
            {mobileLogo}
            <div className="flex flex-col items-center gap-4 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
              <p className="text-muted-foreground text-sm">Validating your reset link…</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tokenState === 'invalid') {
    return (
      <div className="min-h-screen w-full flex">
        {leftPanel}
        <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24 bg-background">
          <div className="w-full max-w-md mx-auto">
            {mobileLogo}
            <div className="text-center space-y-5">
              <div className="mx-auto w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-7 w-7 text-red-500" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">Link invalid or expired</h1>
                <p className="text-muted-foreground text-sm">{tokenError}</p>
              </div>
              <Link
                to="/forgot-password"
                className="block w-full py-3 px-6 rounded-xl bg-primary hover:bg-teal-600 text-white font-semibold text-sm text-center transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Request a new link
              </Link>
              <Link
                to="/login"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex">
      {leftPanel}

      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24 bg-background">
        <div className="w-full max-w-md mx-auto">
          {mobileLogo}

          {done ? (
            <div className="text-center space-y-5">
              <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-green-600" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">Password reset!</h1>
                <p className="text-muted-foreground text-sm">
                  Your password has been updated. You can now sign in with your new password.
                </p>
              </div>
              <Link
                to="/login"
                className="block w-full py-3 px-6 rounded-xl bg-primary hover:bg-teal-600 text-white font-semibold text-sm text-center transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Set new password</h1>
                <p className="text-muted-foreground mt-2">Choose a strong password for your account.</p>
              </div>

              {error && (
                <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="space-y-1.5">
                  <label htmlFor="new-password" className="block text-sm font-medium text-foreground">
                    New password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      id="new-password"
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => { setNewPassword(e.target.value); setFieldErrors(p => ({ ...p, newPassword: '' })); }}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      autoFocus
                      disabled={loading}
                      required
                      className={`w-full pl-10 pr-12 py-3 rounded-xl border bg-background text-foreground placeholder-gray-400 focus:outline-none focus:ring-[3px] focus:ring-primary/25 focus:border-primary transition-all duration-200 text-sm disabled:opacity-60 ${fieldErrors.newPassword ? 'border-red-400' : 'border-border'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {fieldErrors.newPassword && <p className="text-xs text-red-500">{fieldErrors.newPassword}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-foreground">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      id="confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => { setConfirmPassword(e.target.value); setFieldErrors(p => ({ ...p, confirmPassword: '' })); }}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      disabled={loading}
                      required
                      className={`w-full pl-10 pr-12 py-3 rounded-xl border bg-background text-foreground placeholder-gray-400 focus:outline-none focus:ring-[3px] focus:ring-primary/25 focus:border-primary transition-all duration-200 text-sm disabled:opacity-60 ${fieldErrors.confirmPassword ? 'border-red-400' : 'border-border'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && <p className="text-xs text-red-500">{fieldErrors.confirmPassword}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-primary hover:bg-teal-600 text-white font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Resetting…</>
                  ) : (
                    'Reset password'
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                <Link to="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
                  ← Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
