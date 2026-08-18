import { useEffect } from 'react';
import { useTheme } from 'next-themes';

const LIGHT_FAVICON = '/tradepilot-lightmood-icon.jpg';
const DARK_FAVICON = '/tradepilot-darkmood-icon.jpg';

/** Swaps the browser-tab favicon to match the resolved theme — a static
 *  <link> tag can't react to the `dark` class the way CSS can. */
export function useFaviconTheme() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) return;
    link.href = resolvedTheme === 'dark' ? DARK_FAVICON : LIGHT_FAVICON;
  }, [resolvedTheme]);
}
