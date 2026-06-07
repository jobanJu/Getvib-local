"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { Camera, UserRound } from "lucide-react";

type Props = {
  user: any;
};

export function ProfileForm({ user }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [photoUrl, setPhotoUrl] = useState(user?.photo_url || "");
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const supabase = createClient();

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage("Téléchargement de l'image...");

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload l'image dans le bucket 'images'
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Récupère l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('images')
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

    if (!photoUrl) {
      setMessage("Erreur : La photo de profil est obligatoire.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name,
          bio,
          photo_url: photoUrl,
        })
        .eq("id", user.id);

      if (error) throw error;
      setMessage("Profil mis à jour avec succès !");
      router.refresh();
    } catch (error: any) {
      setMessage(`Erreur : ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="flex flex-col items-center gap-4">
        <div 
          className="relative h-32 w-32 cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
        >
          {photoUrl ? (
            <img 
              src={photoUrl} 
              alt="Profil" 
              className="h-full w-full rounded-full object-cover border-4 border-accent transition group-hover:opacity-70" 
            />
          ) : (
            <div className="h-full w-full rounded-full bg-slate-800 flex items-center justify-center border-4 border-dashed border-white/20 group-hover:border-accent">
              <UserRound className="h-12 w-12 text-white/20 group-hover:text-accent" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <Camera className="h-8 w-8 text-white" />
          </div>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleUpload} 
          accept="image/*" 
          className="hidden" 
        />
        <p className="text-xs text-muted">Cliquez sur le cercle pour changer votre photo (Obligatoire)</p>
      </div>

      <div className="grid gap-4">
        <label className="grid gap-2 text-sm font-semibold">
          Prénom
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            placeholder="Votre prénom" 
          />
        </label>
        
        <label className="grid gap-2 text-sm font-semibold">
          Bio
          <textarea 
            value={bio} 
            onChange={(e) => setBio(e.target.value)} 
            placeholder="Dites-nous en plus sur vous..." 
            className="min-h-24 w-full rounded-xl border border-white/20 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-accent"
          />
        </label>
      </div>

      <Button type="submit" disabled={loading} className="py-6 text-lg font-bold">
        {loading ? "Action en cours..." : "Enregistrer les modifications"}
      </Button>

      <p className={`text-sm font-semibold text-center ${message.includes("Erreur") ? "text-danger" : "text-success"}`}>
        {message}
      </p>
    </form>
  );
}
