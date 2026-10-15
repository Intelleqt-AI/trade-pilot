'use client';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchMyBids, fetchMyJobs } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageTitle } from '@/components/trade-pilot/PageTitle';
import { SectionLabel } from '@/components/trade-pilot/SectionLabel';
import { SegmentedControl } from '@/components/trade-pilot/SegmentedControl';
import { UserAvatar } from '@/components/trade-pilot/UserAvatar';
import { EmptyState } from '@/components/trade-pilot/EmptyState';
import { SectionCard } from '@/components/trade-pilot/SectionCard';
import { PropertyCard, type PropertyDetail } from '@/components/trade-pilot/PropertyCard';
import { JobLocationMap } from '@/components/trade-pilot/JobLocationMap';
import ChatPanel from '@/components/chat/ChatPanel';
import {
  Briefcase,
  Download,
  Mail,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Phone,
  Search,
  Star,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTradeLabel } from '@/lib/jobCategories';
import { toast } from '@/lib/toast';

const STATUS_META: Record<string, { label: string; tone: 'neutral' | 'info' | 'success' | 'warning' }> = {
  // Accepted-job statuses (All tab)
  todo: { label: 'To Do', tone: 'neutral' },
  in_progress: { label: 'In Progress', tone: 'info' },
  completed: { label: 'Completed', tone: 'success' },
  // Bid statuses (Pending tab)
  purchased: { label: 'Awaiting quote', tone: 'neutral' },
  pending: { label: 'Awaiting decision', tone: 'warning' },
};

const PRIORITY_TONE: Record<string, 'danger' | 'warning' | 'neutral'> = {
  high: 'danger',
  medium: 'warning',
  low: 'neutral',
};

type WorkDateLabel = 'Completed' | 'Started' | 'Scheduled' | 'Posted';

interface ExtraContact {
  name: string;
  phone: string | null;
  email: string | null;
}

interface LeadRow {
  id: string;
  customerName: string | null;
  phone: string | null;
  email: string | null;
  /** Household contacts besides the primary one (family members). */
  otherContacts: ExtraContact[];
  jobTitle: string;
  jobDescription: string | null;
  priority: string | null;
  trade: string | null;
  category: string | null;
  address: string | null;
  postcode: string | null;
  lat: number | null;
  lng: number | null;
  propertyDetail: PropertyDetail | null;
  conversationId: string | null;
  status: string;
  amount: number | null;
  workDate: string | null;
  workDateLabel: WorkDateLabel;
  rating: number | null;
  ratingComment: string | null;
}

interface LeadGroup {
  ownerKey: string;
  customerName: string | null;
  phone: string | null;
  email: string | null;
  otherContacts: ExtraContact[];
  jobs: LeadRow[]; // newest first
}

interface ApiContact {
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string | null;
  phone?: string | null;
}

const personName = (p: ApiContact | null | undefined): string =>
  (p?.name || `${p?.first_name ?? ''} ${p?.last_name ?? ''}`).trim();

/**
 * Primary contact + the other household contacts. Uses `contacts` (primary first) when the
 * backend sends it, otherwise falls back to the single `homeowner`.
 */
function splitContacts(
  homeowner: ApiContact | null | undefined,
  contacts: ApiContact[] | null | undefined,
): Pick<LeadRow, 'customerName' | 'phone' | 'email' | 'otherContacts'> {
  const list = Array.isArray(contacts) ? contacts.filter(Boolean) : [];
  const primary = homeowner ?? list[0] ?? null;
  // The backend always lists the primary contact first.
  const others = list
    .slice(1)
    .map(c => ({ name: personName(c) || 'Family member', phone: c.phone || null, email: c.email || null }));
  return {
    customerName: primary ? personName(primary) || null : null,
    phone: primary?.phone || null,
    email: primary?.email || null,
    otherContacts: others,
  };
}

const contactKey = (c: ExtraContact) => c.email ?? c.phone ?? c.name;

