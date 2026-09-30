import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SocialSignInButtons, { type ProviderCredential } from '@/components/auth/SocialSignInButtons';
import { useAuth } from '@/hooks/useAuth';
import { deleteTradePilotAccount, type ApiError, firstApiMessage } from '@/lib/api';
import { fetchJobs } from '@/lib/api/tpHomeowner';
import { MARKETING_URL } from '@/lib/siteUrl';
import { type Bid } from '@/lib/bids';

const CONFIRM_TEXT = 'DELETE';
const HAS_SOCIAL_BUTTONS = !!(
  import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.VITE_APPLE_CLIENT_ID
);

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

const DeleteAccountPanel = () => {
  const { user, signOut } = useAuth();
  // Google-only accounts have no password to confirm with — the serializer demands a
  // provider credential instead, so offering a password box would be a dead end.
  const hasPassword = user?.has_password !== false;
  const [step, setStep] = useState<'idle' | 'confirm' | 'verify'>('idle');
  const [confirmText, setConfirmText] = useState('');
  const [password, setPassword] = useState('');
  const [credential, setCredential] = useState<ProviderCredential | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Deleting cascades the homeowner's jobs away, taking with them any lead a
  // trader paid to unlock. Show them that before they commit.
  const { data: jobs = [] } = useQuery({
    queryKey: ['ho-jobs'],
    queryFn: fetchJobs,
    enabled: step !== 'idle',
  });

  const jobList: { bids?: Bid[] }[] = Array.isArray(jobs) ? jobs : [];
  const jobCount = jobList.length;
  // A purchased lead always creates a Bid row, so any bid means a trader paid.
  const paidLeadCount = jobList.reduce((n, j) => n + (j.bids?.length ?? 0), 0);

  const reset = () => {
    setStep('idle');
    setConfirmText('');
    setPassword('');
    setCredential(null);
    setError(null);
  };

  const deleteMutation = useMutation({
    mutationFn: () =>
      deleteTradePilotAccount(
        credential
          ? { provider: credential.provider, credential: credential.token }
          : { password },
      ),
    onSuccess: async () => {
      await signOut();
      // /login is trader-only, so send them back to the site they came from.
      window.location.href = MARKETING_URL;
    },
    onError: (err: ApiError) => {
      const errors = err?.response?.data?.errors ?? {};
      const credentialError = firstApiMessage(errors.credential);
      // A rejected provider token is spent — make them pick the account again.
      if (credentialError) setCredential(null);
      setError(
        firstApiMessage(errors.password) ??
          credentialError ??
          firstApiMessage(errors.detail) ??
          err?.response?.data?.message ??
          'Could not delete your account.',
      );
    },
  });

  const canSubmit = password.length > 0 || !!credential;

  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/[0.03] p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
          <Trash2 className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground">Delete account</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Permanently removes your account and everything on it. This cannot be undone.
          </p>

          {step === 'idle' && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3 border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => setStep('confirm')}
            >
              Delete my account
            </Button>
          )}

          {step === 'confirm' && (
            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-2.5 rounded-lg bg-destructive/10 p-3.5 text-xs leading-relaxed text-destructive">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium">This will permanently delete:</p>
                  <ul className="list-disc space-y-0.5 pl-4">
                    <li>your account, profile and saved property</li>
                    <li>
                      {jobCount > 0
                        ? `${plural(jobCount, 'job', 'jobs')} you have posted`
                        : 'any jobs you post'}
                    </li>
                    {paidLeadCount > 0 ? (
                      <li className="font-medium">
                        {plural(paidLeadCount, 'trader has', 'traders have')} paid to contact
                        you — {paidLeadCount === 1 ? 'that conversation' : 'those conversations'}{' '}
                        will be lost for them too
                      </li>
                    ) : (
                      <li>your messages with traders</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="delete-confirm">
                  Type <span className="font-mono font-semibold">{CONFIRM_TEXT}</span> to continue
                </Label>
                <Input
                  id="delete-confirm"
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  placeholder={`Type "${CONFIRM_TEXT}" to confirm`}
                  autoComplete="off"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={reset}>Cancel</Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={confirmText.trim() !== CONFIRM_TEXT}
                  onClick={() => { setError(null); setStep('verify'); }}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 'verify' && (
            <div className="mt-4 space-y-3">
              <button
                type="button"
                className="text-xs text-muted-foreground hover:underline"
                onClick={() => { setError(null); setStep('confirm'); }}
                disabled={deleteMutation.isPending}
              >
                ← Back
              </button>

              {hasPassword && (
                <div className="space-y-1.5">
                  <Label htmlFor="delete-password">
                    Confirm your password
                    {HAS_SOCIAL_BUTTONS && (
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        (optional if using Google below)
                      </span>
                    )}
                  </Label>
                  <Input
                    id="delete-password"
                    type="password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); if (credential) setCredential(null); }}
                    autoComplete="current-password"
                    disabled={deleteMutation.isPending}
                    placeholder="Enter your password"
                    autoFocus
                  />
                </div>
              )}

              {HAS_SOCIAL_BUTTONS && (
                <>
                  {hasPassword && (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 border-t border-border" />
                      <span className="text-xs text-muted-foreground">or</span>
                      <div className="flex-1 border-t border-border" />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label>
                      {hasPassword
                        ? 'Sign in with your account'
                        : 'Confirm with the account you signed up with'}
                    </Label>
                    {credential ? (
                      <div className="flex items-center justify-between gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
                        <span className="text-muted-foreground">
                          {credential.provider === 'apple' ? 'Apple' : 'Google'} account selected
                        </span>
                        <button
                          type="button"
                          className="text-xs text-muted-foreground hover:underline"
                          onClick={() => setCredential(null)}
                          disabled={deleteMutation.isPending}
                        >
                          Use a different account
                        </button>
                      </div>
                    ) : (
                      <SocialSignInButtons
                        variant="reauth"
                        onCredential={c => { setError(null); setPassword(''); setCredential(c); }}
                        onError={setError}
                      />
                    )}
                  </div>
                </>
              )}

              {!hasPassword && !HAS_SOCIAL_BUTTONS && (
                <p className="text-xs text-muted-foreground">
                  Your account has no password, and sign-in with Google is not configured
                  here. Please contact support to delete your account.
                </p>
              )}

              {error && <p className="text-xs text-destructive">{error}</p>}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={reset} disabled={deleteMutation.isPending}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={!canSubmit || deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate()}
                >
                  {deleteMutation.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                  Permanently delete
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountPanel;
