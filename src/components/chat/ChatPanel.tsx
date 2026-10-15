import { useEffect, useRef, useState, type ChangeEvent } from 'react';
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
import { Ban, Check, FileText, Info, Loader2, Mail, MapPin, Paperclip, Phone, Send, Unlock, X } from 'lucide-react';
import useFetch from '@/hooks/useFetch';
import { postData } from '@/lib/api';
import { toast } from '@/lib/toast';
import JobDetailsDialog, { type JobDetail } from '@/components/chat/JobDetailsDialog';
import MessageBubble, { type ChatMessage } from '@/components/chat/MessageBubble';
import ReportMessageDialog from '@/components/chat/ReportMessageDialog';
import EditHistoryDialog from '@/components/chat/EditHistoryDialog';
import {
  BASE,
  blockConversation,
  deleteMessage,
  editMessage,
  getConversationsUrl,
  getMessagesUrl,
  getUnreadUrl,
  presignAttachment,
  reportMessage,
  unblockConversation,
  type AttachmentType,
  type DeleteScope,
  type ReportReason,
} from '@/lib/messaging';
import { uploadAttachment, validateAttachmentClientSide } from '@/lib/attachmentUpload';

// Shared chat panel. Defaults to the trader messaging mount; the homeowner
// dashboard passes its own base. Both mounts expose identical routes.
const ATTACHMENT_ACCEPT = 'image/*,video/*,application/pdf,.doc,.docx';

type PendingAttachment = {
  file: File;
  s3_key: string;
  attachment_type: AttachmentType;
};

interface OtherParty {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  address?: string;
  postcode?: string;
  business_name?: string;
  /** Trader view only: every household contact for the job, primary first. */
  contacts?: HouseholdContact[];
}

interface HouseholdContact {
  id?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string | null;
  relation?: 'owner' | 'family';
}

const senderKey = (m: ChatMessage) => m.sender ?? m.sender_name;

const householdContactName =(c: HouseholdContact) =>
  (c.name || `${c.first_name ?? ''} ${c.last_name ?? ''}`).trim() || 'Contact';

interface ConversationDetail {
  id: string;
  other_party: OtherParty;
  job_title?: string;
  job_detail?: JobDetail;
  is_blocked: boolean;
  blocked_by_me: boolean;
  blocked_by_name: string;
  can_send: boolean;
  viewer_side?: 'homeowner' | 'trader';
}

interface ChatPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string | null;
  title?: string;
  subtitle?: string;
  /** Messaging mount to talk to. Defaults to the trader one. */
  basePath?: string;
}

