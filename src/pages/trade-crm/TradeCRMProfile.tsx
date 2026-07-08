'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  updateTradePilotMe,
  fetchTradeDocuments,
  uploadTradeDocument,
  deleteTradeDocument,
  fetchTradeServices,
  createTradeService,
  updateTradeService,
  deleteTradeService,
  uploadTraderPhoto,
} from '@/lib/api';
import { ME_URL } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { PageTitle } from '@/components/trade-pilot/PageTitle';
import { SectionCard } from '@/components/trade-pilot/SectionCard';
import { UserAvatar } from '@/components/trade-pilot/UserAvatar';
import { ProgressRing } from '@/components/trade-pilot/ProgressRing';
import { EmptyState } from '@/components/trade-pilot/EmptyState';
import { profileStrength } from '@/lib/profileStrength';
import {
  FileText, Trash2, ExternalLink, Plus, Pencil, MapPin,
  User, Building2, ShieldCheck, Wrench, Coins, Clock,
  Phone, Mail, CheckCircle2, BadgeCheck, Map as MapIcon, Camera,
} from 'lucide-react';
import TradeAreaMap, { type LocationChange } from '@/components/Trade-CRM/TradeAreaMap';
import { cn } from '@/lib/utils';

const DOC_TYPE_LABELS: Record<string, string> = {
  insurance: 'Public Liability Insurance',
  gas_safe: 'Gas Safe Registration',
  electrical: 'Electrical Certification',
  cis: 'CIS Registration',
  id_check: 'ID / DBS Check',
  other: 'Other',
};

const TRADE_SPECIALTIES = [
  'Plumber',
  'Electrician',
  'Builder',
  'Roofer',
  'Painter',
  'Kitchen Installer',
  'Gas Engineer',
  'Carpenter',
  'Tiler',
  'Plasterer',
];

const TRADE_LABELS: Record<string, string> = {
  Painter: 'Painter/Decorator',
  Carpenter: 'Carpenter/Joiner',
};

