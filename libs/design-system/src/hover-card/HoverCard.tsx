import { HoverCard as MantineHoverCard, type HoverCardProps } from '@mantine/core';

/**
 * HoverCard component
 */
export function HoverCard(props: HoverCardProps) {
  return <MantineHoverCard transition="fade" radius="md" {...props} />;
}
HoverCard.Target = MantineHoverCard.Target;
HoverCard.Dropdown = MantineHoverCard.Dropdown;
