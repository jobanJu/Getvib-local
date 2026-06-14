import { redirect } from "next/navigation";
import { requireAdminEmailPage, isUnlocked } from "@/lib/admin";
import { Card } from "@/components/ui/card";
import { AdminUnlockForm } from "@/features/admin/admin-unlock-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Déverrouillage admin · GetVib" };

export default async function AdminUnlockPage() {
  await requireAdminEmailPage();
  if (await isUnlocked()) redirect("/admin");

  return (
    <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-sm content-center px-4 py-8">
      <Card className="p-6">
        <h1 className="text-2xl font-black">🔒 Back-office verrouillé</h1>
        <p className="mt-2 text-sm text-muted">
          Saisis les <strong>deux mots de passe</strong> administrateur pour déverrouiller l&#39;accès.
        </p>
        <AdminUnlockForm />
      </Card>
    </section>
  );
}
