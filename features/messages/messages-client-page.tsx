"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-provider";
import { ChatInterface } from "./chat-interface";
import { useRouter, useSearchParams } from "next/navigation";
import { PageLoader } from "@/components/ui/page-loader";

export function MessagesClientPage() {
  const { user, loading, getIdToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialChatId = searchParams.get("chat") || undefined;
  const [chats, setChats] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [chatsLoading, setChatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      Promise.all([fetchChats(), fetchFriends()]).finally(() => setChatsLoading(false));
    }
  }, [user, loading, router]);

  async function fetchFriends() {
    try {
      const idToken = await getIdToken();
      const res = await fetch("/api/friends/list", {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      const data = await res.json();
      setFriends(data.friends || []);
    } catch (err) {
      console.error(err);
    }
  }

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
    return <PageLoader label="Chargement des messages…" />;
  }

  return <ChatInterface initialChats={chats} initialUserId={user?.id || ""} friends={friends} initialChatId={initialChatId} />;
}
