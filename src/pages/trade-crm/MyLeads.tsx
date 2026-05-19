'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchMyJobs } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Briefcase, CalendarDays, PoundSterling } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  todo: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
};

const STATUS_LABELS: Record<string, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const PRIORITY_STYLES: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
};

const URGENCY_LABELS: Record<string, string> = {
  emergency: 'Emergency',
  urgent: 'Urgent',
  normal: 'Normal',
  flexible: 'Flexible',
};

export default function MyLeads() {
  const { data: jobs = [], isLoading, isError } = useQuery({
    queryKey: ['myJobs'],
    queryFn: fetchMyJobs,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold">My Jobs</h2>
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold">My Jobs</h2>
        <p className="text-sm text-muted-foreground">Failed to load jobs. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">My Jobs</h2>
        <Badge className="bg-black text-white">{jobs.length}</Badge>
      </div>

      {jobs.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground text-sm">
          No accepted jobs yet. Accept a bid from the Job Market to see jobs here.
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job: any) => (
            <Card key={job.id} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-base leading-snug">{job.title}</h3>
                      <Badge className={STATUS_STYLES[job.status] ?? 'bg-gray-100 text-gray-700'}>
                        {STATUS_LABELS[job.status] ?? job.status}
                      </Badge>
                      {job.priority && (
                        <Badge className={PRIORITY_STYLES[job.priority?.toLowerCase()] ?? 'bg-gray-100 text-gray-700 capitalize'}>
                          {job.priority}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {job.location}
                        </span>
                      )}
                      {job.trade && (
                        <span className="flex items-center gap-1 capitalize">
                          <Briefcase className="h-3.5 w-3.5 shrink-0" />
                          {job.trade}{job.category ? ` · ${job.category}` : ''}
                        </span>
                      )}
                      {job.urgency && (
                        <span className="flex items-center gap-1">
                          {URGENCY_LABELS[job.urgency] ?? job.urgency}
                        </span>
                      )}
                      {job.created_at && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                          {new Date(job.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:shrink-0">
                    {job.accepted_bid_amount && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Your bid</p>
                        <p className="text-lg font-bold text-primary flex items-center gap-0.5">
                          <PoundSterling className="h-4 w-4" />
                          {Number(job.accepted_bid_amount).toLocaleString('en-GB', { minimumFractionDigits: 0 })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
