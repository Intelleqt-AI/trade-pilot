import { fetchData, postData, patchData, deleteData } from '@/lib/api';

// Trader-side messaging API (TradePilot). Talks to the trader messaging mount —
// mirrors the homeowner app's equivalent module 1:1 (see plan section 3.1).
export const BASE = '/api/v1/tradepilot/messaging';

export type DeleteScope = 'me' | 'everyone';

export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'hate_speech'
  | 'inappropriate_content'
  | 'scam_fraud'
  | 'impersonation'
  | 'off_platform_contact'
  | 'other';

// Mirrors backend/apps/messaging/models.py MessageReport.REASON_CHOICES exactly.
export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'hate_speech', label: 'Hate speech' },
  { value: 'inappropriate_content', label: 'Inappropriate content' },
  { value: 'scam_fraud', label: 'Scam or fraud' },
  { value: 'impersonation', label: 'Impersonation' },
  { value: 'off_platform_contact', label: 'Off-platform contact' },
  { value: 'other', label: 'Other' },
];

export interface MessageHistoryEntry {
  previous_body: string;
  edited_at: string;
}

// Single source of truth for the thread URL — also the query-key string every
// messaging mutation invalidates against.
export const getMessagesUrl = (conversationId: string) =>
  `${BASE}/conversations/${conversationId}/messages/`;

// Conversations-list query-key string, kept alongside BASE so every mutation
// (and the real-time socket, see useMessagingSocket.ts) invalidates the exact
// same key Messages.tsx queries with.
export const CONVERSATIONS_URL = `${BASE}/conversations/`;

export const blockConversation = (conversationId: string) =>
  postData({ url: `${BASE}/conversations/${conversationId}/block/` });

export const unblockConversation = (conversationId: string) =>
  postData({ url: `${BASE}/conversations/${conversationId}/unblock/` });

export const editMessage = (conversationId: string, messageId: string, body: string) =>
  patchData({
    url: `${BASE}/conversations/${conversationId}/messages/${messageId}/`,
    data: { body },
  });

export const deleteMessage = (conversationId: string, messageId: string, scope: DeleteScope) =>
  deleteData({
    url: `${BASE}/conversations/${conversationId}/messages/${messageId}/`,
    data: { scope },
  });

export const reportMessage = (
  conversationId: string,
  messageId: string,
  payload: { reason: ReportReason; details?: string },
) =>
  postData({
    url: `${BASE}/conversations/${conversationId}/messages/${messageId}/report/`,
    data: payload,
  });

export const fetchMessageHistory = (conversationId: string, messageId: string) =>
  fetchData<any>(`${BASE}/conversations/${conversationId}/messages/${messageId}/history/`);

export type AttachmentType = 'image' | 'video' | 'pdf' | 'docx';

export type PresignedUpload = {
  upload: { method: 'POST' | 'PUT'; url: string; fields?: Record<string, string> | null };
  s3_key: string;
  attachment_type: AttachmentType;
  file_name: string;
};

/** Ask the backend for direct-upload instructions for a chat attachment.
 * Uploads the file's bytes straight to S3 (or, in local dev, a same-app
 * fallback endpoint) — never through this API call itself. */
export const presignAttachment = async (
  conversationId: string,
  file: File,
): Promise<PresignedUpload> => {
  const res: any = await postData({
    url: `${BASE}/conversations/${conversationId}/attachments/presign/`,
    data: { file_name: file.name, content_type: file.type, file_size: file.size },
  });
  return res.data;
};
