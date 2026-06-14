"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Users, MessageCircle, User, MapPin, Search } from "lucide-react";
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
  createdAt: string;
};

type Friend = {
  id: string;
  name: string;
  photo_url: string | null;
  city: string | null;
};

export function ChatInterface({ initialChats, initialUserId, friends }: { initialChats: any[], initialUserId: string, friends: Friend[] }) {
  const { user, getIdToken } = useAuth();
  const [chats, setChats] = useState(initialChats);
  const [activeChatId, setActiveChatId] = useState(initialChats[0]?.id);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState<"chats" | "friends">("chats");
  const [search, setSearch] = useState("");
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!activeChatId) return;

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

    const channel = supabase
      .channel(`chat_${activeChatId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${activeChatId}` }, 
        (payload) => {
          const newMsg = payload.new;
          setMessages((prev) => [...prev, {
            id: newMsg.id,
            senderId: newMsg.sender_id,
            text: newMsg.text,
            createdAt: newMsg.created_at
          }]);
        }
      ).subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [activeChatId, supabase]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function startConversation(friend: Friend) {
    setSending(true);
    try {
      const token = await getIdToken();
      const res = await fetch("/api/messages/chats/private", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ friendId: friend.id })
      });
      
      const { chat } = await res.json();
      
      if (!chats.find(c => c.id === chat.id)) {
        setChats([chat, ...chats]);
      }
      setActiveChatId(chat.id);
      setTab("chats");
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  async function onSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!inputText.trim() || !activeChatId || !user || sending) return;

    setSending(true);
    try {
      const idToken = await getIdToken();
      await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ chatId: activeChatId, text: inputText }),
      });
      setInputText("");
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  const activeChat = chats.find(c => c.id === activeChatId);
  const filteredFriends = friends.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 lg:grid-cols-[22rem_1fr] lg:px-8">
      {/* Sidebar */}
      <div className="flex flex-col h-[70vh] gap-4">
        <h1 className="text-4xl font-black mb-2">Messages</h1>
        
        {/* Tabs */}
        <div className="flex p-1 rounded-xl bg-foreground/5 border border-foreground/10">
            <button 
                onClick={() => setTab("chats")}
                className={cn("flex-1 py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition", tab === "chats" ? "bg-background text-accent shadow-sm" : "text-muted hover:text-foreground")}
            >
                <MessageCircle className="h-4 w-4" /> Discussions
            </button>
            <button 
                onClick={() => setTab("friends")}
                className={cn("flex-1 py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition", tab === "friends" ? "bg-background text-accent shadow-sm" : "text-muted hover:text-foreground")}
            >
                <User className="h-4 w-4" /> Amis
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {tab === "chats" ? (
                <>
                    {chats.map((chat) => (
                        <button
                            key={chat.id}
                            onClick={() => setActiveChatId(chat.id)}
                            className={cn(
                                "w-full text-left p-4 rounded-2xl border transition-all",
                                activeChatId === chat.id 
                                    ? "bg-accent border-accent text-foreground shadow-lg" 
                                    : "bg-foreground/5 border-foreground/10 hover:bg-foreground/8"
                            )}
                        >
                            <h2 className="font-semibold">{chat.title || (chat.type === "group" ? "Groupe Soirée" : "Discussion privée")}</h2>
                            <p className="mt-1 text-sm opacity-70 line-clamp-1">Voir les messages</p>
                        </button>
                    ))}
                    {chats.length === 0 && (
                        <div className="py-12 text-center">
                            <p className="text-muted text-sm italic">Aucune discussion.</p>
                            <Button variant="ghost" size="sm" className="mt-2 text-accent" onClick={() => setTab("friends")}>Démarrer avec un ami</Button>
                        </div>
                    )}
                </>
            ) : (
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                        <Input 
                            placeholder="Rechercher un ami..." 
                            className="pl-9 bg-foreground/5 border-none h-10 text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        {filteredFriends.map(friend => (
                            <button
                                key={friend.id}
                                onClick={() => startConversation(friend)}
                                className="flex items-center gap-3 p-3 rounded-2xl border border-foreground/5 bg-foreground/5 hover:bg-foreground/10 transition-colors text-left"
                            >
                                {friend.photo_url ? (
                                    <img src={friend.photo_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                                        <User className="h-5 w-5" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm truncate">{friend.name}</p>
                                    <p className="text-[10px] uppercase tracking-wider text-muted font-bold flex items-center gap-1">
                                        <MapPin className="h-2.5 w-2.5" /> {friend.city || "Lille"}
                                    </p>
                                </div>
                                <MessageCircle className="h-4 w-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        ))}
                        {filteredFriends.length === 0 && (
                            <p className="py-8 text-center text-sm text-muted italic">Aucun ami trouvé.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Chat Area */}
      <Card className="grid h-[70vh] grid-rows-[auto_1fr_auto] overflow-hidden">
        <div className="p-4 border-b border-foreground/10 bg-foreground/5 font-semibold flex items-center gap-3">
          {activeChat?.title || "Sélectionnez une discussion"}
        </div>
        
        <div className="overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "max-w-[80%] rounded-2xl p-3 text-sm shadow-sm",
                msg.senderId === initialUserId
                  ? "ml-auto bg-accent text-foreground rounded-tr-none"
                  : "bg-foreground/10 text-foreground rounded-tl-none"
              )}
            >
              {msg.text}
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        <form onSubmit={onSendMessage} className="flex gap-2 border-t border-border p-3 bg-foreground/5">
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
