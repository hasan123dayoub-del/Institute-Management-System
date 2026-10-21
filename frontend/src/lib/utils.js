import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// cn("px-2", cond && "bg-primary", "px-4") -> merges class names and lets the last Tailwind class win.
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
