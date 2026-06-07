"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  senderId: string;
  text: string;
  createdAt: string; // ISO string in Supabase
};

type Chat = {
  id: string;
  title?: string;
  type: "group" | "private";
};

export function ChatInterface({ initialChats, initialUserId }: { initialChats: any[], initialUserId: string }) {
  const { user, getIdToken } = useAuth();
  const [chats] = useState(initialChats);
  const [activeChatId, setActiveChatId] = useState(initialChats[0]?.id);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!activeChatId) return;

    // Fetch initial messages for active chat
    let isMounted = true;
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("id, sender_id, text, created_at")
        .eq("chat_id", activeChatId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (isMounted && data) {
        setMessages(data.map(m => ({
          id: m.id,
          senderId: m.sender_id,
          text: m.text,
          createdAt: m.created_at
        })));
      }
    };
    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat_${activeChatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${activeChatId}`,
        },
        (payload) => {
          const newMsg = payload.new;
          setMessages((prev) => [...prev, {
            id: newMsg.id,
            senderId: newMsg.sender_id,
            text: newMsg.text,
            createdAt: newMsg.created_at
          }]);
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [activeChatId, supabase]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function onSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!inputText.trim() || !activeChatId || !user || sending) return;

    setSending(true);
    try {
      const idToken = await getIdToken();
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ chatId: activeChatId, text: inputText }),
      });

      if (!res.ok) throw new Error("Failed to send");
      setInputText("");
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  const activeChat = chats.find(c => c.id === activeChatId);

  return (
    <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 lg:grid-cols-[22rem_1fr] lg:px-8">
      <div className="grid gap-3 content-start">
        <h1 className="text-4xl font-black mb-2">Messages</h1>
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => setActiveChatId(chat.id)}
            className={cn(
              "text-left p-4 rounded-2xl border transition-all",
              activeChatId === chat.id 
                ? "bg-accent border-accent text-white shadow-lg" 
                : "bg-white/5 border-white/10 hover:bg-white/8"
            )}
          >
            <h2 className="font-semibold">{chat.title || (chat.type === "group" ? "Groupe Soirée" : "Discussion privée")}</h2>
            <p className="mt-1 text-sm opacity-70 line-clamp-1">Cliquez pour voir les messages</p>
          </button>
        ))}
        {chats.length === 0 && (
          <p className="text-muted text-sm py-8 text-center">Aucune discussion pour le moment.</p>
        )}
      </div>

      <Card className="grid h-[70vh] grid-rows-[auto_1fr_auto] overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-white/5 font-semibold">
          {activeChat?.title || "Sélectionnez une discussion"}
        </div>
        
        <div className="overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "max-w-[80%] rounded-2xl p-3 text-sm shadow-sm",
                msg.senderId === initialUserId
                  ? "ml-auto bg-accent text-white rounded-tr-none"
                  : "bg-white/10 text-white rounded-tl-none"
              )}
            >
              {msg.text}
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        <form onSubmit={onSendMessage} className="flex gap-2 border-t border-border p-3 bg-white/5">
          <Input 
            placeholder="Écrire un message" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={!activeChatId || sending}
            className="rounded-xl bg-background"
          />
          <Button size="icon" disabled={!activeChatId || sending} type="submit">
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </Card>
    </section>
  );
}
