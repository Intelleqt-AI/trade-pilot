import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { MessageSquare, Loader2 } from 'lucide-react';
import { UserAvatar } from '@/components/trade-pilot/UserAvatar';
import { EmptyState } from '@/components/trade-pilot/EmptyState';
import ChatPanel from '@/components/chat/ChatPanel';
import { fetchData } from '@/lib/api';
import { HOMEOWNER_BASE, getConversationsUrl } from '@/lib/messaging';

// Same URL the socket and ChatPanel invalidate against — useFetch keys on the
// URL string, so sharing it is what makes real-time updates land here.
const CONVERSATIONS_URL = getConversationsUrl(HOMEOWNER_BASE);

interface Conversation {
  id: string;
  job_title: string;
  other_party: { id: string; name: string; role: string; profile_photo_url?: string | null };
  last_message: { body: string; created_at: string; sender: string } | null;
  last_message_at: string;
  unread_count: number;
}

const fmtWhen = (iso: string) => {
  const d = new Date(iso);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const Messages = () => {
  const [active, setActive] = useState<Conversation | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const location = useLocation();

  const { data, isLoading } = useQuery({
    queryKey: [CONVERSATIONS_URL],
    queryFn: () => fetchData<any>(CONVERSATIONS_URL),
    refetchInterval: 20_000,
  });

  const conversations: Conversation[] =
    data?.data?.conversations ?? data?.conversations ?? [];

  // Auto-open a specific conversation when navigated here with state
  useEffect(() => {
    const targetId = (location.state as any)?.conversationId;
    if (!targetId || !conversations.length) return;
    const match = conversations.find(c => c.id === targetId);
    if (match) {
      setActive(match);
      setChatOpen(true);
    }
  }, [conversations, location.state]);

  const openChat = (c: Conversation) => {
    setActive(c);
    setChatOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Chat with traders who have quoted on your jobs.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="rounded-xl border bg-card">
          <EmptyState
            icon={MessageSquare}
            title="No conversations yet"
            description="When a trader buys one of your leads, you'll be able to message them here."
          />
        </div>
      ) : (
        <div className="divide-y overflow-hidden rounded-xl border bg-card">
          {conversations.map(c => (
            <button
              key={c.id}
              onClick={() => openChat(c)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50"
            >
              <UserAvatar
                name={c.other_party?.name}
                src={c.other_party?.profile_photo_url}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {c.other_party?.name ?? 'Trader'}
                  </p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {c.last_message ? fmtWhen(c.last_message.created_at) : fmtWhen(c.last_message_at)}
                  </span>
                </div>
                <p className="truncate text-xs text-muted-foreground">{c.job_title}</p>
                {c.last_message && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground/80">
                    {c.last_message.body}
                  </p>
                )}
              </div>
              {c.unread_count > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-white">
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
        title={active?.other_party?.name}
        subtitle={active?.job_title}
        basePath={HOMEOWNER_BASE}
      />
    </div>
  );
};

export default Messages;
