import { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Conversation, initialConversations } from "@/lib/mockData";

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");

  const active = conversations.find((c) => c.id === activeId) ?? null;

  const send = () => {
    const text = draft.trim();
    if (!text || activeId === null) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, { id: Date.now(), from: "me", text }] }
          : c
      )
    );
    setDraft("");
  };

  if (active) {
    return (
      <section className="flex h-[calc(100vh-11rem)] min-h-[420px] flex-col overflow-hidden rounded-[28px] border-2 border-meskot-gold/30 bg-meskot-cream shadow-sm">
        <header className="flex items-center gap-3 border-b border-meskot-gold/20 p-3">
          <button
            onClick={() => setActiveId(null)}
            aria-label="Back to messages"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-meskot-gold/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Avatar initials={active.initials} color={active.color} size="h-10 w-10" />
          <div>
            <div className="font-semibold">{active.name}</div>
            <div className="text-xs text-meskot-sage">{active.online ? "Active now" : "Offline"}</div>
          </div>
        </header>

        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {active.messages.length === 0 && (
            <p className="py-8 text-center text-sm text-meskot-sage">Say hello to {active.name}!</p>
          )}
          {active.messages.map((m) => (
            <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-3xl px-4 py-2 text-sm ${
                  m.from === "me" ? "bg-meskot-gold-deep text-meskot-cream" : "bg-meskot-paper text-meskot-ink"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex gap-2 border-t border-meskot-gold/20 p-3"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Aa"
            className="h-11 flex-1 rounded-full border-2 border-meskot-gold/30 bg-meskot-paper px-4 text-sm outline-none focus:border-meskot-gold"
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={!draft.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-meskot-gold-deep text-meskot-cream disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border-2 border-meskot-gold/30 bg-meskot-cream p-4 shadow-sm">
      <h1 className="mb-3 font-serif text-2xl font-bold">Messages</h1>
      <ul className="space-y-1">
        {conversations.map((c) => {
          const last = c.messages[c.messages.length - 1];
          return (
            <li key={c.id}>
              <button
                onClick={() => setActiveId(c.id)}
                className="flex w-full items-center gap-3 rounded-2xl p-2 text-left hover:bg-meskot-gold/5"
              >
                <div className="relative">
                  <Avatar initials={c.initials} color={c.color} size="h-12 w-12" />
                  {c.online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-meskot-cream bg-meskot-sage" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{c.name}</div>
                  <div className="truncate text-xs text-meskot-sage">{last ? (last.from === "me" ? `You: ${last.text}` : last.text) : "No messages yet"}</div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
