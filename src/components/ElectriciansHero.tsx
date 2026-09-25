import { useId, useState, type FormEvent } from "react";
import { AlertCircle, Home, MapPin, Receipt, Shield, Zap } from "lucide-react";

const POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
export function formatPostcode(value: string) {
  const compact = value.toUpperCase().replace(/\s+/g, "");
  return compact.length > 3 ? `${compact.slice(0, -3)} ${compact.slice(-3)}` : compact;
}
type ElectriciansHeroProps = { imageSrc?: string; imageAlt?: string; onSubmit?: (postcode: string) => void | Promise<void> };
const TRUST_ITEMS = [
  { icon: Receipt, label: "Reviews from real, invoiced jobs" },
  { icon: Shield, label: "Vetted local trades" },
  { icon: Home, label: "Free for homeowners" },
];

export default function ElectriciansHero({
  imageSrc = "/trade_pilot_electricians_hero.jpg",
  imageAlt = "A modern kitchen lit by pendant lights, track spotlights and under-cabinet LED strips",
  onSubmit,
}: ElectriciansHeroProps) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const [postcode, setPostcode] = useState("");
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = postcode.trim();
    if (!POSTCODE_RE.test(value)) { setError(true); return; }
    const formatted = formatPostcode(value);
    setPending(true);
    try { await onSubmit?.(formatted); setSubmitted(formatted); } finally { setPending(false); }
  }
  return (
    <section aria-labelledby="electricians-hero-title" className="relative overflow-hidden bg-[#001F3D] font-sans lg:min-h-[440px]">
      <img src={imageSrc} alt={imageAlt} className="absolute inset-y-0 right-0 hidden h-full w-[calc(50%-20px)] object-cover object-[50%_30%] lg:block" />
      <svg aria-hidden="true" viewBox="0 0 200 440" preserveAspectRatio="none" className="absolute inset-y-0 left-[calc(50%-60px)] hidden h-full w-[200px] lg:block">
        <path d="M0 0H100C44 120 38 300 132 440H0Z" fill="#001F3D" />
        <path d="M100 0H136C80 120 74 300 168 440H132C38 300 44 120 100 0Z" fill="#1DAFA1" />
        <path d="M136 0H152C96 120 90 300 184 440H168C74 300 80 120 136 0Z" fill="#1DAFA1" opacity="0.35" />
      </svg>
      <div className="relative mx-auto max-w-[1200px] px-4 pb-7 pt-7 lg:px-8 lg:pb-9 lg:pt-10 xl:px-0">
        <div className="flex flex-col lg:w-[calc(50%-60px)] xl:w-[580px]">
          <h1 id="electricians-hero-title" className="text-[30px] font-bold leading-[1.15] tracking-[-0.02em] text-white lg:text-[42px] lg:leading-[1.1]">
            <span className="lg:hidden">Find Local<br />Electricians Near You</span>
            <span className="hidden lg:inline">Find Local Electricians<br />Near You</span>
          </h1>
          <p className="mt-2.5 max-w-[500px] text-base leading-normal text-[#C8D5E2] lg:text-[17px]">Tell us about the job and compare quotes from up to 3 vetted local electricians.</p>
          <div className="mt-[22px] w-full lg:max-w-[460px]">
            {submitted ? (
              <div role="status" className="flex gap-3.5 rounded-2xl border border-white/20 bg-white/[0.06] p-[18px] lg:px-[22px] lg:py-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1DAFA1]/20"><MapPin aria-hidden="true" className="h-5 w-5 text-[#1DAFA1]" /></span>
                <div className="flex flex-col items-start">
                  <p className="text-base font-semibold leading-snug text-white lg:text-[17px]">Thanks. We’ll look for vetted electricians near {submitted}.</p>
                  <p className="mt-1.5 text-[15px] leading-normal text-[#C8D5E2]">Next, tell us a little about the job so up to 3 local electricians can quote.</p>
                  <button type="button" onClick={() => setSubmitted(null)} className="min-h-11 rounded-lg text-[15px] font-semibold text-white underline underline-offset-4 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-white">Change postcode</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate aria-label="Compare electrician quotes" className="flex flex-col">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label htmlFor={inputId} className="text-[15px] font-semibold text-white">Your postcode</label>
                  <span className="inline-flex h-[30px] items-center gap-1.5 rounded-full border border-[#1DAFA1]/60 bg-[#1DAFA1]/15 pl-2.5 pr-3 text-[13px] text-white"><Zap aria-hidden="true" className="h-3.5 w-3.5 text-[#1DAFA1]" /><span className="text-[#A9BDD0]">Job type</span><span className="font-semibold">Electricians</span></span>
                </div>
                <input id={inputId} name="postcode" type="text" inputMode="text" autoComplete="postal-code" autoCapitalize="characters" spellCheck={false} placeholder="e.g. RG1 1AA" value={postcode} onChange={(e) => { setPostcode(e.target.value); setError(false); }} aria-invalid={error} aria-describedby={error ? errorId : undefined} className={`h-[52px] rounded-xl border-2 bg-white px-4 text-[17px] font-medium text-[#001F3D] placeholder:text-[#6B7280] focus:outline focus:outline-[3px] focus:outline-offset-2 focus:outline-[#5FD6CA] lg:px-[18px] ${error ? "border-[#FF8A73]" : "border-white"}`} />
                {error && <p id={errorId} className="mt-2 flex items-center gap-1.5 text-sm text-[#FFC2B3]"><AlertCircle aria-hidden="true" className="h-4 w-4" />Enter a full UK postcode, like RG1 1AA</p>}
                <button type="submit" disabled={pending} className="mt-3 h-[52px] w-full rounded-full bg-[#FF6A00] text-[17px] font-bold text-[#001F3D] transition hover:brightness-[1.07] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-white disabled:opacity-70">Compare up to 3 quotes</button>
              </form>
            )}
          </div>
          <ul aria-label="Why use Trade Pilot" className="mt-5 flex flex-col gap-2.5 text-sm font-medium text-[#D5E0EA] lg:mt-[18px] lg:flex-row lg:flex-wrap lg:gap-x-[22px] lg:gap-y-2 lg:text-[13px]">
            {TRUST_ITEMS.map(({ icon: Icon, label }) => <li key={label} className="flex items-center gap-2 lg:gap-[7px]"><Icon aria-hidden="true" className="h-[18px] w-[18px] shrink-0 text-[#1DAFA1]" />{label}</li>)}
          </ul>
        </div>
      </div>
      <div className="relative aspect-video w-full lg:hidden"><img src={imageSrc} alt={imageAlt} className="h-full w-full object-cover object-[50%_30%]" /><svg aria-hidden="true" viewBox="0 0 84 84" className="absolute left-0 top-0 h-[84px] w-[84px]"><path d="M0 0H60C30 6 7 29 0 60Z" fill="#001F3D" /><path d="M0 60C7 29 30 6 60 0H76C38 8 9 37 0 76Z" fill="#1DAFA1" /><path d="M0 76C9 37 38 8 76 0H84C44 9 11 42 0 84Z" fill="#1DAFA1" opacity="0.35" /></svg></div>
    </section>
  );
}
