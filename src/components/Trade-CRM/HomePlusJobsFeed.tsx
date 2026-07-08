import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { SectionCard } from '@/components/trade-pilot/SectionCard';
import { SectionLabel } from '@/components/trade-pilot/SectionLabel';
import { SegmentedControl } from '@/components/trade-pilot/SegmentedControl';
import { EmptyState } from '@/components/trade-pilot/EmptyState';
import { Banner } from '@/components/trade-pilot/Banner';
import { UserAvatar } from '@/components/trade-pilot/UserAvatar';
import { toneDot, urgencyBadgeTone, urgencyLabel } from '@/components/trade-pilot/tones';
import { deriveCompetition } from '@/lib/designMockData';
import {
  AlertTriangle,
  ArrowDownUp,
  BarChart3,
  Bath,
  BedDouble,
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  CreditCard,
  FileText,
  Home,
  Loader2,
  Lock,
  Mail,
  Map as MapIcon,
  MapPin,
  Phone,
  SlidersHorizontal,
  Star,
  User,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import useFetch from '@/hooks/useFetch';
import { usePost } from '@/hooks/usePost';
import { toast } from '@/lib/toast';
import { useAuth } from '@/hooks/useAuth';
import { updateTradePilotMe } from '@/lib/api';
import TradeAreaMap, { type LocationChange } from '@/components/Trade-CRM/TradeAreaMap';
import { getCategoriesForSpecialty, getTradeLabel } from '@/lib/jobCategories';
import { cn } from '@/lib/utils';

const _jobMarkerIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
});

function JobLocationMap({ lat, lng }: { lat: number; lng: number }) {
  return (
    <div className="h-56 w-full overflow-hidden rounded-lg border">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        scrollWheelZoom={true}
        zoomControl={true}
        dragging={true}
        attributionControl={false}
        className="h-full w-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[lat, lng]} icon={_jobMarkerIcon} />
      </MapContainer>
    </div>
  );
}

/** Read-only Leaflet mini-map of the trade's search area (right rail). */
function SearchAreaMiniMap({
  lat,
  lng,
  radiusKm,
}: {
  lat: number;
  lng: number;
  radiusKm: number;
}) {
  const zoom = Math.max(6, Math.min(13, Math.round(13.5 - Math.log2(radiusKm || 25))));
  return (
    <div className="h-60 w-full overflow-hidden rounded-lg border">
      <MapContainer
        center={[lat, lng]}
        zoom={zoom}
        scrollWheelZoom={false}
        zoomControl={false}
        dragging={false}
        doubleClickZoom={false}
        attributionControl={false}
        className="h-full w-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Circle
          center={[lat, lng]}
          radius={radiusKm * 1000}
          pathOptions={{ color: '#0f8b7d', weight: 1.5, dashArray: '6 6', fillColor: '#0f8b7d', fillOpacity: 0.07 }}
        />
        <Marker position={[lat, lng]} icon={_jobMarkerIcon} />
      </MapContainer>
    </div>
  );
}

const JOBS_URL = '/api/v1/tradepilot/jobs/';
const MY_BIDS_URL = '/api/v1/tradepilot/jobs/my-bids/';
const ME_URL = '/api/v1/tradepilot/auth/me/';
const MIN_BID_COST = 10;
const MAX_BIDS_PER_JOB = 4;

