// Envoi d'e-mail via l'API HTTP de Resend (pas de SDK : un simple fetch).
// Résilient : si RESEND_API_KEY n'est pas configurée, on ne jette pas d'erreur —
// l'appelant continue (la demande reste stockée en base pour le dashboard admin).

type SendArgs = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendArgs): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "GetVib <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY absente — e-mail non envoyé :", subject);
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });

    if (!res.ok) {
      console.error("[email] échec d'envoi :", res.status, await res.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("[email] erreur réseau :", error);
    return false;
  }
}

/** Adresse de l'administrateur GetVib — destinataire de toutes les notifs admin
 *  (réclamations, demandes de vérification, signalements…). */
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "jonathan@getvib.fr";
