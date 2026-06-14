"use client";

import { User, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";

type Friend = {
  id: string;
  name: string;
  photo_url: string | null;
  city: string | null;
};

export function FriendList({ friends }: { friends: Friend[] }) {
  if (friends.length === 0) {
    return (
      <Card className="p-8 border-2 border-dashed text-center">
        <p className="text-sm italic text-muted">Vous n&#39;avez pas encore d&#39;amis sur GetVib.</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {friends.map((f) => (
        <Card key={f.id} className="flex flex-col items-center p-4 text-center bg-foreground/5 transition hover:bg-foreground/8">
          {f.photo_url ? (
            <img src={f.photo_url} alt="" className="h-16 w-16 rounded-full object-cover mb-3 ring-2 ring-accent/20" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center mb-3">
              <User className="h-8 w-8 text-accent" />
            </div>
          )}
          <p className="font-bold text-sm truncate w-full">{f.name}</p>
          {f.city && (
            <p className="text-[10px] uppercase tracking-wider text-muted font-bold mt-1 flex items-center justify-center gap-1">
              <MapPin className="h-2.5 w-2.5" /> {f.city}
            </p>
          )}
        </Card>
      ))}
    </div>
  );
}
