import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Coins,
  MapPin,
  Clock,
  Briefcase,
  Calendar,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  ChevronRight,
  Star,
  FileText,
  Phone,
  Mail,
  User,
  Home,
  BedDouble,
  Bath,
} from 'lucide-react';
import useFetch from '@/hooks/useFetch';
import { usePost } from '@/hooks/usePost';
import { toast } from '@/lib/toast';

const JOBS_URL = '/api/v1/tradepilot/jobs/';
const MY_BIDS_URL = '/api/v1/tradepilot/jobs/my-bids/';
const ME_URL = '/api/v1/tradepilot/auth/me/';
const MIN_BID_COST = 10;

const QUESTION_LABELS: Record<string, string> = {
  boilers_q1: 'What type of boiler do you have?',
  boilers_q2: 'What needs doing to the boiler?',
  boilers_q3: 'Is the property domestic or commercial?',
  radiators_q1: 'What do you need help with?',
  radiators_q2: 'How many radiators are involved (approx)?',
  radiators_q3: 'Is this for a domestic or commercial property?',
  appliances_q1: 'Which appliance do you need help with?',
  appliances_q2: 'What needs doing?',
  appliances_q3: 'Is the property domestic or commercial?',
  fixtures_q1: 'Which fixture needs attention?',
  fixtures_q2: 'What is the issue?',
  fixtures_q3: 'Is the property domestic or commercial?',
  'pipework,_taps_and_drainage_q1': 'What best describes the job?',
  'pipework,_taps_and_drainage_q2': 'Is this an urgent issue?',
  'pipework,_taps_and_drainage_q3': 'Is the property domestic or commercial?',
  boilers_gas_q1: 'What fuel does your boiler use?',
  boilers_gas_q2: 'What needs doing?',
  boilers_gas_q3: 'Property type',
  gas_hobs_cookers_and_ovens_q1: 'Which appliance?',
  gas_hobs_cookers_and_ovens_q2: 'What needs doing?',
  gas_hobs_cookers_and_ovens_q3: 'Property type',
  gas_fires_and_flues_q1: 'What type of unit?',
  gas_fires_and_flues_q2: 'What needs doing?',
  gas_fires_and_flues_q3: 'Property type',
  gas_safety_certificates_cp12_q1: 'Which certificate?',
  gas_safety_certificates_cp12_q2: 'How many gas appliances to test?',
  gas_safety_certificates_cp12_q3: 'Property type',
  gas_leaks_and_emergency_q1: 'What is the issue?',
  gas_leaks_and_emergency_q2: 'How urgent?',
  gas_leaks_and_emergency_q3: 'Property type',
  gas_pipework_q1: 'What best describes the job?',
  gas_pipework_q2: 'Approximate length / scale?',
  gas_pipework_q3: 'Property type',
  // Roofing categories
  pitched_roof_repairs_q1: "What's the issue?",
  pitched_roof_repairs_q2: 'How big is the affected area?',
  pitched_roof_repairs_q3: 'Property type',
  full_or_partial_reroof_q1: "What's the scope?",
  full_or_partial_reroof_q2: 'Roof covering material?',
  full_or_partial_reroof_q3: 'Property type',
  flat_roof_q1: 'What needs doing?',
  flat_roof_q2: 'Flat roof material?',
  flat_roof_q3: 'Property type',
  gutters_fascias_and_soffits_q1: "What's the job?",
  gutters_fascias_and_soffits_q2: 'Approximate scale?',
  gutters_fascias_and_soffits_q3: 'Property type',
  chimney_work_q1: "What's needed?",
  chimney_work_q2: 'How will the chimney be accessed?',
  chimney_work_q3: 'Property type',
  'roof_windows___skylights_q1': 'What do you need?',
  'roof_windows___skylights_q2': 'How many windows?',
  'roof_windows___skylights_q3': 'Property type',
  lead_work_and_flashing_q1: "What's the job?",
  lead_work_and_flashing_q2: 'Where is the lead work?',
  lead_work_and_flashing_q3: 'Property type',
  moss_removal_and_roof_cleaning_q1: "What's the job?",
  moss_removal_and_roof_cleaning_q2: 'Scale of clean?',
  moss_removal_and_roof_cleaning_q3: 'Property type',
};

