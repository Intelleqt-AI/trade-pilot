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

const STATUS_META: Record<string, { label: string; tone: 'neutral' | 'info' | 'success' }> = {
  todo: { label: 'To Do', tone: 'neutral' },
  in_progress: { label: 'In Progress', tone: 'info' },
  completed: { label: 'Completed', tone: 'success' },
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');

  const { data: jobs = [], isLoading: jobsLoading, isError } = useQuery({
    queryKey: ['myJobs'],
    queryFn: fetchMyJobs,
  });
  const { data: myBids = [] } = useQuery({ queryKey: ['MyBids'], queryFn: fetchMyBids });

  const rows: LeadRow[] = useMemo(() => {
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

  const counts = useMemo(
    () => ({
      all: rows.length,
      todo: rows.filter(r => r.status === 'todo').length,
      in_progress: rows.filter(r => r.status === 'in_progress').length,
      completed: rows.filter(r => r.status === 'completed').length,
    }),
    [rows]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(r => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        (r.customerName ?? '').toLowerCase().includes(q) || r.jobTitle.toLowerCase().includes(q)
      );
    });
  }, [rows, statusFilter, query]);

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
        subtitle="Customers from your accepted jobs — contact details unlock when a bid is accepted."
      >
        <Button variant="outline" onClick={handleExport} disabled={filtered.length === 0}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </PageTitle>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl
          value={statusFilter}
          onChange={setStatusFilter}
          items={[
            { value: 'all', label: 'All', count: counts.all },
            { value: 'todo', label: 'To Do', count: counts.todo },
            { value: 'in_progress', label: 'In Progress', count: counts.in_progress },
            { value: 'completed', label: 'Completed', count: counts.completed },
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
            title={rows.length === 0 ? 'No leads yet' : 'No leads match your filters'}
            description={
              rows.length === 0
                ? 'Accept a bid from the Job Market — your customers will appear here.'
                : 'Try a different status or search term.'
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
                            <span className="text-xs capitalize text-muted-foreground">{row.trade}</span>
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
                          <DropdownMenuItem onClick={() => navigate('/trades-crm/jobs')}>
                            <Briefcase className="mr-2 h-4 w-4" />
                            View in pipeline
                          </DropdownMenuItem>
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
