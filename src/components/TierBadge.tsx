import { Badge } from './ui/badge';
import { Crown, Zap, Star } from 'lucide-react';

interface TierBadgeProps {
  tier: 'free' | 'basic' | 'pro';
  showIcon?: boolean;
}

export function TierBadge({ tier, showIcon = true }: TierBadgeProps) {
  const config = {
    free: {
      label: 'Free',
      icon: Star,
      className: 'bg-gray-100 text-gray-700 border-gray-300',
    },
    basic: {
      label: 'Basic',
      icon: Zap,
      className: 'bg-blue-100 text-blue-700 border-blue-300',
    },
    pro: {
      label: 'Pro',
      icon: Crown,
      className: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-300',
    },
  };

  const { label, icon: Icon, className } = config[tier] || config.free;

  return (
    <Badge variant="outline" className={className}>
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {label}
    </Badge>
  );
}