function computeWorkDate(status: string, bid: any, job?: any): { workDate: string | null; workDateLabel: WorkDateLabel } {
  if (status === 'completed') {
    return { workDate: bid?.job_completed_at ?? job?.created_at ?? bid?.created_at ?? null, workDateLabel: 'Completed' };
  }
  if (status === 'in_progress') {
    return { workDate: bid?.job_started_at ?? job?.created_at ?? bid?.created_at ?? null, workDateLabel: 'Started' };
  }
  const scheduled = job?.preferred_date ?? bid?.job_preferred_date ?? bid?.job_todo_at ?? null;
  if (scheduled) return { workDate: scheduled, workDateLabel: 'Scheduled' };
  const posted = job?.created_at ?? bid?.created_at ?? null;
  return { workDate: posted, workDateLabel: 'Posted' };
}

function groupByOwner(rows: LeadRow[]): LeadGroup[] {
  const groups = new Map<string, LeadGroup>();
  for (const row of rows) {
    const key = row.email ?? row.phone ?? row.customerName ?? row.id;
    let group = groups.get(key);
    if (!group) {
      group = {
        ownerKey: key,
        customerName: row.customerName,
        phone: row.phone,
        email: row.email,
        otherContacts: [...row.otherContacts],
        jobs: [],
      };
      groups.set(key, group);
    } else {
      if (!group.customerName && row.customerName) group.customerName = row.customerName;
      if (!group.phone && row.phone) group.phone = row.phone;
      if (!group.email && row.email) group.email = row.email;
      const seen = new Set(group.otherContacts.map(contactKey));
      for (const c of row.otherContacts) {
        if (!seen.has(contactKey(c))) {
          seen.add(contactKey(c));
          group.otherContacts.push(c);
        }
      }
    }
    group.jobs.push(row);
  }
  for (const g of groups.values()) {
    g.jobs.sort((a, b) => new Date(b.workDate ?? 0).getTime() - new Date(a.workDate ?? 0).getTime());
  }
  return Array.from(groups.values());
}

function toCsv(groups: LeadGroup[]): string {
  const header = ['Customer', 'Phone', 'Email', 'Other contacts', 'Job', 'Trade', 'Location', 'Status', 'Value', 'Date'];
  const others = (g: LeadGroup) =>
    g.otherContacts
      .map(c => [c.name, c.phone, c.email].filter(Boolean).join(' / '))
      .join('; ');
  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines: string[] = [];
  for (const g of groups) {
    for (const r of g.jobs) {
      lines.push(
        [
          g.customerName ?? '',
          g.phone ?? '',
          g.email ?? '',
          others(g),
          r.jobTitle,
          r.trade ?? '',
          r.address ?? r.postcode ?? '',
          STATUS_META[r.status]?.label ?? r.status,
          r.amount ?? '',
          r.workDate ? new Date(r.workDate).toLocaleDateString('en-GB') : '',
        ]
          .map(escape)
          .join(','),
      );
    }
  }
  return [header.map(escape).join(','), ...lines].join('\n');
}

