import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Mail, RefreshCw, ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { usePost } from "@/hooks/usePost";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/lib/toast";
import { patchData } from "@/lib/api";
import { readJobIntent } from "@/lib/jobIntent";

const VerifyEmail = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const { verifyEmail, setAuthUser } = useAuth();

  const pendingToken = useMemo(() => params.get("pending_token") || "", [params]);
  const email = useMemo(() => params.get("email") || "", [params]);

  // verifyEmail goes through postAuth, which seeds the /me/ cache — without that
  // the user stays "logged out" to the app despite holding valid cookies, and
  // every route guard bounces them to /login.
  const verifyMutation = useMutation({
    mutationFn: () => verifyEmail(pendingToken, otp),
    onSuccess: async (res: any) => {
      const user = res?.data?.user;
      toast.success("Email verified! Welcome to TradePilot.");
      if (user?.user_type === "trade") {
        navigate("/trades-crm");
        return;
      }
      // Came from the marketing site to get quotes — skip the 3-step wizard and
      // go straight to the prefilled job form. Marking onboarding complete keeps
      // HomeownerLayout from bouncing them back into it; the dashboard's Getting
      // Started checklist still prompts for a property.
      if (readJobIntent()) {
        try {
          const patched: any = await patchData({
            url: "/api/v1/tradepilot/auth/me/",
            data: { onboarding_completed: true },
          });
          // PATCH /me/ returns the user directly on `data` (verify-email nests it
          // under `data.user`). Re-seed, or the cached user still says
          // onboarding_completed:false and the layout redirects to the wizard.
          if (patched?.data) setAuthUser(patched.data);
        } catch {
          // Non-fatal: they'd just see onboarding first, intent stays stashed.
        }
        navigate("/homeowner/dashboard");
        return;
      }
      navigate("/homeowner/onboarding");
    },
    onError: (err: any) => {
      const errors = err?.response?.data?.errors ?? {};
      const msg = errors.otp || errors.pending_token || errors.detail || err?.response?.data?.message || "Verification failed.";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });

  const resendMutation = usePost({
    onSuccess: () => toast.success("New verification code sent."),
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to resend code.";
      toast.error(msg);
    },
  });

  const handleVerify = () => {
    if (otp.length !== 6 || !pendingToken) return;
    verifyMutation.mutate();
  };

  const handleResend = () => {
    if (!pendingToken) return;
    setOtp("");
    resendMutation.mutate({
      url: "/api/v1/tradepilot/auth/resend-otp/",
      data: { pending_token: pendingToken },
    } as any);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center text-secondary font-semibold mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to home
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Check your email</h1>
          {email && (
            <p className="text-muted-foreground mt-2">
              We sent a 6-digit code to{" "}
              <span className="font-medium text-foreground">{email}</span>
            </p>
          )}
        </div>

        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-muted-foreground">Enter the verification code</p>
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                disabled={verifyMutation.isPending}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <p className="text-xs text-muted-foreground">Code expires in 15 minutes. Check spam/junk if not in inbox.</p>
            </div>

            <Button
              className="w-full"
              onClick={handleVerify}
              disabled={otp.length !== 6 || verifyMutation.isPending || !pendingToken}
            >
              {verifyMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />Verifying…</>
              ) : (
                "Verify email"
              )}
            </Button>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleResend}
                disabled={resendMutation.isPending || !pendingToken}
              >
                {resendMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />Resending…</>
                ) : (
                  <><RefreshCw className="h-4 w-4 mr-2" />Resend code</>
                )}
              </Button>
              {email && (
                <Button variant="outline" className="flex-1" asChild>
                  <a href={`mailto:${email}`}>
                    <Mail className="h-4 w-4 mr-2" /> Open email app
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Wrong email?{" "}
          <Link to="/join" className="text-primary hover:underline">
            Register again
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
