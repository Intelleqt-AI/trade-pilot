import { fetchData, postData, patchData, deleteData } from '@/lib/api';
import type { ActivityItem } from '@/lib/activity';

const P = '/api/v1/tradepilot/homeowner';

// ── Properties ──────────────────────────────────────────────────────────────────
export const fetchProperties = () =>
  fetchData<any>(`${P}/properties/`).then(r => r?.data ?? r?.results ?? []);

export const createProperty = (data: Record<string, any>) =>
  postData<any>({ url: `${P}/properties/`, data });

export const updateProperty = (id: string, data: Record<string, any>) =>
  patchData<any>({ url: `${P}/properties/${id}/`, data });

export const deleteProperty = (id: string) =>
  deleteData<any>({ url: `${P}/properties/${id}/` });

export const uploadPropertyCover = (propertyId: string, formData: FormData) =>
  postData<any>({ url: `${P}/properties/${propertyId}/cover-image/`, data: formData });

// ── Jobs ────────────────────────────────────────────────────────────────────────
export const fetchJobs = () =>
  fetchData<any>(`${P}/jobs/`).then(r => r?.data ?? r?.results ?? []);

export const createJob = (data: Record<string, any>) =>
  postData<any>({ url: `${P}/jobs/`, data });

export const updateJob = (id: string, data: Record<string, any>) =>
  patchData<any>({ url: `${P}/jobs/${id}/`, data });

/** Refused with 400 once any trader has purchased the lead — see
 *  TPHomeownerJobLeadViewSet.destroy. Cancel the job instead. */
export const deleteJob = (id: string) =>
  deleteData<any>({ url: `${P}/jobs/${id}/` });

export const uploadJobFile = (jobId: string, formData: FormData) =>
  postData<any>({ url: `${P}/jobs/${jobId}/files/`, data: formData });

export const deleteJobFile = (jobId: string, fileId: string) =>
  deleteData<any>({ url: `${P}/jobs/${jobId}/files/${fileId}/` });

export const respondToBid = (jobId: string, bidId: string, data: { status: string }) =>
  patchData<any>({ url: `${P}/jobs/${jobId}/bids/${bidId}/`, data });

export const rateBid = (jobId: string, bidId: string, data: { rating: number; review?: string }) =>
  postData<any>({ url: `${P}/jobs/${jobId}/bids/${bidId}/rate/`, data });

// ── Insights ────────────────────────────────────────────────────────────────────
export const fetchAnnualSpend = () =>
  fetchData<any>(`${P}/insights/annual-spend/`).then(r => r?.data ?? r);

export const fetchAttention = () =>
  fetchData<any>(`${P}/insights/attention/`).then(r => r?.data ?? r);

export const fetchSpending = () =>
  fetchData<any>(`${P}/insights/spending/`).then(r => r?.data ?? r);

export const fetchSpendingCategories = () =>
  fetchData<any>(`${P}/insights/spending/categories/`).then(r => r?.data ?? r);

export const fetchSummary = () =>
  fetchData<any>(`${P}/insights/summary/`).then(r => r?.data ?? r);

// ── Notifications ───────────────────────────────────────────────────────────────
export const fetchNotifications = () =>
  fetchData<any>(`${P}/notifications/`).then(r => r?.data ?? r);

/** Flat array of ActivityItem — a different contract from fetchNotifications(). */
export const fetchRecentActivity = (limit = 6): Promise<ActivityItem[]> =>
  fetchData<any>(`${P}/notifications/recent/?limit=${limit}`)
    .then(r => (Array.isArray(r?.data) ? r.data : Array.isArray(r) ? r : []));

export const markNotificationRead = (id: string) =>
  patchData<any>({ url: `${P}/notifications/${id}/read/` });

export const markAllNotificationsRead = () =>
  postData<any>({ url: `${P}/notifications/read-all/` });

export const deleteNotification = (id: string) =>
  deleteData<any>({ url: `${P}/notifications/${id}/` });

// ── Messaging ───────────────────────────────────────────────────────────────────
// Chat itself goes through lib/messaging.ts, shared with the trader CRM — see
// HOMEOWNER_BASE there. Only the layout's unread badge still reads from here.
export const fetchUnreadCount = () =>
  fetchData<any>(`${P}/messaging/unread-count/`).then(r => r?.data ?? r);

// ── Notification Preferences ────────────────────────────────────────────────────
export const fetchNotificationPreferences = () =>
  fetchData<any>(`${P}/notification-preferences/`).then(r => r?.data ?? r);

export const updateNotificationPreferences = (data: Record<string, any>) =>
  patchData<any>({ url: `${P}/notification-preferences/`, data });
