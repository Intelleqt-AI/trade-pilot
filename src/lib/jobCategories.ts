// category + trade only — used for filter UI (no questions needed)
export const JOB_CATEGORIES: { category: string; trade: string }[] = [
  { category: 'Boilers', trade: 'Plumbing' },
  { category: 'Radiators', trade: 'Plumbing' },
  { category: 'Appliances', trade: 'Plumbing' },
  { category: 'Fixtures', trade: 'Plumbing' },
  { category: 'Pipework, taps & drainage', trade: 'Plumbing' },

  { category: 'Boilers (gas)', trade: 'Gas Engineer' },
  { category: 'Gas hobs, cookers & ovens', trade: 'Gas Engineer' },
  { category: 'Gas fires & flues', trade: 'Gas Engineer' },
  { category: 'Gas safety certificates (CP12)', trade: 'Gas Engineer' },
  { category: 'Gas leaks & emergency', trade: 'Gas Engineer' },
  { category: 'Gas pipework', trade: 'Gas Engineer' },

  { category: 'Pitched roof repairs', trade: 'Roofing' },
  { category: 'Full or partial reroof', trade: 'Roofing' },
  { category: 'Flat roof', trade: 'Roofing' },
  { category: 'Gutters, fascias & soffits', trade: 'Roofing' },
  { category: 'Chimney work', trade: 'Roofing' },
  { category: 'Roof windows / skylights', trade: 'Roofing' },
  { category: 'Lead work & flashing', trade: 'Roofing' },
  { category: 'Moss removal & roof cleaning', trade: 'Roofing' },

  { category: 'Fuse board (Consumer unit)', trade: 'Electrical' },
  { category: 'Lighting', trade: 'Electrical' },
  { category: 'Sockets & switches', trade: 'Electrical' },
  { category: 'Rewiring & cabling', trade: 'Electrical' },
  { category: 'EV chargers', trade: 'Electrical' },
  { category: 'Testing & certificates', trade: 'Electrical' },
  { category: 'Appliances & hardwired equipment', trade: 'Electrical' },
  { category: 'Smart home & networking', trade: 'Electrical' },
];

// maps trade_specialty (lowercase) → categoryConfig trade label
const SPECIALTY_TO_TRADE: Record<string, string> = {
  plumber: 'Plumbing',
  electrician: 'Electrical',
  'gas engineer': 'Gas Engineer',
  gas_engineer: 'Gas Engineer',
  roofer: 'Roofing',
};

export function getCategoriesForSpecialty(specialty: string | undefined): string[] {
  if (!specialty) return [];
  const trade = SPECIALTY_TO_TRADE[specialty.trim().toLowerCase()];
  if (!trade) return [];
  return JOB_CATEGORIES.filter(c => c.trade === trade).map(c => c.category);
}
