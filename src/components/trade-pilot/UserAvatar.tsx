import { cva, type VariantProps } from 'class-variance-authority';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const avatarVariants = cva(
  'relative inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold',
  {
    variants: {
      tone: {
        brand: 'bg-teal-50 text-teal-700',
        navy: 'bg-navy-700 text-white',
        neutral: 'bg-gray-100 text-gray-600',
        accent: 'bg-orange-50 text-orange-600',
      },
      size: {
        xs: 'h-6 w-6 text-[10px]',
        sm: 'h-8 w-8 text-[11px]',
        md: 'h-10 w-10 text-[13px]',
        lg: 'h-14 w-14 text-lg',
        xl: 'h-[76px] w-[76px] text-2xl',
      },
    },
    defaultVariants: { tone: 'brand', size: 'md' },
  }
);

interface UserAvatarProps extends VariantProps<typeof avatarVariants> {
  name?: string;
  src?: string | null;
  verified?: boolean;
  className?: string;
}

function initialsOf(name?: string): string {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/** Initials avatar with an optional teal verified check badge. */
export function UserAvatar({
  name,
  src,
  tone,
  size,
  verified = false,
  className,
}: UserAvatarProps) {
  return (
    <span className={cn(avatarVariants({ tone, size }), className)}>
      {src ? (
        <img
          src={src}
          alt={name ?? ''}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        initialsOf(name)
      )}
      {verified && (
        <span className="absolute -bottom-0.5 -right-0.5 inline-flex h-[38%] min-h-[14px] w-[38%] min-w-[14px] items-center justify-center rounded-full border-2 border-white bg-primary text-white">
          <Check className="h-[70%] w-[70%]" strokeWidth={3.2} />
        </span>
      )}
    </span>
  );
}
