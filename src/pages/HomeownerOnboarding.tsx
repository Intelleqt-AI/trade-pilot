import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Phone, Home, Bell, ArrowRight, ArrowLeft, Loader2, Check } from 'lucide-react';
import { Logo } from '@/components/trade-pilot/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { patchData } from '@/lib/api';
import { createProperty, updateNotificationPreferences } from '@/lib/api/tpHomeowner';
import PropertyMapPicker from '@/components/PropertyMapPicker';
import { useAuth, ME_URL } from '@/hooks/useAuth';

// Values must match Property.TYPE_CHOICES — posting the display label 400s.
const PROPERTY_TYPES = [
  { value: 'detached', label: 'Detached' },
  { value: 'semi_detached', label: 'Semi-Detached' },
  { value: 'terraced', label: 'Terraced' },
  { value: 'flat', label: 'Flat / Apartment' },
  { value: 'bungalow', label: 'Bungalow' },
  { value: 'other', label: 'Other' },
];

const TOTAL_STEPS = 3;

const HomeownerOnboarding = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, loading: authLoading, user } = useAuth();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [phone, setPhone] = useState('');
  const [property, setProperty] = useState({
    name: '',
    address: '',
    postcode: '',
    property_type: '',
    bedrooms: '',
    bathrooms: '',
    location: '',
    latitude: null as number | null,
    longitude: null as number | null,
  });
  const [prefs, setPrefs] = useState({
    email_notifications: true,
    sms_notifications: false,
    calendar_reminders: true,
    marketing_emails: false,
  });

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.onboarding_completed) return <Navigate to="/homeowner/dashboard" replace />;

  const finish = async () => {
    setSaving(true);
    try {
      await patchData({ url: '/api/v1/tradepilot/auth/me/', data: { onboarding_completed: true } });
      await queryClient.invalidateQueries({ queryKey: [ME_URL] });
      toast.success('Welcome to TradePilot!');
      navigate('/homeowner/dashboard', { replace: true });
    } catch {
      toast.error('Could not finish setup. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    setSaving(true);
    try {
      if (step === 1) {
        if (phone.trim()) {
          await patchData({ url: '/api/v1/tradepilot/auth/me/', data: { phone: phone.trim() } });
        }
        setStep(2);
      } else if (step === 2) {
        const started = property.address.trim() || property.postcode.trim() || property.property_type;
        if (started) {
          // address, postcode and property_type are all required by the API —
          // posting a partial property just 400s.
          if (!property.address.trim()) {
            setSaving(false);
            return toast.error('Please enter your address, or skip this step.');
          }
          if (!property.postcode.trim()) {
            setSaving(false);
            return toast.error('Please enter your postcode, or skip this step.');
          }
          if (!property.property_type) {
            setSaving(false);
            return toast.error('Please choose a property type, or skip this step.');
          }
          await createProperty({
            name: property.name.trim() || 'My Home',
            address: property.address.trim(),
            postcode: property.postcode.trim(),
            property_type: property.property_type,
            latitude: property.latitude,
            longitude: property.longitude,
            ...(property.location ? { location: property.location } : {}),
            ...(property.bedrooms ? { bedrooms: Number(property.bedrooms) } : {}),
            ...(property.bathrooms ? { bathrooms: Number(property.bathrooms) } : {}),
          });
        }
        setStep(3);
      } else {
        await updateNotificationPreferences(prefs);
        await finish();
        return;
      }
    } catch (err: any) {
      const errors = err?.response?.data?.errors;
      const first = errors ? Object.values(errors)[0] : null;
      toast.error(String(Array.isArray(first) ? first[0] : first ?? 'Something went wrong. You can skip this step.'));
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
    else finish();
  };

  const stepMeta = [
    { icon: Phone, title: 'How can traders reach you?', sub: 'Add a phone number so traders can contact you about your jobs.' },
    { icon: Home, title: 'Tell us about your home', sub: 'This helps us match you with the right local traders.' },
    { icon: Bell, title: 'Stay in the loop', sub: 'Choose how you want to hear about quotes and job updates.' },
  ][step - 1];

  const StepIcon = stepMeta.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Logo onDark={false} />
          <span className="text-sm text-muted-foreground">Step {step} of {TOTAL_STEPS}</span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl px-6 pt-6">
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors',
                i <= step ? 'bg-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>
      </div>

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <StepIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{stepMeta.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{stepMeta.sub}</p>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="07700 900123"
              />
              <p className="text-xs text-muted-foreground">
                Only shared with traders after you accept their quote.
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="propname">Property name</Label>
              <Input
                id="propname"
                value={property.name}
                onChange={e => setProperty(p => ({ ...p, name: e.target.value }))}
                placeholder="My Home"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={property.address}
                onChange={e => setProperty(p => ({ ...p, address: e.target.value }))}
                placeholder="12 Example Street, London"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="postcode">Postcode</Label>
                <Input
                  id="postcode"
                  value={property.postcode}
                  onChange={e => setProperty(p => ({ ...p, postcode: e.target.value.toUpperCase() }))}
                  placeholder="SW1A 1AA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  min={0}
                  value={property.bedrooms}
                  onChange={e => setProperty(p => ({ ...p, bedrooms: e.target.value }))}
                  placeholder="3"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  min={0}
                  value={property.bathrooms}
                  onChange={e => setProperty(p => ({ ...p, bathrooms: e.target.value }))}
                  placeholder="2"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Property type</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {PROPERTY_TYPES.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() =>
                      setProperty(p => ({
                        ...p,
                        property_type: p.property_type === t.value ? '' : t.value,
                      }))
                    }
                    className={cn(
                      'flex items-center justify-between rounded-xl border-2 px-3.5 py-3 text-sm font-medium transition-all',
                      property.property_type === t.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border text-foreground hover:border-primary/30'
                    )}
                  >
                    {t.label}
                    {property.property_type === t.value && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Exact location</Label>
              <p className="text-xs text-muted-foreground">
                Drag the pin to your exact address so traders quote for the right place.
              </p>
              <PropertyMapPicker
                lat={property.latitude}
                lng={property.longitude}
                postcode={property.postcode}
                onChange={({ lat, lng, address, postcode, city }) =>
                  setProperty(prev => ({
                    ...prev,
                    latitude: lat,
                    longitude: lng,
                    ...(postcode ? { postcode: postcode.toUpperCase() } : {}),
                    ...(address ? { address } : {}),
                    ...(city ? { location: city } : {}),
                  }))
                }
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-1 rounded-xl border">
            {([
              ['email_notifications', 'Email notifications', 'Quotes, job updates and messages'],
              ['sms_notifications', 'SMS notifications', 'Urgent updates by text message'],
              ['calendar_reminders', 'Calendar reminders', 'Reminders for scheduled work'],
              ['marketing_emails', 'Product news', 'Occasional tips and offers from TradePilot'],
            ] as const).map(([key, label, desc], i) => (
              <div
                key={key}
                className={cn('flex items-center justify-between gap-4 p-4', i > 0 && 'border-t')}
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground">{label}</div>
                  <div className="text-xs text-muted-foreground">{desc}</div>
                </div>
                <Switch
                  checked={prefs[key]}
                  onCheckedChange={v => setPrefs(p => ({ ...p, [key]: v }))}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t px-6 py-5">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1 || saving}
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={handleSkip} disabled={saving}>
              Skip for now
            </Button>
            <Button onClick={handleNext} disabled={saving}>
              {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              {step === TOTAL_STEPS ? 'Finish' : 'Continue'}
              {!saving && <ArrowRight className="ml-1.5 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeownerOnboarding;
