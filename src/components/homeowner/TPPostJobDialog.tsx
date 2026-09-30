import { useState, useMemo, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Upload, X, FileText, Home } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { formatPropertyLine } from '@/lib/format';
import { categoryConfig, type CategoryQuestion } from '@/lib/jobCategoryQuestions';
import { URGENCY_LABELS } from '@/components/trade-pilot/tones';
import { createJob, updateJob, uploadJobFile, fetchProperties } from '@/lib/api/tpHomeowner';
import { requestedTradeLabel } from '@/lib/jobIntent';

const MAX_FILES = 3;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
// Mirrors ALLOWED_JOB_FILE_TYPES in backend/apps/jobs/views.py — a broader list
// here just means the server rejects the upload after the job is already created.
const FILE_ACCEPT = '.pdf,.png,.jpg,.jpeg,.webp,.heic,.heif,.docx';

// Matches HomePlus's JOB_TRADE_OPTIONS, and deliberately so: these four are the
// only trades with entries in CREDIT_RULES. Adding a trade whose categories are
// unpriced would sell every one of its leads at the 10-credit floor.
// Labels are the discipline names (as HomePlus shows them); values stay the
// backend TRADE_CHOICES slugs.
const TRADES = [
  { value: 'plumber', label: 'Plumbing' },
  { value: 'gas_engineer', label: 'Gas Engineer' },
  { value: 'electrician', label: 'Electrical' },
  { value: 'roofer', label: 'Roofing' },
];

// Single source shared with the trader-side badges; mirrors JobLead.URGENCY_CHOICES.
const URGENCIES = Object.entries(URGENCY_LABELS).map(([value, label]) => ({ value, label }));

// JobLead.PRIORITY_CHOICES — there is no 'emergency'; use urgency for speed.
const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

// categoryConfig keys categories by display trade name, not the backend trade slug.
// Keep in step with TRADES above — every offered trade must resolve to a category
// set, or its jobs reach traders with no answers and no real price.
const TRADE_TO_CATEGORY_LABEL: Record<string, string> = {
  plumber: 'Plumbing',
  gas_engineer: 'Gas Engineer',
  electrician: 'Electrical',
  roofer: 'Roofing',
};

type AnswerValue = string | number | undefined;

/** The subset of JobLeadSerializer's output the form can edit. */
export interface EditableJob {
  id: string;
  property?: string | null;
  title?: string;
  trade?: string;
  category?: string;
  description?: string;
  postcode?: string;
  urgency?: string;
  priority?: string;
  answers?: Record<string, AnswerValue> | null;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onPosted?: () => void;
  /** Present → edit that job instead of posting a new one. */
  job?: EditableJob | null;
  /** Seeded from the marketing site's trade page + postcode search.
   *  `requestedTrade` is what the landing page asked for; when it doesn't map to
   *  a selectable trade we say so rather than leaving the field blank in silence. */
  prefill?: { trade?: string; postcode?: string; requestedTrade?: string };
}

const emptyForm = {
  property: '',
  title: '',
  trade: '',
  category: '',
  description: '',
  postcode: '',
  urgency: 'within_2_weeks',
  priority: 'medium',
};