const TRADE_OPTIONS = [
  { value: 'plumber', label: 'Plumber' },
  { value: 'electrician', label: 'Electrician' },
  { value: 'builder', label: 'Builder' },
  { value: 'decorator', label: 'Decorator' },
  { value: 'roofer', label: 'Roofer' },
  { value: 'carpenter', label: 'Carpenter' },
  { value: 'plasterer', label: 'Plasterer' },
  { value: 'tiler', label: 'Tiler' },
  { value: 'gardener', label: 'Gardener' },
  { value: 'cleaner', label: 'Cleaner' },
  { value: 'handyman', label: 'Handyman' },
  { value: 'locksmith', label: 'Locksmith' },
  { value: 'glazier', label: 'Glazier' },
  { value: 'hvac', label: 'HVAC Engineer' },
  { value: 'gas_engineer', label: 'Gas Engineer' },
  { value: 'other', label: 'Other' },
];

const URGENCY_OPTIONS = [
  { value: 'emergency', label: 'Emergency (same day)' },
  { value: 'urgent', label: 'Urgent (within 48h)' },
  { value: 'normal', label: 'Normal (within 2 weeks)' },
  { value: 'flexible', label: 'Flexible' },
];

const urgencyConfig: Record<string, { label: string; color: string }> = {
  emergency: { label: 'Emergency', color: 'bg-red-100 text-red-700 border-red-200' },
  urgent: { label: 'Urgent', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  normal: { label: 'Normal', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  flexible: { label: 'Flexible', color: 'bg-green-100 text-green-700 border-green-200' },
};

const bidStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700 border-green-200' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 border-red-200' },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  high: { label: 'High', color: 'bg-red-100 text-red-700 border-red-200' },
  medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  low: { label: 'Low', color: 'bg-slate-100 text-slate-600 border-slate-200' },
};

interface PropertyDetail {
  name: string | null;
  address: string;
  postcode: string;
  location: string | null;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
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
  location: string;
  postcode: string;
  property_postcode: string | null;
  property_detail: PropertyDetail | null;
  already_bid: boolean;
  files_count: number;
  bid_credits: number;
  bid_credits_note: string;
  answers: Record<string, unknown>;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
  radius_km: number | null;
  distance_km: number | null;
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
  const [subTab, setSubTab] = useState<'available' | 'my-bids'>('available');
  const [tradeFilter, setTradeFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [distanceFilter, setDistanceFilter] = useState<'all' | '10' | '20' | '30' | 'other'>('all');
  const [customDistance, setCustomDistance] = useState<string>('');
  const [detailJob, setDetailJob] = useState<Job | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidDescription, setBidDescription] = useState('');
  const [bidAvailability, setBidAvailability] = useState('');
  const [contactBid, setContactBid] = useState<MyBid | null>(null);

  const openBidDialog = (job: Job) => {
    setDetailJob(null);
    setSelectedJob(job);
  };