const TradeCRMProfile = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [businessName, setBusinessName] = useState(profile?.business_name || '');
  const [tradeSpecialty, setTradeSpecialty] = useState(profile?.trade_specialty || '');
  const [businessType, setBusinessType] = useState(profile?.business_type || '');
  const [yearsExperience, setYearsExperience] = useState(profile?.years_experience || '');
  const [postcode, setPostcode] = useState(profile?.postcode || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [lat, setLat] = useState<number | null>(profile?.latitude ?? null);
  const [lng, setLng] = useState<number | null>(profile?.longitude ?? null);
  const [radiusKm, setRadiusKm] = useState<number>(profile?.radius_km ?? 25);
  const [profileDescription, setProfileDescription] = useState(profile?.profile_description || '');
  const [hasInsurance, setHasInsurance] = useState(profile?.has_insurance || false);
  const [hasLicense, setHasLicense] = useState(profile?.has_license || false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docUploadOpen, setDocUploadOpen] = useState(false);
  const [docType, setDocType] = useState('');
  const [docName, setDocName] = useState('');
  const [docExpiry, setDocExpiry] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);

  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [deletingService, setDeletingService] = useState<any>(null);
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [servicePriceType, setServicePriceType] = useState('fixed');

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setBusinessName(profile.business_name || '');
      setTradeSpecialty(profile.trade_specialty || '');
      setBusinessType(profile.business_type || '');
      setYearsExperience(profile.years_experience || '');
      setPostcode(profile.postcode || '');
      setAddress(profile.address || '');
      setLat(profile.latitude ?? null);
      setLng(profile.longitude ?? null);
      setRadiusKm(profile.radius_km ?? 25);
      setProfileDescription(profile.profile_description || '');
      setHasInsurance(profile.has_insurance || false);
      setHasLicense(profile.has_license || false);
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: updateTradePilotMe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/tradepilot/auth/me/'] });
      toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to update profile', variant: 'destructive' });
    },
  });

  const handleSavePersonalInfo = () =>
    updateProfileMutation.mutate({ first_name: firstName, last_name: lastName, phone });

  const handleSaveBusinessInfo = () =>
    updateProfileMutation.mutate({
      business_name: businessName,
      trade_specialty: tradeSpecialty,
      business_type: businessType,
      years_experience: yearsExperience,
      postcode,
      address,
      ...(lat !== null && lng !== null ? { latitude: lat, longitude: lng } : {}),
      radius_km: radiusKm,
      profile_description: profileDescription,
      has_insurance: hasInsurance,
      has_license: hasLicense,
    });

  const photoInputRef = useRef<HTMLInputElement>(null);
  const uploadPhotoMutation = useMutation({
    mutationFn: uploadTraderPhoto,
    onSuccess: (res: any) => {
      queryClient.setQueryData([ME_URL], res);
      toast({ title: 'Profile photo updated' });
    },
    onError: () => toast({ title: 'Photo upload failed', variant: 'destructive' } as any),
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    uploadPhotoMutation.mutate(fd);
  };

  const { data: documents = [], isLoading: docsLoading } = useQuery({
    queryKey: ['tradeDocuments'],
    queryFn: fetchTradeDocuments,
  });

  const uploadDocMutation = useMutation({
    mutationFn: uploadTradeDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tradeDocuments'] });
      toast({ title: 'Document uploaded' });
      setDocUploadOpen(false);
      setDocType(''); setDocName(''); setDocExpiry(''); setDocFile(null);
    },
    onError: () => toast({ title: 'Upload failed', variant: 'destructive' } as any),
  });

  const deleteDocMutation = useMutation({
    mutationFn: deleteTradeDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tradeDocuments'] });
      toast({ title: 'Document removed' });
    },
  });

  const handleDocUpload = () => {
    if (!docType || !docName || !docFile) return toast({ title: 'Fill all required fields', variant: 'destructive' } as any);
    const fd = new FormData();
    fd.append('file', docFile);
    fd.append('doc_type', docType);
    fd.append('name', docName);
    if (docExpiry) fd.append('expires_at', docExpiry);
    uploadDocMutation.mutate(fd);
  };

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['tradeServices'],
    queryFn: fetchTradeServices,
  });

  const createServiceMutation = useMutation({
    mutationFn: createTradeService,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tradeServices'] }); toast({ title: 'Service added' }); closeServiceDialog(); },
    onError: () => toast({ title: 'Failed to save service', variant: 'destructive' } as any),
  });

  const updateServiceMutation = useMutation({
    mutationFn: updateTradeService,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tradeServices'] }); toast({ title: 'Service updated' }); closeServiceDialog(); },
    onError: () => toast({ title: 'Failed to update service', variant: 'destructive' } as any),
  });

  const deleteServiceMutation = useMutation({
    mutationFn: deleteTradeService,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tradeServices'] }); toast({ title: 'Service removed' }); },
  });

  const openAddService = () => {
    setEditingService(null);
    setServiceName(''); setServiceDescription(''); setServicePrice(''); setServicePriceType('fixed');
    setServiceDialogOpen(true);
  };

  const openEditService = (svc: any) => {
    setEditingService(svc);
    setServiceName(svc.name); setServiceDescription(svc.description);
    setServicePrice(String(svc.price)); setServicePriceType(svc.price_type);
    setServiceDialogOpen(true);
  };

  const closeServiceDialog = () => { setServiceDialogOpen(false); setEditingService(null); };

  const handleServiceSubmit = () => {
    if (!serviceName || !servicePrice) return toast({ title: 'Name and price required', variant: 'destructive' } as any);
    const payload = { name: serviceName, description: serviceDescription, price: servicePrice, price_type: servicePriceType };
    editingService ? updateServiceMutation.mutate({ id: editingService.id, ...payload }) : createServiceMutation.mutate(payload);
  };

  const servicePending = createServiceMutation.isPending || updateServiceMutation.isPending;
  const saving = updateProfileMutation.isPending;
  const fullName = `${firstName} ${lastName}`.trim();
  const hasUploadedDoc = (documents as any[]).length > 0;
  const strength = profileStrength(profile, profile?.credit_balance ?? 0, {
    hasService: (services as any[]).length > 0,
    hasCertificationDoc: hasUploadedDoc,
  });
  const hasVerifiedDoc = (documents as any[]).some((d: any) => d.is_verified);

  return (
    <div className="space-y-4 pb-8">
      <PageTitle title="My Profile" subtitle="How homeowners see you across TradePilot." />

      {/* Header card */}
      <SectionCard>
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <UserAvatar
              name={fullName || businessName}
              src={profile?.profile_photo_url}
              size="xl"
              verified={!!profile?.is_verified || hasVerifiedDoc}
            />
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              disabled={uploadPhotoMutation.isPending}
              className="absolute -bottom-1 -right-1 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-navy-700 text-white shadow-sm hover:bg-navy-800 disabled:opacity-60"
              aria-label="Change profile photo"
            >
              <Camera className="h-3 w-3" />
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-h2 font-semibold text-foreground">
                {businessName || fullName || 'Your profile'}
              </h2>
              {profile?.is_verified && (
                <Badge tone="success" size="sm">
                  <BadgeCheck className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {[fullName, tradeSpecialty && (TRADE_LABELS[tradeSpecialty] ?? tradeSpecialty)]
                .filter(Boolean)
                .join(' · ') || 'Complete your details below'}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              {postcode && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {postcode} · <span className="font-mono tabular-nums">{radiusKm}</span> km radius
                </span>
              )}
              {yearsExperience && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {yearsExperience} yrs experience
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Coins className="h-3.5 w-3.5" />
                <span className="font-mono tabular-nums">{profile?.credit_balance ?? '—'}</span> credits
              </span>
              {hasInsurance && (
                <Badge tone="success" size="sm">
                  <ShieldCheck className="h-3 w-3" />
                  Insured
                </Badge>
              )}
              {hasLicense && (
                <Badge tone="brand" size="sm">
                  <CheckCircle2 className="h-3 w-3" />
                  Licensed
                </Badge>
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-1">
            <ProgressRing value={strength.percent} size={82} stroke={7} />
            <span className="text-overline font-semibold uppercase text-muted-foreground">
              Profile strength
            </span>
          </div>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.7fr_1fr]">
        {/* LEFT column */}
        <div className="flex flex-col gap-4">
          {/* Personal information */}
          <SectionCard title="Personal information" subtitle="Your account details" icon={User}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>First name</Label>
                  <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" />
                </div>
                <div className="space-y-1.5">
                  <Label>Last name</Label>
                  <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Email address</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input readOnly disabled className="pl-9" value={email} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Phone number</Label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    className="pl-9 font-mono tabular-nums"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+44 7700 000000"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <Button onClick={handleSavePersonalInfo} disabled={saving} size="sm">
                  {saving ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            </div>
          </SectionCard>

          {/* Business details */}
          <SectionCard title="Business details" subtitle="Manage your trade profile" icon={Building2}>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Business name</Label>
                <Input
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder="e.g. Smith Plumbing Ltd"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Primary trade</Label>
                  <Select value={tradeSpecialty} onValueChange={setTradeSpecialty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trade" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRADE_SPECIALTIES.map(t => (
                        <SelectItem key={t} value={t}>
                          {TRADE_LABELS[t] ?? t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Business type</Label>
                  <Select value={businessType} onValueChange={setBusinessType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sole-trader">Sole Trader</SelectItem>
                      <SelectItem value="limited-company">Limited Company</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Years of experience</Label>
                <Select value={yearsExperience} onValueChange={setYearsExperience}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2">1–2 years</SelectItem>
                    <SelectItem value="3-5">3–5 years</SelectItem>
                    <SelectItem value="6-10">6–10 years</SelectItem>
                    <SelectItem value="10+">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Address</Label>
                  <Input
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Auto-filled from map, or type manually"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Postcode</Label>
                  <Input
                    className="uppercase"
                    value={postcode}
                    onChange={e => setPostcode(e.target.value.toUpperCase())}
                    placeholder="e.g. SW1A 1AA"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Business description</Label>
                <Textarea
                  rows={4}
                  placeholder="Describe your services, experience, and what makes you stand out…"
                  value={profileDescription}
                  onChange={e => setProfileDescription(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-1">
                <Button onClick={handleSaveBusinessInfo} disabled={saving} size="sm">
                  {saving ? 'Saving…' : 'Save business details'}
                </Button>
              </div>
            </div>
          </SectionCard>

          {/* Service area */}
          <SectionCard
            title="Service area"
            subtitle="Drag the pin or search to set your location"
            icon={MapIcon}
          >
            <div className="space-y-4">
              <TradeAreaMap
                lat={lat}
                lng={lng}
                radiusKm={radiusKm}
                postcode={postcode}
                onLocationChange={({ lat: newLat, lng: newLng, postcode: newPostcode, address: newAddress }: LocationChange) => {
                  setLat(newLat);
                  setLng(newLng);
                  if (newPostcode) setPostcode(newPostcode.toUpperCase());
                  if (newAddress) setAddress(newAddress);
                }}
              />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Coverage radius</p>
                    <p className="text-xs text-muted-foreground">Only see jobs within this distance</p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-1.5 text-teal-700">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="font-mono text-sm font-bold tabular-nums">{radiusKm} km</span>
                  </div>
                </div>
                <Slider
                  min={1}
                  max={100}
                  step={1}
                  value={[radiusKm]}
                  onValueChange={([v]) => setRadiusKm(v)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 km — Local</span>
                  <span>100 km — Nationwide</span>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveBusinessInfo} disabled={saving} size="sm">
                  {saving ? 'Saving…' : 'Save service area'}
                </Button>
              </div>
            </div>
          </SectionCard>

          {/* Services & pricing */}
          <SectionCard
            title="Services & pricing"
            subtitle="What you offer and at what rates"
            icon={Wrench}
            action={
              <Button size="sm" onClick={openAddService}>
                <Plus className="h-3.5 w-3.5" />
                Add service
              </Button>
            }
            bodyClassName="p-0"
          >
            {servicesLoading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Loading services…</div>
            ) : services.length === 0 ? (
              <EmptyState
                icon={Wrench}
                title="No services listed"
                description="Add your services and prices to attract more jobs."
                action={
                  <Button variant="outline" size="sm" onClick={openAddService}>
                    Add your first service
                  </Button>
                }
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {services.map((svc: any) => (
                  <div key={svc.id} className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-gray-50">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-semibold text-foreground">{svc.name}</div>
                      {svc.description && (
                        <div className="truncate text-xs text-muted-foreground">{svc.description}</div>
                      )}
                    </div>
                    <span className="shrink-0 font-mono text-[13px] font-semibold tabular-nums text-teal-600">
                      {svc.price_type === 'from' && <span className="font-sans text-xs font-normal text-muted-foreground">from </span>}
                      £{Number(svc.price).toLocaleString('en-GB')}
                      {svc.price_type === 'hourly' && <span className="font-sans text-xs font-normal text-muted-foreground">/hr</span>}
                    </span>
                    <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditService(svc)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-red-500"
                        onClick={() => setDeletingService(svc)}
                        disabled={deleteServiceMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* RIGHT column */}
        <div className="flex flex-col gap-4">
          {/* Certifications & documents */}
          <SectionCard
            title="Certifications"
            subtitle="Documents homeowners can trust"
            icon={ShieldCheck}
            action={
              <Button size="sm" variant="outline" onClick={() => setDocUploadOpen(true)}>
                <Plus className="h-3.5 w-3.5" />
                Upload
              </Button>
            }
            bodyClassName="p-0"
          >
            {docsLoading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Loading documents…</div>
            ) : documents.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No documents yet"
                description="Upload your insurance, certifications and other credentials."
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {documents.map((doc: any) => (
                  <div key={doc.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-gray-50">
                    <span
                      className={cn(
                        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                        doc.is_expired ? 'bg-red-50 text-red-500' : 'bg-teal-50 text-teal-600'
                      )}
                    >
                      <BadgeCheck className="h-[18px] w-[18px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-[13px] font-semibold text-foreground">{doc.name}</span>
                        {doc.is_verified && (
                          <Badge tone="success" size="sm">
                            Verified
                          </Badge>
                        )}
                        {doc.is_expired && (
                          <Badge tone="danger" size="sm">
                            Expired
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {DOC_TYPE_LABELS[doc.doc_type] ?? doc.doc_type}
                        {doc.expires_at
                          ? ` · ${new Date(doc.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                          : ''}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5">
                      {doc.file_url && (
                        <a href={doc.file_url} target="_blank" rel="noreferrer">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </a>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-500"
                        onClick={() => deleteDocMutation.mutate(doc.id)}
                        disabled={deleteDocMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Compliance & trust */}
          <SectionCard title="Compliance & trust" subtitle="Shown on your public profile" icon={ShieldCheck}>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'inline-flex h-9 w-9 items-center justify-center rounded-lg',
                      hasInsurance ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'
                    )}
                  >
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">Public liability</p>
                    <p className="text-xs text-muted-foreground">Insurance held</p>
                  </div>
                </div>
                <Switch checked={hasInsurance} onCheckedChange={setHasInsurance} />
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'inline-flex h-9 w-9 items-center justify-center rounded-lg',
                      hasLicense ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'
                    )}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">Trade licence</p>
                    <p className="text-xs text-muted-foreground">Licence held</p>
                  </div>
                </div>
                <Switch checked={hasLicense} onCheckedChange={setHasLicense} />
              </div>
              <div className="flex justify-end pt-1">
                <Button onClick={handleSaveBusinessInfo} disabled={saving} size="sm" variant="outline">
                  {saving ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Upload document dialog */}
      <Dialog open={docUploadOpen} onOpenChange={setDocUploadOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Upload document</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-2">
              <Label>Document type *</Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="insurance">Public Liability Insurance</SelectItem>
                  <SelectItem value="gas_safe">Gas Safe Registration</SelectItem>
                  <SelectItem value="electrical">Electrical Certification</SelectItem>
                  <SelectItem value="cis">CIS Registration</SelectItem>
                  <SelectItem value="id_check">ID / DBS Check</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Document name *</Label>
              <Input placeholder="e.g. Public Liability Insurance 2026" value={docName} onChange={e => setDocName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Expiry date</Label>
              <Input type="date" value={docExpiry} onChange={e => setDocExpiry(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>File * (PDF, JPG, PNG — max 10 MB)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="w-full rounded-lg border border-input bg-white p-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground"
                onChange={e => setDocFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDocUploadOpen(false)}>Cancel</Button>
            <Button onClick={handleDocUpload} disabled={uploadDocMutation.isPending}>
              {uploadDocMutation.isPending ? 'Uploading…' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add / edit service dialog */}
      <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingService ? 'Edit service' : 'Add service'}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-2">
              <Label>Service name *</Label>
              <Input placeholder="e.g. Emergency plumbing" value={serviceName} onChange={e => setServiceName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="Short description" value={serviceDescription} onChange={e => setServiceDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Price (£) *</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  className="font-mono tabular-nums"
                  value={servicePrice}
                  onChange={e => setServicePrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Price type</Label>
                <Select value={servicePriceType} onValueChange={setServicePriceType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed price</SelectItem>
                    <SelectItem value="hourly">Per hour</SelectItem>
                    <SelectItem value="from">From</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeServiceDialog}>Cancel</Button>
            <Button onClick={handleServiceSubmit} disabled={servicePending}>
              {servicePending ? 'Saving…' : editingService ? 'Update' : 'Add service'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete service confirmation */}
      <AlertDialog open={!!deletingService} onOpenChange={open => !open && setDeletingService(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove service?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deletingService?.name}” will be removed from your profile. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={() => {
                if (deletingService) deleteServiceMutation.mutate(deletingService.id);
                setDeletingService(null);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TradeCRMProfile;
