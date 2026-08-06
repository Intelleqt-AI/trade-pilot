import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { fetchMessageHistory, type MessageHistoryEntry } from '@/lib/messaging';

interface EditHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string | null;
  messageId: string | null;
}

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString([], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const EditHistoryDialog = ({ open, onOpenChange, conversationId, messageId }: EditHistoryDialogProps) => {
  const enabled = open && !!conversationId && !!messageId;

  const { data, isLoading } = useQuery<any>({
    queryKey: ['message-history', conversationId, messageId],
    queryFn: () => fetchMessageHistory(conversationId as string, messageId as string),
    enabled,
  });

  const entries: MessageHistoryEntry[] = data?.data?.entries ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[70vh] overflow-y-auto sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Edit history</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No earlier versions found.</p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, i) => (
              <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
                <p className="whitespace-pre-wrap break-words text-sm text-gray-700">{entry.previous_body}</p>
                <p className="mt-1.5 text-[11px] text-muted-foreground">{fmtDateTime(entry.edited_at)}</p>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditHistoryDialog;
