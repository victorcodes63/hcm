import {
  Briefcase,
  Users,
  TrendingUp,
  Settings,
  ShoppingCart,
  Laptop,
  HeartPulse,
  Scale,
  Megaphone,
  Building2,
  GraduationCap,
  Wrench,
  Truck,
  BarChart2,
  Globe,
  Shield,
  FlaskConical,
  Hotel,
  Landmark,
  Hammer,
  type LucideIcon,
} from 'lucide-react';

/**
 * Maps a job category name to a relevant Lucide icon.
 * Matching is case-insensitive substring — first match wins.
 * Falls back to Briefcase for anything unrecognised.
 */
const CATEGORY_ICON_MAP: Array<{ keywords: string[]; icon: LucideIcon }> = [
  { keywords: ['executive', 'c-suite', 'director', 'leadership', 'management'], icon: Users },
  { keywords: ['human resource', 'hr', 'people', 'talent', 'recruitment', 'staffing'], icon: Users },
  { keywords: ['finance', 'accounting', 'account', 'audit', 'tax', 'treasury', 'payroll'], icon: Landmark },
  { keywords: ['technology', 'software', 'engineer', 'developer', 'it ', 'data', 'cyber', 'cloud', 'devops'], icon: Laptop },
  { keywords: ['marketing', 'brand', 'digital', 'social media', 'content', 'seo', 'growth'], icon: Megaphone },
  { keywords: ['sales', 'business development', 'revenue', 'account manager'], icon: TrendingUp },
  { keywords: ['operation', 'logistics', 'supply chain', 'warehouse', 'distribution'], icon: Truck },
  { keywords: ['procurement', 'purchasing', 'buying', 'sourcing', 'vendor', 'supply'], icon: ShoppingCart },
  { keywords: ['health', 'medical', 'clinical', 'nurse', 'doctor', 'pharma', 'hospital'], icon: HeartPulse },
  { keywords: ['legal', 'compliance', 'law', 'counsel', 'regulatory', 'paralegal'], icon: Scale },
  { keywords: ['education', 'training', 'teaching', 'academic', 'learning', 'instructor'], icon: GraduationCap },
  { keywords: ['engineering', 'mechanical', 'electrical', 'civil', 'structural'], icon: Wrench },
  { keywords: ['construction', 'architect', 'site', 'project manager'], icon: Hammer },
  { keywords: ['analytics', 'research', 'intelligence', 'insight', 'strategy'], icon: BarChart2 },
  { keywords: ['communications', 'public relation', 'pr', 'media'], icon: Globe },
  { keywords: ['security', 'safety', 'risk', 'guard'], icon: Shield },
  { keywords: ['science', 'laboratory', 'research', 'r&d', 'quality'], icon: FlaskConical },
  { keywords: ['hospitality', 'hotel', 'tourism', 'travel', 'events', 'catering'], icon: Hotel },
  { keywords: ['admin', 'office', 'secretary', 'receptionist', 'clerical'], icon: Building2 },
  { keywords: ['customer service', 'support', 'call centre', 'helpdesk'], icon: Settings },
];

export function getCategoryIcon(category: string): LucideIcon {
  const lower = category.toLowerCase();
  for (const entry of CATEGORY_ICON_MAP) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.icon;
    }
  }
  return Briefcase;
}
