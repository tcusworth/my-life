export const DEFAULT_AREAS = [
  "CSI",
  "OPAcommunity",
  "Daily AI Productivity",
  "Flatirons Creative Studio",
  "Personal",
] as const;

export type DefaultAreaName = (typeof DEFAULT_AREAS)[number];
