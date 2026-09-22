import { postData } from './api';

// apps/jobs tradepilot_urls.py — report/hide/block-homeowner. Mirrors
// lib/messaging.ts's ReportReason/report/block shape for the same job-post
// moderation pattern, just scoped to a JobLead instead of a Message.

export type JobReportReason = 'fake' | 'nudity' | 'violence' | 'harassment' | 'other';

export const JOB_REPORT_REASONS: { value: JobReportReason; label: string }[] = [
  { value: 'fake', label: 'Fake or scam' },
  { value: 'nudity', label: 'Nudity' },
  { value: 'violence', label: 'Violence' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'other', label: 'Something else' },
];

export const reportJob = (jobId: string, payload: { reason: JobReportReason; details?: string }) =>
  postData({ url: `/api/v1/tradepilot/jobs/${jobId}/report/`, data: payload });

/** "Not seeing this post" — hides just this job for the calling trader. */
export const hideJob = (jobId: string) => postData({ url: `/api/v1/tradepilot/jobs/${jobId}/hide/` });

/** Hides all future posts from this job's homeowner, for the calling trader only. */
export const blockHomeownerForJob = (jobId: string) =>
  postData({ url: `/api/v1/tradepilot/jobs/${jobId}/block-homeowner/` });