const QUESTION_LABELS: Record<string, string> = {
  // Plumbing – Boilers
  boilers_q1: 'What type of boiler do you have?',
  boilers_q2: 'What needs doing to the boiler?',
  boilers_q3: 'Is the property domestic or commercial?',

  // Plumbing – Radiators
  radiators_q1: 'What do you need help with?',
  radiators_q2: 'How many radiators are involved (approx)?',
  radiators_q3: 'Is this for a domestic or commercial property?',

  // Plumbing – Appliances
  appliances_q1: 'Which appliance do you need help with?',
  appliances_q2: 'What needs doing?',
  appliances_q3: 'Is the property domestic or commercial?',

  // Plumbing – Fixtures
  fixtures_q1: 'Which fixture needs attention?',
  fixtures_q2: 'What is the issue?',
  fixtures_q3: 'Is the property domestic or commercial?',

  // Plumbing – Pipework, taps & drainage
  'pipework,_taps_and_drainage_q1': 'What best describes the job?',
  'pipework,_taps_and_drainage_q2': 'Is this an urgent issue?',
  'pipework,_taps_and_drainage_q3': 'Is the property domestic or commercial?',

  // Gas Engineer – Boilers (gas)
  boilers_gas_q1: 'What fuel does your boiler use?',
  boilers_gas_q2: 'What needs doing?',
  boilers_gas_q3: 'Property type',

  // Gas Engineer – Gas hobs, cookers & ovens
  gas_hobs_cookers_and_ovens_q1: 'Which appliance?',
  gas_hobs_cookers_and_ovens_q2: 'What needs doing?',
  gas_hobs_cookers_and_ovens_q3: 'Property type',

  // Gas Engineer – Gas fires & flues
  gas_fires_and_flues_q1: 'What type of unit?',
  gas_fires_and_flues_q2: 'What needs doing?',
  gas_fires_and_flues_q3: 'Property type',

  // Gas Engineer – Gas safety certificates (CP12)
  gas_safety_certificates_cp12_q1: 'Which certificate?',
  gas_safety_certificates_cp12_q2: 'How many gas appliances to test?',
  gas_safety_certificates_cp12_q3: 'Property type',

  // Gas Engineer – Gas leaks & emergency
  gas_leaks_and_emergency_q1: 'What is the issue?',
  gas_leaks_and_emergency_q2: 'How urgent?',
  gas_leaks_and_emergency_q3: 'Property type',

  // Gas Engineer – Gas pipework
  gas_pipework_q1: 'What best describes the job?',
  gas_pipework_q2: 'Approximate length / scale?',
  gas_pipework_q3: 'Property type',

  // Roofing – Pitched roof repairs
  pitched_roof_repairs_q1: "What's the issue?",
  pitched_roof_repairs_q2: 'How big is the affected area?',
  pitched_roof_repairs_q3: 'Property type',

  // Roofing – Full or partial reroof
  full_or_partial_reroof_q1: "What's the scope?",
  full_or_partial_reroof_q2: 'Roof covering material?',
  full_or_partial_reroof_q3: 'Property type',

  // Roofing – Flat roof
  flat_roof_q1: 'What needs doing?',
  flat_roof_q2: 'Flat roof material?',
  flat_roof_q3: 'Property type',

  // Roofing – Gutters, fascias & soffits
  gutters_fascias_and_soffits_q1: "What's the job?",
  gutters_fascias_and_soffits_q2: 'Approximate scale?',
  gutters_fascias_and_soffits_q3: 'Property type',

  // Roofing – Chimney work
  chimney_work_q1: "What's needed?",
  chimney_work_q2: 'How will the chimney be accessed?',
  chimney_work_q3: 'Property type',

  // Roofing – Roof windows / skylights
  roof_windows___skylights_q1: 'What do you need?',
  roof_windows___skylights_q2: 'How many windows?',
  roof_windows___skylights_q3: 'Property type',

  // Roofing – Lead work & flashing
  lead_work_and_flashing_q1: "What's the job?",
  lead_work_and_flashing_q2: 'Where is the lead work?',
  lead_work_and_flashing_q3: 'Property type',

  // Roofing – Moss removal & roof cleaning
  moss_removal_and_roof_cleaning_q1: "What's the job?",
  moss_removal_and_roof_cleaning_q2: 'Scale of clean?',
  moss_removal_and_roof_cleaning_q3: 'Property type',

  // Electrical – Fuse board (Consumer unit)
  'fuse_board_(consumer_unit)_q1': 'What needs doing?',
  'fuse_board_(consumer_unit)_q2': 'How old is the existing unit?',
  'fuse_board_(consumer_unit)_q3': 'Property type',

  // Electrical – Lighting
  lighting_q1: 'What do you need help with?',
  lighting_q2: 'How many lights/fittings are involved?',
  lighting_q3: 'Property type',

  // Electrical – Sockets & switches
  sockets_and_switches_q1: 'What do you need help with?',
  sockets_and_switches_q2: 'How many sockets/switches?',
  sockets_and_switches_q3: 'Property type',

  // Electrical – Rewiring & cabling
  rewiring_and_cabling_q1: 'What best describes the job?',
  rewiring_and_cabling_q2: 'Is the power currently working?',
  rewiring_and_cabling_q3: 'Property type',

  // Electrical – EV chargers
  ev_chargers_q1: 'What do you need?',
  ev_chargers_q2: 'Where is it being installed?',
  ev_chargers_q3: 'Property type',

  // Electrical – Testing & certificates
  testing_and_certificates_q1: 'Which certificate/test?',
  testing_and_certificates_q2: 'Approximate property size?',
  testing_and_certificates_q3: 'Property type',

  // Electrical – Appliances & hardwired equipment
  appliances_and_hardwired_equipment_q1: 'Which appliance?',
  appliances_and_hardwired_equipment_q2: 'What needs doing?',
  appliances_and_hardwired_equipment_q3: 'Property type',

  // Electrical – Smart home & networking
  smart_home_and_networking_q1: 'What do you need help with?',
  smart_home_and_networking_q2: 'How many devices/points?',
  smart_home_and_networking_q3: 'Property type',
};

const URGENCY_OPTIONS = [
  { value: 'emergency', label: 'Emergency (same day)' },
  { value: 'urgent', label: 'Urgent (within 48h)' },
  { value: 'normal', label: 'Normal (within 2 weeks)' },
  { value: 'flexible', label: 'Flexible' },
];

const bidStatusTone: Record<string, 'success' | 'warning' | 'danger'> = {
  accepted: 'success',
  pending: 'warning',
  rejected: 'danger',
};

const priorityTone: Record<string, 'danger' | 'warning' | 'neutral'> = {
  high: 'danger',
  medium: 'warning',
  low: 'neutral',
};

const competitionMeta = {
  low: { tone: 'success' as const, label: 'Low competition' },
  medium: { tone: 'warning' as const, label: 'Some competition' },
  high: { tone: 'danger' as const, label: 'High competition' },
};

interface PropertyDetail {
  property_type: string;
  bedrooms: number;
  bathrooms: number;
}

interface UnlockedInfo {
  address: string;
  postcode: string;
  latitude: number | null;
  longitude: number | null;
  contact_unlocked: boolean;
  homeowner: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  } | null;
}

interface JobFile {
  id: string;
  file_name: string;
  file_size: number;
  content_type: string;
  presigned_url: string | null;
}

interface Job {
  id: string;
  title: string;
  description: string;
  trade: string;
  category: string;
  urgency: string;
  priority: string;
  preferred_date: string | null;
  property_detail: PropertyDetail | null;
  already_bid: boolean;
  is_full: boolean;
  files_count: number;
  bids_count: number;
  bid_credits: number;
  bid_credits_note: string;
  answers: Record<string, unknown>;
  created_at: string;
  files: JobFile[];
  distance_km: number | null;
  unlocked_info: UnlockedInfo | null;
}

