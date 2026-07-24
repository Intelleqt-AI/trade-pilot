'use client';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchMyBids, fetchMyJobs } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
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
import { SegmentedControl } from '@/components/trade-pilot/SegmentedControl';
import { UserAvatar } from '@/components/trade-pilot/UserAvatar';
import { EmptyState } from '@/components/trade-pilot/EmptyState';
import { SectionCard } from '@/components/trade-pilot/SectionCard';
import {
  Briefcase,
  Download,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Search,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTradeLabel } from '@/lib/jobCategories';

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

interface LeadRow {
  id: string;
  customerName: string | null;
  phone: string | null;
  email: string | null;
  jobTitle: string;
  priority: string | null;
  trade: string | null;
  location: string | null;
  status: string;
  amount: number | null;
  date: string | null;
}

function toCsv(rows: LeadRow[]): string {
  const header = ['Customer', 'Phone', 'Email', 'Job', 'Trade', 'Location', 'Status', 'Value', 'Date'];
  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = rows.map(r =>
    [
      r.customerName ?? '',
      r.phone ?? '',
      r.email ?? '',
      r.jobTitle,
      r.trade ?? '',
      r.location ?? '',
      STATUS_META[r.status]?.label ?? r.status,
      r.amount ?? '',
      r.date ? new Date(r.date).toLocaleDateString('en-GB') : '',
    ]
      .map(escape)
      .join(',')
  );
  return [header.map(escape).join(','), ...lines].join('\n');
}

export default function MyLeads() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'all' | 'pending'>('all');

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
      return {
        id: String(job.id),
        customerName: homeowner ? `${homeowner.first_name} ${homeowner.last_name}`.trim() : null,
        phone: homeowner?.phone ?? null,
        email: homeowner?.email ?? null,
        jobTitle: job.title,
        priority: job.priority?.toLowerCase() ?? null,
        trade: job.trade ?? null,
        location: job.location ?? null,
        status: job.status ?? 'todo',
        amount: job.accepted_bid_amount != null ? Number(job.accepted_bid_amount) : bid ? Number(bid.amount) : null,
        date: job.created_at ?? null,
      };
    });
  }, [jobs, myBids]);

  // Pending tab — leads purchased but not yet accepted (bid still purchased/pending).
  const pendingRows: LeadRow[] = useMemo(() => {
    return (myBids as any[])
      .filter(b => b.status === 'purchased' || b.status === 'pending')
      .map(b => {
        const homeowner = b.homeowner ?? null;
        return {
          id: String(b.id),
          customerName: homeowner ? `${homeowner.first_name} ${homeowner.last_name}`.trim() : null,
          phone: homeowner?.phone ?? null,
          email: homeowner?.email ?? null,
          jobTitle: b.job_title,
          priority: b.job_priority?.toLowerCase() ?? null,
          trade: b.job_trade ?? null,
          location: b.job_location ?? null,
          status: b.status,
          amount: b.amount != null ? Number(b.amount) : null,
          date: b.created_at ?? null,
        };
      });
  }, [myBids]);

  const rows = tab === 'all' ? allRows : pendingRows;
  const counts = useMemo(
    () => ({ all: allRows.length, pending: pendingRows.length }),
    [allRows, pendingRows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(r => {
      if (!q) return true;
      return (
        (r.customerName ?? '').toLowerCase().includes(q) || r.jobTitle.toLowerCase().includes(q)
      );
    });
  }, [rows, query]);

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
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
            icon={rows.length === 0 ? Briefcase : Users}
            title={
              rows.length === 0
                ? tab === 'pending'
                  ? 'No pending leads'
                  : 'No leads yet'
                : 'No leads match your filters'
            }
            description={
              rows.length === 0
                ? tab === 'pending'
                  ? "Purchase a lead from the Job Market — it'll appear here until the homeowner accepts you."
                  : 'Get accepted for a job from the Job Market — your customers will appear here.'
                : 'Try a different search term.'
            }
            action={
              rows.length === 0 ? (
                <Button variant="outline" size="sm" onClick={() => navigate('/trades-crm/job-market')}>
                  Open Job Market
                </Button>
              ) : undefined
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-25 hover:bg-gray-25">
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
              {filtered.map((row, i) => {
                const status = STATUS_META[row.status] ?? STATUS_META.todo;
                return (
                  <TableRow key={row.id} className="hover:bg-gray-50">
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar
                          name={row.customerName ?? '?'}
                          size="md"
                          tone={i % 2 === 0 ? 'brand' : 'navy'}
                        />
                        <div className="min-w-0">
                          <div className="truncate text-[13px] font-semibold text-foreground">
                            {row.customerName ?? '—'}
                          </div>
                          <div className="truncate font-mono text-xs tabular-nums text-muted-foreground">
                            {row.phone ?? '—'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex min-w-0 flex-col gap-1">
                        <span className="truncate text-[13px] font-medium text-foreground">
                          {row.jobTitle}
                        </span>
                        <span className="flex items-center gap-1.5">
                          {row.priority && PRIORITY_TONE[row.priority] && (
                            <Badge tone={PRIORITY_TONE[row.priority]} size="sm" className="capitalize">
                              {row.priority}
                            </Badge>
                          )}
                          {row.trade && (
                            <span className="text-xs text-muted-foreground">{getTradeLabel(row.trade)}</span>
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {row.location ? (
                        <span className="inline-flex items-center gap-1 text-[13px] text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {row.location}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge tone={status.tone} size="sm" dot>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden text-right sm:table-cell">
                      {row.amount != null ? (
                        <span
                          className={cn(
                            'font-mono text-[13px] font-semibold tabular-nums',
                            row.status === 'completed' ? 'text-green-600' : 'text-foreground'
                          )}
                        >
                          £{row.amount.toLocaleString('en-GB')}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="pr-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Row actions">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem disabled={!row.phone} asChild={!!row.phone}>
                            {row.phone ? (
                              <a href={`tel:${row.phone}`}>
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
                          <DropdownMenuItem disabled={!row.email} asChild={!!row.email}>
                            {row.email ? (
                              <a href={`mailto:${row.email}`}>
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
    </div>
  );
}
