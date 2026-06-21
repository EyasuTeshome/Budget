import {
  Utensils,
  Car,
  Home,
  Gamepad2,
  ShoppingBag,
  Heart,
  Repeat,
  Wallet,
  TrendingUp,
  Clock,
  CreditCard,
  Landmark,
  PiggyBank,
  LineChart,
  Tag,
  Plane,
  GraduationCap,
  Gift,
  Smartphone,
  Coffee,
  type LucideIcon,
} from 'lucide-react';

export const ICONS: Record<string, LucideIcon> = {
  utensils: Utensils,
  car: Car,
  home: Home,
  gamepad: Gamepad2,
  bag: ShoppingBag,
  heart: Heart,
  repeat: Repeat,
  wallet: Wallet,
  'trending-up': TrendingUp,
  clock: Clock,
  card: CreditCard,
  bank: Landmark,
  piggy: PiggyBank,
  chart: LineChart,
  tag: Tag,
  plane: Plane,
  grad: GraduationCap,
  gift: Gift,
  phone: Smartphone,
  coffee: Coffee,
};

export const ICON_KEYS = Object.keys(ICONS);

export function getIcon(name: string): LucideIcon {
  return ICONS[name] ?? Tag;
}
