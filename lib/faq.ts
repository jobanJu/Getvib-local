// Source unique de la FAQ GetVib — utilisée à la fois par la page /aide et par
// le bot du widget de support. Pas de JSX ici : juste de la donnée, importable
// côté serveur comme côté client. Les réponses sont volontairement courtes et
// factuelles ; tout ce qui dépasse part vers le mail (réponse sous 12h).

export type FaqItem = {
  id: string;
  /** Question — sert de titre dans /aide ET de libellé de bouton dans le chat */
  q: string;
  /** Réponse (texte simple) */
  a: string;
  /** Catégorie pour le regroupement dans /aide */
  category: FaqCategory;
  /** Mis en avant comme réponse rapide dans le bot du widget */
  top?: boolean;
};

export type FaqCategory = "Rejoindre une vibe" | "Organiser & Vib+" | "Compte & profil" | "Sécurité";

export const FAQ_CATEGORIES: FaqCategory[] = [
  "Rejoindre une vibe",
  "Organiser & Vib+",
  "Compte & profil",
  "Sécurité",
];

export const FAQ: FaqItem[] = [
  {
    id: "rejoindre",
    category: "Rejoindre une vibe",
    top: true,
    q: "Comment rejoindre une vibe ?",
    a: "Ouvre une vibe depuis « Découvrir », puis clique sur « Rejoindre la vibe » et envoie un petit message à l'hôte. C'est une candidature : une fois que l'hôte t'accepte, tu reçois l'adresse exacte et l'accès au chat de la soirée.",
  },
  {
    id: "adresse",
    category: "Rejoindre une vibe",
    q: "Pourquoi je ne vois pas l'adresse exacte ?",
    a: "Par sécurité, l'adresse précise n'est révélée qu'aux personnes acceptées par l'hôte. Avant validation, tu ne vois que la ville. Garde toujours cette adresse privée (commandement n°5).",
  },
  {
    id: "annuler",
    category: "Rejoindre une vibe",
    top: true,
    q: "Comment annuler ma participation ?",
    a: "Va sur ton profil, retrouve la vibe dans « Mes vibes » à venir et quitte-la. Préviens l'hôte le plus tôt possible via le chat : un désistement de dernière minute pénalise l'organisation.",
  },
  {
    id: "vibplus",
    category: "Organiser & Vib+",
    top: true,
    q: "C'est quoi une Vib+ ?",
    a: "Une Vib est gratuite et ouverte à tous. Une Vib+ peut demander une petite participation, toujours justifiée par l'hôte (matériel, traiteur, lieu…). Le montant et la raison sont affichés sur la vibe avant que tu candidates.",
  },
  {
    id: "creer",
    category: "Organiser & Vib+",
    q: "Comment organiser ma propre vibe ?",
    a: "Clique sur « Créer », remplis le thème, la date, le lieu, le nombre de places et les critères (âge, centres d'intérêt). Tu valides ensuite toi-même les candidatures reçues depuis ton profil.",
  },
  {
    id: "paiement",
    category: "Organiser & Vib+",
    q: "Comment se passe le paiement d'une Vib+ ?",
    a: "La participation se règle directement à l'hôte à ton arrivée (commandement n°11). GetVib ne prélève rien et ne stocke aucune donnée bancaire.",
  },
  {
    id: "verification",
    category: "Compte & profil",
    top: true,
    q: "Comment faire vérifier mon profil (badge « Le Jeune ») ?",
    a: "Depuis ton profil, envoie une photo de toi tenant une feuille manuscrite avec ton prénom, le mot « GetVib » et une coupe de champagne dessinée. On vérifie à la main pour écarter les faux profils : tu reçois le badge « Le Jeune » sous 48h.",
  },
  {
    id: "badges",
    category: "Compte & profil",
    q: "Comment débloquer des badges ?",
    a: "Les badges se débloquent automatiquement selon ton activité : première sortie, vibes organisées, amis, invités cumulés… Tu vois ta progression dans la section « Mes badges » de ton profil.",
  },
  {
    id: "supprimer-compte",
    category: "Compte & profil",
    q: "Comment supprimer mon compte ?",
    a: "Rends-toi dans « Réglages ». Si tu ne trouves pas l'option ou rencontres un souci, écris-nous via le bouton ci-dessous, on s'en occupe.",
  },
  {
    id: "signaler",
    category: "Sécurité",
    top: true,
    q: "Comment signaler un comportement déplacé ?",
    a: "Tu peux signaler un profil depuis sa page. GetVib applique une tolérance zéro : tout harcèlement ou comportement déplaçé entraîne une suspension immédiate. En cas d'urgence, contacte aussi les autorités.",
  },
  {
    id: "regles",
    category: "Sécurité",
    q: "Quelles sont les règles de la communauté ?",
    a: "Ce sont les 18 Commandements (notre Charte de Confiance) : majeurs uniquement, respect, discrétion, zéro drogue, profil authentique… Tu peux les consulter à tout moment sur la page Sécurité.",
  },
];

/** Réponses rapides affichées comme boutons dans le bot du widget. */
export const FAQ_TOP = FAQ.filter((f) => f.top);
