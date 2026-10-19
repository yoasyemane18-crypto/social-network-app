import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Bell, Clapperboard, Home, Menu, MessageCircle, Search, Store, Users } from "lucide-react";

export const navItems = [
  { label: "Feed", to: "/", icon: Home },
  { label: "Friends", to: "/friends", icon: Users },
  { label: "Messages", to: "/messages", icon: MessageCircle },
  { label: "Reels", to: "/reels", icon: Clapperboard },
  { label: "Market", to: "/market", icon: Store },
  { label: "Alerts", to: "/alerts", icon: Bell },
  { label: "Menu", to: "/menu", icon: Menu },
];

export default function AppShell() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-meskot-paper font-sans text-meskot-ink">
      <div className="mx-auto max-w-md pb-10">
        <header className="flex items-center justify-between bg-meskot-cream px-4 py-3">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-meskot-gold bg-meskot-cream font-serif text-xl font-bold italic text-meskot-gold-deep shadow-sm">
              M
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight">Meskot</span>
          </NavLink>
          <button
            aria-label="Search"
            onClick={() => navigate("/search")}
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-meskot-gold/50 bg-meskot-cream text-meskot-gold-deep transition hover:bg-meskot-gold/10"
          >
            <Search className="h-5 w-5" />
          </button>
        </header>

        <nav className="grid grid-cols-7 gap-1 border-y border-meskot-gold/20 bg-meskot-cream px-2 py-2">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-semibold transition ${
                  isActive
                    ? "border-2 border-meskot-gold/60 bg-meskot-gold/10 text-meskot-ink"
                    : "border-2 border-transparent text-meskot-sage hover:text-meskot-ink"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`h-6 w-6 ${isActive ? "text-meskot-gold-deep" : ""}`} />
                  <span className="truncate">{label}</span>
                  {isActive && <span className="mt-0.5 h-1 w-8 rounded-full bg-meskot-gold" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <main className="p-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
