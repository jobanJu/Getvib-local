// Moteur de badges GetVib — purement logique (pas de JSX) pour être importable
// côté serveur comme client. Les badges sont DÉRIVÉS des stats du profil : on ne
// les stocke pas en base, on les recalcule, ce qui évite toute désynchronisation.

export type BadgeStats = {
  /** verification_level du profil (0 = non vérifié) */
  verificationLevel: number;
  /** Nombre total de vibes organisées */
  eventsHosted: number;
  /** Nombre de vibes Vib+ organisées */
  vibPlusHosted: number;
  /** Invités cumulés sur l'ensemble des vibes organisées */
  totalGuests: number;
  /** Vibes rejointes (à venir + passées) */
  eventsAttended: number;
  /** Nombre d'amis */
  friends: number;
};

// Palier visuel — pilote la couleur/le glow dans l'UI.
export type BadgeTier = "verified" | "bronze" | "silver" | "gold" | "premium";

export type BadgeDef = {
  id: string;
  /** Nom original affiché */
  name: string;
  description: string;
  /** Clé d'icône lucide (résolue dans le composant d'affichage) */
  icon: string;
  tier: BadgeTier;
  /** Condition d'obtention */
  earned: (s: BadgeStats) => boolean;
  /** Progression vers l'obtention (pour les badges à seuil) */
  progress?: (s: BadgeStats) => { current: number; target: number };
};

export const BADGES: BadgeDef[] = [
  {
    id: "le-jeune",
    name: "Le Jeune",
    description: "Profil vérifié, 100 % authentique. Bienvenue dans la vibe.",
    icon: "ShieldCheck",
    tier: "verified",
    earned: (s) => s.verificationLevel >= 1,
  },
  {
    id: "premiere-sortie",
    name: "La Première Sortie",
    description: "Tu as rejoint ta toute première vibe.",
    icon: "PartyPopper",
    tier: "bronze",
    earned: (s) => s.eventsAttended >= 1,
    progress: (s) => ({ current: Math.min(s.eventsAttended, 1), target: 1 }),
  },
  {
    id: "hote-etoile",
    name: "L'Hôte Étoilé",
    description: "Tu as organisé ta première vibe. Le début d'une légende.",
    icon: "Sparkles",
    tier: "bronze",
    earned: (s) => s.eventsHosted >= 1,
    progress: (s) => ({ current: Math.min(s.eventsHosted, 1), target: 1 }),
  },
  {
    id: "le-noctambule",
    name: "Le Noctambule",
    description: "10 vibes à ton actif. La nuit n'a plus de secret pour toi.",
    icon: "Moon",
    tier: "silver",
    earned: (s) => s.eventsAttended >= 10,
    progress: (s) => ({ current: Math.min(s.eventsAttended, 10), target: 10 }),
  },
  {
    id: "le-connecteur",
    name: "Le Connecteur",
    description: "10 amis dans ta bande. Tu fais vibrer la communauté.",
    icon: "HeartHandshake",
    tier: "silver",
    earned: (s) => s.friends >= 10,
    progress: (s) => ({ current: Math.min(s.friends, 10), target: 10 }),
  },
  {
    id: "le-pilier",
    name: "Le Pilier",
    description: "5 vibes organisées. La communauté compte sur toi.",
    icon: "Flame",
    tier: "silver",
    earned: (s) => s.eventsHosted >= 5,
    progress: (s) => ({ current: Math.min(s.eventsHosted, 5), target: 5 }),
  },
  {
    id: "initie",
    name: "L'Initié",
    description: "Tu as ouvert ta première vibe Vib+. Accès au cercle privé.",
    icon: "Diamond",
    tier: "premium",
    earned: (s) => s.vibPlusHosted >= 1,
  },
  {
    id: "aimant-foule",
    name: "L'Aimant à Foule",
    description: "100 invités cumulés sur tes vibes. Une vraie star.",
    icon: "Users",
    tier: "gold",
    earned: (s) => s.totalGuests >= 100,
    progress: (s) => ({ current: Math.min(s.totalGuests, 100), target: 100 }),
  },
  {
    id: "legende-fete",
    name: "La Légende de la Fête",
    description: "20 vibes au compteur. Tu es entré dans l'histoire de GetVib.",
    icon: "Crown",
    tier: "gold",
    earned: (s) => s.eventsHosted >= 20,
    progress: (s) => ({ current: Math.min(s.eventsHosted, 20), target: 20 }),
  },
];

export type EarnedBadge = Omit<BadgeDef, "progress"> & {
  unlocked: boolean;
  progress?: { current: number; target: number };
};

/** Calcule l'état (débloqué + progression) de tous les badges pour un profil. */
export function computeBadges(stats: BadgeStats): EarnedBadge[] {
  return BADGES.map((b) => ({
    ...b,
    unlocked: b.earned(stats),
    progress: b.progress?.(stats),
  }));
}
