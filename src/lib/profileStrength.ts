/**
 * Profile-strength checklist shared by the Dashboard and My Profile screens.
 * Derived from real profile fields (previously inlined in Dashboard.tsx).
 */

export interface ProfileCheck {
  key: string;
  label: string;
  done: boolean;
  route: string;
  cta: string;
}

export interface ProfileStrengthResult {
  checks: ProfileCheck[];
  percent: number;
}

export interface ProfileStrengthInputs {
  /** True when the trader has added ≥1 service (real TradeService rows). */
  hasService?: boolean;
  /** True when the trader has uploaded ≥1 certification document. */
  hasCertificationDoc?: boolean;
}

export function profileStrength(
  profile: Record<string, any> | null | undefined,
  creditBalance: number,
  { hasService = false, hasCertificationDoc = false }: ProfileStrengthInputs = {}
): ProfileStrengthResult {
  const isProfileComplete = !!(
    profile?.first_name &&
    profile?.last_name &&
    profile?.trade_specialty &&
    profile?.postcode &&
    profile?.phone
  );
  const hasAreaSet = !!profile?.postcode;
  const hasCredits = creditBalance > 0;

  const checks: ProfileCheck[] = [
    { key: 'profile', label: 'Complete your profile', done: isProfileComplete, route: '/trades-crm/profile', cta: 'Complete' },
    { key: 'services', label: 'Set your services & pricing', done: hasService, route: '/trades-crm/profile', cta: 'Set up' },
    { key: 'area', label: 'Define your service area', done: hasAreaSet, route: '/trades-crm/profile', cta: 'Add area' },
    { key: 'credits', label: 'Purchase credits', done: hasCredits, route: '/trades-crm/credits', cta: 'Buy now' },
    { key: 'certs', label: 'Add certifications', done: hasCertificationDoc, route: '/trades-crm/profile', cta: 'Add' },
  ];

  const percent = Math.round(
    (checks.filter(c => c.done).length / checks.length) * 100
  );

  return { checks, percent };
}
