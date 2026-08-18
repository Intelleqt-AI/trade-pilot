import { useState } from 'react';
import { Home, BedDouble, Bath } from 'lucide-react';
import { formatAnswerKey } from '@/lib/jobQuestions';

export interface PropertyDetail {
  name?: string | null;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  year_built?: number | null;
  epc_band?: string | null;
  heating_type?: string | null;
  wall_construction?: string | null;
  tenure?: string | null;
  council_tax_band?: string | null;
  cover_image_url?: string | null;
}

/** Shared property profile card used across job/bid/lead detail drawers. */
export function PropertyCard({ detail }: { detail: PropertyDetail }) {
  const [imageFailed, setImageFailed] = useState(false);
  const extras: string[] = [];
  if (detail.year_built) extras.push(`Built ${detail.year_built}`);
  if (detail.epc_band) extras.push(`EPC ${detail.epc_band}`);
  if (detail.heating_type) extras.push(formatAnswerKey(detail.heating_type));
  if (detail.wall_construction) extras.push(`${formatAnswerKey(detail.wall_construction)} walls`);
  if (detail.tenure) extras.push(formatAnswerKey(detail.tenure));
  if (detail.council_tax_band) extras.push(`Council tax ${detail.council_tax_band}`);

  return (
    <div className="space-y-2">
      {detail.cover_image_url && !imageFailed && (
        <img
          src={detail.cover_image_url}
          alt="Property"
          className="h-32 w-full rounded-lg border object-cover"
          onError={() => setImageFailed(true)}
        />
      )}
      <div className="flex flex-wrap gap-4 rounded-lg bg-muted px-3.5 py-3 text-[13px] text-foreground">
        <span className="inline-flex items-center gap-1.5 capitalize">
          <Home className="h-[15px] w-[15px]" />
          {detail.property_type.replace('_', ' ')}
        </span>
        {detail.bedrooms > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <BedDouble className="h-[15px] w-[15px]" />
            <span className="font-mono tabular-nums">{detail.bedrooms}</span> bed
          </span>
        )}
        {detail.bathrooms > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <Bath className="h-[15px] w-[15px]" />
            <span className="font-mono tabular-nums">{detail.bathrooms}</span> bath
          </span>
        )}
      </div>
      {extras.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {extras.map(e => (
            <span
              key={e}
              className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
            >
              {e}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
