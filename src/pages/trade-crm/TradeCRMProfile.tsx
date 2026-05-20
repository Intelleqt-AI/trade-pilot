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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Trash2, ExternalLink, Plus, Pencil } from 'lucide-react';

const DOC_TYPE_LABELS: Record<string, string> = {
  insurance: 'Public Liability Insurance',
  gas_safe: 'Gas Safe Registration',
  electrical: 'Electrical Certification',
  cis: 'CIS Registration',
  id_check: 'ID / DBS Check',
  other: 'Other',
};

const PRICE_TYPE_LABELS: Record<string, string> = {
  hourly: '/hr',
  fixed: '',
  from: 'from ',
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
  const [profileDescription, setProfileDescription] = useState(profile?.profile_description || '');
  const [hasInsurance, setHasInsurance] = useState(profile?.has_insurance || false);
  const [hasLicense, setHasLicense] = useState(profile?.has_license || false);

  // Document upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docUploadOpen, setDocUploadOpen] = useState(false);
  const [docType, setDocType] = useState('');
  const [docName, setDocName] = useState('');
  const [docExpiry, setDocExpiry] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);

  // Service state
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
      setProfileDescription(profile.profile_description || '');
      setHasInsurance(profile.has_insurance || false);
      setHasLicense(profile.has_license || false);
    }
  }, [profile]);

  // ── Profile mutations ────────────────────────────────────────────────────────
  const updateProfileMutation = useMutation({
    mutationFn: updateTradePilotMe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/tradepilot/auth/me/'] });
      toast({ title: 'Success', description: 'Profile updated successfully' });
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
      profile_description: profileDescription,
      has_insurance: hasInsurance,
      has_license: hasLicense,
    });

  // ── Documents ────────────────────────────────────────────────────────────────
  const { data: documents = [], isLoading: docsLoading } = useQuery({
    queryKey: ['tradeDocuments'],
    queryFn: fetchTradeDocuments,
  });

  const uploadDocMutation = useMutation({
    mutationFn: uploadTradeDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tradeDocuments'] });
      toast({ title: 'Success', description: 'Document uploaded' });
      setDocUploadOpen(false);
      setDocType(''); setDocName(''); setDocExpiry(''); setDocFile(null);
    },
    onError: () => toast({ title: 'Error', description: 'Upload failed', variant: 'destructive' }),
  });

  const deleteDocMutation = useMutation({
    mutationFn: deleteTradeDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tradeDocuments'] });
      toast({ title: 'Deleted', description: 'Document removed' });
    },
  });

  const handleDocUpload = () => {
    if (!docType || !docName || !docFile) return toast({ title: 'Error', description: 'Fill all required fields', variant: 'destructive' });
    const fd = new FormData();
    fd.append('file', docFile);
    fd.append('doc_type', docType);
    fd.append('name', docName);
    if (docExpiry) fd.append('expires_at', docExpiry);
    uploadDocMutation.mutate(fd);
  };

  // ── Services ─────────────────────────────────────────────────────────────────
  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['tradeServices'],
    queryFn: fetchTradeServices,
  });

  const createServiceMutation = useMutation({
    mutationFn: createTradeService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tradeServices'] });
      toast({ title: 'Success', description: 'Service added' });
      closeServiceDialog();
    },
    onError: () => toast({ title: 'Error', description: 'Failed to save service', variant: 'destructive' }),
  });

  const updateServiceMutation = useMutation({
    mutationFn: updateTradeService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tradeServices'] });
      toast({ title: 'Success', description: 'Service updated' });
      closeServiceDialog();
    },
    onError: () => toast({ title: 'Error', description: 'Failed to update service', variant: 'destructive' }),
  });

  const deleteServiceMutation = useMutation({
    mutationFn: deleteTradeService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tradeServices'] });
      toast({ title: 'Deleted', description: 'Service removed' });
    },
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

  const closeServiceDialog = () => {
    setServiceDialogOpen(false);
    setEditingService(null);
  };

  const handleServiceSubmit = () => {
    if (!serviceName || !servicePrice) return toast({ title: 'Error', description: 'Name and price required', variant: 'destructive' });
    const payload = { name: serviceName, description: serviceDescription, price: servicePrice, price_type: servicePriceType };
    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, ...payload });
    } else {
      createServiceMutation.mutate(payload);
    }
  };

  const servicePending = createServiceMutation.isPending || updateServiceMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-xl font-bold">Account Settings</h2>
        <p className="text-sm sm:text-base">Remaining Credit: {profile?.credit_balance ?? '—'}</p>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name *</label>
              <input className="w-full p-2 border border-border rounded-md bg-background" value={firstName} onChange={e => setFirstName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name *</label>
              <input className="w-full p-2 border border-border rounded-md bg-background" value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <input readOnly disabled className="w-full p-2 border border-border rounded-md bg-background opacity-60" value={email} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number *</label>
            <input className="w-full p-2 border border-border rounded-md bg-background" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <Button onClick={handleSavePersonalInfo} disabled={updateProfileMutation.isPending}>
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Personal Details'}
          </Button>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Business Information</CardTitle>
          <CardDescription>Manage your business profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" />
              <AvatarFallback>{firstName?.[0]}{lastName?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{businessName || 'Your Business'}</h3>
              <p className="text-muted-foreground">{tradeSpecialty || 'Trade Professional'}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Business Name *</label>
            <input className="w-full p-2 border border-border rounded-md bg-background" value={businessName} onChange={e => setBusinessName(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Primary Trade *</label>
              <select className="w-full p-2 border border-border rounded-md bg-background" value={tradeSpecialty} onChange={e => setTradeSpecialty(e.target.value)}>
                <option value="">Select Trade</option>
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Business Type *</label>
              <select className="w-full p-2 border border-border rounded-md bg-background" value={businessType} onChange={e => setBusinessType(e.target.value)}>
                <option value="">Select Type</option>
                <option value="sole-trader">Sole Trader</option>
                <option value="limited-company">Limited Company</option>
                <option value="partnership">Partnership</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Years of Experience *</label>
            <select className="w-full p-2 border border-border rounded-md bg-background" value={yearsExperience} onChange={e => setYearsExperience(e.target.value)}>
              <option value="">Select Experience</option>
              <option value="1-2">1-2 years</option>
              <option value="3-5">3-5 years</option>
              <option value="6-10">6-10 years</option>
              <option value="10+">10+ years</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Postcode *</label>
            <input
              className="w-full p-2 border border-border rounded-md bg-background uppercase"
              value={postcode}
              onChange={e => setPostcode(e.target.value.toUpperCase())}
              placeholder="e.g. SW1A 1AA"
            />
            <p className="text-xs text-muted-foreground">Used to match you to nearby jobs. Saving will geocode this postcode.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Business Description</label>
            <textarea className="w-full p-2 border border-border rounded-md bg-background h-24 resize-none" placeholder="Describe your services, experience, and what makes you stand out..." value={profileDescription} onChange={e => setProfileDescription(e.target.value)} />
          </div>

          <Button onClick={handleSaveBusinessInfo} disabled={updateProfileMutation.isPending}>
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Business Details'}
          </Button>
        </CardContent>
      </Card>

      {/* Verification & Credentials */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Verification & Credentials</CardTitle>
          <CardDescription>Manage your insurance and certifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {docsLoading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Loading documents...</p>
          ) : documents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No documents uploaded yet.</p>
          ) : (
            documents.map((doc: any) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 shrink-0 bg-primary/10 rounded-full flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium text-sm truncate">{doc.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {DOC_TYPE_LABELS[doc.doc_type] ?? doc.doc_type}
                      {doc.expires_at ? ` · Expires ${new Date(doc.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                      {doc.is_expired ? ' · ' : ''}
                      {doc.is_expired && <span className="text-red-500">Expired</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {doc.is_verified && (
                    <Badge className="bg-green-100 text-green-800 text-xs">Verified</Badge>
                  )}
                  {doc.file_url && (
                    <a href={doc.file_url} target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700"
                    onClick={() => deleteDocMutation.mutate(doc.id)}
                    disabled={deleteDocMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}

          <Button variant="outline" className="w-full mt-2" onClick={() => setDocUploadOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </CardContent>
      </Card>

      {/* Services & Pricing */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Services & Pricing</CardTitle>
              <CardDescription>Manage your service offerings and rates</CardDescription>
            </div>
            <Button size="sm" onClick={openAddService}>
              <Plus className="h-4 w-4 mr-1" />
              Add Service
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {servicesLoading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Loading services...</p>
          ) : services.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No services added yet.</p>
          ) : (
            <div className="space-y-3">
              {services.map((svc: any) => (
                <div key={svc.id} className="flex items-start justify-between p-3 border border-border rounded-lg">
                  <div className="min-w-0">
                    <h4 className="font-medium text-sm">{svc.name}</h4>
                    {svc.description && <p className="text-xs text-muted-foreground mt-0.5">{svc.description}</p>}
                    <p className="font-semibold text-primary text-sm mt-1">
                      {PRICE_TYPE_LABELS[svc.price_type] === 'from ' ? 'From ' : ''}
                      £{Number(svc.price).toLocaleString('en-GB')}
                      {svc.price_type === 'hourly' ? '/hr' : ''}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0 ml-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditService(svc)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700"
                      onClick={() => deleteServiceMutation.mutate(svc.id)}
                      disabled={deleteServiceMutation.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Document Dialog */}
      <Dialog open={docUploadOpen} onOpenChange={setDocUploadOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
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
                className="w-full text-sm border border-border rounded-md p-2 bg-background file:mr-3 file:text-sm file:font-medium file:border-0 file:bg-primary file:text-primary-foreground file:rounded file:px-3 file:py-1"
                onChange={e => setDocFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDocUploadOpen(false)}>Cancel</Button>
            <Button onClick={handleDocUpload} disabled={uploadDocMutation.isPending}>
              {uploadDocMutation.isPending ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add / Edit Service Dialog */}
      <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingService ? 'Edit Service' : 'Add Service'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-2">
              <Label>Service Name *</Label>
              <Input placeholder="e.g. Emergency Plumbing" value={serviceName} onChange={e => setServiceName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="Short description of the service" value={serviceDescription} onChange={e => setServiceDescription(e.target.value)} />
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
              {servicePending ? 'Saving...' : editingService ? 'Update' : 'Add Service'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TradeCRMProfile;
