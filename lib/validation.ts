import type { CreateEventInput, EventType } from "@/lib/types";

export function parseString(value: unknown, label: string, max = 240) {
  const text = String(value || "").trim();
  if (!text) throw new Error(`${label} is required.`);
  if (text.length > max) throw new Error(`${label} is too long.`);
  return text;
}

export function parseNumber(value: unknown, label: string, min = 0, max = 9999) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) {
    throw new Error(`${label} is invalid.`);
  }
  return number;
}

export function parseEventType(value: unknown): EventType {
  if (value === "vib" || value === "vibplus") return value;
  throw new Error("Invalid event type.");
}

export function parseStringList(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean).slice(0, 12);
  }
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export function parseCreateEventInput(body: Record<string, unknown>): CreateEventInput {
  const type = parseEventType(body.type);
  const contributionAmount = parseNumber(body.contributionAmount ?? 0, "Contribution amount", 0, 500);

  if (type === "vib" && contributionAmount > 0) {
    throw new Error("Vib events must remain free.");
  }

  return {
    title: parseString(body.title, "Title", 90),
    description: parseString(body.description, "Description", 1200),
    image: String(body.image || "").trim(),
    vibe: parseString(body.vibe, "Vibe", 60),
    date: parseString(body.date, "Date", 16),
    time: parseString(body.time, "Time", 8),
    city: parseString(body.city, "City", 80),
    address: parseString(body.address, "Address", 180),
    maxParticipants: parseNumber(body.maxParticipants, "Max participants", 2, 30),
    minAge: parseNumber(body.minAge, "Minimum age", 18, 99),
    maxAge: parseNumber(body.maxAge, "Maximum age", 18, 99),
    interestsRequired: parseStringList(body.interestsRequired),
    type,
    contributionAmount,
    contributionReason: contributionAmount > 0 ? parseString(body.contributionReason, "Contribution reason", 120) : "",
  };
}
