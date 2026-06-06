import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path = "/") {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://getvib.fr";
  return new URL(path, baseUrl).toString();
}
