/** Storage options for admin variation rows: 32GB through 2TB */
export const STORAGE_OPTIONS = [
  '32GB',
  '64GB',
  '128GB',
  '256GB',
  '512GB',
  '1TB',
  '2TB',
] as const;

export type StorageOption = (typeof STORAGE_OPTIONS)[number];
