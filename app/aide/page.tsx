import { LifeBuoy, ChevronDown } from "lucide-react";
import { FAQ, FAQ_CATEGORIES } from "@/lib/faq";
import { SupportPanel } from "@/components/support/support-panel";

export const metadata = {
  title: "Centre d'aide · GetVib",
  description: "Trouvez en un instant la réponse à vos questions sur GetVib.",
};

export default function AidePage() {
  return (
    <section className="mx-auto grid max-w-3xl gap-8 px-4 py-8 sm:px-6 lg:px-8 animate-fade-in-up">
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-sm font-bold text-accent">
          <LifeBuoy className="h-4 w-4" />
          Centre d&#39;aide
        </div>
        <h1 className="text-4xl font-black tracking-tight">Comment pouvons-nous t&#39;aider ?</h1>
        <p className="mx-auto max-w-xl text-muted">
          Les réponses aux questions les plus fréquentes. Tu ne trouves pas ton bonheur ? Écris-nous, on répond sous 12h.
        </p>
      </div>

      {FAQ_CATEGORIES.map((category) => {
        const items = FAQ.filter((f) => f.category === category);
        if (items.length === 0) return null;
        return (
          <div key={category} className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">{category}</h2>
            <div className="grid gap-2">
              {items.map((item) => (
                <details
                  key={item.id}
                  className="group rounded-2xl border border-foreground/10 bg-card/50 px-4 open:border-accent/30"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 font-semibold text-foreground marker:hidden">
                    {item.q}
                    <ChevronDown className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="pb-4 text-sm leading-relaxed text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        );
      })}

      <div className="mt-2">
        <SupportPanel />
      </div>
    </section>
  );
}
