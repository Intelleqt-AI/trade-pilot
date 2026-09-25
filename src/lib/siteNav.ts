// Shared header navigation data. Trade pages are listed in the same order as the
// "Browse our most popular categories" grid on the home page.
export const TRADE_PAGES = [
  { label: "Plumbers", href: "/plumbers" },
  { label: "Electricians", href: "/electricians" },
  { label: "Builders", href: "/builders" },
  { label: "Roofers", href: "/roofers" },
  { label: "Painters & Decorators", href: "/painters-decorators" },
  { label: "Kitchen Fitters", href: "/kitchen-fitters" },
  { label: "Gas & Boiler Engineers", href: "/gas-engineers" },
  { label: "Carpenters & Joiners", href: "/carpenters" },
] as const;

// Flip to true once /areas/reading is live (w/c 5 Oct).
export const SHOW_AREAS_LINK = false;
export const AREAS_HREF = "/areas/reading";

// Footer "Homeowners" column order (differs from the header dropdown, which follows the home page grid).
export const FOOTER_TRADE_PAGES = [
  { label: "Plumbers", href: "/plumbers" },
  { label: "Electricians", href: "/electricians" },
  { label: "Gas & Boiler Engineers", href: "/gas-engineers" },
  { label: "Builders", href: "/builders" },
  { label: "Roofers", href: "/roofers" },
  { label: "Painters & Decorators", href: "/painters-decorators" },
  { label: "Kitchen Fitters", href: "/kitchen-fitters" },
  { label: "Carpenters & Joiners", href: "/carpenters" },
] as const;

// Apps page and the QR code shown in the header "Apps" pop-out.
export const APPS_PATH = "/apps";

// TEMP: the QR code currently opens the home page so it can be tested.
// Switch this to `${window.location.origin}${APPS_PATH}` when the apps page is ready to be scanned.
export const getAppsQrUrl = () => `${window.location.origin}/`;
