import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell, BellOff, Mail, CheckCircle, Wrench, Star, Trash2, CheckCheck,
  SlidersHorizontal, AlertTriangle, Unlock, Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import {
  fetchNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification,
} from '@/lib/api/tpHomeowner';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  job_id: string | null;
  created_at: string;
}

type TypeEntry = {
  Icon: React.ElementType;
  iconCls: string;
  badgeCls: string;
  label: string;
  cta?: string;
};

const TYPE_CONFIG: Record<string, TypeEntry> = {
  new_quote:      { Icon: Mail,        iconCls: 'text-blue-600 bg-blue-50 dark:bg-blue-500/15 dark:text-blue-300',       badgeCls: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',       label: 'New quote',    cta: 'View quotes' },
  lead_purchased: { Icon: Unlock,      iconCls: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/15 dark:text-indigo-300', badgeCls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300', label: 'Lead unlocked', cta: 'View quotes' },
  job_completed:  { Icon: CheckCircle, iconCls: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/15 dark:text-emerald-300', badgeCls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300', label: 'Job complete', cta: 'Rate tradesperson' },
  job_status:     { Icon: Wrench,      iconCls: 'text-muted-foreground bg-muted',                                       badgeCls: 'bg-muted text-muted-foreground',                                         label: 'Update',       cta: 'View job' },
  bid_accepted:   { Icon: CheckCircle, iconCls: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/15 dark:text-emerald-300', badgeCls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300', label: 'Accepted',     cta: 'View job' },
  bid_rejected:   { Icon: Bell,        iconCls: 'text-muted-foreground bg-muted',                                       badgeCls: 'bg-muted text-muted-foreground',                                         label: 'Update',       cta: 'View job' },
  new_review:     { Icon: Star,        iconCls: 'text-amber-600 bg-amber-50 dark:bg-amber-500/15 dark:text-amber-300',   badgeCls: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',   label: 'Review' },
};

const FALLBACK: TypeEntry = {
  Icon: Bell,
  iconCls: 'text-muted-foreground bg-muted',
  badgeCls: 'bg-muted text-muted-foreground',
  label: 'Update',
};

const cfgFor = (n: Notification): TypeEntry => TYPE_CONFIG[n.type] ?? FALLBACK;
const targetFor = (n: Notification): string | null =>
  cfgFor(n).cta && n.job_id ? '/homeowner/improvements' : null;

const Notifications = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['ho-notifications'],
    queryFn: fetchNotifications,
  });

  const notifications: Notification[] = (data as any)?.notifications ?? (Array.isArray(data) ? data : []);
  const total = notifications.length;
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const visible = filter === 'unread' ? notifications.filter(n => !n.is_read) : notifications;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['ho-notifications'] });
    queryClient.invalidateQueries({ queryKey: ['ho-notifications-unread'] });
  };

  const markRead = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: invalidate,
    onError: () => toast.error('Could not mark as read'),
  });

  const markAllRead = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => { invalidate(); toast.success('All caught up'); },
    onError: () => toast.error('Could not mark all as read'),
  });

  const removeNotif = useMutation({
    mutationFn: deleteNotification,
    onSuccess: invalidate,
    onError: () => toast.error('Could not remove notification'),
  });

  const openNotif = (n: Notification) => {
    if (!n.is_read) markRead.mutate(n.id);
    const target = targetFor(n);
    if (target) navigate(target);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Updates about your jobs, quotes and messages.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" size="sm" asChild>
            <Link to="/homeowner/settings?tab=notifications">
              <SlidersHorizontal className="mr-1.5 h-4 w-4" />
              Preferences
            </Link>
          </Button>
          {unreadCount > 0 && (
            <Button size="sm" onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
              <CheckCheck className="mr-1.5 h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      <div className="flex w-fit gap-1 rounded-full bg-muted p-1">
        {([['all', `All ${total}`], ['unread', `Unread ${unreadCount}`]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all',
              filter === key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <AlertTriangle className="h-6 w-6" />
            </span>
            <p className="text-sm font-semibold text-foreground">Couldn't load notifications</p>
            <Button size="sm" className="mt-4" onClick={() => refetch()}>Try again</Button>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <BellOff className="h-6 w-6" />
            </span>
            <p className="text-sm font-semibold text-foreground">
              {filter === 'unread' ? 'No unread notifications' : 'All caught up'}
            </p>
            <p className="mt-1 max-w-[340px] text-[13px] text-muted-foreground">
              {filter === 'unread'
                ? "You're all read up."
                : 'Updates about quotes and jobs will appear here.'}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {visible.map(n => {
              const cfg = cfgFor(n);
              const { Icon } = cfg;
              const target = targetFor(n);
              return (
                <div
                  key={n.id}
                  onClick={() => openNotif(n)}
                  className={cn(
                    'group relative flex cursor-pointer items-start gap-4 p-5 transition-colors hover:bg-muted/40',
                    !n.is_read && 'bg-primary/[0.04]'
                  )}
                >
                  {!n.is_read && (
                    <span className="absolute left-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-primary" />
                  )}
                  <span className={cn('inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full', cfg.iconCls)}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn('min-w-0 truncate text-sm leading-snug', !n.is_read ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground')}>
                        {n.title}
                      </p>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', cfg.badgeCls)}>
                          {cfg.label}
                        </span>
                        <span className="whitespace-nowrap text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    {n.body && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{n.body}</p>}
                    {target && cfg.cta && (
                      <button
                        onClick={e => { e.stopPropagation(); openNotif(n); }}
                        className="mt-1.5 text-xs font-medium text-primary underline underline-offset-2 hover:no-underline"
                      >
                        {cfg.cta} →
                      </button>
                    )}
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); removeNotif.mutate(n.id); }}
                    className="-mt-0.5 shrink-0 rounded-full p-1.5 opacity-100 transition-opacity hover:bg-muted sm:opacity-0 sm:group-hover:opacity-100"
                    aria-label="Delete notification"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground transition-colors hover:text-destructive" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