interface Homeowner {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

interface MyBid {
  id: string;
  job: string;
  job_title: string;
  job_trade: string;
  job_status: string;
  amount: string;
  description: string;
  availability: string | null;
  status: string;
  rating: number | null;
  rating_comment: string;
  rated_at: string | null;
  created_at: string;
  homeowner: Homeowner | null;
}

function formatAnswerKey(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface Props {
  creditBalance: number;
  onCreditChange: (newBalance: number) => void;
}

const HomePlusJobsFeed = ({ creditBalance, onCreditChange }: Props) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user: profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const urgencyFilter = searchParams.get('urgency') ?? 'all';
  const categoryFilter = searchParams.get('category') ?? 'all';

  const setUrgencyFilter = (val: string) =>
    setSearchParams(
      prev => {
        const p = new URLSearchParams(prev);
        val === 'all' ? p.delete('urgency') : p.set('urgency', val);
        return p;
      },
      { replace: true },
    );
  const setCategoryFilter = (val: string) =>
    setSearchParams(
      prev => {
        const p = new URLSearchParams(prev);
        val === 'all' ? p.delete('category') : p.set('category', val);
        return p;
      },
      { replace: true },
    );

  const [subTab, setSubTab] = useState<'available' | 'my-bids'>('available');
  const [sortBy, setSortBy] = useState<'newest' | 'distance'>('newest');
  const [detailJob, setDetailJob] = useState<Job | null>(null);

  const tradeCategories = useMemo(() => getCategoriesForSpecialty(profile?.trade_specialty), [profile?.trade_specialty]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsLat, setSettingsLat] = useState<number | null>(null);
  const [settingsLng, setSettingsLng] = useState<number | null>(null);
  const [settingsRadiusKm, setSettingsRadiusKm] = useState(25);
  const [settingsPostcode, setSettingsPostcode] = useState('');
  const [settingsAddress, setSettingsAddress] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidDescription, setBidDescription] = useState('');
  const [bidAvailability, setBidAvailability] = useState('');
  const [bidSuccess, setBidSuccess] = useState(false);
  const [contactBid, setContactBid] = useState<MyBid | null>(null);
  const [detailBid, setDetailBid] = useState<MyBid | null>(null);

  useEffect(() => {
    if (settingsOpen && profile) {
      setSettingsLat(profile.latitude ?? null);
      setSettingsLng(profile.longitude ?? null);
      setSettingsRadiusKm(profile.radius_km ?? 25);
      setSettingsPostcode(profile.postcode ?? '');
      setSettingsAddress(profile.address ?? '');
    }
  }, [settingsOpen, profile]);