const TPPostJobDialog = ({ open, onOpenChange, onPosted, prefill, job }: Props) => {
  const isEdit = !!job;
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState<File[]>([]);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});

  const { data: properties = [] } = useQuery({
    queryKey: ['ho-properties'],
    queryFn: fetchProperties,
    enabled: open,
  });

  const categories = useMemo(() => {
    const label = TRADE_TO_CATEGORY_LABEL[form.trade];
    if (!label) return [];
    return categoryConfig.filter(c => c.trade === label).map(c => c.category);
  }, [form.trade]);

  const selectedCategory = useMemo(
    () => categoryConfig.find(c => c.category === form.category),
    [form.category],
  );

  const questions: CategoryQuestion[] = useMemo(
    () => [...(selectedCategory?.questions ?? [])].sort((a, b) => a.question_order - b.question_order),
    [selectedCategory],
  );

  // Changing trade or category invalidates the previous category's answers —
  // stale keys would otherwise be priced against the wrong category.
  const set = (k: keyof typeof form, v: string) => {
    setForm(f => ({ ...f, [k]: v, ...(k === 'trade' ? { category: '' } : {}) }));
    if (k === 'trade' || k === 'category') setAnswers({});
  };

  const setAnswer = (key: string, value: AnswerValue) =>
    setAnswers(prev => ({ ...prev, [key]: value }));

  const reset = () => {
    setForm(emptyForm);
    setFiles([]);
    setAnswers({});
  };

  const propertyList = properties as any[];
  const selectedProperty = propertyList.find(p => p.id === form.property);

  // Editing: load the saved job into the form each time the dialog opens. Keyed on
  // job.id so reopening on a different job reseeds rather than keeping stale values.
  const editId = job?.id;
  useEffect(() => {
    if (!open || !job) return;
    setForm({
      property: job.property ?? '',
      title: job.title ?? '',
      trade: job.trade ?? '',
      category: job.category ?? '',
      description: job.description ?? '',
      postcode: job.postcode ?? '',
      urgency: job.urgency || 'within_2_weeks',
      priority: job.priority || 'medium',
    });
    setAnswers(job.answers ?? {});
    setFiles([]);
    // `job` is a fresh object on every render of the parent; editId is the stable key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editId]);

  // Homeowners keep a single property, so there is nothing to choose — link it
  // automatically and let the serializer fill postcode/location/pin from it.
  useEffect(() => {
    if (open && !isEdit && propertyList.length === 1 && !form.property) {
      setForm(f => ({ ...f, property: propertyList[0].id }));
    }
  }, [open, propertyList, form.property]);

  // Seed the trade/postcode the user picked on the marketing site. Applied once
  // per opening, and only over blank fields so it can never clobber typing.
  const prefillTrade = prefill?.trade ?? '';
  const prefillPostcode = prefill?.postcode ?? '';
  // Landing page asked for a trade we can't offer (builder, carpenter, …).
  const unmatchedTrade =
    !prefillTrade && prefill?.requestedTrade
      ? requestedTradeLabel(prefill.requestedTrade)
      : '';
  useEffect(() => {
    if (!open || isEdit || (!prefillTrade && !prefillPostcode)) return;
    setForm(f => ({
      ...f,
      ...(prefillTrade && !f.trade ? { trade: prefillTrade, category: '' } : {}),
      ...(prefillPostcode && !f.postcode ? { postcode: prefillPostcode } : {}),
    }));
  }, [open, prefillTrade, prefillPostcode]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, any> = {
        title: form.title.trim(),
        trade: form.trade,
        description: form.description.trim(),
        urgency: form.urgency,
        priority: form.priority,
        // Drives per-category lead pricing server-side (credit_rules.py) — an
        // empty object prices every job at the 10-credit floor.
        answers,
      };
      // With a property linked the serializer fills postcode, location and the map
      // pin from it — sending our own would just be a second source of truth.
      if (form.property) payload.property = form.property;
      else payload.postcode = form.postcode.trim().toUpperCase();
      if (form.category) payload.category = form.category;

      // Always a full payload, never a diff: JobLeadWriteSerializer.validate() runs
      // on PATCH too, and it forces `trade` to 'other' and regenerates `title`
      // whenever they are absent — so omitting an unchanged field would rewrite it.
      const res: any = isEdit ? await updateJob(job!.id, payload) : await createJob(payload);
      const jobId = isEdit ? job!.id : (res?.data?.id ?? res?.id);

      if (jobId && files.length) {
        for (const file of files) {
          const fd = new FormData();
          fd.append('file', file);
          try {
            await uploadJobFile(jobId, fd);
          } catch {
            // a failed attachment shouldn't discard a posted job
            toast.error(`Could not upload ${file.name}`);
          }
        }
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ho-jobs'] });
      toast.success(isEdit ? 'Job updated.' : 'Job posted — traders can now send you quotes.');
      reset();
      onOpenChange(false);
      onPosted?.();
    },
    onError: (err: any) => {
      const errors = err?.response?.data?.errors;
      const first = errors ? Object.values(errors)[0] : null;
      toast.error(String(
        Array.isArray(first) ? first[0] : first ?? (isEdit ? 'Could not update job.' : 'Could not post job.'),
      ));
    },
  });

  const handleSubmit = () => {
    // The server hard-rejects a property with no pin; catch it here so the
    // homeowner gets a fix they can act on rather than a raw field error.
    if (selectedProperty && (selectedProperty.latitude == null || selectedProperty.longitude == null)) {
      return toast.error('That property has no map pin yet. Set its exact location in Settings → Properties first.');
    }
    if (!form.title.trim()) return toast.error('Please give your job a title.');
    if (!form.trade) return toast.error('Please choose a trade.');
    // Only asked for when no property is linked — otherwise it comes from the property.
    if (!selectedProperty && !form.postcode.trim()) {
      return toast.error('Please enter the job postcode.');
    }
    if (categories.length > 0 && !form.category) return toast.error('Please select a category.');

    const unanswered = questions.find(q => q.required && !answers[q.output_key]);
    if (unanswered) return toast.error(`Please answer: ${unanswered.question_text}`);

    // Description is optional: each category's final question writes to
    // output_key 'description', which the serializer uses as the fallback.
    if (!form.description.trim() && !answers.description) {
      return toast.error('Please describe the work needed.');
    }
    mutation.mutate();
  };

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list);

    const valid = incoming.filter(f => {
      if (f.size > MAX_FILE_BYTES) {
        toast.error(`${f.name} exceeds 5 MB`);
        return false;
      }
      return true;
    });

    setFiles(prev => {
      const remaining = MAX_FILES - prev.length;
      if (valid.length > remaining) {
        toast.error(`Max ${MAX_FILES} files — ${valid.length - remaining} skipped`);
      }
      return [...prev, ...valid.slice(0, Math.max(0, remaining))];
    });
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!mutation.isPending) { onOpenChange(v); if (!v) reset(); } }}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit job' : 'Post a job'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the details of your job. Traders who have already contacted you will see the changes.'
              : 'Tell us what you need done and verified traders in your area will send you quotes.'}
          </DialogDescription>
        </DialogHeader>

        {/* min-w-0: DialogContent is a grid, whose items default to min-width:auto and
            would otherwise stretch to fit a long address instead of truncating it. */}
        <div className="min-w-0 space-y-4 py-2">
          {propertyList.length === 1 && selectedProperty ? (
            <div className="space-y-2">
              <Label>Property</Label>
              <div className="flex items-start gap-3 rounded-xl border bg-muted/40 p-3.5">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Home className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {selectedProperty.name || 'My Home'}
                  </p>
                  <p
                    className="truncate text-xs text-muted-foreground"
                    title={formatPropertyLine(selectedProperty.address, selectedProperty.postcode)}
                  >
                    {formatPropertyLine(selectedProperty.address, selectedProperty.postcode)}
                  </p>
                </div>
              </div>
            </div>
          ) : propertyList.length > 1 ? (
            <div className="space-y-2">
              <Label>Property</Label>
              <Select value={form.property} onValueChange={v => set('property', v)}>
                <SelectTrigger><SelectValue placeholder="Select a property (optional)" /></SelectTrigger>
                <SelectContent>
                  {propertyList.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name || p.address || 'My property'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="title">Job title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="e.g. Replace leaking kitchen tap"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Trade *</Label>
              <Select value={form.trade} onValueChange={v => set('trade', v)}>
                <SelectTrigger><SelectValue placeholder="Choose a trade" /></SelectTrigger>
                <SelectContent>
                  {TRADES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {unmatchedTrade && !form.trade && (
                <p className="text-xs text-muted-foreground">
                  We don't take {unmatchedTrade} jobs yet — pick the closest trade.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Category{categories.length > 0 ? ' *' : ''}</Label>
              <Select
                value={form.category}
                onValueChange={v => set('category', v)}
                disabled={categories.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={categories.length ? 'Choose a category' : 'No categories'} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {questions.length > 0 && (
            <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{form.category}</p>
                {selectedCategory?.category_description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {selectedCategory.category_description}
                  </p>
                )}
              </div>

              {questions.map(q => (
                <div key={q.output_key} className="space-y-2">
                  <Label htmlFor={q.output_key}>
                    {q.question_text}{q.required ? ' *' : ''}
                  </Label>

                  {q.question_type === 'multiple_choice' ? (
                    <Select
                      value={(answers[q.output_key] as string) ?? ''}
                      onValueChange={v => setAnswer(q.output_key, v)}
                    >
                      <SelectTrigger id={q.output_key}>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        {(q.options ?? []).map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : q.question_type === 'number' ? (
                    <Input
                      id={q.output_key}
                      type="number"
                      value={(answers[q.output_key] as number | undefined) ?? ''}
                      onChange={e => setAnswer(q.output_key, Number(e.target.value))}
                      placeholder="Enter number"
                    />
                  ) : (
                    <Textarea
                      id={q.output_key}
                      rows={3}
                      value={(answers[q.output_key] as string) ?? ''}
                      onChange={e => setAnswer(q.output_key, e.target.value)}
                      placeholder="Enter details…"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">
              Describe the work{questions.length > 0 ? '' : ' *'}
            </Label>
            <Textarea
              id="description"
              rows={4}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Include as much detail as you can — what's wrong, what you'd like done, and any access notes."
            />
          </div>

          <div className={cn('grid gap-4', selectedProperty ? 'sm:grid-cols-2' : 'sm:grid-cols-3')}>
            {!selectedProperty && (
              <div className="space-y-2">
                <Label htmlFor="postcode">Postcode *</Label>
                <Input
                  id="postcode"
                  value={form.postcode}
                  onChange={e => set('postcode', e.target.value.toUpperCase())}
                  placeholder="SW1A 1AA"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Timeframe</Label>
              <Select value={form.urgency} onValueChange={v => set('urgency', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {URGENCIES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={v => set('priority', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Photos or documents ({files.length}/{MAX_FILES})</Label>
            {files.length < MAX_FILES && (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-6 text-center transition-colors hover:border-primary/40">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to upload</span>
                <span className="text-xs text-muted-foreground">
                  Max {MAX_FILES} files · 5 MB each · PDF, images, Word
                </span>
                <input
                  type="file"
                  multiple
                  accept={FILE_ACCEPT}
                  className="hidden"
                  onChange={e => { addFiles(e.target.files); e.target.value = ''; }}
                />
              </label>
            )}
            {files.length > 0 && (
              <div className="space-y-1.5">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate text-xs">{f.name}</span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {(f.size / 1024).toFixed(0)} KB
                    </span>
                    <button
                      type="button"
                      onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            {isEdit ? 'Save changes' : 'Post job'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TPPostJobDialog;
