"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Send, Users, MessageCircle, User, MapPin, Search, UserPlus, ArrowLeft, Camera, Image as ImageIcon, Loader2 } from "lucide-react";
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
  photoUrl?: string | null;
  createdAt: string;
  sender?: {
    name: string;
    photo_url: string | null;
  };
};

type Friend = {
  id: string;
  name: string;
  photo_url: string | null;
  city: string | null;
};

export function ChatInterface({ initialChats, initialUserId, friends, initialChatId }: { initialChats: any[], initialUserId: string, friends: Friend[], initialChatId?: string }) {
  const { user, getIdToken } = useAuth();
  const [chats, setChats] = useState(initialChats);
  const [activeChatId, setActiveChatId] = useState<string | undefined>(
    (initialChatId && initialChats.some((c) => c.id === initialChatId) ? initialChatId : undefined) ?? (initialChats.length > 0 ? initialChats[0].id : undefined),
  );
  // Sur mobile, on veut savoir si on affiche la liste ou le chat
  const [showChatMobile, setShowChatMobile] = useState(!!initialChatId);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<"chats" | "friends">("chats");
  const [search, setSearch] = useState("");
  const [chatSearch, setChatSearch] = useState("");
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const activeChat = chats.find(c => c.id === activeChatId);
  const filteredFriends = friends.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
  const filteredChats = chats.filter(c => c.title?.toLowerCase().includes(chatSearch.toLowerCase()));

  // Reset de la vue mobile quand on change de chat
  const selectChat = async (id: string) => {
    setActiveChatId(id);
    setShowChatMobile(true);
    
    // Marquer comme lu localement
    setChats(prev => prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c));

    // Marquer comme lu sur le serveur
    try {
      const token = await getIdToken();
      await fetch("/api/messages/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ chatId: id })
      });
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  useEffect(() => {
    if (!activeChatId || !activeChat) return;

    let isMounted = true;
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select(`
          id, 
          sender_id, 
          text, 
          photo_url,
          created_at,
          sender:sender_id (name, photo_url)
        `)
        .eq("chat_id", activeChatId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (isMounted && data) {
        setMessages(data.map(m => ({
          id: m.id,
          senderId: m.sender_id,
          text: m.text,
          photoUrl: m.photo_url,
          createdAt: m.created_at,
          sender: (m as any).sender
        })));
      }
    };
    fetchMessages();

    const channel = supabase
      .channel(`chat_${activeChatId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${activeChatId}` }, 
        (payload) => {
          const newMsg = payload.new;
          // On enrichit le message avec les infos du participant qu'on a déjà
          const senderInfo = activeChat.participants?.find((p: any) => p.id === newMsg.sender_id);
          
          setMessages((prev) => [...prev, {
            id: newMsg.id,
            senderId: newMsg.sender_id,
            text: newMsg.text,
            photoUrl: newMsg.photo_url,
            createdAt: newMsg.created_at,
            sender: senderInfo
          }]);

          // Mise à jour du dernier message dans la liste des chats
          setChats((prevChats) => {
            return prevChats.map(c => 
              c.id === activeChatId 
                ? { ...c, lastMessage: { text: newMsg.text, createdAt: newMsg.created_at }, unreadCount: 0 }
                : c
            ).sort((a, b) => {
                const dateA = a.lastMessage?.createdAt || a.updatedAt;
                const dateB = b.lastMessage?.createdAt || b.updatedAt;
                return new Date(dateB).getTime() - new Date(dateA).getTime();
            });
          });
        }
      ).subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [activeChatId, activeChat, supabase]);

  useEffect(() => {
    const timer = setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !activeChatId) return;

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = `chat_photos/${activeChatId}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from("images").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("images").getPublicUrl(filePath);
      
      const idToken = await getIdToken();
      await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ 
          chatId: activeChatId, 
          text: "📷 Photo", 
          photoUrl: publicUrl 
        }),
      });
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi de la photo.");
    } finally {
      setUploading(false);
    }
  }

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
      setShowChatMobile(true);
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

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-4 px-0 py-0 sm:px-4 sm:py-8 lg:grid-cols-[22rem_1fr] lg:px-8 h-[calc(100vh-4rem)] sm:h-[80vh]">
      {/* Sidebar - Cachée sur mobile si un chat est ouvert */}
      <div className={cn(
        "flex flex-col h-full gap-4 transition-all duration-300",
        showChatMobile ? "hidden lg:flex" : "flex"
      )}>
        <div className="px-4 sm:px-0">
            <h1 className="text-3xl sm:text-4xl font-black mb-2">Messages</h1>
            
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
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-2 px-4 sm:px-0 pr-1">
            {tab === "chats" ? (
                <div className="space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                        <Input
                            placeholder="Rechercher une discussion..."
                            className="pl-9 bg-foreground/5 border-none h-10 text-sm"
                            value={chatSearch}
                            onChange={(e) => setChatSearch(e.target.value)}
                        />
                    </div>
                    {filteredChats.map((chat) => (
                        <button
                            key={chat.id}
                            onClick={() => selectChat(chat.id)}
                            className={cn(
                                "w-full text-left p-3 rounded-2xl border transition-all flex items-center gap-3 relative",
                                activeChatId === chat.id 
                                    ? "bg-accent border-accent text-foreground shadow-lg" 
                                    : "bg-foreground/5 border-foreground/10 hover:bg-foreground/8"
                            )}
                        >
                            <div className="relative shrink-0">
                                {chat.type === "group" ? (
                                    <div className="h-12 w-12 rounded-full bg-foreground/10 flex items-center justify-center border-2 border-background/20">
                                        <Users className="h-6 w-6" />
                                    </div>
                                ) : (
                                    <>
                                        {chat.participants?.find((p: any) => p.id !== initialUserId)?.photo_url ? (
                                            <img src={chat.participants.find((p: any) => p.id !== initialUserId).photo_url} alt="" className="h-12 w-12 rounded-full object-cover border-2 border-background/20" />
                                        ) : (
                                            <div className="h-12 w-12 rounded-full bg-foreground/10 flex items-center justify-center">
                                                <User className="h-6 w-6" />
                                            </div>
                                        )}
                                    </>
                                )}
                                {chat.unreadCount > 0 && activeChatId !== chat.id && (
                                    <span className="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white ring-2 ring-background animate-in zoom-in">
                                        {chat.unreadCount}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline gap-1">
                                    <h2 className={cn("truncate text-sm", (chat as any).unreadCount > 0 ? "font-black" : "font-bold")}>
                                        {chat.title || (chat.type === "group" ? "Groupe Soirée" : "Discussion privée")}
                                    </h2>
                                    {chat.lastMessage && (
                                        <span className={cn("text-[10px] shrink-0", (chat as any).unreadCount > 0 ? "text-accent font-bold" : "text-muted")}>
                                            {formatTime(chat.lastMessage.createdAt)}
                                        </span>
                                    )}
                                </div>
                                <p className={cn(
                                    "text-xs truncate", 
                                    (chat as any).unreadCount > 0 ? "text-foreground font-semibold" : (activeChatId === chat.id ? "text-foreground opacity-90" : "text-muted")
                                )}>
                                    {chat.lastMessage ? chat.lastMessage.text : (chat.type === "group" ? "Discussion de groupe" : "Discussion privée")}
                                </p>
                            </div>
                        </button>
                    ))}
                    {chats.length === 0 && (
                        <div className="py-12 text-center">
                            <p className="text-muted text-sm italic">Aucune discussion.</p>
                            <Button variant="ghost" size="sm" className="mt-2 text-accent" onClick={() => setTab("friends")}>Démarrer avec un ami</Button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <Link
                        href="/amis"
                        className="flex items-center justify-center gap-2 rounded-2xl border border-accent/30 bg-accent/10 px-3 py-2.5 text-sm font-bold text-accent transition hover:bg-accent/20"
                    >
                        <UserPlus className="h-4 w-4" />
                        Ajouter un ami par @pseudo
                    </Link>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                        <Input
                            placeholder="Filtrer mes amis..."
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
                                className="flex items-center gap-3 p-3 rounded-2xl border border-foreground/5 bg-foreground/5 hover:bg-foreground/10 transition-colors text-left group"
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

      {/* Chat Area - Plein écran sur mobile si actif */}
      <Card className={cn(
        "grid grid-rows-[auto_1fr_auto] overflow-hidden border-none sm:border-solid sm:border-foreground/10 shadow-2xl h-full rounded-none sm:rounded-3xl transition-all duration-300",
        !showChatMobile ? "hidden lg:grid" : "grid"
      )}>
        <div className="p-4 border-b border-foreground/10 bg-foreground/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowChatMobile(false)}
                className="lg:hidden p-2 -ml-2 text-muted hover:text-foreground transition"
              >
                  <ArrowLeft className="h-5 w-5" />
              </button>
              {activeChat?.type === "group" ? (
                  <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                      <Users className="h-5 w-5" />
                  </div>
              ) : (
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-foreground/10">
                      {activeChat?.participants?.find((p: any) => p.id !== initialUserId)?.photo_url ? (
                          <img src={activeChat.participants.find((p: any) => p.id !== initialUserId).photo_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                          <div className="h-full w-full flex items-center justify-center text-muted"><User className="h-5 w-5" /></div>
                      )}
                  </div>
              )}
              <div className="min-w-0">
                  <h2 className="font-bold truncate leading-none text-sm sm:text-base">{activeChat?.title || "Sélectionnez une discussion"}</h2>
                  <p className="text-[10px] uppercase tracking-widest text-muted mt-1 font-bold">
                      {activeChat?.type === "group" ? `${activeChat.participants?.length || 0} membres` : "En ligne"}
                  </p>
              </div>
          </div>
        </div>
        
        <div className="overflow-y-auto p-4 space-y-6 bg-foreground/[0.02]">
          {messages.map((msg, index) => {
            const isMe = msg.senderId === initialUserId;
            const prevMsg = messages[index - 1];
            const isSameSender = prevMsg?.senderId === msg.senderId;

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col max-w-[85%] sm:max-w-[70%]",
                  isMe ? "ml-auto items-end" : "items-start",
                  isSameSender ? "mt-1" : "mt-4"
                )}
              >
                {!isMe && !isSameSender && activeChat?.type === "group" && (
                  <span className="text-[10px] font-bold text-muted ml-11 mb-1 uppercase tracking-tighter">
                    {msg.sender?.name || "Membre"}
                  </span>
                )}
                <div className={cn("flex items-end gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
                  {activeChat?.type === "group" && !isMe ? (
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-foreground/10 shrink-0">
                      {!isSameSender ? (
                        msg.sender?.photo_url ? (
                          <img src={msg.sender.photo_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[10px] bg-accent/20 text-accent font-bold">
                            {msg.sender?.name?.charAt(0)}
                          </div>
                        )
                      ) : null}
                    </div>
                  ) : null}
                  
                  <div
                    className={cn(
                      "relative rounded-2xl p-0.5 text-sm shadow-sm overflow-hidden",
                      isMe
                        ? "bg-accent text-foreground rounded-tr-none shadow-accent/20"
                        : "bg-background border border-foreground/5 text-foreground rounded-tl-none",
                      msg.photoUrl ? "max-w-[240px]" : "px-4 py-2.5"
                    )}
                  >
                    {msg.photoUrl && (
                        <div className="relative group/photo">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={msg.photoUrl} alt="" className="w-full h-auto rounded-[14px] object-cover block" />
                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/photo:opacity-100 transition-opacity" />
                        </div>
                    )}
                    <div className={cn(msg.photoUrl ? "p-3 pt-2" : "")}>
                        {msg.text && (msg.text !== "📷 Photo" || !msg.photoUrl) && (
                            <p className="leading-relaxed">{msg.text}</p>
                        )}
                        <span className={cn(
                            "block text-[9px] mt-1 opacity-50 font-medium",
                            isMe ? "text-right" : "text-left"
                        )}>
                            {formatTime(msg.createdAt)}
                        </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        <div className="border-t border-border bg-background p-4 flex flex-col gap-3">
          {uploading && (
              <div className="flex items-center gap-2 text-xs font-bold text-accent animate-pulse px-2">
                  <Loader2 className="h-3 w-3 animate-spin" /> Envoi de la photo...
              </div>
          )}
          <form onSubmit={onSendMessage} className="flex gap-2">
            <button 
                type="button"
                disabled={!activeChatId || sending || uploading}
                onClick={() => fileInputRef.current?.click()}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-foreground/5 text-muted hover:bg-foreground/10 transition"
            >
                <Camera className="h-5 w-5" />
            </button>
            <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoUpload} 
                className="hidden" 
            />
            
            <Input 
                placeholder="Écrire un message..." 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={!activeChatId || sending || uploading}
                className="rounded-xl bg-foreground/5 border-none h-12 flex-1"
            />
            
            <Button size="icon" disabled={!activeChatId || sending || uploading || !inputText.trim()} type="submit" className="h-12 w-12 rounded-xl shadow-lg shadow-accent/20">
                <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </Card>
    </section>
  );
}
