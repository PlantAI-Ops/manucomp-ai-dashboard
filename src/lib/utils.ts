import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MOCK_ID_PATTERNS = {
  employee: /^emp-\d+$/,
  role: /^role-\d+$/,
  competency: /^comp-\d+$/,
};

export function isMockId(id: string | null | undefined): boolean {
  if (!id) return false;
  return Object.values(MOCK_ID_PATTERNS).some((pattern) => pattern.test(id));
}