export default function MyLeads() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'all' | 'pending'>('all');
  const [detailGroup, setDetailGroup] = useState<LeadGroup | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatConversationId, setChatConversationId] = useState<string | null>(null);
  const [chatTitle, setChatTitle] = useState('');
  const [chatSubtitle, setChatSubtitle] = useState('');

  const openChatWith = (conversationId: string | null | undefined, name: string, subtitle: string) => {
    if (!conversationId) {
      toast.error('Chat is not available for this lead yet.');
      return;
    }
    setChatConversationId(conversationId);
    setChatTitle(name || 'Homeowner');
    setChatSubtitle(subtitle);
    setChatOpen(true);
  };

  const { data: jobs = [], isLoading: jobsLoading, isError } = useQuery({
    queryKey: ['myJobs'],
    queryFn: fetchMyJobs,
  });
  const { data: myBids = [] } = useQuery({ queryKey: ['MyBids'], queryFn: fetchMyBids });

  // All tab — accepted jobs (homeowner accepted this trader for the job).
  const allRows: LeadRow[] = useMemo(() => {
    const acceptedByJob = new Map<string, any>();
    (myBids as any[])
      .filter(b => b.status === 'accepted')
      .forEach(b => acceptedByJob.set(String(b.job), b));

    return (jobs as any[]).map(job => {
      const bid = acceptedByJob.get(String(job.id));
      const homeowner = bid?.homeowner ?? null;
      const unlocked = job.unlocked_info ?? null;
      const { workDate, workDateLabel } = computeWorkDate(job.status ?? 'todo', bid, job);
      return {
        id: String(job.id),
        ...splitContacts(homeowner, bid?.contacts),
        jobTitle: job.title,
        jobDescription: job.description ?? null,
        priority: job.priority?.toLowerCase() ?? null,
        trade: job.trade ?? null,
        category: job.category ?? null,
        address: unlocked?.address ?? null,
        postcode: unlocked?.postcode ?? null,
        lat: unlocked?.latitude ?? null,
        lng: unlocked?.longitude ?? null,
        propertyDetail: job.property_detail ?? null,
        conversationId: unlocked?.conversation_id ?? null,
        status: job.status ?? 'todo',
        amount: job.accepted_bid_amount != null ? Number(job.accepted_bid_amount) : bid ? Number(bid.amount) : null,
        workDate,
        workDateLabel,
        rating: bid?.rating ?? null,
        ratingComment: bid?.rating_comment ?? null,
      };
    });
  }, [jobs, myBids]);

  // Pending tab — leads purchased but not yet accepted (bid still purchased/pending).
  const pendingRows: LeadRow[] = useMemo(() => {
    return (myBids as any[])
      .filter(b => b.status === 'purchased' || b.status === 'pending')
      .map(b => {
        const homeowner = b.homeowner ?? null;
        const { workDate, workDateLabel } = computeWorkDate(b.status, b);
        return {
          id: String(b.id),
          ...splitContacts(homeowner, b.contacts),
          jobTitle: b.job_title,
          jobDescription: b.job_description ?? null,
          priority: b.job_priority?.toLowerCase() ?? null,
          trade: b.job_trade ?? null,
          category: b.job_category ?? null,
          address: b.address ?? null,
          postcode: b.job_postcode ?? null,
          lat: b.job_latitude ?? null,
          lng: b.job_longitude ?? null,
          propertyDetail: b.property_detail ?? null,
          conversationId: b.conversation_id ?? null,
          status: b.status,
          amount: b.amount != null ? Number(b.amount) : null,
          workDate,
          workDateLabel,
          rating: null,
          ratingComment: null,
        };
      });
  }, [myBids]);

  const allGroups = useMemo(() => groupByOwner(allRows), [allRows]);
  const pendingGroups = useMemo(() => groupByOwner(pendingRows), [pendingRows]);

  const groups = tab === 'all' ? allGroups : pendingGroups;
  const counts = useMemo(
    () => ({ all: allGroups.length, pending: pendingGroups.length }),
    [allGroups, pendingGroups],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter(g =>
      (g.customerName ?? '').toLowerCase().includes(q) ||
      g.jobs.some(j => j.jobTitle.toLowerCase().includes(q)),
    );
  }, [groups, query]);

  const handleExport = () => {
    const blob = new Blob([toCsv(filtered)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tradepilot-leads.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isError) {
    return (
      <div className="space-y-4">
        <PageTitle title="My Leads" />
        <p className="text-sm text-muted-foreground">Failed to load leads. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageTitle
        title="My Leads"
        subtitle="All = jobs you've been accepted for. Pending = leads you've purchased that are awaiting acceptance."
      >
        <Button variant="outline" onClick={handleExport} disabled={filtered.length === 0}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </PageTitle>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl
          value={tab}
          onChange={v => setTab(v as 'all' | 'pending')}
          items={[
            { value: 'all', label: 'All', count: counts.all },
            { value: 'pending', label: 'Pending', count: counts.pending },
          ]}
        />
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search customers or jobs…"
            className="h-9 w-64 pl-9"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      <SectionCard bodyClassName="p-0">
        {jobsLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={groups.length === 0 ? Briefcase : Users}
            title={
              groups.length === 0
                ? tab === 'pending'
                  ? 'No pending leads'
                  : 'No leads yet'
                : 'No leads match your filters'
            }
            description={
              groups.length === 0
                ? tab === 'pending'
                  ? "Purchase a lead from the Job Market — it'll appear here until the homeowner accepts you."
                  : 'Get accepted for a job from the Job Market — your customers will appear here.'
                : 'Try a different search term.'
            }
            action={
              groups.length === 0 ? (
                <Button variant="outline" size="sm" onClick={() => navigate('/trades-crm/job-market')}>
                  Open Job Market
                </Button>
              ) : undefined
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted hover:bg-muted">
                <TableHead className="pl-5 text-overline font-semibold uppercase text-muted-foreground">
                  Customer
                </TableHead>
                <TableHead className="text-overline font-semibold uppercase text-muted-foreground">
                  Job
                </TableHead>
                <TableHead className="hidden text-overline font-semibold uppercase text-muted-foreground md:table-cell">
                  Location
                </TableHead>
                <TableHead className="text-overline font-semibold uppercase text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="hidden text-right text-overline font-semibold uppercase text-muted-foreground sm:table-cell">
                  Value
                </TableHead>
                <TableHead className="w-11" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((group, i) => {
                const latest = group.jobs[0];
                const status = STATUS_META[latest.status] ?? STATUS_META.todo;
                const totalValue = group.jobs.reduce((sum, j) => sum + (j.amount ?? 0), 0);
                const location = latest.address ?? latest.postcode;
                return (
                  <TableRow
                    key={group.ownerKey}
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => setDetailGroup(group)}
                  >
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar
                          name={group.customerName ?? '?'}
                          size="md"
                          tone={i % 2 === 0 ? 'brand' : 'navy'}
                        />
                        <div className="min-w-0">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <span className="truncate text-[13px] font-semibold text-foreground">
                              {group.customerName ?? '—'}
                            </span>
                            {group.otherContacts.length > 0 && (
                              <span
                                className="shrink-0 rounded-full bg-muted px-1.5 py-px text-[11px] font-semibold text-muted-foreground"
                                title={`Also: ${group.otherContacts.map(c => c.name).join(', ')}`}
                              >
                                +{group.otherContacts.length}
                              </span>
                            )}
                          </div>
                          <div className="truncate font-mono text-xs tabular-nums text-muted-foreground">
                            {group.phone ?? '—'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex min-w-0 flex-col gap-1">
                        <span className="flex items-center gap-1.5 truncate text-[13px] font-medium text-foreground">
                          <span className="truncate">{latest.jobTitle}</span>
                          {group.jobs.length > 1 && (
                            <Badge tone="neutral" size="sm" className="shrink-0">
                              +{group.jobs.length - 1} more
                            </Badge>
                          )}
                        </span>
                        <span className="flex items-center gap-1.5">
                          {latest.priority && PRIORITY_TONE[latest.priority] && (
                            <Badge tone={PRIORITY_TONE[latest.priority]} size="sm" className="capitalize">
                              {latest.priority}
                            </Badge>
                          )}
                          {latest.trade && (
                            <span className="text-xs text-muted-foreground">{getTradeLabel(latest.trade)}</span>
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {location ? (
                        <span className="inline-flex items-center gap-1 text-[13px] text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {location}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge tone={status.tone} size="sm" dot>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden text-right sm:table-cell">
                      {totalValue > 0 ? (
                        <span
                          className={cn(
                            'font-mono text-[13px] font-semibold tabular-nums',
                            latest.status === 'completed' ? 'text-green-600' : 'text-foreground'
                          )}
                        >
                          £{totalValue.toLocaleString('en-GB')}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="pr-3" onClick={e => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Row actions">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem disabled={!group.phone} asChild={!!group.phone}>
                            {group.phone ? (
                              <a href={`tel:${group.phone}`}>
                                <Phone className="mr-2 h-4 w-4" />
                                Call
                              </a>
                            ) : (
                              <span>
                                <Phone className="mr-2 h-4 w-4" />
                                Call
                              </span>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled={!group.email} asChild={!!group.email}>
                            {group.email ? (
                              <a href={`mailto:${group.email}`}>
                                <Mail className="mr-2 h-4 w-4" />
                                Email
                              </a>
                            ) : (
                              <span>
                                <Mail className="mr-2 h-4 w-4" />
                                Email
                              </span>
                            )}
                          </DropdownMenuItem>
                          {tab === 'pending' ? (
                            <DropdownMenuItem onClick={() => navigate('/trades-crm/messages')}>
                              <Briefcase className="mr-2 h-4 w-4" />
                              Open messages
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => navigate('/trades-crm/jobs')}>
                              <Briefcase className="mr-2 h-4 w-4" />
                              View in pipeline
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </SectionCard>

      {/* Lead detail — right-side sheet */}
      <Sheet open={!!detailGroup} onOpenChange={open => !open && setDetailGroup(null)}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-[480px]">
          {detailGroup && (() => {
            const latest = detailGroup.jobs[0];
            const addressJob = detailGroup.jobs.find(j => j.address || j.postcode) ?? null;
            const propertyJob = detailGroup.jobs.find(j => j.propertyDetail) ?? null;
            const mapJob = detailGroup.jobs.find(j => j.lat != null && j.lng != null) ?? null;
            return (
              <>
                <div className="flex items-start gap-3.5 border-b border-border p-6 pb-5 pr-12">
                  <UserAvatar name={detailGroup.customerName ?? '?'} size="lg" tone="brand" />
                  <div className="min-w-0 flex-1">
                    <h2 className="mb-1 truncate text-h2 font-semibold leading-snug text-foreground">
                      {detailGroup.customerName ?? 'Unknown customer'}
                    </h2>
                    <p className="mb-2 truncate text-sm text-muted-foreground">
                      {detailGroup.jobs.length === 1
                        ? latest.jobTitle
                        : `${detailGroup.jobs.length} jobs together`}
                    </p>
                    <Badge tone={(STATUS_META[latest.status] ?? STATUS_META.todo).tone} size="sm" dot>
                      {(STATUS_META[latest.status] ?? STATUS_META.todo).label}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-5 p-6">
                  <div>
                    <SectionLabel className="mb-2">Homeowner details</SectionLabel>
                    <div className="space-y-2">
                      {detailGroup.phone ? (
                        <a
                          href={`tel:${detailGroup.phone}`}
                          className="flex items-center gap-2 rounded-lg border p-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                        >
                          <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="font-mono tabular-nums">{detailGroup.phone}</span>
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">No phone number on file.</p>
                      )}
                      {detailGroup.email ? (
                        <a
                          href={`mailto:${detailGroup.email}`}
                          className="flex items-center gap-2 rounded-lg border p-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                        >
                          <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="truncate">{detailGroup.email}</span>
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">No email on file.</p>
                      )}
                    </div>
                    {detailGroup.otherContacts.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        <p className="text-xs font-medium text-muted-foreground">Other household contacts</p>
                        {detailGroup.otherContacts.map(c => (
                          <div
                            key={contactKey(c)}
                            className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border p-2.5 text-sm"
                          >
                            <span className="min-w-0 truncate font-medium text-foreground">{c.name}</span>
                            {c.phone && (
                              <a href={`tel:${c.phone}`} className="font-mono text-xs tabular-nums text-muted-foreground hover:text-foreground">
                                {c.phone}
                              </a>
                            )}
                            {c.email && (
                              <a href={`mailto:${c.email}`} className="min-w-0 truncate text-xs text-muted-foreground hover:text-foreground">
                                {c.email}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <SectionLabel className="mb-2">Working status</SectionLabel>
                    <div className="space-y-2.5">
                      {detailGroup.jobs.map(job => {
                        const jobStatus = STATUS_META[job.status] ?? STATUS_META.todo;
                        return (
                          <div key={job.id} className="rounded-lg border p-3">
                            <div className="mb-1.5 flex items-start justify-between gap-2">
                              <span className="min-w-0 truncate text-sm font-semibold text-foreground">
                                {job.jobTitle}
                              </span>
                              <Badge tone={jobStatus.tone} size="sm" dot className="shrink-0">
                                {jobStatus.label}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              {job.amount != null && (
                                <span className="font-mono font-semibold tabular-nums text-foreground">
                                  £{job.amount.toLocaleString('en-GB')}
                                </span>
                              )}
                              {job.trade && <span>{getTradeLabel(job.trade)}</span>}
                              {job.workDate && (
                                <span>
                                  {job.workDateLabel}{' '}
                                  {new Date(job.workDate).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </span>
                              )}
                            </div>
                            {job.status === 'completed' && job.rating != null && (
                              <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-amber-600 dark:text-amber-400">
                                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                                <span className="font-mono font-semibold tabular-nums">{job.rating}/5</span>
                                {job.ratingComment && (
                                  <span className="text-muted-foreground">— {job.ratingComment}</span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {(addressJob || propertyJob) && (
                    <div>
                      <SectionLabel className="mb-2">Property</SectionLabel>
                      {addressJob && (
                        <div className="mb-2 flex items-start gap-2 text-sm text-foreground">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                          <div>
                            {addressJob.address && <p className="font-medium leading-snug">{addressJob.address}</p>}
                            {addressJob.postcode && (
                              <p className="mt-0.5 text-xs text-muted-foreground">{addressJob.postcode}</p>
                            )}
                          </div>
                        </div>
                      )}
                      {propertyJob?.propertyDetail && <PropertyCard detail={propertyJob.propertyDetail} />}
                    </div>
                  )}

                  {mapJob && mapJob.lat != null && mapJob.lng != null && (
                    <div>
                      <SectionLabel className="mb-2">Location</SectionLabel>
                      <JobLocationMap lat={mapJob.lat} lng={mapJob.lng} />
                    </div>
                  )}
                </div>

                <div className="sticky bottom-0 flex items-center gap-2 border-t border-border bg-card px-6 py-4">
                  <Button variant="outline" size="sm" className="flex-1" disabled={!detailGroup.phone} asChild={!!detailGroup.phone}>
                    {detailGroup.phone ? (
                      <a href={`tel:${detailGroup.phone}`}>
                        <Phone className="h-4 w-4" />
                        Call
                      </a>
                    ) : (
                      <span>
                        <Phone className="h-4 w-4" />
                        Call
                      </span>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" disabled={!detailGroup.email} asChild={!!detailGroup.email}>
                    {detailGroup.email ? (
                      <a href={`mailto:${detailGroup.email}`}>
                        <Mail className="h-4 w-4" />
                        Email
                      </a>
                    ) : (
                      <span>
                        <Mail className="h-4 w-4" />
                        Email
                      </span>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={!latest.conversationId}
                    onClick={() =>
                      openChatWith(latest.conversationId, detailGroup.customerName ?? 'Homeowner', latest.jobTitle)
                    }
                  >
                    <MessageCircle className="h-4 w-4" />
                    Message
                  </Button>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>

      <ChatPanel
        open={chatOpen}
        onOpenChange={setChatOpen}
        conversationId={chatConversationId}
        title={chatTitle}
        subtitle={chatSubtitle}
      />
    </div>
  );
}
