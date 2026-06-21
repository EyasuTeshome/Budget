/* eslint-disable react-hooks/static-components -- icon is selected from a fixed registry by name, not created per render */
import { getIcon } from '../lib/icons';

export function CategoryIcon({
  name,
  size,
  strokeWidth,
  className,
}: {
  name: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const Icon = getIcon(name);
  return <Icon size={size} strokeWidth={strokeWidth} className={className} />;
}
