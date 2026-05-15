import { apiRequest } from './apiClient';
import { supabase } from '@/integrations/supabase/client';

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
export const postJobs = async job => {
  if (isDemoMode()) {
    return { data: addDemoJob(job) };
  }

  const { data, error } = await supabase.from('jobs').insert(job);
  if (error) {
    throw new Error(error.message);
  }
  return { data };
};

// Add new lead
export const postLeads = async lead => {
  if (isDemoMode()) {
    return { data: addDemoLead(lead) };
  }

  const { data, error } = await supabase.from('leads').insert([lead]);
  if (error) {
    throw new Error(error.message);
  }
  return { data };
};

// Modify lead
export const modifyLeads = async lead => {
  if (isDemoMode()) {
    return { data: updateDemoLead(lead) };
  }

  const { data, error } = await supabase.from('leads').update(lead).eq('id', lead.id);
  if (error) {
    throw new Error(error.message);
  }
  return { data };
};

// Normalise a Supabase CRM job to use consistent status values
const normaliseSupabaseJob = (job: any) => ({
  ...job,
  _source: 'supabase' as const,
  status:
    job.status === 'in-progress' ? 'in_progress'
    : job.status === 'complete' ? 'completed'
    : job.status,
});

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

// Fetch jobs — merges Supabase CRM jobs with accepted HomePlus jobs
export const fetchJobs = async () => {
  if (isDemoMode()) {
    return getDemoJobs();
  }

  const [supabaseResult, homeplusJobs] = await Promise.allSettled([
    supabase.from('jobs').select('*'),
    fetchMyJobs(),
  ]);

  const supabaseJobs: any[] =
    supabaseResult.status === 'fulfilled' && !supabaseResult.value.error
      ? (supabaseResult.value.data ?? []).map(normaliseSupabaseJob)
      : [];

  const acceptedJobs: any[] =
    homeplusJobs.status === 'fulfilled' ? homeplusJobs.value : [];

  // Deduplicate by id (safety guard in case of overlap)
  const seen = new Set(supabaseJobs.map((j: any) => String(j.id)));
  const uniqueAccepted = acceptedJobs.filter((j: any) => !seen.has(String(j.id)));

  return [...supabaseJobs, ...uniqueAccepted];
};

// Fetch leads
export const fetchLeads = async () => {
  if (isDemoMode()) {
    return getDemoLeads();
  }

  const { data, error } = await supabase.from('leads').select(`
      *,
      bids(*,
      bidder:bid_by (
         *
        ))
    `);
  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// add bids
export const addBids = async ({ updates }) => {
  if (isDemoMode()) {
    return addDemoBid(updates);
  }

  const { data, error } = await supabase.from('bids').insert(updates);
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

// modify bids
export const modifyBids = async updates => {
  if (isDemoMode()) {
    return updateDemoBid(updates);
  }

  const { data, error } = await supabase.from('bids').update(updates).eq('id', updates.id);
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

// Update profile
export const updateProfile = async profile => {
  if (isDemoMode()) {
    return updateDemoProfile(profile);
  }

  const { data, error } = await supabase.from('profiles').update(profile).eq('id', profile.id);
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

// Update job status — routes to HomePlus backend or Supabase based on source
export const updateJobStatus = async ({
  jobId,
  status,
  _source,
}: {
  jobId: string;
  status: string;
  _source?: string;
}) => {
  if (_source === 'homeplus') {
    return updateTradeJobStatus({ jobId, status });
  }

  if (isDemoMode()) {
    return { data: updateDemoJob(jobId, { status }) };
  }

  const { data, error } = await supabase.from('jobs').update({ status }).eq('id', jobId);
  if (error) {
    throw new Error(error.message);
  }
  return { data };
};

// Blog API

const API_URL = 'https://reassuring-paradise-02bc2fb070.strapiapp.com';

// Fetch All Article
export async function fetchArticles() {
  if (isDemoMode()) {
    return mockArticles;
  }

  try {
    const response = await fetch(`${API_URL}/api/articles?populate=*&filters[Site][$eq]=tradepilot&pagination[pageSize]=100`, {});

    if (!response.ok) {
      throw new Error(`Failed to fetch articles: ${response.status}`);
    }
    const result = await response.json();
    console.log('API response structure:', Object.keys(result));

    return result;
  } catch (error) {
    console.error('Error fetching articles:', error);
    return { data: [] };
  }
}

// Fetch article by slug
export async function fetchArticleBySlug(slug) {
  if (isDemoMode()) {
    const article = mockArticles.data.find(a => a.slug === slug || a.id.toString() === slug);
    return article || null;
  }

  try {
    if (!slug) {
      console.warn('fetchArticleBySlug called with empty/undefined slug:', slug);
      return null;
    }
    // First attempt: Try to find by slug
    let response = await fetch(`${API_URL}/api/articles?filters[slug][$eq]=${slug}&populate=*&sort=updatedAt:desc`, {});

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

// Fetch Author Info
export async function fetchAuthors() {
  if (isDemoMode()) {
    return { data: [{ id: 1, name: 'Trade Pilot Team', bio: 'Your trusted source for trade advice.' }] };
  }

  try {
    const response = await fetch(`${API_URL}/api/authors?populate=*`, {});

    if (!response.ok) {
      throw new Error(`Failed to fetch articles: ${response.status}`);
    }
    const result = await response.json();
    console.log('API response structure:', Object.keys(result));

    return result;
  } catch (error) {
    console.error('Error fetching articles:', error);
    return { data: [] };
  }
}

export const addPurchase = async ({ lead, userID }) => {
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

    updateDemoProfile({
      id: userID,
      leads: updatedLeads,
      credit: newCredit,
    });

    return {
      data: {
        profile: profiles[userID],
      },
    };
  }

  const { data: profile, error: fetchError } = await supabase.from('profiles').select('leads, credit').eq('id', userID).single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  // Check if user has sufficient credit (30 credits required per lead)
  const CREDIT_COST = 30;
  const currentCredit = profile.credit || 0;

  if (currentCredit < CREDIT_COST) {
    throw new Error('Insufficient credits. You need at least 30 credits to accept a lead.');
  }

  // Create or update the leads array
  const currentLeads = profile.leads || [];
  const updatedLeads = [...currentLeads, lead];

  // Calculate new credit balance
  const newCredit = currentCredit - CREDIT_COST;

  // Update the profiles table with the new leads array and deducted credit
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .update({ leads: updatedLeads, credit: newCredit })
    .eq('id', userID);

  if (profileError) {
    throw new Error(profileError.message);
  }

  return {
    data: {
      profile: profileData,
    },
  };
};
