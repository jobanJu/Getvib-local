"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-provider";
import { ChatInterface } from "./chat-interface";
import { useRouter } from "next/navigation";

export function MessagesClientPage() {
  const { user, loading, getIdToken } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<any[]>([]);
  const [chatsLoading, setChatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchChats();
    }
  }, [user, loading, router]);

  async function fetchChats() {
    try {
      const idToken = await getIdToken();
      // We'll need to make sure this endpoint exists or use a direct firestore query here
      // Given our architecture, let's assume we have an endpoint or we add one.
      const res = await fetch("/api/messages/chats", {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      const data = await res.json();
      setChats(data.chats || []);
    } catch (err) {
      console.error(err);
    } finally {
      setChatsLoading(false);
    }
  }

  if (loading || chatsLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  return <ChatInterface initialChats={chats} initialUserId={user?.id || ""} />;
}
