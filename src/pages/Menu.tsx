import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Bookmark, Clock, HelpCircle, LogOut, Lock, Settings, Store, User, Users, ChevronRight } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { ME } from "@/lib/mockData";

export default function Menu() {
  const [darkNotifs, setDarkNotifs] = useState(false);
  const [notifs, setNotifs] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const items = [
    { label: "Your profile", icon: User, to: null, note: "Name, photo and bio" },
    { label: "Friends", icon: Users, to: "/friends", note: "" },
    { label: "Saved items", icon: Bookmark, to: "/market", note: "" },
    { label: "Your activity", icon: Clock, to: "/alerts", note: "" },
    { label: "Marketplace", icon: Store, to: "/market", note: "" },
    { label: "Privacy", icon: Lock, to: null, note: "Who can see your posts" },
    { label: "Help", icon: HelpCircle, to: null, note: "Support and FAQs" },
    { label: "Settings", icon: Settings, to: null, note: "" },
  ];

  return (
    <div className="space-y-4">
      <section className="flex items-center gap-4 rounded-[28px] border-2 border-meskot-gold/30 bg-meskot-cream p-4 shadow-sm">
        <Avatar photo={ME.photo} initials={ME.initials} size="h-16 w-16" ring />
        <div>
          <div className="font-serif text-xl font-bold">{ME.name}</div>
          <div className="text-sm text-meskot-sage">View your profile</div>
        </div>
      </section>

      <section className="rounded-[28px] border-2 border-meskot-gold/30 bg-meskot-cream p-3 shadow-sm">
        <ul>
          {items.map(({ label, icon: Icon, to, note }) => {
            const content = (
              <>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-meskot-gold/15 text-meskot-gold-deep">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{label}</span>
                  {note && <span className="block text-xs text-meskot-sage">{note}</span>}
                </span>
                <ChevronRight className="h-4 w-4 text-meskot-sage" />
              </>
            );
            return (
              <li key={label}>
                {to ? (
                  <Link to={to} className="flex items-center gap-3 rounded-2xl p-3 hover:bg-meskot-gold/5">
                    {content}
                  </Link>
                ) : (
                  <button
                    onClick={() => setMessage(`${label} is coming soon.`)}
                    className="flex w-full items-center gap-3 rounded-2xl p-3 text-left hover:bg-meskot-gold/5"
                  >
                    {content}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-3 rounded-[28px] border-2 border-meskot-gold/30 bg-meskot-cream p-4 shadow-sm">
        <label className="flex items-center justify-between text-sm font-semibold">
          <span className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-meskot-gold-deep" /> Push notifications
          </span>
          <input type="checkbox" checked={notifs} onChange={(e) => setNotifs(e.target.checked)} className="h-5 w-5 accent-meskot-gold-deep" />
        </label>
        <label className="flex items-center justify-between text-sm font-semibold">
          <span>Show sponsored posts</span>
          <input type="checkbox" checked={darkNotifs} onChange={(e) => setDarkNotifs(e.target.checked)} className="h-5 w-5 accent-meskot-gold-deep" />
        </label>
        {message && <p className="text-xs font-medium text-meskot-gold-deep">{message}</p>}
      </section>

      <button
        onClick={() => setMessage("You're signed in as a guest.")}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-meskot-live/40 bg-meskot-cream py-3 text-sm font-bold text-meskot-live"
      >
        <LogOut className="h-4 w-4" /> Log out
      </button>
    </div>
  );
}
