import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, Bell, BellOff, Briefcase, CheckCheck, FileCheck, Star, Trash2, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { deleteData, fetchData, postData, patchData } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Notification {
  id: string;
  type: 'bid_accepted' | 'bid_rejected' | 'job_status' | 'new_review' | 'document_reviewed' | 'account_verified';
  title: string;
  body: string;
  is_read: boolean;
  job_id: string | null;
  bid_id: string | null;
  created_at: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  unread_count: number;
}

const typeConfig = {
  bid_accepted: { icon: Briefcase, iconCls: 'bg-green-50 text-green-600', dotCls: 'bg-green-500' },
  bid_rejected: { icon: XCircle, iconCls: 'bg-red-50 text-red-600', dotCls: 'bg-red-500' },
  job_status: { icon: Briefcase, iconCls: 'bg-blue-50 text-blue-600', dotCls: 'bg-blue-500' },
  new_review: { icon: Star, iconCls: 'bg-amber-50 text-amber-600', dotCls: 'bg-amber-500' },
  document_reviewed: { icon: FileCheck, iconCls: 'bg-teal-50 text-teal-600', dotCls: 'bg-teal-500' },
  account_verified: { icon: BadgeCheck, iconCls: 'bg-teal-50 text-teal-600', dotCls: 'bg-teal-500' },
};

export const NotificationPanel = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data } = useQuery<NotificationsResponse>({
    queryKey: ['tp-notifications'],
    queryFn: () =>
      fetchData<any>('/api/v1/tradepilot/notifications/').then(r => r?.data ?? r),
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unread_count ?? 0;

  const markRead = useMutation({
    mutationFn: (id: string) =>
      patchData({ url: `/api/v1/tradepilot/notifications/${id}/read/`, data: {} }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tp-notifications'] }),
  });

  const markAllRead = useMutation({
    mutationFn: () => postData({ url: '/api/v1/tradepilot/notifications/read-all/', data: {} }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tp-notifications'] }),
  });

  const deleteNotif = useMutation({
    mutationFn: (id: string) => deleteData({ url: `/api/v1/tradepilot/notifications/${id}/` }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tp-notifications'] }),
  });

  const handleNotifClick = (n: Notification) => {
    if (!n.is_read) markRead.mutate(n.id);
    setOpen(false);
    if (n.type === 'document_reviewed' || n.type === 'account_verified') {
      navigate('/trades-crm/profile');
    } else {
      navigate('/trades-crm/jobs');
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-[18px] w-[18px] text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute right-2 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-orange-500" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-80 overflow-hidden rounded-xl p-0 shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-teal-50 px-1.5 py-0.5 font-mono text-[10px] font-bold tabular-nums text-teal-700">
                {unreadCount > 99 ? '99+' : unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              className="flex items-center gap-1 text-xs font-medium text-teal-600 transition-colors hover:text-teal-700"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-[420px] divide-y divide-gray-100 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
                <BellOff className="h-5 w-5" />
              </span>
              <p className="text-sm font-semibold text-foreground">All caught up</p>
              <p className="mt-1 text-xs text-muted-foreground">No notifications yet.</p>
            </div>
          ) : (
            notifications.map(n => {
              const cfg = typeConfig[n.type] ?? typeConfig.job_status;
              const Icon = cfg.icon;
              return (
                <div
                  key={n.id}
                  onClick={() => handleNotifClick(n)}
                  className={`group relative flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50 ${
                    !n.is_read ? 'bg-teal-50/40' : ''
                  }`}
                >
                  {!n.is_read && (
                    <span className={`absolute left-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full ${cfg.dotCls}`} />
                  )}
                  <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.iconCls}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[13px] leading-snug ${!n.is_read ? 'font-semibold text-foreground' : 'font-medium text-gray-700'}`}>
                      {n.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{n.body}</p>
                    <p className="mt-1 text-[10px] text-gray-400">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); deleteNotif.mutate(n.id); }}
                    className="shrink-0 rounded p-1 opacity-0 transition-opacity hover:bg-red-50 group-hover:opacity-100"
                    aria-label="Delete notification"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-gray-400 transition-colors hover:text-red-500" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {notifications.length > 0 && (
          <div className="border-t border-gray-100 bg-gray-25 px-4 py-2.5">
            <button
              onClick={() => {
                if (window.confirm('Delete all notifications?')) {
                  notifications.forEach(n => deleteNotif.mutate(n.id));
                }
              }}
              className="flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-red-500"
            >
              <Trash2 className="h-3 w-3" />
              Clear all
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationPanel;
