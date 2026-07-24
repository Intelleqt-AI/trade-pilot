import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { getTradeLabel } from '@/lib/jobCategories';
import { answerLabel } from '@/lib/jobQuestions';

interface PropertyDetail {
  name?: string | null;
  property_type?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  year_built?: number | null;
  epc_band?: string | null;
  heating_type?: string | null;
  wall_construction?: string | null;
  tenure?: string | null;
  council_tax_band?: string | null;
  cover_image_url?: string | null;
}

export interface JobDetail {
  title: string;
  description: string;
  trade: string;
  category: string;
  urgency: string;
  priority: string;
  status: string;
  location: string;
  postcode: string;
  preferred_date: string | null;
  answers: Record<string, unknown>;
  property_detail: PropertyDetail | null;
}

interface JobDetailsDialogProps {
  job: JobDetail | null | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex gap-2 text-xs">
    <span className="min-w-[112px] shrink-0 text-muted-foreground">{label}</span>
    <span className="text-foreground">{value}</span>
  </div>
);

const JobDetailsDialog = ({ job, open, onOpenChange }: JobDetailsDialogProps) => {
  if (!job) return null;
  const prop = job.property_detail;
  const answers = Object.entries(job.answers || {}).filter(([k, v]) => v && k !== 'description');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Job details</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-1">
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">{job.title}</h3>
            <div className="flex flex-wrap gap-1.5">
              {job.trade && <Badge tone="neutral" size="sm">{getTradeLabel(job.trade)}</Badge>}
              {job.category && <Badge tone="violet" size="sm">{job.category}</Badge>}
              {job.urgency && <Badge tone="warning" size="sm">{cap(job.urgency)}</Badge>}
              {job.priority && <Badge tone="neutral" size="sm">{cap(job.priority)} priority</Badge>}
            </div>
          </div>

          {job.description && (
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{job.description}</p>
            </div>
          )}

          <div className="space-y-1.5 rounded-lg border bg-gray-50 p-3">
            {(job.location || job.postcode) && (
              <Row label="Location" value={[job.location, job.postcode].filter(Boolean).join(', ')} />
            )}
            {job.preferred_date && <Row label="Preferred date" value={fmtDate(job.preferred_date)} />}
            {job.status && <Row label="Status" value={cap(job.status.replace('_', ' '))} />}
          </div>

          {prop && (
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Property</p>
              <div className="space-y-1.5 rounded-lg border bg-gray-50 p-3">
                {prop.property_type && <Row label="Type" value={cap(prop.property_type)} />}
                {prop.bedrooms != null && <Row label="Bedrooms" value={prop.bedrooms} />}
                {prop.bathrooms != null && <Row label="Bathrooms" value={prop.bathrooms} />}
                {prop.year_built && <Row label="Year built" value={prop.year_built} />}
                {prop.epc_band && <Row label="EPC band" value={prop.epc_band} />}
                {prop.heating_type && <Row label="Heating" value={cap(prop.heating_type)} />}
                {prop.tenure && <Row label="Tenure" value={cap(prop.tenure)} />}
                {prop.council_tax_band && <Row label="Council tax" value={prop.council_tax_band} />}
              </div>
            </div>
          )}

          {answers.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Additional details</p>
              <div className="space-y-1.5 rounded-lg border bg-gray-50 p-3">
                {answers.map(([key, val]) => (
                  <Row key={key} label={answerLabel(key)} value={String(val)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobDetailsDialog;
