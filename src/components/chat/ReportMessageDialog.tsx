import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { REPORT_REASONS, type ReportReason } from '@/lib/messaging';

interface ReportMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: { reason: ReportReason; details?: string }) => void;
  isSubmitting?: boolean;
}

const ReportMessageDialog = ({ open, onOpenChange, onSubmit, isSubmitting }: ReportMessageDialogProps) => {
  const [reason, setReason] = useState<ReportReason>('spam');
  const [details, setDetails] = useState('');

  const isOther = reason === 'other';
  const detailsMissing = isOther && !details.trim();

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setReason('spam');
      setDetails('');
    }
    onOpenChange(next);
  };

  const handleSubmit = () => {
    if (detailsMissing) return;
    onSubmit({ reason, details: details.trim() || undefined });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Report message</DialogTitle>
          <DialogDescription>
            Let us know what&apos;s wrong with this message. Reports are reviewed by our team.
          </DialogDescription>
        </DialogHeader>

        <RadioGroup value={reason} onValueChange={v => setReason(v as ReportReason)} className="gap-2">
          {REPORT_REASONS.map(r => (
            <label
              key={r.value}
              htmlFor={`report-reason-${r.value}`}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-gray-100 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <RadioGroupItem value={r.value} id={`report-reason-${r.value}`} />
              {r.label}
            </label>
          ))}
        </RadioGroup>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Details {isOther ? '(required)' : '(optional)'}
          </label>
          <Textarea
            value={details}
            onChange={e => setDetails(e.target.value)}
            placeholder={isOther ? 'Tell us what happened…' : 'Add any extra context (optional)…'}
            rows={3}
            className="min-h-[80px]"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={detailsMissing || isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportMessageDialog;
