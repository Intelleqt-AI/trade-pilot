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

export function profileStrength(
  profile: Record<string, any> | null | undefined,
  creditBalance: number
): ProfileStrengthResult {
  const isProfileComplete = !!(
    profile?.first_name &&
    profile?.last_name &&
    profile?.trade_specialty &&
    profile?.postcode &&
    profile?.phone
  );
  const hasServicesSet = !!profile?.trade_specialty;
  const hasAreaSet = !!profile?.postcode;
  const hasCredits = creditBalance > 0;
  const isVerified = !!(profile?.has_insurance || profile?.has_license);

  const checks: ProfileCheck[] = [
    { key: 'profile', label: 'Complete your profile', done: isProfileComplete, route: '/trades-crm/profile', cta: 'Complete' },
    { key: 'services', label: 'Set your services & pricing', done: hasServicesSet, route: '/trades-crm/profile', cta: 'Set up' },
    { key: 'area', label: 'Define your service area', done: hasAreaSet, route: '/trades-crm/profile', cta: 'Add area' },
    { key: 'credits', label: 'Purchase credits', done: hasCredits, route: '/trades-crm/credits', cta: 'Buy now' },
    { key: 'certs', label: 'Add certifications', done: isVerified, route: '/trades-crm/profile', cta: 'Add' },
  ];

  const percent = Math.round(
    (checks.filter(c => c.done).length / checks.length) * 100
  );

  return { checks, percent };
}
