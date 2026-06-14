"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { Camera, UserRound, Loader2, Sparkles, X } from "lucide-react";
import { AVAILABLE_CITIES, CITIES_BY_REGION } from "@/lib/constants";

type Props = {
  user: any;
};

export function ProfileForm({ user }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [photoUrl, setPhotoUrl] = useState(user?.photo_url || "");
  const [name, setName] = useState(user?.name || "");
  const [pseudo, setPseudo] = useState(user?.pseudo || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [age, setAge] = useState(user?.age || "");
  const [selectedRegion, setSelectedRegion] = useState<string>(user?.region || "France");
  const [city, setCity] = useState(user?.city || "");
  const [interestsList, setInterestsList] = useState<string[]>(user?.interests || []);
  const [interestInput, setInterestInput] = useState("");
  const [password, setPassword] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const addInterest = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = interestInput.trim().replace(/,$/, "");
      if (val && !interestsList.includes(val)) {
        setInterestsList([...interestsList, val]);
        setInterestInput("");
      }
    }
  };

  const removeInterest = (tag: string) => {
    setInterestsList(interestsList.filter(i => i !== tag));
  };

  const citiesInRegion = CITIES_BY_REGION[selectedRegion as keyof typeof CITIES_BY_REGION] || [];

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage("Téléchargement de l'image...");

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles') // On utilise le bucket 'profiles' comme à l'inscription
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      setPhotoUrl(publicUrl);
      setMessage("Image chargée ! N'oubliez pas d'enregistrer.");
    } catch (error: any) {
      setMessage(`Erreur upload : ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("Mise à jour du profil...");

    try {
      // Pseudo : normalisé + validé. On ne l'envoie que s'il a changé.
      const normalizedPseudo = String(pseudo).trim().toLowerCase().replace(/^@+/, "");
      const pseudoChanged = normalizedPseudo !== (user?.pseudo || "");
      if (pseudoChanged && !/^[a-z0-9_]{3,20}$/.test(normalizedPseudo)) {
        throw new Error("Pseudo invalide : 3 à 20 caractères, lettres minuscules, chiffres ou _.");
      }

      // 1. Mise à jour du profil (Table profiles)
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          name,
          ...(pseudoChanged ? { pseudo: normalizedPseudo } : {}),
          bio,
          photo_url: photoUrl,
          phone,
          region: selectedRegion,
          city,
          interests: interestsList
        })
        .eq("id", user.id);

      if (profileError) {
        // 23505 = violation de contrainte unique (pseudo déjà pris).
        if ((profileError as any).code === "23505") throw new Error("Ce pseudo est déjà pris, choisis-en un autre.");
        throw profileError;
      }

      // 2. Mise à jour du mot de passe si renseigné
      if (password) {
        if (password.length < 8) throw new Error("Le mot de passe doit faire au moins 8 caractères.");
        const { error: pwdError } = await supabase.auth.updateUser({ password });
        if (pwdError) throw pwdError;
        setPassword("");
      }

      setMessage("Profil mis à jour avec succès !");
      router.refresh();
    } catch (error: any) {
      setMessage(`Erreur : ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8">
      {/* Photo de profil */}
      <div className="flex flex-col items-center gap-4">
        <div 
          className="relative h-32 w-32 cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
        >
          {photoUrl ? (
            <img 
              src={photoUrl} 
              alt="Profil" 
              className="h-full w-full rounded-full object-cover border-4 border-accent transition group-hover:opacity-70 shadow-lg" 
            />
          ) : (
            <div className="h-full w-full rounded-full bg-foreground/5 flex items-center justify-center border-4 border-dashed border-foreground/20 group-hover:border-accent">
              <UserRound className="h-12 w-12 text-muted group-hover:text-accent" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <Camera className="h-8 w-8 text-foreground" />
          </div>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*" className="hidden" />
        <p className="text-xs text-muted">Cliquez pour changer votre photo</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold">
          Nom Complet
          <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Prénom Nom" />
        </label>

        <label className="grid gap-2 text-sm font-semibold">
          Pseudo
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">@</span>
            <Input value={pseudo} onChange={(e) => setPseudo(e.target.value)} placeholder="lele59" className="pl-7" />
          </div>
          <p className="text-[10px] text-muted italic">Identifiant unique pour la recherche d&#39;amis.</p>
        </label>

        <label className="grid gap-2 text-sm font-semibold">
          Email
          <Input value={user.email} disabled className="opacity-60 cursor-not-allowed bg-foreground/5" />
        </label>

        <label className="grid gap-2 text-sm font-semibold">
          Téléphone
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="06 12 34 56 78" />
        </label>

        <label className="grid gap-2 text-sm font-semibold">
          Âge
          <Input value={age} disabled className="opacity-60 cursor-not-allowed bg-foreground/5" />
          <p className="text-[10px] text-muted italic">L&#39;âge ne peut plus être modifié après l&#39;inscription.</p>
        </label>

        <label className="grid gap-2 text-sm font-semibold">
          Pays / Région
          <select 
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
          Ville
          <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Lille" list="cities-profile" />
          <datalist id="cities-profile">
            {citiesInRegion.map(city => (
              <option key={city} value={city} />
            ))}
          </datalist>
        </label>

        <label className="grid gap-2 text-sm font-semibold">
          Nouveau Mot de Passe
          <Input 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            type="password" 
            placeholder="Laisser vide pour ne pas changer" 
            minLength={8}
          />
        </label>
      </div>

      <div className="grid gap-6">
        <label className="grid gap-2 text-sm font-semibold">
          Bio
          <textarea 
            value={bio} 
            onChange={(e) => setBio(e.target.value)} 
            placeholder="Dites-nous en plus sur vous, vos passions..." 
            className="min-h-24 w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-3 text-sm text-foreground outline-none focus:border-accent transition"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            Centres d&#39;intérêt <span className="font-normal text-muted text-xs">(Entrée pour ajouter)</span>
          </span>
          <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-foreground/10 bg-foreground/5 min-h-[44px]">
            {interestsList.map((tag) => (
                <span key={tag} className="flex items-center gap-1 bg-accent text-white px-3 py-1 rounded-full text-xs font-bold animate-in zoom-in-50">
                    {tag}
                    <button type="button" onClick={() => removeInterest(tag)} className="hover:text-black transition">
                        <X className="h-3 w-3" />
                    </button>
                </span>
            ))}
            <input 
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={addInterest}
                placeholder={interestsList.length === 0 ? "Ex: Jazz, Vin nature..." : "Ajouter..."}
                className="flex-1 bg-transparent border-none outline-none text-sm min-w-[120px]"
            />
          </div>
        </label>
      </div>

      <Button type="submit" disabled={loading} className="py-6 text-lg font-bold">
        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
        {loading ? "Enregistrement..." : "Mettre à jour mon profil"}
      </Button>

      {message && (
        <p className={`text-sm font-semibold text-center p-3 rounded-xl ${message.includes("Erreur") ? "bg-red-500/10 text-danger border border-red-500/20" : "bg-emerald-500/10 text-success border border-emerald-500/20"}`}>
          {message}
        </p>
      )}
    </form>
  );
}
