import { apiRequest } from './apiClient';
import {
  isDemoMode,
  getDemoLeads,
  getDemoJobs,
  getDemoProfiles,
  addDemoLead,
  updateDemoLead,
  addDemoBid,
  updateDemoBid,
  addDemoJob,
  updateDemoJob,
  updateDemoProfile,
  mockArticles,
} from '@/lib/mockData';

// ─── Generic HTTP helpers (HomePlus backend) ──────────────────────────────────

export const fetchData = <T = any>(url: string): Promise<T> =>
  apiRequest<T>(url, { method: 'GET' });

export const postData = <T = any>({ url, data, config }: { url: string; data?: any; config?: any }): Promise<T> => {
  const isFormData = data instanceof FormData;
  return apiRequest<T>(url, {
    method: 'POST',
    body: isFormData ? data : data !== undefined ? JSON.stringify(data) : undefined,
    ...(config?.headers ? { headers: config.headers } : {}),
  });
};

export const patchData = <T = any>({ url, data }: { url: string; data?: any }): Promise<T> => {
  const isFormData = data instanceof FormData;
  return apiRequest<T>(url, {
    method: 'PATCH',
    body: isFormData ? data : data !== undefined ? JSON.stringify(data) : undefined,
  });
};

export const deleteData = <T = any>({ url }: { url: string }): Promise<T> =>
  apiRequest<T>(url, { method: 'DELETE' });

// Update TradePilot user + TradePilotProfile via Django /me/ endpoint
export const updateTradePilotMe = (data: Record<string, any>) =>
  patchData({ url: 'api/v1/tradepilot/auth/me/', data });

// My Bids (accepted HomePlus bids)
export const fetchMyBids = () =>
  fetchData<any>('/api/v1/tradepilot/jobs/my-bids/').then(r => r?.data ?? []);

// Trade Documents
export const fetchTradeDocuments = () =>
  fetchData<any>('api/v1/tradepilot/profile/documents/').then(r => r?.data ?? []);

export const uploadTradeDocument = (formData: FormData) =>
  postData<any>({ url: 'api/v1/tradepilot/profile/documents/', data: formData });

export const deleteTradeDocument = (id: string) =>
  deleteData<any>({ url: `api/v1/tradepilot/profile/documents/${id}/` });

// Trade Services
export const fetchTradeServices = () =>
  fetchData<any>('api/v1/tradepilot/profile/services/').then(r => r?.data ?? []);

export const createTradeService = (data: Record<string, any>) =>
  postData<any>({ url: 'api/v1/tradepilot/profile/services/', data });

export const updateTradeService = ({ id, ...data }: { id: string; [key: string]: any }) =>
  patchData<any>({ url: `api/v1/tradepilot/profile/services/${id}/`, data });

export const deleteTradeService = (id: string) =>
  deleteData<any>({ url: `api/v1/tradepilot/profile/services/${id}/` });

// Add new job
export const postJobs = async (job: any) => {
  if (isDemoMode()) {
    return { data: addDemoJob(job) };
  }
  return postData({ url: 'api/v1/tradepilot/jobs/', data: job });
};

// Add new lead
export const postLeads = async (lead: any) => {
  if (isDemoMode()) {
    return { data: addDemoLead(lead) };
  }
  return postData({ url: 'api/v1/tradepilot/leads/', data: lead });
};

// Modify lead
export const modifyLeads = async (lead: any) => {
  if (isDemoMode()) {
    return { data: updateDemoLead(lead) };
  }
  return patchData({ url: `api/v1/tradepilot/leads/${lead.id}/`, data: lead });
};

// Fetch accepted HomePlus jobs for the logged-in trade
export const fetchMyJobs = async (): Promise<any[]> => {
  try {
    const res = await fetchData<any>('api/v1/tradepilot/jobs/my-jobs/');
    return (res?.data ?? []).map((j: any) => ({ ...j, _source: 'homeplus' as const }));
  } catch {
    return [];
  }
};

// Update status of an accepted HomePlus job
export const updateTradeJobStatus = async ({ jobId, status }: { jobId: string; status: string }) =>
  patchData({ url: `api/v1/tradepilot/jobs/my-jobs/${jobId}/status/`, data: { status } });

