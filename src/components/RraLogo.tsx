import '../styles/rra-brand.css';

type RraLogoVariant = 'primary' | 'compact' | 'compactReversed' | 'orange' | 'icon' | 'appIcon';
type RraLogoSize = 'sm' | 'md' | 'lg' | 'xl';

interface RraLogoProps {
  variant?: RraLogoVariant;
  size?: RraLogoSize;
  className?: string;
}

const LOGO_MAP: Record<RraLogoVariant, string> = {
  primary:         `${import.meta.env.BASE_URL}brand/orra-logo-full.png`,
  compact:         `${import.meta.env.BASE_URL}brand/orra-logo-full.png`,
  compactReversed: `${import.meta.env.BASE_URL}brand/orra-logo-full.png`,
  orange:          `${import.meta.env.BASE_URL}brand/orra-logo-full.png`,
  icon:            `${import.meta.env.BASE_URL}brand/orra-icon.png`,
  appIcon:         `${import.meta.env.BASE_URL}brand/orra-icon.png`,
};

export const RraLogo = ({ variant = 'compact', size = 'md', className = '' }: RraLogoProps): JSX.Element => {
  const isIcon = variant === 'icon' || variant === 'appIcon';
  const classes = [
    'rra-logo',
    `rra-logo--${size}`,
    isIcon ? 'rra-logo--icon' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} aria-label='RRA — Workplace Ordering, Simplified'>
      <img
        src={LOGO_MAP[variant]}
        alt='RRA — Workplace Ordering, Simplified'
        loading='eager'
        decoding='async'
      />
    </span>
  );
};

export default RraLogo;
