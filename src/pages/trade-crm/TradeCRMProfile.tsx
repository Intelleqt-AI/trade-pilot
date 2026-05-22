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
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  FileText, Trash2, ExternalLink, Plus, Pencil, MapPin,
  User, Building2, ShieldCheck, Wrench, Coins, Calendar,
  Phone, Mail, AlertCircle, CheckCircle2, Clock, BadgeCheck,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import TradeAreaMap, { type LocationChange } from '@/components/Trade-CRM/TradeAreaMap';
import { Slider } from '@/components/ui/slider';

const DOC_TYPE_LABELS: Record<string, string> = {
  insurance: 'Public Liability Insurance',
  gas_safe: 'Gas Safe Registration',
  electrical: 'Electrical Certification',
  cis: 'CIS Registration',
  id_check: 'ID / DBS Check',
  other: 'Other',
};

const inputCls = 'w-full px-3 py-2.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow';
const labelCls = 'text-xs font-semibold text-muted-foreground uppercase tracking-wide';
const sectionCls = 'bg-card rounded-2xl border border-border shadow-sm overflow-hidden';

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
  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || '??';

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, #1A9D8F, #14b8a6)' }} />
        <div className="px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Avatar className="h-16 w-16 shrink-0 ring-2 ring-offset-2 ring-primary/30">
            <AvatarImage src="" />
            <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-semibold text-foreground truncate">
                {businessName || `${firstName} ${lastName}`.trim() || 'Your Profile'}
              </h1>
              {profile?.is_verified && (
                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <BadgeCheck className="h-4 w-4 text-blue-500 shrink-0 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="p-0 bg-transparent border-0 shadow-none">
                      <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden w-56">
                        <div className="bg-primary px-3 py-2.5 flex items-center gap-2">
                          <BadgeCheck className="h-4 w-4 text-white shrink-0" />
                          <span className="text-sm font-semibold text-white">Verified Account</span>
                        </div>
                        <div className="px-3 py-2.5 space-y-1.5">
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Your identity and business credentials have been reviewed and confirmed by the HomePlus team.
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-700 pt-0.5">
                            <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                            <span>Homeowners can trust your profile</span>
                          </div>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {tradeSpecialty && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                  {tradeSpecialty}
                </span>
              )}
              {businessType && (
                <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                  {businessType === 'sole-trader' ? 'Sole Trader' : businessType === 'limited-company' ? 'Ltd Company' : 'Partnership'}
                </span>
              )}
              {yearsExperience && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> {yearsExperience} yrs
                </span>
              )}
            </div>
            {address && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3 shrink-0" /> {address}
              </p>
            )}
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
            <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 bg-muted/50">
              <Coins className="h-4 w-4 text-primary" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-none">Credits</p>
                <p className="font-bold text-base leading-tight text-foreground">{profile?.credit_balance ?? '—'}</p>
              </div>
            </div>
            {(hasInsurance || hasLicense) && (
              <div className="flex gap-1.5">
                {hasInsurance && (
                  <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="h-3 w-3" /> Insured
                  </span>
                )}
                {hasLicense && (
                  <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                    <CheckCircle2 className="h-3 w-3" /> Licensed
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Personal Information ─────────────────────────────────────────── */}
      <div className={sectionCls}>
        <div className="px-6 py-4 border-b border-border flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">Personal Information</h2>
            <p className="text-xs text-muted-foreground">Your account details</p>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelCls}>First Name</label>
              <input className={inputCls} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Last Name</label>
              <input className={inputCls} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className={labelCls}>Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input readOnly disabled className={`${inputCls} pl-9 opacity-60 cursor-not-allowed`} value={email} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className={labelCls}>Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input className={`${inputCls} pl-9`} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+44 7700 000000" />
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <Button onClick={handleSavePersonalInfo} disabled={saving} size="sm" className="px-6">
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Business Information ─────────────────────────────────────────── */}
      <div className={sectionCls}>
        <div className="px-6 py-4 border-b border-border flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">Business Information</h2>
            <p className="text-xs text-muted-foreground">Manage your trade profile</p>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className={labelCls}>Business Name</label>
            <input className={inputCls} value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g. Smith Plumbing Ltd" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelCls}>Primary Trade</label>
              <select className={inputCls} value={tradeSpecialty} onChange={e => setTradeSpecialty(e.target.value)}>
                <option value="">Select trade</option>
                <option value="Plumber">Plumber</option>
                <option value="Electrician">Electrician</option>
                <option value="Builder">Builder</option>
                <option value="Roofer">Roofer</option>
                <option value="Painter">Painter/Decorator</option>
                <option value="Kitchen Installer">Kitchen Installer</option>
                <option value="Gas Engineer">Gas Engineer</option>
                <option value="Carpenter">Carpenter/Joiner</option>
                <option value="Tiler">Tiler</option>
                <option value="Plasterer">Plasterer</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Business Type</label>
              <select className={inputCls} value={businessType} onChange={e => setBusinessType(e.target.value)}>
                <option value="">Select type</option>
                <option value="sole-trader">Sole Trader</option>
                <option value="limited-company">Limited Company</option>
                <option value="partnership">Partnership</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelCls}>Years of Experience</label>
            <select className={inputCls} value={yearsExperience} onChange={e => setYearsExperience(e.target.value)}>
              <option value="">Select experience</option>
              <option value="1-2">1–2 years</option>
              <option value="3-5">3–5 years</option>
              <option value="6-10">6–10 years</option>
              <option value="10+">10+ years</option>
            </select>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <label className={labelCls}>Address</label>
            <input
              className={inputCls}
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Auto-filled from map, or type manually"
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelCls}>Postcode</label>
            <input
              className={`${inputCls} uppercase`}
              value={postcode}
              onChange={e => setPostcode(e.target.value.toUpperCase())}
              placeholder="e.g. SW1A 1AA"
            />
          </div>

          {/* Work Area Map */}
          <div className="rounded-xl border border-border bg-muted/20 overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Work Coverage Area</span>
              <span className="ml-auto text-xs text-muted-foreground">Drag pin or search to set location</span>
            </div>
            <div className="p-4 space-y-4">
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
                    <p className="text-sm font-medium">Job Search Radius</p>
                    <p className="text-xs text-muted-foreground">Only see jobs within this distance</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-primary/10 text-primary rounded-lg px-3 py-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="text-sm font-bold">{radiusKm} km</span>
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
            </div>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <label className={labelCls}>Business Description</label>
            <textarea
              className={`${inputCls} h-28 resize-none`}
              placeholder="Describe your services, experience, and what makes you stand out…"
              value={profileDescription}
              onChange={e => setProfileDescription(e.target.value)}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <p className={labelCls}>Compliance & Trust</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${hasInsurance ? 'bg-emerald-100' : 'bg-muted'}`}>
                    <ShieldCheck className={`h-4 w-4 ${hasInsurance ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Public Liability</p>
                    <p className="text-xs text-muted-foreground">Insurance held</p>
                  </div>
                </div>
                <Switch checked={hasInsurance} onCheckedChange={setHasInsurance} />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${hasLicense ? 'bg-blue-100' : 'bg-muted'}`}>
                    <CheckCircle2 className={`h-4 w-4 ${hasLicense ? 'text-blue-600' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Trade License</p>
                    <p className="text-xs text-muted-foreground">License held</p>
                  </div>
                </div>
                <Switch checked={hasLicense} onCheckedChange={setHasLicense} />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button onClick={handleSaveBusinessInfo} disabled={saving} size="sm" className="px-6">
              {saving ? 'Saving…' : 'Save Business Details'}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Credentials ──────────────────────────────────────────────────── */}
      <div className={sectionCls}>
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">Credentials & Documents</h2>
              <p className="text-xs text-muted-foreground">Certifications and compliance documents</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => setDocUploadOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Upload
          </Button>
        </div>
        <div className="p-4 space-y-2">
          {docsLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading documents…</div>
          ) : documents.length === 0 ? (
            <div className="py-10 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No documents yet</p>
              <p className="text-xs text-muted-foreground mt-1">Upload your insurance, certifications, and other credentials</p>
            </div>
          ) : (
            documents.map((doc: any) => (
              <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/40 transition-colors">
                <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${doc.is_expired ? 'bg-red-100' : 'bg-primary/10'}`}>
                  <FileText className={`h-5 w-5 ${doc.is_expired ? 'text-red-500' : 'text-primary'}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm truncate">{doc.name}</h4>
                    {doc.is_verified && <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] px-1.5">Verified</Badge>}
                    {doc.is_expired && <Badge className="bg-red-100 text-red-600 border-red-200 text-[10px] px-1.5">Expired</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {DOC_TYPE_LABELS[doc.doc_type] ?? doc.doc_type}
                    {doc.expires_at ? ` · ${new Date(doc.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {doc.file_url && (
                    <a href={doc.file_url} target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                  )}
                  <Button
                    variant="ghost" size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-500"
                    onClick={() => deleteDocMutation.mutate(doc.id)}
                    disabled={deleteDocMutation.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Services & Pricing ───────────────────────────────────────────── */}
      <div className={sectionCls}>
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wrench className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">Services & Pricing</h2>
              <p className="text-xs text-muted-foreground">What you offer and at what rates</p>
            </div>
          </div>
          <Button size="sm" onClick={openAddService}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Service
          </Button>
        </div>
        <div className="p-4">
          {servicesLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading services…</div>
          ) : services.length === 0 ? (
            <div className="py-10 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <Wrench className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No services listed</p>
              <p className="text-xs text-muted-foreground mt-1">Add your services to attract more jobs</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((svc: any) => (
                <div key={svc.id} className="relative rounded-xl border border-border bg-background p-4 hover:shadow-sm transition-shadow group">
                  <div className="pr-16">
                    <h4 className="font-semibold text-sm">{svc.name}</h4>
                    {svc.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{svc.description}</p>}
                    <p className="text-primary font-bold text-base mt-2">
                      {svc.price_type === 'from' && <span className="text-sm font-normal mr-0.5">from </span>}
                      £{Number(svc.price).toLocaleString('en-GB')}
                      {svc.price_type === 'hourly' && <span className="text-xs font-normal text-muted-foreground">/hr</span>}
                    </p>
                  </div>
                  <div className="absolute top-3 right-3 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditService(svc)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-red-500"
                      onClick={() => deleteServiceMutation.mutate(svc.id)}
                      disabled={deleteServiceMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Upload Document Dialog ───────────────────────────────────────── */}
      <Dialog open={docUploadOpen} onOpenChange={setDocUploadOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-2">
              <Label>Document Type *</Label>
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
              <Label>Document Name *</Label>
              <Input placeholder="e.g. Public Liability Insurance 2025" value={docName} onChange={e => setDocName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Input type="date" value={docExpiry} onChange={e => setDocExpiry(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>File * (PDF, JPG, PNG — max 10 MB)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="w-full text-sm border border-border rounded-lg p-2 bg-background file:mr-3 file:text-xs file:font-medium file:border-0 file:bg-primary file:text-primary-foreground file:rounded file:px-3 file:py-1.5"
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

      {/* ── Add / Edit Service Dialog ────────────────────────────────────── */}
      <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingService ? 'Edit Service' : 'Add Service'}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-2">
              <Label>Service Name *</Label>
              <Input placeholder="e.g. Emergency Plumbing" value={serviceName} onChange={e => setServiceName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="Short description" value={serviceDescription} onChange={e => setServiceDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Price (£) *</Label>
                <Input type="number" min="0" placeholder="0" value={servicePrice} onChange={e => setServicePrice(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Price Type</Label>
                <Select value={servicePriceType} onValueChange={setServicePriceType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Price</SelectItem>
                    <SelectItem value="hourly">Per Hour</SelectItem>
                    <SelectItem value="from">From</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeServiceDialog}>Cancel</Button>
            <Button onClick={handleServiceSubmit} disabled={servicePending}>
              {servicePending ? 'Saving…' : editingService ? 'Update' : 'Add Service'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TradeCRMProfile;
