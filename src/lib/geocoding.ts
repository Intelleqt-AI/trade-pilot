export type LatLng = { lat: number; lng: number };

export async function postcodeToLatLng(pc: string): Promise<LatLng | null> {
  const cleaned = (pc || '').trim().replace(/\s+/g, '').toUpperCase();
  if (!cleaned) return null;
  try {
    const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(cleaned)}`);
    if (res.ok) {
      const body = await res.json();
      const r = body?.result;
      if (r && typeof r.latitude === 'number' && typeof r.longitude === 'number') {
        return { lat: r.latitude, lng: r.longitude };
      }
    }
  } catch {
    // ignore
  }
  try {
    const outward = cleaned.length > 3 ? cleaned.slice(0, -3) : cleaned;
    const res2 = await fetch(`https://api.postcodes.io/outcodes/${encodeURIComponent(outward)}`);
    if (!res2.ok) return null;
    const body = await res2.json();
    const r = body?.result;
    if (r && typeof r.latitude === 'number' && typeof r.longitude === 'number') {
      return { lat: r.latitude, lng: r.longitude };
    }
    return null;
  } catch {
    return null;
  }
}

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<{ address?: string; postcode?: string; city?: string } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } },
    );
    if (!res.ok) return null;
    const body = await res.json();
    const addr = body?.address || {};
    return {
      address: body?.display_name,
      postcode: addr.postcode,
      city: addr.city ?? addr.town ?? addr.village ?? addr.suburb,
    };
  } catch {
    return null;
  }
}
