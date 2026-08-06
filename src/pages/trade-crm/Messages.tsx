import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { PageTitle } from '@/components/trade-pilot/PageTitle';
import { EmptyState } from '@/components/trade-pilot/EmptyState';
import { UserAvatar } from '@/components/trade-pilot/UserAvatar';
import useFetch from '@/hooks/useFetch';
import ChatPanel from '@/components/chat/ChatPanel';
import { cn } from '@/lib/utils';
import { CONVERSATIONS_URL } from '@/lib/messaging';

interface Conversation {
  id: string;
  job: string;
  job_title: string;
  job_trade: string;
  job_status: string;
  other_party: { id: string; name: string; role: string };
  last_message: { body: string; created_at: string; sender: string } | null;
  last_message_at: string;
  unread_count: number;
}

const fmtWhen = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const Messages = () => {
  const { data, isLoading } = useFetch<any>(CONVERSATIONS_URL, { refetchInterval: 20000 });
  const conversations: Conversation[] = data?.data?.conversations ?? [];

  const [chatOpen, setChatOpen] = useState(false);
  const [active, setActive] = useState<Conversation | null>(null);

  const openChat = (c: Conversation) => {
    setActive(c);
    setChatOpen(true);
  };

  return (
    <div className="space-y-4">
      <PageTitle title="Messages" subtitle="Chat with homeowners whose leads you've purchased." />

      {isLoading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading conversations…</div>
      ) : conversations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No conversations yet"
          description="When you purchase a lead, you can message the homeowner and it'll show up here."
        />
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-xl border bg-card">
          {conversations.map(c => (
            <button
              key={c.id}
              onClick={() => openChat(c)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50"
            >
              <UserAvatar name={c.other_party.name} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-foreground">{c.other_party.name}</p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {c.last_message ? fmtWhen(c.last_message.created_at) : fmtWhen(c.last_message_at)}
                  </span>
                </div>
                <p className="truncate text-xs font-medium text-teal-600">{c.job_title}</p>
                {c.last_message && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{c.last_message.body}</p>
                )}
              </div>
              {c.unread_count > 0 && (
                <span
                  className={cn(
                    'ml-1 inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5',
                    'bg-teal-600 text-[11px] font-semibold text-white',
                  )}
                >
                  {c.unread_count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <ChatPanel
        open={chatOpen}
        onOpenChange={setChatOpen}
        conversationId={active?.id ?? null}
        title={active?.other_party.name}
        subtitle={active?.job_title}
      />
    </div>
  );
};

export default Messages;
