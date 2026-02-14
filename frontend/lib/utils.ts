import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes safely.
 * Combines clsx for conditional classes with tailwind-merge
 * to resolve conflicting utilities (e.g., `p-4 p-2` → `p-2`).
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