  const jobsUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (tradeFilter && tradeFilter !== 'all') params.set('trade', tradeFilter);
    if (urgencyFilter && urgencyFilter !== 'all') params.set('urgency', urgencyFilter);
    if (distanceFilter !== 'all') {
      if (distanceFilter === 'other') {
        const n = parseInt(customDistance, 10);
        if (Number.isFinite(n) && n > 0) params.set('distance', String(n));
      } else {
        params.set('distance', distanceFilter);
      }
    }
    const qs = params.toString();
    return `${JOBS_URL}${qs ? '?' + qs : ''}`;
  }, [tradeFilter, urgencyFilter, distanceFilter, customDistance]);

  const { data: jobsRes, isLoading: jobsLoading } = useFetch<any>(jobsUrl);
  const { data: bidsRes, isLoading: bidsLoading } = useFetch<any>(
    subTab === 'my-bids' ? MY_BIDS_URL : null,
  );

  const jobs: Job[] = jobsRes?.data ?? [];
  const myBids: MyBid[] = bidsRes?.data ?? [];

  const bidMutation = usePost({
    onSuccess: (res: any) => {
      const newBalance = res?.data?.credit_balance;
      if (newBalance !== undefined) onCreditChange(newBalance);
      queryClient.invalidateQueries({ predicate: q => (q.queryKey[0] as string)?.startsWith(JOBS_URL) });
      queryClient.invalidateQueries({ queryKey: [MY_BIDS_URL] });
      queryClient.invalidateQueries({ queryKey: [ME_URL] });
      toast.success('Bid submitted!');
      setSelectedJob(null);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Job Market</h2>
          <p className="text-sm text-slate-500 mt-0.5">Browse and bid on homeowner jobs</p>
        </div>
        <Badge
          variant={insufficientCredits ? 'destructive' : 'secondary'}
          className="text-sm px-3 py-1.5 self-start sm:self-auto"
        >
          <Coins className="h-4 w-4 mr-1.5" />
          {creditBalance} credits · from {MIN_BID_COST} per bid
        </Badge>
      </div>

      {/* Low credits warning */}
      {insufficientCredits && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 font-medium">
              You need at least {MIN_BID_COST} credits to bid. Top up your account to start bidding.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setSubTab('available')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            subTab === 'available'
              ? 'bg-white shadow-sm text-slate-900'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          Available Jobs {!jobsLoading && `(${jobs.length})`}
        </button>
        <button
          onClick={() => setSubTab('my-bids')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            subTab === 'my-bids'
              ? 'bg-white shadow-sm text-slate-900'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          My Bids
        </button>
      </div>

      {/* Available Jobs */}
      {subTab === 'available' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <Select value={tradeFilter} onValueChange={setTradeFilter}>
              <SelectTrigger className="w-44 bg-white">
                <SelectValue placeholder="All trades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All trades</SelectItem>
                {TRADE_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-44 bg-white">
                <SelectValue placeholder="Any urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any urgency</SelectItem>
                {URGENCY_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={distanceFilter} onValueChange={v => setDistanceFilter(v as 'all' | '10' | '20' | '30' | 'other')}>
              <SelectTrigger className="w-44 bg-white">
                <SelectValue placeholder="Any distance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any distance</SelectItem>
                <SelectItem value="10">Within 10 km</SelectItem>
                <SelectItem value="20">Within 20 km</SelectItem>
                <SelectItem value="30">Within 30 km</SelectItem>
                <SelectItem value="other">Other (custom km)</SelectItem>
              </SelectContent>
            </Select>
            {distanceFilter === 'other' && (
              <Input
                type="number"
                min="1"
                max="500"
                value={customDistance}
                onChange={e => setCustomDistance(e.target.value)}
                placeholder="km"
                className="w-24 bg-white"
              />
            )}
          </div>

          {/* Job list */}
          {jobsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : jobs.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No jobs available right now</p>
                <p className="text-slate-400 text-sm mt-1">Check back soon or adjust your filters</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {jobs.map(job => (
                <Card
                  key={job.id}
                  onClick={() => setDetailJob(job)}
                  className="border border-slate-200 bg-white hover:shadow-md transition-shadow cursor-pointer"
                >
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <h3 className="text-base font-semibold text-slate-800">{job.title}</h3>
                          <Badge variant="outline" className="capitalize text-xs">
                            {job.trade}
                          </Badge>
                          {job.category && (
                            <Badge variant="outline" className="text-xs bg-violet-50 text-violet-700 border-violet-200">
                              {job.category}
                            </Badge>
                          )}
                          {urgencyConfig[job.urgency] && (
                            <Badge
                              variant="outline"
                              className={`text-xs capitalize ${urgencyConfig[job.urgency].color}`}
                            >
                              {urgencyConfig[job.urgency].label}
                            </Badge>
                          )}
                          {priorityConfig[job.priority] && (
                            <Badge
                              variant="outline"
                              className={`text-xs capitalize ${priorityConfig[job.priority].color}`}
                            >
                              {priorityConfig[job.priority].label} Priority
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">{job.description}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          {job.distance_km !== null && job.distance_km !== undefined && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-medium">
                                {job.distance_km} km away
                              </span>
                            </span>
                          )}
                          {job.preferred_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(job.preferred_date).toLocaleDateString('en-GB')}
                            </span>
                          )}
                          {job.files_count > 0 && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-3.5 w-3.5" />
                              {job.files_count} file{job.files_count !== 1 ? 's' : ''}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {timeAgo(job.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0" onClick={e => e.stopPropagation()}>
                        {job.already_bid ? (
                          <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                            <CheckCircle2 className="h-4 w-4" />
                            Bid sent
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            disabled={insufficientCredits}
                            onClick={() => openBidDialog(job)}
                            className="whitespace-nowrap"
                          >
                            Bid
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Bids */}
      {subTab === 'my-bids' && (
        <div className="space-y-4">
          {bidsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : myBids.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No bids submitted yet</p>
                <p className="text-slate-400 text-sm mt-1">Browse available jobs and submit your first bid</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {myBids.map(bid => (
                <Card key={bid.id} className="border border-slate-200 bg-white">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <h3 className="text-base font-semibold text-slate-800">{bid.job_title}</h3>
                          <Badge variant="outline" className="capitalize text-xs">{bid.job_trade}</Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs capitalize ${bidStatusConfig[bid.status]?.color ?? ''}`}
                          >
                            {bidStatusConfig[bid.status]?.label ?? bid.status}
                          </Badge>
                        </div>
                        {bid.description && (
                          <p className="text-sm text-slate-600 line-clamp-1 mb-2">{bid.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <Coins className="h-3.5 w-3.5" />
                            £{parseFloat(bid.amount).toFixed(0)} bid
                          </span>
                          {bid.availability && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              Available {new Date(bid.availability).toLocaleDateString('en-GB')}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {timeAgo(bid.created_at)}
                          </span>
                        </div>
                        {bid.rating && (
                          <div className="mt-2 flex items-center gap-1.5 text-sm text-amber-600">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="font-medium">{bid.rating}/5</span>
                            {bid.rating_comment && (
                              <span className="text-slate-500">— {bid.rating_comment}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-2">
                        <span className="text-xs text-slate-400">
                          Job: <span className={`font-medium capitalize ${bid.job_status === 'completed' ? 'text-green-600' : 'text-slate-600'}`}>{bid.job_status}</span>
                        </span>
                        {bid.status === 'accepted' && bid.homeowner && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 border-green-300 text-green-700 hover:bg-green-50"
                            onClick={() => setContactBid(bid)}
                          >
                            <User className="h-3.5 w-3.5 mr-1" />
                            View Contact
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Job Detail Dialog */}
      <Dialog open={!!detailJob} onOpenChange={open => !open && setDetailJob(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="leading-snug">{detailJob?.title}</DialogTitle>
            {detailJob && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                <Badge variant="outline" className="capitalize text-xs">{detailJob.trade}</Badge>
                {detailJob.category && (
                  <Badge variant="outline" className="text-xs bg-violet-50 text-violet-700 border-violet-200">
                    {detailJob.category}
                  </Badge>
                )}
                {urgencyConfig[detailJob.urgency] && (
                  <Badge variant="outline" className={`text-xs ${urgencyConfig[detailJob.urgency].color}`}>
                    {urgencyConfig[detailJob.urgency].label}
                  </Badge>
                )}
                {priorityConfig[detailJob.priority] && (
                  <Badge variant="outline" className={`text-xs ${priorityConfig[detailJob.priority].color}`}>
                    {priorityConfig[detailJob.priority].label} Priority
                  </Badge>
                )}
              </div>
            )}
          </DialogHeader>

          {detailJob && (
            <div className="space-y-5 py-2">
              {/* Description */}
              {detailJob.description && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Description</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{detailJob.description}</p>
                </div>
              )}

              {/* Key info row */}
              <div className="grid grid-cols-2 gap-3">
                {detailJob.distance_km !== null && detailJob.distance_km !== undefined && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><MapPin className="h-3 w-3" />Distance</p>
                    <p className="text-sm font-semibold text-slate-800">{detailJob.distance_km} km away</p>
                  </div>
                )}
                {detailJob.preferred_date && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Calendar className="h-3 w-3" />Preferred date</p>
                    <p className="text-sm font-semibold text-slate-800">{new Date(detailJob.preferred_date).toLocaleDateString('en-GB')}</p>
                  </div>
                )}
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Clock className="h-3 w-3" />Posted</p>
                  <p className="text-sm font-semibold text-slate-800">{timeAgo(detailJob.created_at)}</p>
                </div>
              </div>

              {/* Property detail (type / beds / baths only — homeowner's location stays private until bid is accepted) */}
              {detailJob.property_detail && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Property</p>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex flex-wrap gap-3">
                      <span className="flex items-center gap-1 text-xs text-slate-600">
                        <Home className="h-3.5 w-3.5" />
                        {detailJob.property_detail.property_type.replace('_', ' ')}
                      </span>
                      {detailJob.property_detail.bedrooms > 0 && (
                        <span className="flex items-center gap-1 text-xs text-slate-600">
                          <BedDouble className="h-3.5 w-3.5" />
                          {detailJob.property_detail.bedrooms} bed
                        </span>
                      )}
                      {detailJob.property_detail.bathrooms > 0 && (
                        <span className="flex items-center gap-1 text-xs text-slate-600">
                          <Bath className="h-3.5 w-3.5" />
                          {detailJob.property_detail.bathrooms} bath
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Q&A answers */}
              {detailJob.answers && Object.keys(detailJob.answers).filter(k => detailJob.answers[k] && k !== 'description').length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Additional Details</p>
                  <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
                    {Object.entries(detailJob.answers)
                      .filter(([key, val]) => val && key !== 'description')
                      .map(([key, val]) => (
                        <div key={key} className="flex gap-3 px-3 py-2">
                          <span className="text-xs text-slate-500 min-w-[120px] shrink-0 pt-0.5">
                            {QUESTION_LABELS[key] ?? key.replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs text-slate-800 font-medium">{String(val)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {detailJob.files_count > 0 && (
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  {detailJob.files_count} attachment{detailJob.files_count !== 1 ? 's' : ''} uploaded by homeowner
                </p>
              )}
            </div>
          )}

          {detailJob && !detailJob.already_bid && detailJob.bid_credits_note && (
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mx-6 mb-2">
              <Coins className="h-3.5 w-3.5 shrink-0 text-amber-500" />
              <span>{detailJob.bid_credits} credits — {detailJob.bid_credits_note}</span>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDetailJob(null)}>Close</Button>
            {detailJob && (
              detailJob.already_bid ? (
                <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium px-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Bid already sent
                </div>
              ) : (
                <Button
                  disabled={creditBalance < detailJob.bid_credits}
                  onClick={() => openBidDialog(detailJob)}
                >
                  Place Bid · {detailJob.bid_credits} credits
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Homeowner Contact Dialog */}
      <Dialog open={!!contactBid} onOpenChange={open => !open && setContactBid(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Homeowner Contact</DialogTitle>
            {contactBid && (
              <p className="text-sm text-slate-500 mt-1">{contactBid.job_title}</p>
            )}
          </DialogHeader>
          {contactBid?.homeowner && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">
                    {contactBid.homeowner.first_name} {contactBid.homeowner.last_name}
                  </p>
                  <p className="text-xs text-slate-500">Homeowner</p>
                </div>
              </div>
              <div className="space-y-3">
                {contactBid.homeowner.email && (
                  <a
                    href={`mailto:${contactBid.homeowner.email}`}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-slate-50 transition-colors group"
                  >
                    <Mail className="h-4 w-4 text-slate-400 group-hover:text-primary shrink-0" />
                    <span className="text-sm text-slate-700 truncate">{contactBid.homeowner.email}</span>
                  </a>
                )}
                {contactBid.homeowner.phone && (
                  <a
                    href={`tel:${contactBid.homeowner.phone}`}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-slate-50 transition-colors group"
                  >
                    <Phone className="h-4 w-4 text-slate-400 group-hover:text-primary shrink-0" />
                    <span className="text-sm text-slate-700">{contactBid.homeowner.phone}</span>
                  </a>
                )}
                {!contactBid.homeowner.phone && !contactBid.homeowner.email && (
                  <p className="text-sm text-slate-400 text-center py-2">No contact details available.</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setContactBid(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bid Dialog */}
      <Dialog open={!!selectedJob} onOpenChange={open => !open && setSelectedJob(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit a Bid</DialogTitle>
            {selectedJob && (
              <p className="text-sm text-slate-500 mt-1">{selectedJob.title}</p>
            )}
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Job details summary */}
            {selectedJob && (selectedJob.category || (selectedJob.answers && Object.keys(selectedJob.answers).length > 0)) && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Job Details</p>
                {selectedJob.category && (
                  <div className="flex gap-2 text-xs">
                    <span className="text-slate-500 min-w-[96px]">Category</span>
                    <span className="text-slate-800 font-medium">{selectedJob.category}</span>
                  </div>
                )}
                {selectedJob.answers && Object.entries(selectedJob.answers)
                  .filter(([key, val]) => val && key !== 'description')
                  .map(([key, val]) => (
                    <div key={key} className="flex gap-2 text-xs">
                      <span className="text-slate-500 min-w-[96px]">{QUESTION_LABELS[key] ?? key.replace(/_/g, ' ')}</span>
                      <span className="text-slate-800">{String(val)}</span>
                    </div>
                  ))
                }
              </div>
            )}

            <div className="flex items-center justify-between text-sm p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Bid cost</span>
              <div className="text-right">
                <span className="font-semibold text-slate-800 flex items-center gap-1 justify-end">
                  <Coins className="h-4 w-4 text-amber-500" />
                  {selectedJob?.bid_credits ?? MIN_BID_COST} credits (balance: {creditBalance} → {creditBalance - (selectedJob?.bid_credits ?? MIN_BID_COST)})
                </span>
                {selectedJob?.bid_credits_note && (
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedJob.bid_credits_note}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bid-amount">Your quote (£) *</Label>
              <Input
                id="bid-amount"
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 250"
                value={bidAmount}
                onChange={e => setBidAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bid-description">Message to homeowner</Label>
              <Textarea
                id="bid-description"
                placeholder="Describe your approach, experience, or ask a question..."
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
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedJob(null)}
              disabled={bidMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBidSubmit}
              disabled={!bidAmount || bidMutation.isPending}
            >
              {bidMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Submitting…</>
              ) : (
                <>Submit Bid</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePlusJobsFeed;
