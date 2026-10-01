import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Bell, Shield, Building, Loader2, Plus, Trash2, Pencil, Camera, Home } from 'lucide-react';
import { SectionCard } from '@/components/trade-pilot/SectionCard';
import { EmptyState } from '@/components/trade-pilot/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import PropertyMapPicker from '@/components/PropertyMapPicker';
import DeleteAccountPanel from '@/components/homeowner/DeleteAccountPanel';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { formatPropertyLine } from '@/lib/format';
import { patchData, postData } from '@/lib/api';
import { useAuth, ME_URL } from '@/hooks/useAuth';
import {
  fetchProperties, createProperty, updateProperty, deleteProperty,
  uploadPropertyCover,
  fetchNotificationPreferences, updateNotificationPreferences,
} from '@/lib/api/tpHomeowner';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'properties', label: 'Properties', icon: Building },
] as const;

type TabId = typeof TABS[number]['id'];

const Settings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as TabId) || 'profile';
  const setTab = (id: TabId) => setSearchParams({ tab: id }, { replace: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account, properties and notification preferences.
        </p>
      </div>

      <div className="flex flex-wrap gap-1 rounded-full bg-muted p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all',
              activeTab === t.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && <ProfileTab />}
      {activeTab === 'notifications' && <NotificationsTab />}
      {activeTab === 'security' && <SecurityTab />}
      {activeTab === 'properties' && <PropertiesTab />}
    </div>
  );
};