const ChatPanel = ({
  open, onOpenChange, conversationId, title, subtitle, basePath = BASE,
}: ChatPanelProps) => {
  const CONVERSATIONS_URL = getConversationsUrl(basePath);
  const UNREAD_URL = getUnreadUrl(basePath);
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [reportingMessage, setReportingMessage] = useState<ChatMessage | null>(null);
  const [historyMessage, setHistoryMessage] = useState<ChatMessage | null>(null);
  const [pendingAttachment, setPendingAttachment] = useState<PendingAttachment | null>(null);
  const [attachmentProgress, setAttachmentProgress] = useState<number | null>(null);
  const [isAttaching, setIsAttaching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const messagesUrl = open && conversationId ? getMessagesUrl(conversationId, basePath) : null;

  const { data, isLoading } = useFetch<any>(messagesUrl, { refetchInterval: 8000 });
  const messages: ChatMessage[] = data?.data?.messages ?? [];
  const conversation: ConversationDetail | undefined = data?.data?.conversation;
  const other = conversation?.other_party;
  // Show the counterparty's contact whichever direction we're looking. For a
  // trader that is the homeowner (unchanged); for a homeowner it is the trader,
  // whose details they can already see on the bid once the lead is purchased.
  const contact = other?.email || other?.phone || other?.address || other?.postcode ? other : null;
  // A household can have several contacts (owner + family members); list them all.
  const householdContacts = (other?.contacts?.length ?? 0) > 1 ? other!.contacts! : null;
  // Label household senders once more than one person can write on that side.
  const otherHouseholdSenders = new Set(
    messages.filter(m => m.sender_side === 'homeowner' && !m.is_mine).map(senderKey),
  );
  const multipleHouseholdSenders =
    !!householdContacts ||
    otherHouseholdSenders.size > 1 ||
    // Viewer is in the household and someone else in it has written too.
    (otherHouseholdSenders.size > 0 &&
      (conversation?.viewer_side === 'homeowner' || messages.some(m => m.sender_side === 'homeowner' && m.is_mine)));
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
    setPendingAttachment(null);
    setAttachmentProgress(null);
    setIsAttaching(false);
  }, [conversationId]);

  const invalidateThread = () => {
    if (messagesUrl) queryClient.invalidateQueries({ queryKey: [messagesUrl] });
  };

  const sendMutation = useMutation({
    mutationFn: ({ body, attachment }: { body: string; attachment: PendingAttachment | null }) =>
      postData({
        url: getMessagesUrl(conversationId as string, basePath),
        data: {
          body,
          ...(attachment && {
            attachment_s3_key: attachment.s3_key,
            attachment_file_name: attachment.file.name,
            attachment_file_size: attachment.file.size,
            attachment_content_type: attachment.file.type,
            attachment_type: attachment.attachment_type,
          }),
        },
      }),
    onSuccess: () => {
      setDraft('');
      setPendingAttachment(null);
      invalidateThread();
      queryClient.invalidateQueries({ queryKey: [UNREAD_URL] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to send message.');
    },
  });

  const handleAttachClick = () => fileInputRef.current?.click();

  const handleFileSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !conversationId) return;
    const clientError = validateAttachmentClientSide(file);
    if (clientError) {
      toast.error(clientError);
      return;
    }
    setIsAttaching(true);
    setAttachmentProgress(0);
    try {
      const presigned = await presignAttachment(conversationId, file, basePath);
      await uploadAttachment(file, presigned, setAttachmentProgress);
      setPendingAttachment({ file, s3_key: presigned.s3_key, attachment_type: presigned.attachment_type });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to attach file.');
    } finally {
      setIsAttaching(false);
      setAttachmentProgress(null);
    }
  };

  const handleRemoveAttachment = () => setPendingAttachment(null);

  const editMutation = useMutation({
    mutationFn: ({ messageId, body }: { messageId: string; body: string }) =>
      editMessage(conversationId as string, messageId, body, basePath),
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
      deleteMessage(conversationId as string, messageId, scope, basePath),
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
      reportMessage(conversationId as string, (reportingMessage as ChatMessage).id, payload, basePath),
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
    mutationFn: () => blockConversation(conversationId as string, basePath),
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
    mutationFn: () => unblockConversation(conversationId as string, basePath),
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
    if (!conversationId) return;
    if (editingMessageId) {
      if (!body) return;
      editMutation.mutate({ messageId: editingMessageId, body });
    } else {
      if (!body && !pendingAttachment) return;
      sendMutation.mutate({ body, attachment: pendingAttachment });
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

          {householdContacts ? (
            <div className="mt-3 space-y-1.5 rounded-lg border border-border bg-muted px-3 py-2.5 text-xs text-muted-foreground">
              {householdContacts.map((c, i) => (
                <div key={c.id ?? i} className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="min-w-0 truncate font-medium text-foreground">{householdContactName(c)}</span>
                  {c.relation === 'family' && (
                    <span className="shrink-0 text-[10px] uppercase tracking-wide">Family</span>
                  )}
                  {(c.phone || c.email) && <span aria-hidden="true">—</span>}
                  {c.phone && (
                    <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 hover:text-teal-700">
                      <Phone className="h-3 w-3 shrink-0" />
                      <span className="font-mono tabular-nums">{c.phone}</span>
                    </a>
                  )}
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="inline-flex min-w-0 items-center gap-1 hover:text-teal-700">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </a>
                  )}
                </div>
              ))}
              {(other?.address || other?.postcode) && (
                <div className="flex items-start gap-2 pt-0.5">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span>{[other?.address, other?.postcode].filter(Boolean).join(', ')}</span>
                </div>
              )}
            </div>
          ) : contact && (
            <div className="mt-3 space-y-1.5 rounded-lg border border-border bg-muted px-3 py-2.5 text-xs text-muted-foreground">
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-2 hover:text-teal-700"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{contact.email}</span>
                </a>
              )}
              {contact.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-2 hover:text-teal-700"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="font-mono tabular-nums">{contact.phone}</span>
                </a>
              )}
              {(contact.address || contact.postcode) && (
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span>{[contact.address, contact.postcode].filter(Boolean).join(', ')}</span>
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
            messages.map((m, i) => (
              <MessageBubble
                key={m.id}
                message={m}
                showSenderName={
                  multipleHouseholdSenders &&
                  (i === 0 ||
                    messages[i - 1].is_mine ||
                    messages[i - 1].sender_side !== m.sender_side ||
                    senderKey(messages[i - 1]) !== senderKey(m))
                }
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
            <input
              ref={fileInputRef}
              type="file"
              accept={ATTACHMENT_ACCEPT}
              className="hidden"
              onChange={handleFileSelected}
            />
            {(isAttaching || pendingAttachment) && !editingMessageId && (
              <div className="mb-2 flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5 shrink-0" />
                <span className="min-w-0 flex-1 truncate">
                  {isAttaching ? 'Uploading…' : pendingAttachment?.file.name}
                  {isAttaching && attachmentProgress != null ? ` ${attachmentProgress}%` : ''}
                </span>
                {isAttaching ? (
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                ) : (
                  <button type="button" onClick={handleRemoveAttachment} className="shrink-0 hover:text-foreground">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
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
              {!editingMessageId && (
                <Button size="icon" variant="outline" onClick={handleAttachClick} disabled={isAttaching} title="Attach a file">
                  <Paperclip className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="icon"
                onClick={handleSend}
                disabled={
                  isComposerBusy ||
                  isAttaching ||
                  (editingMessageId ? !draft.trim() : !draft.trim() && !pendingAttachment)
                }
              >
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
          basePath={basePath}
        />
      </SheetContent>
    </Sheet>
  );
};

export default ChatPanel;