// Fetch jobs
export const fetchJobs = async () => {
  if (isDemoMode()) {
    return getDemoJobs();
  }
  return fetchMyJobs();
};

// Fetch leads
export const fetchLeads = async () => {
  if (isDemoMode()) {
    return getDemoLeads();
  }
  const res = await fetchData<any>('api/v1/tradepilot/leads/');
  return res?.data ?? res ?? [];
};

// Add bid
export const addBids = async ({ updates }: { updates: any }) => {
  if (isDemoMode()) {
    return addDemoBid(updates);
  }
  return postData({ url: 'api/v1/tradepilot/bids/', data: updates });
};

// Modify bid
export const modifyBids = async (updates: any) => {
  if (isDemoMode()) {
    return updateDemoBid(updates);
  }
  return patchData({ url: `api/v1/tradepilot/bids/${updates.id}/`, data: updates });
};

// Update profile
export const updateProfile = async (profile: any) => {
  if (isDemoMode()) {
    return updateDemoProfile(profile);
  }
  return patchData({ url: 'api/v1/tradepilot/auth/me/', data: profile });
};

// Update job status
export const updateJobStatus = async ({
  jobId,
  status,
}: {
  jobId: string;
  status: string;
  _source?: string;
}) => {
  if (isDemoMode()) {
    return { data: updateDemoJob(Number(jobId), { status }) };
  }
  return updateTradeJobStatus({ jobId, status });
};

// Purchase lead (credit deduction + lead assignment)
export const addPurchase = async ({ lead, userID }: { lead: any; userID: string }) => {
  if (isDemoMode()) {
    const profiles = getDemoProfiles();
    const profile = profiles[userID];

    if (!profile) {
      throw new Error('Profile not found');
    }

    const CREDIT_COST = 30;
    const currentCredit = profile.credit || 0;

    if (currentCredit < CREDIT_COST) {
      throw new Error('Insufficient credits. You need at least 30 credits to accept a lead.');
    }

    const currentLeads = profile.leads || [];
    const updatedLeads = [...currentLeads, lead];
    const newCredit = currentCredit - CREDIT_COST;

    updateDemoProfile({ id: userID, leads: updatedLeads, credit: newCredit });

    return { data: { profile: profiles[userID] } };
  }

  return postData({ url: 'api/v1/tradepilot/leads/purchase/', data: { lead_id: lead.id } });
};

// ─── Blog API ─────────────────────────────────────────────────────────────────

const API_URL = 'https://reassuring-paradise-02bc2fb070.strapiapp.com';

export async function fetchArticles() {
  if (isDemoMode()) {
    return mockArticles;
  }

  try {
    const response = await fetch(`${API_URL}/api/articles?populate=*&filters[Site][$eq]=tradepilot&pagination[pageSize]=100`);
    if (!response.ok) {
      throw new Error(`Failed to fetch articles: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching articles:', error);
    return { data: [] };
  }
}

export async function fetchArticleBySlug(slug: string) {
  if (isDemoMode()) {
    const article = mockArticles.data.find(a => a.slug === slug || a.id.toString() === slug);
    return article || null;
  }

  try {
    if (!slug) return null;

    let response = await fetch(`${API_URL}/api/articles?filters[slug][$eq]=${slug}&populate=*&sort=updatedAt:desc`);
    let result = await response.json();

    if (!result.data || result.data.length === 0) {
      const possibleId = parseInt(slug, 10);
      if (!isNaN(possibleId)) {
        response = await fetch(`${API_URL}/api/articles?filters[id][$eq]=${possibleId}&populate=*&sort=updatedAt:desc`, {
          cache: 'no-store',
        });
        if (response.ok) {
          result = await response.json();
          return result.data && result.data.length > 0 ? result.data[0] : null;
        }
      }
      return null;
    }
    return result.data[0];
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

export async function fetchAuthors() {
  if (isDemoMode()) {
    return { data: [{ id: 1, name: 'Trade Pilot Team', bio: 'Your trusted source for trade advice.' }] };
  }

  try {
    const response = await fetch(`${API_URL}/api/authors?populate=*`);
    if (!response.ok) {
      throw new Error(`Failed to fetch authors: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching authors:', error);
    return { data: [] };
  }
}
