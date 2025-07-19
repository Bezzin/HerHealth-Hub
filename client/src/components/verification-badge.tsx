import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Shield, CheckCircle2, Award, GraduationCap } from "lucide-react";

interface VerificationBadgeProps {
  type: 'verified' | 'gmc' | 'specialist' | 'experience';
  value?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function VerificationBadge({ type, value, size = 'md' }: VerificationBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const badges = {
    verified: {
      icon: CheckCircle2,
      label: 'Verified Doctor',
      tooltip: 'Identity and qualifications verified by HerHealth Hub',
      className: 'bg-green-100 text-green-800 border-green-200'
    },
    gmc: {
      icon: Shield,
      label: value || 'GMC Registered',
      tooltip: 'Registered with the General Medical Council',
      className: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    specialist: {
      icon: Award,
      label: 'Specialist',
      tooltip: 'Board-certified specialist in women\'s health',
      className: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    experience: {
      icon: GraduationCap,
      label: value || '10+ Years',
      tooltip: 'Extensive clinical experience',
      className: 'bg-amber-100 text-amber-800 border-amber-200'
    }
  };

  const badge = badges[type];
  const Icon = badge.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`${badge.className} ${sizeClasses[size]} flex items-center gap-1 font-medium`}
          >
            <Icon className={iconSizes[size]} />
            <span>{badge.label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{badge.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}