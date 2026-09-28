export type SignupAs = 'trade' | 'customer';

export interface SocialSignup {
  signup_token: string;
  provider: 'google' | 'apple';
  email: string;
  first_name: string;
  last_name: string;
}

/** `data` of a social login response: either a signed-in user, or a new identity that must finish signup. */
export interface SocialAuthResult extends Partial<SocialSignup> {
  needs_registration?: boolean;
  user?: { user_type?: string };
}

export const providerLabel = (provider?: string) => (provider === 'apple' ? 'Apple' : 'Google');

export const homePathFor = (user?: { user_type?: string } | null) =>
  user?.user_type === 'trade' ? '/trades-crm' : '/dashboard';

const first = (v: unknown) => (Array.isArray(v) ? v[0] : v);

export const authErrorMessage = (err: any, fallback: string): string => {
  const data = err?.response?.data;
  const errors: Record<string, unknown> = data?.errors ?? {};
  const preferred = first(errors.detail) || first(errors.non_field_errors) || first(errors.signup_token);
  if (preferred) return String(preferred);
  const field = Object.entries(errors).find(([, v]) => first(v));
  if (field) {
    const label = field[0].replace(/_/g, ' ');
    return `${label.charAt(0).toUpperCase()}${label.slice(1)}: ${first(field[1])}`;
  }
  return data?.message || fallback;
};
