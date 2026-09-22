import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { JOB_REPORT_REASONS, type JobReportReason } from '@/lib/jobModeration';

interface ReportJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: { reason: JobReportReason; details?: string }) => void;
  isSubmitting?: boolean;
}

const ReportJobDialog = ({ open, onOpenChange, onSubmit, isSubmitting }: ReportJobDialogProps) => {
  const [reason, setReason] = useState<JobReportReason>('fake');
  const [details, setDetails] = useState('');

  const isOther = reason === 'other';
  const detailsMissing = isOther && !details.trim();

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setReason('fake');
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
          <DialogTitle>Report post</DialogTitle>
          <DialogDescription>
            Let us know what&apos;s wrong with this job post. Reports are reviewed by our team.
          </DialogDescription>
        </DialogHeader>

        <RadioGroup value={reason} onValueChange={v => setReason(v as JobReportReason)} className="gap-2">
          {JOB_REPORT_REASONS.map(r => (
            <label
              key={r.value}
              htmlFor={`report-job-reason-${r.value}`}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-gray-100 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <RadioGroupItem value={r.value} id={`report-job-reason-${r.value}`} />
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

export default ReportJobDialog;
