import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Ban, Check, Info, Loader2, Mail, MapPin, Phone, Send, Unlock } from 'lucide-react';
import useFetch from '@/hooks/useFetch';
import { postData } from '@/lib/api';
import { toast } from '@/lib/toast';
import JobDetailsDialog, { type JobDetail } from '@/components/chat/JobDetailsDialog';
import MessageBubble, { type ChatMessage } from '@/components/chat/MessageBubble';
import ReportMessageDialog from '@/components/chat/ReportMessageDialog';
import EditHistoryDialog from '@/components/chat/EditHistoryDialog';
import {
  blockConversation,
  deleteMessage,
  editMessage,
  getMessagesUrl,
  reportMessage,
  unblockConversation,
  type DeleteScope,
  type ReportReason,
} from '@/lib/messaging';

// Trader-side chat panel (TradePilot). Talks to the trader messaging mount.
const BASE = '/api/v1/tradepilot/messaging';
const CONVERSATIONS_URL = `${BASE}/conversations/`;
const UNREAD_URL = `${BASE}/unread-count/`;

interface OtherParty {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  address?: string;
  postcode?: string;
  business_name?: string;
}

interface ConversationDetail {
  id: string;
  other_party: OtherParty;
  job_title?: string;
  job_detail?: JobDetail;
  is_blocked: boolean;
  blocked_by_me: boolean;
  blocked_by_name: string;
  can_send: boolean;
}

interface ChatPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string | null;
  title?: string;
  subtitle?: string;
}

