import type { Timestamp } from "firebase-admin/firestore";

export type EventType = "vib" | "vibplus";
export type ApplicationStatus = "pending" | "accepted" | "rejected";
export type VerificationLevel = 0 | 1 | 2;
export type EventStatus = "draft" | "published" | "cancelled" | "completed";
export type NotificationType =
  | "application_received"
  | "application_accepted"
  | "application_rejected"
  | "new_message"
  | "address_revealed"
  | "event_reminder";

export type FireTimestamp = Timestamp | Date;

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  age: number;
  bio: string;
  interests: string[];
  verificationLevel: VerificationLevel;
  createdAt: FireTimestamp;
};

export type VibeEvent = {
  id: string;
  hostId: string;
  type: EventType;
  title: string;
  description: string;
  image: string;
  vibe: string;
  date: FireTimestamp;
  city: string;
  address: string;
  addressVisible: boolean;
  revealAt: FireTimestamp;
  maxParticipants: number;
  participants: string[];
  contributionAmount: number;
  contributionReason: string;
  minAge: number;
  maxAge: number;
  interestsRequired: string[];
  status: EventStatus;
  createdAt: FireTimestamp;
};

export type EventApplication = {
  id: string;
  eventId: string;
  userId: string;
  message: string;
  status: ApplicationStatus;
  createdAt: FireTimestamp;
};

export type ChatKind = "private" | "group";

export type Chat = {
  id: string;
  eventId: string;
  type: ChatKind;
  participantIds: string[];
  createdAt: FireTimestamp;
  updatedAt: FireTimestamp;
};

export type ChatMessage = {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: FireTimestamp;
};

export type AppNotification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  read: boolean;
  createdAt: FireTimestamp;
};

export type Report = {
  id: string;
  reporterId: string;
  targetUserId: string;
  reason: string;
  createdAt: FireTimestamp;
};

export type CreateEventInput = {
  title: string;
  description: string;
  image?: string;
  vibe: string;
  date: string;
  time: string;
  city: string;
  address: string;
  maxParticipants: number;
  minAge: number;
  maxAge: number;
  interestsRequired: string[];
  type: EventType;
  contributionAmount: number;
  contributionReason: string;
};
