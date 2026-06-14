"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

import { Camera, Loader2, Plus } from "lucide-react";
import { AVAILABLE_CITIES, CITIES_BY_REGION } from "@/lib/constants";

type Props = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>("France");
  const supabase = createClient();

  const citiesInRegion = CITIES_BY_REGION[selectedRegion as keyof typeof CITIES_BY_REGION] || [];

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  async function handleGoogleLogin() {
    setMessage("Connexion Google...");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/discover`
      }
    });
    if (error) {
      setMessage(`Erreur Google: ${error.message}`);
    }
  }

  async function submit(formData: FormData) {
    setLoading(true);
    setMessage("Vérification...");
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    try {
      if (mode === "signup") {
        const firstName = String(formData.get("firstName") || "");
        const lastName = String(formData.get("lastName") || "");
        const region = String(formData.get("region") || "France");
        const city = String(formData.get("city") || "");
        const age = Number(formData.get("age") || 0);
        const fullName = `${firstName} ${lastName}`.trim();

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: fullName,
              first_name: firstName,
              last_name: lastName,
              region: region,
              city: city,
              age: age
            }
          }
        });

        if (error) throw error;

        // Gestion de la photo si présente
        if (data.user) {
          const updates: any = { 
            name: fullName,
            region: region,
            city: city,
            age: age
          };

          if (photoFile) {
            const fileExt = photoFile.name.split('.').pop();
            const fileName = `${data.user.id}-${Math.random()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from('profiles')
              .upload(filePath, photoFile);

            if (!uploadError) {
              const { data: { publicUrl } } = supabase.storage
                .from('profiles')
                .getPublicUrl(filePath);
              updates.photo_url = publicUrl;
            }
          }
          
          await supabase.from('profiles').update(updates).eq('id', data.user.id);
        }

        if (!data.session) {
          setMessage("Compte créé ! Vérifie ta boîte mail pour confirmer ton adresse, puis connecte-toi.");
          setLoading(false);
          return;
        }
        setMessage("Compte créé avec succès. Vous êtes connecté.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      router.push("/discover");
    } catch (error: any) {
      console.error("Auth error details:", error);
      setMessage(`Erreur : ${error.message || "Erreur inconnue"}`);
      setLoading(false);
    }
  }

  return (
    <form action={submit} className="mt-5 grid gap-4">
      {mode === "signup" && (
        <>
          <div className="flex justify-center mb-4">
            <label className="relative group cursor-pointer">
              <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-dashed border-foreground/20 bg-foreground/5 flex items-center justify-center transition group-hover:border-accent/50">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <Camera className="h-8 w-8 text-muted group-hover:text-accent transition" />
                )}
              </div>
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              <div className="absolute -bottom-1 -right-1 bg-accent rounded-full p-1.5 text-white shadow-lg">
                <Plus className="h-4 w-4" />
              </div>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="grid gap-2 text-sm font-semibold">
              Prénom
              <Input name="firstName" required autoComplete="given-name" placeholder="Jean" />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Nom
              <Input name="lastName" required autoComplete="family-name" placeholder="Dupont" />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold">
              Pays / Région
              <select 
                name="region" 
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="h-11 w-full rounded-xl border border-foreground/10 bg-foreground/5 px-3 py-1 text-sm font-medium outline-none focus:border-accent transition"
              >
                {Object.keys(CITIES_BY_REGION).map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Âge
              <Input name="age" type="number" required min="18" max="99" placeholder="25" />
            </label>
          </div>
          <label className="grid gap-2 text-sm font-semibold">
            Ville
            <Input 
              name="city" 
              required 
              autoComplete="address-level2" 
              placeholder={`Ex: ${citiesInRegion[0] || "Paris"}`} 
              list="cities-signup" 
            />
            <datalist id="cities-signup">
              {citiesInRegion.map(city => (
                <option key={city} value={city} />
              ))}
            </datalist>
          </label>
        </>
      )}
      <label className="grid gap-2 text-sm font-semibold">
        Email
        <Input name="email" type="email" required autoComplete="email" placeholder="jean@exemple.fr" />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Mot de passe
        <Input name="password" type="password" required minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} placeholder="••••••••" />
      </label>
      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {mode === "signup" ? "Créer mon compte" : "Se connecter"}
      </Button>
      
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-foreground/10"></span></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted">Ou</span></div>
      </div>

      <Button type="button" variant="secondary" onClick={handleGoogleLogin} disabled={loading}>
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continuer avec Google
      </Button>

      <p className="min-h-5 text-sm font-semibold text-muted text-center">{message}</p>
    </form>
  );
}
