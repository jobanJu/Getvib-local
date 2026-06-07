"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

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
  
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("Mise à jour...");

    if (!photoUrl || !photoUrl.startsWith("http")) {
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
      setMessage("Profil mis à jour !");
      router.refresh();
    } catch (error: any) {
      setMessage(`Erreur : ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <label className="grid gap-2 text-sm font-semibold">
        Prénom
        <Input 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
          placeholder="Votre prénom" 
          className="bg-white/5"
        />
      </label>
      
      <label className="grid gap-2 text-sm font-semibold text-accent">
        Photo de profil (URL) *
        <Input 
          value={photoUrl} 
          onChange={(e) => setPhotoUrl(e.target.value)} 
          required 
          placeholder="https://images.unsplash.com/photo-..." 
          className="bg-white/5 border-accent/50"
        />
        <span className="text-xs text-muted font-normal">Obligatoire pour participer aux vibes.</span>
      </label>

      {photoUrl && photoUrl.startsWith("http") && (
        <div className="flex justify-center py-2">
          <img src={photoUrl} alt="Preview" className="h-20 w-20 rounded-full object-cover border-2 border-accent" />
        </div>
      )}

      <label className="grid gap-2 text-sm font-semibold">
        Bio
        <textarea 
          value={bio} 
          onChange={(e) => setBio(e.target.value)} 
          placeholder="Dites-nous en plus sur vous..." 
          className="min-h-24 w-full rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent"
        />
      </label>

      <Button type="submit" disabled={loading}>
        {loading ? "Enregistrement..." : "Enregistrer les modifications"}
      </Button>

      <p className={`text-sm font-semibold text-center ${message.startsWith("Erreur") ? "text-danger" : "text-success"}`}>
        {message}
      </p>
    </form>
  );
}
