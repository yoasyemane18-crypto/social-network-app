import { useState } from "react";
import { Bell, UserPlus, Heart, MessageCircle, Store, Info } from "lucide-react";
import { Alert, initialAlerts } from "@/lib/mockData";

const icons = {
  friend: UserPlus,
  like: Heart,
  comment: MessageCircle,
  market: Store,
  system: Info,
} as const;

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unread = alerts.filter((a) => !a.read).length;
  const visible = filter === "unread" ? alerts.filter((a) => !a.read) : alerts;

  const markAllRead = () => setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  const markRead = (id: number) =>
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));

  return (
    <section className="rounded-[28px] border-2 border-meskot-gold/30 bg-meskot-cream p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold">Alerts</h1>
        <button
          onClick={markAllRead}
          disabled={unread === 0}
          className="text-sm font-bold text-meskot-gold-deep disabled:opacity-40"
        >
          Mark all read
        </button>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-2xl border-2 py-2 text-sm font-bold capitalize transition ${
              filter === f
                ? "border-meskot-gold bg-meskot-gold/15 text-meskot-ink"
                : "border-transparent text-meskot-sage"
            }`}
          >
            {f} {f === "unread" && `(${unread})`}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-meskot-sage">You're all caught up.</p>
      ) : (
        <ul className="space-y-1">
          {visible.map((a) => {
            const Icon = icons[a.kind] ?? Bell;
            return (
              <li key={a.id}>
                <button
                  onClick={() => markRead(a.id)}
                  className={`flex w-full items-start gap-3 rounded-2xl p-3 text-left transition hover:bg-meskot-gold/5 ${
                    a.read ? "" : "bg-meskot-gold/10"
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-meskot-gold-deep text-meskot-cream">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm ${a.read ? "" : "font-semibold"}`}>{a.text}</span>
                    <span className="text-xs text-meskot-sage">{a.time}</span>
                  </span>
                  {!a.read && <span className="mt-2 h-2.5 w-2.5 rounded-full bg-meskot-live" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
