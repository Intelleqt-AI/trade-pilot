import { useState } from 'react';
import { Clock3, Copy, Flag, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import type { DeleteScope } from '@/lib/messaging';

export interface ChatMessage {
  id: string;
  sender: string;
  sender_name: string;
  body: string;
  created_at: string;
  read_at: string | null;
  is_mine: boolean;
  is_edited: boolean;
  edited_at: string | null;
  is_deleted: boolean;
  is_reported_by_me: boolean;
  can_edit?: boolean;
  can_delete_for_everyone?: boolean;
}

interface MessageBubbleProps {
  message: ChatMessage;
  onEdit: (message: ChatMessage) => void;
  onDelete: (messageId: string, scope: DeleteScope) => void;
  onReport: (message: ChatMessage) => void;
  onViewHistory: (message: ChatMessage) => void;
}

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });

const MessageBubble = ({ message: m, onEdit, onDelete, onReport, onViewHistory }: MessageBubbleProps) => {
  const isMobile = useIsMobile();
  const [confirmScope, setConfirmScope] = useState<DeleteScope | null>(null);

  const handleCopy = () => {
    if (!m.body) return;
    navigator.clipboard.writeText(m.body).then(
      () => toast.success('Message copied.'),
      () => toast.error('Could not copy message.'),
    );
  };

  if (m.is_deleted) {
    return (
      <div className={cn('flex', m.is_mine ? 'justify-end' : 'justify-start')}>
        <div className="max-w-[80%] rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-3.5 py-2 text-sm italic text-muted-foreground">
          <p>This message was deleted</p>
          <p className="mt-1 text-[10px] text-gray-400">{fmtTime(m.created_at)}</p>
        </div>
      </div>
    );
  }

  // Same conditional item list rendered into both the desktop right-click
  // ContextMenu and the touch-friendly MoreVertical DropdownMenu fallback —
  // `Item`/`Sep` are swapped per menu type so the two stay in lockstep.
  const renderItems = (Item: React.ElementType, Sep: React.ElementType) => (
    <>
      <Item onClick={handleCopy}>
        <Copy className="mr-2 h-4 w-4" />
        Copy
      </Item>
      {m.is_edited && (
        <Item onClick={() => onViewHistory(m)}>
          <Clock3 className="mr-2 h-4 w-4" />
          View edit history
        </Item>
      )}
      {m.is_mine && (
        <Item onClick={() => onEdit(m)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Item>
      )}
      <Sep />
      <Item onClick={() => setConfirmScope('me')}>
        <Trash2 className="mr-2 h-4 w-4" />
        Delete for me
      </Item>
      {m.is_mine && (
        <Item className="text-destructive focus:text-destructive" onClick={() => setConfirmScope('everyone')}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete for everyone
        </Item>
      )}
      {!m.is_mine && (
        <>
          <Sep />
          <Item disabled={m.is_reported_by_me} onClick={() => onReport(m)}>
            <Flag className="mr-2 h-4 w-4" />
            {m.is_reported_by_me ? 'Reported' : 'Report'}
          </Item>
        </>
      )}
    </>
  );

  return (
    <>
      <div className={cn('group flex', m.is_mine ? 'justify-end' : 'justify-start')}>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div
              className={cn(
                'relative max-w-[80%] rounded-2xl px-3.5 py-2 text-sm',
                m.is_mine ? 'bg-primary text-primary-foreground' : 'border border-gray-200 bg-white text-gray-800',
              )}
            >
              <p className="whitespace-pre-wrap break-words">{m.body}</p>
              <div
                className={cn(
                  'mt-1 flex items-center gap-1.5 text-[10px]',
                  m.is_mine ? 'text-teal-100' : 'text-gray-400',
                )}
              >
                <span>{fmtTime(m.created_at)}</span>
                {m.is_edited && (
                  <button
                    type="button"
                    onClick={() => onViewHistory(m)}
                    className="underline decoration-dotted underline-offset-2 hover:opacity-80"
                  >
                    edited
                  </button>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Message actions"
                    className={cn(
                      'absolute -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-opacity hover:text-gray-700',
                      m.is_mine ? '-left-2' : '-right-2',
                      isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                    )}
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={m.is_mine ? 'end' : 'start'} className="w-48">
                  {renderItems(DropdownMenuItem, DropdownMenuSeparator)}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-48">
            {renderItems(ContextMenuItem, ContextMenuSeparator)}
          </ContextMenuContent>
        </ContextMenu>
      </div>

      <AlertDialog open={confirmScope !== null} onOpenChange={open => !open && setConfirmScope(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmScope === 'everyone' ? 'Delete for everyone?' : 'Delete for me?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmScope === 'everyone'
                ? 'This message will be removed for both of you. This cannot be undone.'
                : 'This message will be hidden from your view only — the other person will still see it.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmScope(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={confirmScope === 'everyone' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : undefined}
              onClick={() => {
                if (confirmScope) onDelete(m.id, confirmScope);
                setConfirmScope(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MessageBubble;