  const saveSettingsMutation = useMutation({
    mutationFn: updateTradePilotMe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ME_URL] });
      queryClient.invalidateQueries({ predicate: q => (q.queryKey[0] as string)?.startsWith(JOBS_URL) });
      toast.success('Search area updated');
      setSettingsOpen(false);
    },
    onError: () => toast.error('Failed to save settings'),
  });

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate({
      radius_km: settingsRadiusKm,
      ...(settingsLat !== null && settingsLng !== null ? { latitude: settingsLat, longitude: settingsLng } : {}),
      ...(settingsPostcode ? { postcode: settingsPostcode } : {}),
      ...(settingsAddress ? { address: settingsAddress } : {}),
    });
  };

  const openBidDialog = (job: Job) => {
    setDetailJob(null);
    setBidSuccess(false);
    setSelectedJob(job);
  };

  const jobsUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (urgencyFilter !== 'all') params.set('urgency', urgencyFilter);
    if (categoryFilter !== 'all') params.set('category', categoryFilter);
    const qs = params.toString();
    return `${JOBS_URL}${qs ? '?' + qs : ''}`;
  }, [urgencyFilter, categoryFilter]);

  const { data: jobsRes, isLoading: jobsLoading } = useFetch<any>(jobsUrl);
  const { data: bidsRes, isLoading: bidsLoading } = useFetch<any>(MY_BIDS_URL);
  const { data: marketRes } = useFetch<any>('/api/v1/tradepilot/jobs/dashboard/market-insights/');

  const jobs: Job[] = jobsRes?.data ?? [];
  const myBids: MyBid[] = bidsRes?.data ?? [];
  const marketInsights = marketRes?.data ?? {};

  const sortedJobs = useMemo(() => {
    const withJob = jobs.map(job => ({ job }));
    return withJob.sort((a, b) => {
      if (sortBy === 'distance') {
        return (a.job.distance_km ?? Infinity) - (b.job.distance_km ?? Infinity);
      }
      // newest first
      return new Date(b.job.created_at).getTime() - new Date(a.job.created_at).getTime();
    });
  }, [jobs, sortBy]);

  const bidMutation = usePost({
    onSuccess: (res: any) => {
      const newBalance = res?.data?.credit_balance;
      if (newBalance !== undefined) onCreditChange(newBalance);
      queryClient.invalidateQueries({ predicate: q => (q.queryKey[0] as string)?.startsWith(JOBS_URL) });
      queryClient.invalidateQueries({ queryKey: [MY_BIDS_URL] });
      queryClient.invalidateQueries({ queryKey: [ME_URL] });
      setBidSuccess(true);
      setBidAmount('');
      setBidDescription('');
      setBidAvailability('');
    },
    onError: (err: any) => {
      const errors = err?.response?.data?.errors ?? {};
      const msg = errors.detail || err?.response?.data?.message || 'Failed to submit bid.';
      toast.error(msg);
    },
  });

  const handleBidSubmit = () => {
    if (!selectedJob || !bidAmount) return;
    bidMutation.mutate({
      url: `/api/v1/tradepilot/jobs/${selectedJob.id}/bid/`,
      data: {
        amount: parseFloat(bidAmount),
        description: bidDescription,
        ...(bidAvailability ? { availability: bidAvailability } : {}),
      },
    } as any);
  };

  const insufficientCredits = creditBalance < MIN_BID_COST;

  // New market jobs this week within the trader's area — powers the page header.
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const jobsThisWeek = jobs.filter(j => new Date(j.created_at).getTime() >= weekAgo).length;

  const radiusKm = profile?.radius_km ?? 25;
  const postcode = profile?.postcode ?? '';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-h1 font-semibold text-foreground">Job Market</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-mono tabular-nums">{jobsThisWeek}</span> new jobs this week within{' '}
            <span className="font-mono tabular-nums">{radiusKm}</span> km{postcode ? ` of ${postcode}` : ''}.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-10 items-center gap-2 rounded-lg bg-teal-50 px-3.5 text-[13px] font-semibold text-teal-700">
            <Coins className="h-4 w-4" />
            <span className="font-mono tabular-nums">{creditBalance}</span> credits
          </span>
          <Button variant="secondary" onClick={() => navigate('/trades-crm/credits')}>
            <CreditCard className="h-4 w-4" />
            Buy credits
          </Button>
        </div>
      </div>

      {/* Low credits warning */}
      {insufficientCredits && (
        <Banner
          tone="warning"
          icon={AlertTriangle}
          title={`You need at least ${MIN_BID_COST} credits to bid`}
          action={
            <Button variant="outline" size="sm" onClick={() => navigate('/trades-crm/credits')}>
              Top up
            </Button>
          }
        >
          Top up your account to start bidding on jobs.
        </Banner>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl
          value={subTab}
          onChange={v => setSubTab(v as 'available' | 'my-bids')}
          items={[
            { value: 'available', label: 'Available jobs', count: jobsLoading ? undefined : jobs.length },
            { value: 'my-bids', label: 'My bids', count: bidsLoading ? undefined : myBids.length },
          ]}
        />
        {subTab === 'available' && (
          <div className="flex flex-wrap items-center gap-2.5">
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="h-8 w-40 rounded-lg bg-white text-[13px]">
                <SelectValue placeholder="Any urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any urgency</SelectItem>
                {URGENCY_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {tradeCategories.length > 0 && (
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-8 w-48 rounded-lg bg-white text-[13px]">
                  <SelectValue placeholder="Any category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any category</SelectItem>
                  {tradeCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={sortBy} onValueChange={v => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="h-8 w-40 rounded-lg bg-white text-[13px]">
                <div className="flex items-center gap-1.5">
                  <ArrowDownUp className="h-3.5 w-3.5 text-gray-400" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="distance">Nearest</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
              <SlidersHorizontal className="h-[15px] w-[15px]" />
              <span className="font-mono tabular-nums">{radiusKm}</span> km
            </Button>
          </div>
        )}
      </div>

      {/* Available jobs */}
      {subTab === 'available' && (
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_340px]">
          <div className="flex flex-col gap-3">
            {jobsLoading ? (
              <>
                {[0, 1, 2].map(i => (
                  <div key={i} className="rounded-xl border bg-card p-5 shadow-xs">
                    <div className="flex gap-4">
                      <Skeleton className="h-[52px] w-[52px] rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : sortedJobs.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-card">
                <EmptyState
                  icon={Briefcase}
                  title="No jobs available right now"
                  description="Check back soon or adjust your filters and search area."
                />
              </div>
            ) : (
              sortedJobs.map(({ job }) => {
                const comp = competitionMeta[deriveCompetition(job.bids_count)];
                return (
                  <div
                    key={job.id}
                    onClick={() => setDetailJob(job)}
                    className="cursor-pointer overflow-hidden rounded-xl border bg-card shadow-xs transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
                  >
                    <div className="flex gap-4 p-5">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex flex-wrap items-center gap-2">
                          <span className="text-h3 font-semibold text-foreground">{job.title}</span>
                          <Badge tone={urgencyBadgeTone(job.urgency)} size="sm">
                            {urgencyLabel(job.urgency)}
                          </Badge>
                        </div>
                        <div className="mb-2.5 flex flex-wrap gap-1.5">
                          <Badge tone="neutral" size="sm">
                            {getTradeLabel(job.trade)}
                          </Badge>
                          {job.category && (
                            <Badge tone="violet" size="sm">
                              {job.category}
                            </Badge>
                          )}
                        </div>
                        <p className="line-clamp-2 text-[13px] text-muted-foreground">{job.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-5 py-2.5">
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        {job.distance_km != null && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-[13px] w-[13px]" />
                            <span className="font-mono tabular-nums">{job.distance_km} km</span>
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Briefcase className="h-[13px] w-[13px]" />
                          <span className="font-mono tabular-nums">
                            {job.bids_count}/{MAX_BIDS_PER_JOB}
                          </span>{' '}
                          bids
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className={cn('h-1.5 w-1.5 rounded-full', toneDot[comp.tone])} />
                          {comp.label}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-[13px] w-[13px]" />
                          {timeAgo(job.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5" onClick={e => e.stopPropagation()}>
                        <span className="text-xs text-gray-400">
                          from{' '}
                          <span className="font-mono font-semibold tabular-nums text-teal-600">
                            {job.bid_credits} cr
                          </span>
                        </span>
                        {job.already_bid ? (
                          <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            Bid placed
                          </span>
                        ) : job.is_full ? (
                          <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-400">
                            <Lock className="h-3.5 w-3.5" />
                            Bidding closed
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            disabled={creditBalance < job.bid_credits}
                            title={creditBalance < job.bid_credits ? 'Not enough credits' : undefined}
                            onClick={() => openBidDialog(job)}
                          >
                            Bid
                            <ChevronRight className="h-[15px] w-[15px]" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right rail */}
          <div className="sticky top-[88px] hidden flex-col gap-4 lg:flex">
            <SectionCard
              title="Market insights"
              subtitle={postcode ? `Your area · ${postcode}` : 'Your area'}
              icon={BarChart3}
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-gray-50 px-3.5 py-3">
                  <SectionLabel className="mb-1">Avg. job value</SectionLabel>
                  <div className="font-mono text-h2 font-semibold tabular-nums text-foreground">
                    {marketInsights.avg_job_value != null ? `£${marketInsights.avg_job_value}` : '—'}
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 px-3.5 py-3">
                  <SectionLabel className="mb-1">Jobs this week</SectionLabel>
                  <div className="font-mono text-h2 font-semibold tabular-nums text-foreground">
                    {marketInsights.jobs_this_week ?? 0}
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 px-3.5 py-3">
                  <SectionLabel className="mb-1">Your win rate</SectionLabel>
                  <div className="font-mono text-h2 font-semibold tabular-nums text-green-600">
                    {marketInsights.win_rate != null ? `${marketInsights.win_rate}%` : '—'}
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 px-3.5 py-3">
                  <SectionLabel className="mb-1">Competition</SectionLabel>
                  <div className="text-h2 font-semibold text-foreground">
                    {marketInsights.competition ?? '—'}
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Your search area"
              subtitle={`${jobs.length} within ${radiusKm} km`}
              icon={MapIcon}
              bodyClassName="p-3.5"
            >
              {profile?.latitude != null && profile?.longitude != null ? (
                <>
                  <SearchAreaMiniMap lat={profile.latitude} lng={profile.longitude} radiusKm={radiusKm} />
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Jobs shown are within your radius.
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(true)}>
                      Edit area
                    </Button>
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={MapPin}
                  title="No search area set"
                  description="Set your location and radius to see jobs near you."
                  action={
                    <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
                      Set search area
                    </Button>
                  }
                />
              )}
            </SectionCard>
          </div>
        </div>
      )}

      {/* My bids */}
      {subTab === 'my-bids' && (
        <div className="flex flex-col gap-3.5">
          {bidsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : myBids.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-card">
              <EmptyState
                icon={Briefcase}
                title="No bids submitted yet"
                description="Browse available jobs and submit your first bid."
                action={
                  <Button variant="outline" size="sm" onClick={() => setSubTab('available')}>
                    Browse jobs
                  </Button>
                }
              />
            </div>
          ) : (
            myBids.map(bid => (
              <div
                key={bid.id}
                onClick={() => setDetailBid(bid)}
                className="cursor-pointer rounded-xl border bg-card p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
              >
                <div className="flex flex-wrap items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <span className="text-h3 font-semibold text-foreground capitalize">
                        {bid.job_title}
                      </span>
                      <Badge tone="neutral" size="sm">
                        {getTradeLabel(bid.job_trade)}
                      </Badge>
                      <Badge tone={bidStatusTone[bid.status] ?? 'neutral'} size="sm" dot>
                        {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Coins className="h-[13px] w-[13px]" />
                        Your bid{' '}
                        <span className="font-mono font-semibold tabular-nums text-gray-700">
                          £{parseFloat(bid.amount).toFixed(0)}
                        </span>
                      </span>
                      {bid.availability && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-[13px] w-[13px]" />
                          Available {new Date(bid.availability).toLocaleDateString('en-GB')}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-[13px] w-[13px]" />
                        {timeAgo(bid.created_at)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        Job:{' '}
                        <span
                          className={cn(
                            'font-medium capitalize',
                            bid.job_status === 'completed' ? 'text-green-600' : 'text-gray-600'
                          )}
                        >
                          {bid.job_status.replace('_', ' ')}
                        </span>
                      </span>
                    </div>
                    {bid.rating && (
                      <div className="mt-2 flex items-center gap-1.5 text-[13px] text-amber-600">
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        <span className="font-mono font-semibold tabular-nums">{bid.rating}/5</span>
                        {bid.rating_comment && (
                          <span className="text-muted-foreground">— {bid.rating_comment}</span>
                        )}
                      </div>
                    )}
                  </div>
                  {bid.status === 'accepted' && bid.homeowner ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        setContactBid(bid);
                      }}
                    >
                      <User className="h-[15px] w-[15px]" />
                      View contact
                    </Button>
                  ) : (
                    <span className="text-xs text-gray-400">Awaiting homeowner</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Job detail — right-side sheet */}
      <Sheet open={!!detailJob} onOpenChange={open => !open && setDetailJob(null)}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-[480px]">
          {detailJob && (
            <>
              <div className="flex items-start gap-3.5 border-b border-gray-100 p-6 pb-5 pr-12">
                <div>
                  <h2 className="mb-2 text-h2 font-semibold leading-snug text-foreground">
                    {detailJob.title}
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge tone="neutral" size="sm">
                      {getTradeLabel(detailJob.trade)}
                    </Badge>
                    {detailJob.category && (
                      <Badge tone="violet" size="sm">
                        {detailJob.category}
                      </Badge>
                    )}
                    <Badge tone={urgencyBadgeTone(detailJob.urgency)} size="sm">
                      {urgencyLabel(detailJob.urgency)}
                    </Badge>
                    {priorityTone[detailJob.priority] && (
                      <Badge tone={priorityTone[detailJob.priority]} size="sm" className="capitalize">
                        {detailJob.priority} priority
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-5 p-6">
                {detailJob.description && (
                  <div>
                    <SectionLabel className="mb-2">Description</SectionLabel>
                    <p className="text-sm leading-relaxed text-gray-700">{detailJob.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2.5">
                  {detailJob.distance_km != null && (
                    <div className="rounded-lg bg-gray-50 px-3 py-2.5">
                      <div className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        Distance
                      </div>
                      <div className="font-mono text-[13px] font-semibold tabular-nums text-foreground">
                        {detailJob.distance_km} km
                      </div>
                    </div>
                  )}
                  <div className="rounded-lg bg-gray-50 px-3 py-2.5">
                    <div className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Posted
                    </div>
                    <div className="text-[13px] font-semibold text-foreground">
                      {timeAgo(detailJob.created_at)}
                    </div>
                  </div>
                  {detailJob.preferred_date && (
                    <div className="rounded-lg bg-gray-50 px-3 py-2.5">
                      <div className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Preferred
                      </div>
                      <div className="font-mono text-[13px] font-semibold tabular-nums text-foreground">
                        {new Date(detailJob.preferred_date).toLocaleDateString('en-GB')}
                      </div>
                    </div>
                  )}
                </div>

                {detailJob.property_detail && (
                  <div>
                    <SectionLabel className="mb-2">Property</SectionLabel>
                    <div className="flex flex-wrap gap-4 rounded-lg bg-gray-50 px-3.5 py-3 text-[13px] text-gray-700">
                      <span className="inline-flex items-center gap-1.5 capitalize">
                        <Home className="h-[15px] w-[15px]" />
                        {detailJob.property_detail.property_type.replace('_', ' ')}
                      </span>
                      {detailJob.property_detail.bedrooms > 0 && (
                        <span className="inline-flex items-center gap-1.5">
                          <BedDouble className="h-[15px] w-[15px]" />
                          <span className="font-mono tabular-nums">{detailJob.property_detail.bedrooms}</span> bed
                        </span>
                      )}
                      {detailJob.property_detail.bathrooms > 0 && (
                        <span className="inline-flex items-center gap-1.5">
                          <Bath className="h-[15px] w-[15px]" />
                          <span className="font-mono tabular-nums">{detailJob.property_detail.bathrooms}</span> bath
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {detailJob.answers &&
                  Object.keys(detailJob.answers).filter(k => detailJob.answers[k] && k !== 'description').length > 0 && (
                    <div>
                      <SectionLabel className="mb-2">Additional details</SectionLabel>
                      <div className="divide-y divide-gray-100 rounded-lg border">
                        {Object.entries(detailJob.answers)
                          .filter(([key, val]) => val && key !== 'description')
                          .map(([key, val]) => (
                            <div key={key} className="flex gap-3 px-3 py-2">
                              <span className="min-w-[120px] shrink-0 pt-0.5 text-xs text-muted-foreground">
                                {QUESTION_LABELS[key] ?? formatAnswerKey(key)}
                              </span>
                              <span className="text-xs font-medium text-foreground">{String(val)}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="h-[13px] w-[13px]" />
                    <span className="font-mono tabular-nums">
                      {detailJob.bids_count}/{MAX_BIDS_PER_JOB}
                    </span>{' '}
                    bids so far
                  </span>
                </div>

                {detailJob.files.length > 0 && (
                  <div>
                    <SectionLabel className="mb-2">Attachments</SectionLabel>
                    <div className="space-y-2">
                      {detailJob.files.map(f => (
                        <a
                          key={f.id}
                          href={f.presigned_url ?? '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 rounded-lg border bg-gray-50 px-3 py-2 text-sm transition-colors hover:bg-gray-100"
                        >
                          <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                          <span className="flex-1 truncate text-gray-700">{f.file_name}</span>
                          <span className="shrink-0 font-mono text-xs tabular-nums text-gray-400">
                            {(f.file_size / 1024).toFixed(0)} KB
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Homeowner contact — location unlocks on bid, contact unlocks on acceptance */}
                <div>
                  <SectionLabel className="mb-2">Homeowner contact</SectionLabel>
                  {detailJob.unlocked_info ? (
                    <div className="space-y-3 rounded-xl border border-teal-200 bg-teal-50/60 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-teal-700">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        {detailJob.unlocked_info.contact_unlocked
                          ? 'Bid accepted — contact & location unlocked'
                          : 'Bid placed — location unlocked'}
                      </div>

                      {(detailJob.unlocked_info.address || detailJob.unlocked_info.postcode) && (
                        <div className="flex items-start gap-2 text-sm text-gray-700">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                          <div>
                            {detailJob.unlocked_info.address && (
                              <p className="font-medium leading-snug">{detailJob.unlocked_info.address}</p>
                            )}
                            {detailJob.unlocked_info.postcode && (
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {detailJob.unlocked_info.postcode}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {detailJob.unlocked_info.latitude !== null && detailJob.unlocked_info.longitude !== null && (
                        <JobLocationMap
                          lat={detailJob.unlocked_info.latitude!}
                          lng={detailJob.unlocked_info.longitude!}
                        />
                      )}

                      {detailJob.unlocked_info.contact_unlocked && detailJob.unlocked_info.homeowner ? (
                        <>
                          <div className="flex items-center gap-3 pt-1">
                            <UserAvatar
                              name={`${detailJob.unlocked_info.homeowner.first_name} ${detailJob.unlocked_info.homeowner.last_name}`}
                              size="sm"
                            />
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {detailJob.unlocked_info.homeowner.first_name}{' '}
                                {detailJob.unlocked_info.homeowner.last_name}
                              </p>
                              <p className="text-xs text-muted-foreground">Homeowner</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {detailJob.unlocked_info.homeowner.email && (
                              <a
                                href={`mailto:${detailJob.unlocked_info.homeowner.email}`}
                                className="flex items-center gap-2 rounded-lg border border-teal-200 bg-white p-2.5 text-sm text-gray-700 transition-colors hover:bg-teal-50"
                              >
                                <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                                <span className="truncate">{detailJob.unlocked_info.homeowner.email}</span>
                              </a>
                            )}
                            {detailJob.unlocked_info.homeowner.phone && (
                              <a
                                href={`tel:${detailJob.unlocked_info.homeowner.phone}`}
                                className="flex items-center gap-2 rounded-lg border border-teal-200 bg-white p-2.5 text-sm text-gray-700 transition-colors hover:bg-teal-50"
                              >
                                <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                                <span className="font-mono tabular-nums">
                                  {detailJob.unlocked_info.homeowner.phone}
                                </span>
                              </a>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="relative overflow-hidden rounded-lg border border-teal-200/70">
                          <div className="select-none space-y-2.5 bg-white/70 p-3.5 blur-sm" aria-hidden="true">
                            <div className="flex items-center gap-2.5">
                              <span className="h-9 w-9 rounded-full bg-gray-200" />
                              <div>
                                <p className="text-sm font-semibold text-foreground">John D.</p>
                                <p className="text-xs text-gray-400">Homeowner</p>
                              </div>
                            </div>
                            <div className="text-[13px] text-muted-foreground">+44 7700 ••• •••</div>
                          </div>
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-white/60">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                            <span className="px-4 text-center text-xs font-semibold text-gray-700">
                              Contact unlocks once the homeowner accepts your bid
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative overflow-hidden rounded-xl border">
                      <div className="select-none space-y-2.5 p-4 blur-sm" aria-hidden="true">
                        <div className="flex items-center gap-2.5">
                          <span className="h-9 w-9 rounded-full bg-gray-200" />
                          <div>
                            <p className="text-sm font-semibold text-foreground">John D.</p>
                            <p className="text-xs text-gray-400">Homeowner</p>
                          </div>
                        </div>
                        <div className="text-[13px] text-muted-foreground">+44 7700 ••• •••</div>
                        <div className="text-[13px] text-muted-foreground">j••••@gmail.com</div>
                      </div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/55">
                        <span className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white text-muted-foreground shadow-sm">
                          <Lock className="h-4 w-4" />
                        </span>
                        <span className="px-4 text-center text-xs font-semibold text-gray-700">
                          Place a bid to unlock location
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-gray-100 bg-card px-6 py-4">
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Coins className="h-3.5 w-3.5 text-orange-500" />
                  <span className="font-mono tabular-nums">{detailJob.bid_credits}</span> credits to bid
                </span>
                {detailJob.already_bid ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Bid already sent
                  </span>
                ) : detailJob.is_full ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400">
                    <Lock className="h-4 w-4" />
                    Bidding closed — {MAX_BIDS_PER_JOB} bids received
                  </span>
                ) : (
                  <Button
                    disabled={creditBalance < detailJob.bid_credits}
                    onClick={() => openBidDialog(detailJob)}
                  >
                    Place bid
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Bid detail — right-side sheet */}
      <Sheet open={!!detailBid} onOpenChange={open => !open && setDetailBid(null)}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-[480px]">
          {detailBid && (
            <>
              <div className="flex items-start gap-3.5 border-b border-gray-100 p-6 pb-5 pr-12">
                <div>
                  <h2 className="mb-2 text-h2 font-semibold leading-snug text-foreground">
                    {detailBid.job_title}
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge tone="neutral" size="sm">
                      {getTradeLabel(detailBid.job_trade)}
                    </Badge>
                    <Badge tone={bidStatusTone[detailBid.status] ?? 'neutral'} size="sm" dot>
                      {detailBid.status.charAt(0).toUpperCase() + detailBid.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-5 p-6">
                {detailBid.description && (
                  <div>
                    <SectionLabel className="mb-2">Your bid message</SectionLabel>
                    <p className="text-sm leading-relaxed text-gray-700">{detailBid.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2.5">
                  <div className="rounded-lg bg-gray-50 px-3 py-2.5">
                    <div className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Coins className="h-3 w-3" />
                      Your bid
                    </div>
                    <div className="font-mono text-[13px] font-semibold tabular-nums text-foreground">
                      £{parseFloat(detailBid.amount).toFixed(0)}
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-50 px-3 py-2.5">
                    <div className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Submitted
                    </div>
                    <div className="text-[13px] font-semibold text-foreground">
                      {timeAgo(detailBid.created_at)}
                    </div>
                  </div>
                  {detailBid.availability && (
                    <div className="rounded-lg bg-gray-50 px-3 py-2.5">
                      <div className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Available
                      </div>
                      <div className="font-mono text-[13px] font-semibold tabular-nums text-foreground">
                        {new Date(detailBid.availability).toLocaleDateString('en-GB')}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    Job status:{' '}
                    <span
                      className={cn(
                        'font-medium capitalize',
                        detailBid.job_status === 'completed' ? 'text-green-600' : 'text-gray-600'
                      )}
                    >
                      {detailBid.job_status.replace('_', ' ')}
                    </span>
                  </span>
                </div>

                {detailBid.rating != null && (
                  <div>
                    <SectionLabel className="mb-2">Homeowner rating</SectionLabel>
                    <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3.5 py-3 text-[13px] text-amber-700">
                      <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                      <span className="font-mono font-semibold tabular-nums">{detailBid.rating}/5</span>
                      {detailBid.rating_comment && (
                        <span className="text-amber-600">— {detailBid.rating_comment}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Homeowner contact — unlocked once the bid is accepted */}
                <div>
                  <SectionLabel className="mb-2">Homeowner contact</SectionLabel>
                  {detailBid.status === 'accepted' && detailBid.homeowner ? (
                    <div className="space-y-3 rounded-xl border border-teal-200 bg-teal-50/60 p-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={`${detailBid.homeowner.first_name} ${detailBid.homeowner.last_name}`}
                          size="sm"
                        />
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {detailBid.homeowner.first_name} {detailBid.homeowner.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">Homeowner</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {detailBid.homeowner.email && (
                          <a
                            href={`mailto:${detailBid.homeowner.email}`}
                            className="flex items-center gap-2 rounded-lg border border-teal-200 bg-white p-2.5 text-sm text-gray-700 transition-colors hover:bg-teal-50"
                          >
                            <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                            <span className="truncate">{detailBid.homeowner.email}</span>
                          </a>
                        )}
                        {detailBid.homeowner.phone && (
                          <a
                            href={`tel:${detailBid.homeowner.phone}`}
                            className="flex items-center gap-2 rounded-lg border border-teal-200 bg-white p-2.5 text-sm text-gray-700 transition-colors hover:bg-teal-50"
                          >
                            <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                            <span className="font-mono tabular-nums">{detailBid.homeowner.phone}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="relative overflow-hidden rounded-xl border">
                      <div className="select-none space-y-2.5 p-4 blur-sm" aria-hidden="true">
                        <div className="flex items-center gap-2.5">
                          <span className="h-9 w-9 rounded-full bg-gray-200" />
                          <div>
                            <p className="text-sm font-semibold text-foreground">John D.</p>
                            <p className="text-xs text-gray-400">Homeowner</p>
                          </div>
                        </div>
                        <div className="text-[13px] text-muted-foreground">+44 7700 ••• •••</div>
                        <div className="text-[13px] text-muted-foreground">j••••@gmail.com</div>
                      </div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/55">
                        <span className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white text-muted-foreground shadow-sm">
                          <Lock className="h-4 w-4" />
                        </span>
                        <span className="px-4 text-center text-xs font-semibold text-gray-700">
                          Contact unlocks once the homeowner accepts your bid
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Homeowner contact dialog */}
      <Dialog open={!!contactBid} onOpenChange={open => !open && setContactBid(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Homeowner contact</DialogTitle>
            {contactBid && <p className="mt-1 text-sm text-muted-foreground">{contactBid.job_title}</p>}
          </DialogHeader>
          {contactBid?.homeowner && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                <UserAvatar
                  name={`${contactBid.homeowner.first_name} ${contactBid.homeowner.last_name}`}
                  size="md"
                />
                <div>
                  <p className="font-semibold text-foreground">
                    {contactBid.homeowner.first_name} {contactBid.homeowner.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">Homeowner</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {contactBid.homeowner.email && (
                  <a
                    href={`mailto:${contactBid.homeowner.email}`}
                    className="group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50"
                  >
                    <Mail className="h-4 w-4 shrink-0 text-gray-400 group-hover:text-teal-600" />
                    <span className="truncate text-sm text-gray-700">{contactBid.homeowner.email}</span>
                  </a>
                )}
                {contactBid.homeowner.phone && (
                  <a
                    href={`tel:${contactBid.homeowner.phone}`}
                    className="group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-gray-400 group-hover:text-teal-600" />
                    <span className="font-mono text-sm tabular-nums text-gray-700">
                      {contactBid.homeowner.phone}
                    </span>
                  </a>
                )}
                {!contactBid.homeowner.phone && !contactBid.homeowner.email && (
                  <p className="py-2 text-center text-sm text-gray-400">No contact details available.</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setContactBid(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search-area settings dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Search area</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="overflow-hidden rounded-xl border bg-gray-25">
              <div className="flex items-center gap-2 border-b px-4 py-3">
                <MapPin className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-medium">Work coverage area</span>
                <span className="ml-auto text-xs text-muted-foreground">Drag pin or search to set location</span>
              </div>
              <div className="space-y-4 p-4">
                <TradeAreaMap
                  lat={settingsLat}
                  lng={settingsLng}
                  radiusKm={settingsRadiusKm}
                  postcode={settingsPostcode}
                  onLocationChange={({ lat: newLat, lng: newLng, postcode: newPostcode, address: newAddress }: LocationChange) => {
                    setSettingsLat(newLat);
                    setSettingsLng(newLng);
                    if (newPostcode) setSettingsPostcode(newPostcode.toUpperCase());
                    if (newAddress) setSettingsAddress(newAddress);
                  }}
                />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Job search radius</p>
                      <p className="text-xs text-muted-foreground">Only see jobs within this distance</p>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-1.5 text-teal-700">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="font-mono text-sm font-bold tabular-nums">{settingsRadiusKm} km</span>
                    </div>
                  </div>
                  <Slider
                    min={1}
                    max={100}
                    step={1}
                    value={[settingsRadiusKm]}
                    onValueChange={([v]) => setSettingsRadiusKm(v)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 km — Local</span>
                    <span>100 km — Nationwide</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings} disabled={saveSettingsMutation.isPending}>
              {saveSettingsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bid dialog */}
      <Dialog
        open={!!selectedJob}
        onOpenChange={open => {
          if (!open) {
            setSelectedJob(null);
            setBidSuccess(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[460px]">
          {bidSuccess ? (
            <div className="px-2 py-8 text-center">
              <span className="mb-3.5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
                <Check className="h-7 w-7" strokeWidth={2.4} />
              </span>
              <h2 className="mb-1.5 text-h2 font-semibold text-foreground">Bid submitted</h2>
              <p className="mb-5 text-[13px] text-muted-foreground">
                Contact details and location are now unlocked. The homeowner will be notified.
              </p>
              <Button
                className="w-full"
                onClick={() => {
                  setSelectedJob(null);
                  setBidSuccess(false);
                }}
              >
                Done
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Place a bid</DialogTitle>
                {selectedJob && (
                  <p className="mt-1 text-sm text-muted-foreground">{selectedJob.title}</p>
                )}
              </DialogHeader>

              <div className="space-y-4 py-2">
                {selectedJob &&
                  (selectedJob.category ||
                    (selectedJob.answers && Object.keys(selectedJob.answers).length > 0)) && (
                    <div className="space-y-2 rounded-lg border bg-gray-50 p-3">
                      <SectionLabel>Job details</SectionLabel>
                      {selectedJob.category && (
                        <div className="flex gap-2 text-xs">
                          <span className="min-w-[96px] text-muted-foreground">Category</span>
                          <span className="font-medium text-foreground">{selectedJob.category}</span>
                        </div>
                      )}
                      {selectedJob.answers &&
                        Object.entries(selectedJob.answers)
                          .filter(([key, val]) => val && key !== 'description')
                          .map(([key, val]) => (
                            <div key={key} className="flex gap-2 text-xs">
                              <span className="min-w-[96px] text-muted-foreground">
                                {QUESTION_LABELS[key] ?? formatAnswerKey(key)}
                              </span>
                              <span className="text-foreground">{String(val)}</span>
                            </div>
                          ))}
                    </div>
                  )}

                <div className="space-y-2">
                  <Label htmlFor="bid-amount">Your quote (£) *</Label>
                  <Input
                    id="bid-amount"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="e.g. 250"
                    className="font-mono tabular-nums"
                    value={bidAmount}
                    onChange={e => setBidAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bid-description">Message to homeowner</Label>
                  <Textarea
                    id="bid-description"
                    placeholder="Introduce yourself, your experience and when you can attend."
                    rows={3}
                    value={bidDescription}
                    onChange={e => setBidDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bid-availability">Available from (optional)</Label>
                  <Input
                    id="bid-availability"
                    type="date"
                    value={bidAvailability}
                    onChange={e => setBidAvailability(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2.5 text-xs text-orange-600">
                  <Coins className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    This bid costs{' '}
                    <strong className="font-mono tabular-nums">
                      {selectedJob?.bid_credits ?? MIN_BID_COST} credits
                    </strong>{' '}
                    · balance after:{' '}
                    <span className="font-mono tabular-nums">
                      {creditBalance - (selectedJob?.bid_credits ?? MIN_BID_COST)}
                    </span>
                    {selectedJob?.bid_credits_note ? ` — ${selectedJob.bid_credits_note}` : ''}
                  </span>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedJob(null)} disabled={bidMutation.isPending}>
                  Cancel
                </Button>
                <Button onClick={handleBidSubmit} disabled={!bidAmount || bidMutation.isPending}>
                  {bidMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      Submit bid ·{' '}
                      <span className="font-mono tabular-nums">{selectedJob?.bid_credits ?? MIN_BID_COST} cr</span>
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePlusJobsFeed;
