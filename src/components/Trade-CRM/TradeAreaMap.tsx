import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, Search, AlertTriangle, LocateFixed } from 'lucide-react';
import { postcodeToLatLng, reverseGeocode } from '@/lib/geocoding';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const UK_CENTER: [number, number] = [54.5, -2.0];
// Generous bounds that keep the view within UK + surrounding waters
const UK_BOUNDS: L.LatLngBoundsExpression = [[49.0, -11.0], [62.0, 4.0]];

function isWithinUK(lat: number, lng: number): boolean {
  return lat >= 49.5 && lat <= 61.5 && lng >= -8.7 && lng <= 2.1;
}

type Suggestion = {
  display_name: string;
  lat: number;
  lng: number;
  postcode?: string;
};

export type LocationChange = {
  lat: number;
  lng: number;
  postcode?: string;
  address?: string;
};

interface Props {
  lat: number | null;
  lng: number | null;
  radiusKm: number;
  postcode?: string;
  onLocationChange: (change: LocationChange) => void;
}

function FitRadius({ lat, lng, radiusKm }: { lat: number | null; lng: number | null; radiusKm: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat !== null && lng !== null) {
      const bounds = L.latLng(lat, lng).toBounds(radiusKm * 2000);
      map.fitBounds(bounds, { padding: [32, 32], animate: true, maxZoom: 13 });
    }
  }, [lat, lng, radiusKm, map]);
  return null;
}

async function searchPlaces(query: string): Promise<Suggestion[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=gb&q=${encodeURIComponent(q)}&addressdetails=1&limit=8`,
      { headers: { 'Accept-Language': 'en' } },
    );
    if (!res.ok) return [];
    const body = await res.json();
    if (!Array.isArray(body)) return [];
    return body.map((r: any) => ({
      display_name: r.display_name as string,
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      postcode: r.address?.postcode as string | undefined,
    }));
  } catch {
    return [];
  }
}

const TradeAreaMap = ({ lat, lng, radiusKm, postcode, onLocationChange }: Props) => {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [outsideUK, setOutsideUK] = useState(false);
  const [locating, setLocating] = useState(false);
  const lastLookedUp = useRef<string>('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (search.trim().length < 3) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const id = setTimeout(async () => {
      const results = await searchPlaces(search);
      setSuggestions(results);
      setLoading(false);
    }, 450);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-look-up when postcode prop changes
  useEffect(() => {
    const pc = (postcode || '').trim();
    const normalized = pc.replace(/\s+/g, '').toUpperCase();
    if (!pc || normalized === lastLookedUp.current) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      postcodeToLatLng(pc).then(res => {
        if (cancelled || !res) return;
        lastLookedUp.current = normalized;
        setOutsideUK(false);
        onLocationChange({ lat: res.lat, lng: res.lng, postcode: pc });
      });
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postcode]);

  const handlePickSuggestion = (s: Suggestion) => {
    setSearch(s.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
    if (!isWithinUK(s.lat, s.lng)) {
      setOutsideUK(true);
      return;
    }
    setOutsideUK(false);
    if (s.postcode) {
      lastLookedUp.current = s.postcode.replace(/\s+/g, '').toUpperCase();
    }
    onLocationChange({ lat: s.lat, lng: s.lng, postcode: s.postcode, address: s.display_name });
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude } = pos.coords;
        setLocating(false);
        if (!isWithinUK(latitude, longitude)) {
          setOutsideUK(true);
          return;
        }
        setOutsideUK(false);
        const rev = await reverseGeocode(latitude, longitude);
        if (rev?.postcode) {
          lastLookedUp.current = rev.postcode.replace(/\s+/g, '').toUpperCase();
        }
        onLocationChange({ lat: latitude, lng: longitude, postcode: rev?.postcode, address: rev?.address });
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const center: [number, number] = lat !== null && lng !== null ? [lat, lng] : UK_CENTER;
  const zoom = lat !== null && lng !== null ? 11 : 6;

  return (
    <div className="space-y-2">
      <div ref={wrapperRef} className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setShowSuggestions(true); setOutsideUK(false); }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search address, street, postcode or city…"
              className="w-full pl-9 pr-9 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              autoComplete="off"
            />
            {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />}
          </div>
          <button
            type="button"
            onClick={handleCurrentLocation}
            disabled={locating}
            title="Use my current location"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50 shrink-0"
          >
            {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4 text-primary" />}
            <span className="hidden sm:inline">My location</span>
          </button>
        </div>

        {outsideUK && (
          <div className="flex items-center gap-2 mt-1.5 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            Please select an address within the UK. This service only operates in the UK.
          </div>
        )}

        {showSuggestions && !outsideUK && (suggestions.length > 0 || (loading && search.trim().length >= 3)) && (
          <div className="absolute z-[1000] mt-1 w-full bg-background border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {loading && suggestions.length === 0 && (
              <div className="px-3 py-2 text-xs text-muted-foreground">Searching…</div>
            )}
            {suggestions.map((s, i) => (
              <button
                type="button"
                key={`${s.lat}-${s.lng}-${i}`}
                onClick={() => handlePickSuggestion(s)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted border-b border-border last:border-b-0"
              >
                {s.display_name}
              </button>
            ))}
            {!loading && suggestions.length === 0 && search.trim().length >= 3 && (
              <div className="px-3 py-2 text-xs text-muted-foreground">No matches</div>
            )}
          </div>
        )}

        {!outsideUK && (
          <p className="text-xs text-muted-foreground mt-1">
            Drag the pin to fine-tune your location. The circle shows your job search radius.
          </p>
        )}
      </div>

      <div className="h-72 w-full rounded-lg overflow-hidden border border-border">
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom
          maxBounds={UK_BOUNDS}
          maxBoundsViscosity={1.0}
          minZoom={5}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {lat !== null && lng !== null && (
            <>
              <Circle
                center={[lat, lng]}
                radius={radiusKm * 1000}
                pathOptions={{ color: '#6366f1', fillColor: '#6366f1', fillOpacity: 0.12, weight: 2 }}
              />
              <Marker
                draggable
                position={[lat, lng]}
                icon={defaultIcon}
                eventHandlers={{
                  async dragend(e) {
                    const p = (e.target as L.Marker).getLatLng();
                    if (!isWithinUK(p.lat, p.lng)) {
                      setOutsideUK(true);
                      // Snap marker back to last valid position
                      (e.target as L.Marker).setLatLng([lat!, lng!]);
                      return;
                    }
                    setOutsideUK(false);
                    const rev = await reverseGeocode(p.lat, p.lng);
                    if (rev?.postcode) {
                      lastLookedUp.current = rev.postcode.replace(/\s+/g, '').toUpperCase();
                    }
                    onLocationChange({
                      lat: p.lat,
                      lng: p.lng,
                      postcode: rev?.postcode,
                      address: rev?.address,
                    });
                  },
                }}
              />
            </>
          )}
          <FitRadius lat={lat} lng={lng} radiusKm={radiusKm} />
        </MapContainer>
      </div>
    </div>
  );
};

export default TradeAreaMap;
