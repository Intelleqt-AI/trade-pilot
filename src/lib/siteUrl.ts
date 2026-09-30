// The public marketing site (tradepilot-landingpage). Homeowners arrive from it —
// "Compare up to 3 quotes" deep-links here — so it is also where we send them back
// after they delete their account: /login is trader-only since Phase 9.
//
// Mirrors how the landing site resolves APP_URL in reverse, so local development
// never bounces to production. Vite exposes import.meta.env, not process.env.
export const MARKETING_URL =
  import.meta.env.VITE_MARKETING_URL ||
  (import.meta.env.DEV ? 'http://localhost:3000' : 'https://www.mytradepilot.io');