const ChatPanel = ({ open, onOpenChange, conversationId, title, subtitle }: ChatPanelProps) => {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [reportingMessage, setReportingMessage] = useState<ChatMessage | null>(null);
  const [historyMessage, setHistoryMessage] = useState<ChatMessage | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const messagesUrl = open && conversationId ? getMessagesUrl(conversationId) : null;

  const { data, isLoading } = useFetch<any>(messagesUrl, { refetchInterval: 8000 });
  const messages: ChatMessage[] = data?.data?.messages ?? [];
  const conversation: ConversationDetail | undefined = data?.data?.conversation;
  const other = conversation?.other_party;
  const homeowner = other?.role === 'homeowner' ? other : null;
  const jobDetail: JobDetail | undefined = conversation?.job_detail;

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, open]);

  // Opening the thread marks it read on the server, so refresh the unread badge.
  useEffect(() => {
    if (open && conversationId) {
      queryClient.invalidateQueries({ queryKey: [UNREAD_URL] });
    }
  }, [open, conversationId, data, queryClient]);

  // Reset conversation-scoped local UI state whenever the thread changes.
  useEffect(() => {
    setEditingMessageId(null);
    setDraft('');
    setReportingMessage(null);
    setHistoryMessage(null);
  }, [conversationId]);

  const invalidateThread = () => {
    if (messagesUrl) queryClient.invalidateQueries({ queryKey: [messagesUrl] });
  };

  const sendMutation = useMutation({
    mutationFn: (body: string) => postData({ url: getMessagesUrl(conversationId as string), data: { body } }),
    onSuccess: () => {
      setDraft('');
      invalidateThread();
      queryClient.invalidateQueries({ queryKey: [UNREAD_URL] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to send message.');
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ messageId, body }: { messageId: string; body: string }) =>
      editMessage(conversationId as string, messageId, body),
    onSuccess: () => {
      setDraft('');
      setEditingMessageId(null);
      invalidateThread();
      queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_URL] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update message.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ messageId, scope }: { messageId: string; scope: DeleteScope }) =>
      deleteMessage(conversationId as string, messageId, scope),
    onSuccess: () => {
      invalidateThread();
      queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_URL] });
      queryClient.invalidateQueries({ queryKey: [UNREAD_URL] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete message.');
    },
  });

  const reportMutation = useMutation({
    mutationFn: (payload: { reason: ReportReason; details?: string }) =>
      reportMessage(conversationId as string, (reportingMessage as ChatMessage).id, payload),
    onSuccess: () => {
      toast.success('Message reported.');
      setReportingMessage(null);
      invalidateThread();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to report message.');
    },
  });

  const blockMutation = useMutation({
    mutationFn: () => blockConversation(conversationId as string),
    onSuccess: () => {
      setBlockConfirmOpen(false);
      invalidateThread();
      queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_URL] });
      toast.success('Conversation blocked.');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to block conversation.');
    },
  });

  const unblockMutation = useMutation({
    mutationFn: () => unblockConversation(conversationId as string),
    onSuccess: () => {
      invalidateThread();
      queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_URL] });
      toast.success('Conversation unblocked.');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to unblock conversation.');
    },
  });

  const handleSend = () => {
    const body = draft.trim();
    if (!body || !conversationId) return;
    if (editingMessageId) {
      editMutation.mutate({ messageId: editingMessageId, body });
    } else {
      sendMutation.mutate(body);
    }
  };

  const handleEditRequest = (message: ChatMessage) => {
    setEditingMessageId(message.id);
    setDraft(message.body);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setDraft('');
  };

  const handleDelete = (messageId: string, scope: DeleteScope) => {
    deleteMutation.mutate({ messageId, scope });
  };

  const isComposerBusy = sendMutation.isPending || editMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <SheetTitle className="text-base font-semibold text-foreground">
                {other?.name || title || 'Messages'}
              </SheetTitle>
              {(conversation?.job_title || subtitle) && (
                <p className="mt-0.5 truncate text-xs font-medium text-teal-600">
                  {conversation?.job_title || subtitle}
                </p>
              )}
            </div>
            <div className="mr-6 flex shrink-0 items-center gap-0.5">
              {conversation && !conversation.is_blocked && (
                <button
                  type="button"
                  onClick={() => setBlockConfirmOpen(true)}
                  title="Block conversation"
                  aria-label="Block conversation"
                  className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-red-50 dark:hover:bg-red-500/15 hover:text-destructive"
                >
                  <Ban className="h-4 w-4" />
                </button>
              )}
              {conversation?.is_blocked && conversation.blocked_by_me && (
                <button
                  type="button"
                  onClick={() => unblockMutation.mutate()}
                  disabled={unblockMutation.isPending}
                  title="Unblock conversation"
                  aria-label="Unblock conversation"
                  className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-teal-700 disabled:opacity-50"
                >
                  {unblockMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Unlock className="h-4 w-4" />
                  )}
                </button>
              )}
              {jobDetail && (
                <button
                  type="button"
                  onClick={() => setDetailsOpen(true)}
                  title="View job details"
                  aria-label="View job details"
                  className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-teal-700"
                >
                  <Info className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {homeowner && (
            <div className="mt-3 space-y-1.5 rounded-lg border border-border bg-muted px-3 py-2.5 text-xs text-muted-foreground">
              {homeowner.email && (
                <a
                  href={`mailto:${homeowner.email}`}
                  className="flex items-center gap-2 hover:text-teal-700"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{homeowner.email}</span>
                </a>
              )}
              {homeowner.phone && (
                <a
                  href={`tel:${homeowner.phone}`}
                  className="flex items-center gap-2 hover:text-teal-700"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="font-mono tabular-nums">{homeowner.phone}</span>
                </a>
              )}
              {(homeowner.address || homeowner.postcode) && (
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span>{[homeowner.address, homeowner.postcode].filter(Boolean).join(', ')}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto bg-muted/40 px-4 py-4">
          {isLoading ? (
            <div className="flex justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No messages yet — start the conversation.
            </p>
          ) : (
            messages.map(m => (
              <MessageBubble
                key={m.id}
                message={m}
                onEdit={handleEditRequest}
                onDelete={handleDelete}
                onReport={setReportingMessage}
                onViewHistory={setHistoryMessage}
              />
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {conversation && !conversation.can_send ? (
          <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3.5">
            <p className="text-sm text-muted-foreground">
              {conversation.blocked_by_me
                ? `You blocked ${other?.name || 'this user'}.`
                : "You can't reply to this conversation."}
            </p>
            {conversation.blocked_by_me && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => unblockMutation.mutate()}
                disabled={unblockMutation.isPending}
              >
                {unblockMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Unblock
              </Button>
            )}
          </div>
        ) : (
          <div className="border-t border-border px-4 py-3">
            {editingMessageId && (
              <div className="mb-2 flex items-center justify-between rounded-md bg-teal-50 px-2.5 py-1.5 text-xs text-teal-700 dark:bg-teal-500/15 dark:text-teal-300">
                <span className="font-medium">Editing message</span>
                <button type="button" onClick={handleCancelEdit} className="text-teal-600 hover:text-teal-800">
                  Cancel
                </button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <Textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder={editingMessageId ? 'Edit message…' : 'Type a message…'}
                rows={1}
                className="max-h-32 min-h-[40px] resize-none"
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                  if (e.key === 'Escape' && editingMessageId) {
                    handleCancelEdit();
                  }
                }}
              />
              <Button size="icon" onClick={handleSend} disabled={!draft.trim() || isComposerBusy}>
                {isComposerBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingMessageId ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        <JobDetailsDialog job={jobDetail} open={detailsOpen} onOpenChange={setDetailsOpen} />

        <AlertDialog open={blockConfirmOpen} onOpenChange={setBlockConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Block {other?.name || 'this user'}?</AlertDialogTitle>
              <AlertDialogDescription>
                They won&apos;t be able to send you messages until you unblock them.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={blockMutation.isPending}
                onClick={() => blockMutation.mutate()}
              >
                {blockMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Block
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <ReportMessageDialog
          open={!!reportingMessage}
          onOpenChange={o => !o && setReportingMessage(null)}
          onSubmit={payload => reportMutation.mutate(payload)}
          isSubmitting={reportMutation.isPending}
        />

        <EditHistoryDialog
          open={!!historyMessage}
          onOpenChange={o => !o && setHistoryMessage(null)}
          conversationId={conversationId}
          messageId={historyMessage?.id ?? null}
        />
      </SheetContent>
    </Sheet>
  );
};

export default ChatPanel;