const ProfileTab = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    first_name: '', last_name: '', phone: '', postcode: '', address: '',
  });

  const { data: propertiesData } = useQuery({
    queryKey: ['ho-properties'],
    queryFn: fetchProperties,
  });
  const properties: any[] = Array.isArray(propertiesData) ? propertiesData : [];
  const property = properties[0] ?? null;

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name ?? '',
        last_name: (user as any).last_name ?? '',
        phone: (user as any).phone ?? '',
        postcode: (user as any).postcode ?? '',
        address: (user as any).address ?? '',
      });
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: () => patchData({ url: '/api/v1/tradepilot/auth/me/', data: form }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ME_URL] });
      toast.success('Profile updated');
    },
    onError: () => toast.error('Could not save your profile.'),
  });

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <SectionCard title="Your details" icon={User}>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first_name">First name</Label>
            <Input id="first_name" value={form.first_name} onChange={e => set('first_name', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last name</Label>
            <Input id="last_name" value={form.last_name} onChange={e => set('last_name', e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={user?.email ?? ''} disabled />
          <p className="text-xs text-muted-foreground">Your email address can't be changed.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postcode">Postcode</Label>
            <Input
              id="postcode"
              value={property ? (property.postcode ?? '') : form.postcode}
              onChange={e => set('postcode', e.target.value.toUpperCase())}
              disabled={!!property}
            />
            {property && (
              <p className="text-xs text-muted-foreground">Managed from your <a href="?tab=properties" className="underline underline-offset-2 hover:no-underline">property settings</a>.</p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={property ? (property.address ?? '') : form.address}
            onChange={e => set('address', e.target.value)}
            disabled={!!property}
          />
          {property && (
            <p className="text-xs text-muted-foreground">Managed from your <a href="?tab=properties" className="underline underline-offset-2 hover:no-underline">property settings</a>.</p>
          )}
        </div>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
          Save changes
        </Button>
      </div>
    </SectionCard>
  );
};

const PREF_ROWS = [
  ['email_notifications', 'Email notifications', 'Quotes, job updates and messages'],
  ['sms_notifications', 'SMS notifications', 'Urgent updates by text message. Coming soon.'],
  ['calendar_reminders', 'Calendar reminders', 'Reminders for scheduled work'],
  ['marketing_emails', 'Product news', 'Occasional tips and offers from TradePilot'],
] as const;

const NotificationsTab = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['ho-notification-prefs'],
    queryFn: fetchNotificationPreferences,
  });

  const mutation = useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ho-notification-prefs'] });
      toast.success('Preferences updated');
    },
    onError: () => toast.error('Could not save your preferences.'),
  });

  const prefs = (data as any) ?? {};

  return (
    <SectionCard title="Notification preferences" icon={Bell}>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-1">
          {PREF_ROWS.map(([key, label, desc], i) => {
            const isSms = key === 'sms_notifications';
            return (
              <div key={key} className={cn('flex items-center justify-between gap-4 py-4', i > 0 && 'border-t', isSms && 'opacity-50')}>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground">{label}</div>
                  <div className="text-xs text-muted-foreground">{desc}</div>
                </div>
                <Switch
                  checked={isSms ? false : !!prefs[key]}
                  onCheckedChange={v => !isSms && mutation.mutate({ [key]: v })}
                  disabled={isSms || mutation.isPending}
                />
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
};

const SecurityTab = () => {
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm_password: '' });

  const mutation = useMutation({
    mutationFn: () =>
      postData({
        url: '/api/v1/tradepilot/homeowner/change-password/',
        data: {
          old_password: form.old_password,
          new_password: form.new_password,
          new_password_confirm: form.confirm_password,
        },
      }),
    onSuccess: () => {
      toast.success('Password changed');
      setForm({ old_password: '', new_password: '', confirm_password: '' });
    },
    onError: (err: any) => {
      const errors = err?.response?.data?.errors;
      const first = errors ? Object.values(errors)[0] : null;
      toast.error(String(Array.isArray(first) ? first[0] : first ?? 'Could not change your password.'));
    },
  });

  const submit = () => {
    if (!form.old_password || !form.new_password) {
      return toast.error('Please fill in all fields.');
    }
    if (form.new_password !== form.confirm_password) {
      return toast.error('New passwords do not match.');
    }
    if (form.new_password.length < 8) {
      return toast.error('Password must be at least 8 characters.');
    }
    mutation.mutate();
  };

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <SectionCard title="Change password" icon={Shield}>
        <div className="max-w-md space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current">Current password</Label>
            <Input
              id="current"
              type="password"
              value={form.old_password}
              onChange={e => set('old_password', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new">New password</Label>
            <Input
              id="new"
              type="password"
              value={form.new_password}
              onChange={e => set('new_password', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm new password</Label>
            <Input
              id="confirm"
              type="password"
              value={form.confirm_password}
              onChange={e => set('confirm_password', e.target.value)}
            />
          </div>
          <Button onClick={submit} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Change password
          </Button>
        </div>
      </SectionCard>

      <DeleteAccountPanel />
    </div>
  );
};

// Values must match Property.TYPE_CHOICES — the API rejects display labels.
const PROPERTY_TYPES = [
  { value: 'detached', label: 'Detached House' },
  { value: 'semi_detached', label: 'Semi-Detached' },
  { value: 'terraced', label: 'Terraced' },
  { value: 'flat', label: 'Flat / Apartment' },
  { value: 'bungalow', label: 'Bungalow' },
  { value: 'other', label: 'Other' },
];

const emptyProperty = {
  name: '', address: '', postcode: '', property_type: '', bedrooms: '', bathrooms: '',
  location: '',
  latitude: null as number | null,
  longitude: null as number | null,
};

const CoverImg = ({ url, className }: { url?: string | null; className?: string }) => {
  const [error, setError] = useState(false);
  if (url?.trim() && !error)
    return <img src={url} alt="Cover" className={cn(className, 'object-cover')} onError={() => setError(true)} />;
  return (
    <div className={cn(className, 'flex items-center justify-center bg-muted')}>
      <Home className="h-8 w-8 text-muted-foreground/40" />
    </div>
  );
};

const PropertiesTab = () => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyProperty);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const addCoverRef = useRef<HTMLInputElement>(null);
  const editCoverRef = useRef<HTMLInputElement>(null);
  const [coverUploading, setCoverUploading] = useState(false);

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['ho-properties'],
    queryFn: fetchProperties,
  });

  const openNew = () => {
    setEditing(null);
    setForm(emptyProperty);
    setCoverFile(null);
    setCoverPreview(null);
    setDialogOpen(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      name: p.name ?? '',
      address: p.address ?? '',
      postcode: p.postcode ?? '',
      property_type: p.property_type ?? '',
      bedrooms: p.bedrooms != null ? String(p.bedrooms) : '',
      bathrooms: p.bathrooms != null ? String(p.bathrooms) : '',
      location: p.location ?? '',
      latitude: p.latitude ?? null,
      longitude: p.longitude ?? null,
    });
    setDialogOpen(true);
  };

  const saveMut = useMutation({
    mutationFn: () => {
      const payload: Record<string, any> = {
        name: form.name.trim() || 'My Home',
        address: form.address.trim(),
        postcode: form.postcode.trim(),
        property_type: form.property_type,
        // Sending the pin keeps the server from falling back to the postcode
        // centroid, which is what put every property on the wrong spot before.
        latitude: form.latitude,
        longitude: form.longitude,
      };
      if (form.location) payload.location = form.location;
      if (form.bedrooms) payload.bedrooms = Number(form.bedrooms);
      if (form.bathrooms) payload.bathrooms = Number(form.bathrooms);
      return editing ? updateProperty(editing.id, payload) : createProperty(payload);
    },
    onSuccess: async (res: any) => {
      const created = res?.data ?? res;
      if (!editing && coverFile && created?.id) {
        const fd = new FormData();
        fd.append('file', coverFile);
        try { await uploadPropertyCover(created.id, fd); } catch { /* toast below */ }
      }
      setCoverFile(null);
      setCoverPreview(null);
      queryClient.invalidateQueries({ queryKey: ['ho-properties'] });
      toast.success(editing ? 'Property updated' : 'Property added');
      setDialogOpen(false);
    },
    onError: (err: any) => {
      const errors = err?.response?.data?.errors;
      const first = errors ? Object.values(errors)[0] : null;
      toast.error(String(Array.isArray(first) ? first[0] : first ?? 'Could not save the property.'));
    },
  });

  const submitProperty = () => {
    if (!form.address.trim()) return toast.error('Please enter the property address.');
    if (!form.postcode.trim()) return toast.error('Please enter the postcode.');
    if (!form.property_type) return toast.error('Please choose a property type.');
    saveMut.mutate();
  };

  const deleteMut = useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ho-properties'] });
      toast.success('Property removed');
    },
    onError: () => toast.error('Could not remove the property.'),
  });

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));
  const list: any[] = Array.isArray(properties) ? properties : [];

  const handleAddCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleEditCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    const fd = new FormData();
    fd.append('file', file);
    setCoverUploading(true);
    try {
      const res = await uploadPropertyCover(editing.id, fd);
      const url = res?.data?.url ?? res?.url;
      if (url) setEditing((prev: any) => prev ? { ...prev, cover_image_url: url } : prev);
      queryClient.invalidateQueries({ queryKey: ['ho-properties'] });
      toast.success('Cover photo updated');
    } catch {
      toast.error('Failed to upload cover photo.');
    } finally {
      setCoverUploading(false);
      if (editCoverRef.current) editCoverRef.current.value = '';
    }
  };

  return (
    <>
      <SectionCard
        title="Your property"
        icon={Building}
        action={
          list.length === 0 ? (
            <Button size="sm" onClick={openNew}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add property
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">One property per account</span>
          )
        }
      >
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            icon={Building}
            title="No property yet"
            description="Add your home so we can match you with local traders."
            action={
              <Button size="sm" onClick={openNew}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add property
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {list.map(p => (
              <div key={p.id} className="flex items-center gap-4 rounded-lg border p-4">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                  <CoverImg url={p.cover_image_url} className="h-full w-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{p.name || 'My Home'}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatPropertyLine(p.address, p.postcode)}
                  </p>
                  {(p.bedrooms || p.bathrooms || p.property_type) && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {[
                        p.property_type,
                        p.bedrooms ? `${p.bedrooms} bed` : null,
                        p.bathrooms ? `${p.bathrooms} bath` : null,
                      ].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => openEdit(p)} aria-label="Edit property">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (window.confirm('Remove this property?')) deleteMut.mutate(p.id);
                  }}
                  aria-label="Remove property"
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit property' : 'Add a property'}</DialogTitle>
          </DialogHeader>

          {/* Cover image */}
          {editing ? (
            <div className="relative h-36 overflow-hidden rounded-lg bg-muted">
              <CoverImg url={editing.cover_image_url} className="h-full w-full" />
              <button
                type="button"
                onClick={() => editCoverRef.current?.click()}
                disabled={coverUploading}
                className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white transition-colors hover:bg-black/75"
              >
                {coverUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                {coverUploading ? 'Uploading…' : 'Change cover'}
              </button>
              <input ref={editCoverRef} type="file" accept="image/*" className="hidden" onChange={handleEditCoverUpload} />
            </div>
          ) : (
            <div
              className="relative h-36 cursor-pointer overflow-hidden rounded-lg bg-muted"
              onClick={() => addCoverRef.current?.click()}
            >
              {coverPreview ? (
                <img src={coverPreview} alt="Cover preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                  <Camera className="h-7 w-7 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">Add cover photo (optional)</p>
                </div>
              )}
              <span className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white">
                <Camera className="h-3.5 w-3.5" />
                {coverPreview ? 'Change' : 'Add photo'}
              </span>
              <input ref={addCoverRef} type="file" accept="image/*" className="hidden" onChange={handleAddCoverChange} />
            </div>
          )}

          {/* min-w-0: DialogContent is a grid; without it a long geocoded address
              stretches the dialog instead of wrapping. */}
          <div className="min-w-0 space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="p-name">Property name</Label>
              <Input id="p-name" value={form.name} onChange={e => set('name', e.target.value)} placeholder="My Home" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-address">Address</Label>
              <Input id="p-address" value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="p-postcode">Postcode</Label>
                <Input
                  id="p-postcode"
                  value={form.postcode}
                  onChange={e => set('postcode', e.target.value.toUpperCase())}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-bed">Bedrooms</Label>
                <Input id="p-bed" type="number" min={0} value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-bath">Bathrooms</Label>
                <Input id="p-bath" type="number" min={0} value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-type">Property type *</Label>
              <Select value={form.property_type} onValueChange={v => set('property_type', v)}>
                <SelectTrigger id="p-type">
                  <SelectValue placeholder="Choose a property type" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Exact location *</Label>
              <p className="text-xs text-muted-foreground">
                Drag the pin to your exact address so traders quote for the right place.
              </p>
              <PropertyMapPicker
                lat={form.latitude}
                lng={form.longitude}
                postcode={form.postcode}
                onChange={({ lat, lng, address, postcode, city }) =>
                  setForm(prev => ({
                    ...prev,
                    latitude: lat,
                    longitude: lng,
                    ...(postcode ? { postcode: postcode.toUpperCase() } : {}),
                    ...(address ? { address } : {}),
                    ...(city ? { location: city } : {}),
                  }))
                }
              />
              {form.latitude != null && form.longitude != null && (
                <p className="text-xs text-muted-foreground">
                  Pin: {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saveMut.isPending}>
              Cancel
            </Button>
            <Button onClick={submitProperty} disabled={saveMut.isPending}>
              {saveMut.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              {editing ? 'Save changes' : 'Add property'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Settings;
