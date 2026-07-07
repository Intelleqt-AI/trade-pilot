import { Building2, Coins, Zap, type LucideIcon } from 'lucide-react';

/** Stripe credit packages — ids map to backend package_id values. */
export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  perCredit: string;
  description: string;
  features: string[];
  icon: LucideIcon;
  popular: boolean;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'pkg_10',
    name: 'Starter',
    credits: 10,
    price: 10,
    perCredit: '1.00',
    description: 'For occasional jobs and getting started.',
    features: ['10 job credits', 'Standard support', 'Instant activation'],
    icon: Coins,
    popular: false,
  },
  {
    id: 'pkg_50',
    name: 'Professional',
    credits: 50,
    price: 45,
    perCredit: '0.90',
    description: 'For active trades winning work every week.',
    features: ['50 job credits', 'Priority lead alerts', 'Email support', 'Save 10%'],
    icon: Zap,
    popular: true,
  },
  {
    id: 'pkg_100',
    name: 'Business',
    credits: 100,
    price: 80,
    perCredit: '0.80',
    description: 'Best value for busy teams and companies.',
    features: ['100 job credits', 'Premium placement', 'Priority support', 'Save 20%'],
    icon: Building2,
    popular: false,
  },
];
