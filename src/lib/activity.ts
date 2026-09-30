// Shape returned by /notifications/recent/ — build_recent_activity() in
// backend/apps/notifications/activity.py, NOT the notifications list.
//
// It merges notifications, job requests and other events into one flat array and
// deliberately renames the fields (RecentActivitySerializer maps title→text,
// body→sub, created_at→timestamp). Reading `title`/`body`/`created_at` here
// silently yields blank rows, which is exactly what happened.
export interface ActivityItem {
  id: string;
  type: string;
  text: string;
  sub: string;
  /** Positive event (accepted bid, completed job) — drives the emerald chip. */
  good: boolean;
  timestamp: string | null;
}
