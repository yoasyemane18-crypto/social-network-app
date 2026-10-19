import { useMemo, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Person, initialFriends, initialRequests, initialSuggestions } from "@/lib/mockData";

type Tab = "friends" | "requests" | "suggestions";

export default function Friends() {
  const [tab, setTab] = useState<Tab>("friends");
  const [query, setQuery] = useState("");
  const [friends, setFriends] = useState<Person[]>(initialFriends);
  const [requests, setRequests] = useState<Person[]>(initialRequests);
  const [suggestions, setSuggestions] = useState<Person[]>(initialSuggestions);
  const [sent, setSent] = useState<number[]>([]);

  const q = query.trim().toLowerCase();
  const match = (p: Person) => p.name.toLowerCase().includes(q);

  const acceptRequest = (p: Person) => {
    setRequests((r) => r.filter((x) => x.id !== p.id));
    setFriends((f) => [...f, p]);
  };
  const declineRequest = (id: number) => setRequests((r) => r.filter((x) => x.id !== id));
  const removeFriend = (id: number) => setFriends((f) => f.filter((x) => x.id !== id));
  const addSuggestion = (p: Person) => {
    setSent((s) => [...s, p.id]);
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "friends", label: "Friends", count: friends.length },
    { key: "requests", label: "Requests", count: requests.length },
    { key: "suggestions", label: "Suggestions", count: suggestions.length },
  ];

  const Row = ({ p, actions }: { p: Person; actions: React.ReactNode }) => (
    <li className="flex items-center gap-3 rounded-2xl p-2 hover:bg-meskot-gold/5">
      <div className="relative">
        <Avatar initials={p.initials} color={p.color} size="h-12 w-12" />
        {p.online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-meskot-cream bg-meskot-sage" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold">{p.name}</div>
        <div className="text-xs text-meskot-sage">{p.mutual} mutual friends</div>
      </div>
      <div className="flex gap-2">{actions}</div>
    </li>
  );

  const btn = "rounded-full px-3 py-1.5 text-xs font-bold transition";
  const primary = `${btn} bg-meskot-gold-deep text-meskot-cream hover:brightness-110`;
  const ghost = `${btn} border-2 border-meskot-gold/40 bg-meskot-paper text-meskot-ink hover:bg-meskot-gold/10`;

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] border-2 border-meskot-gold/30 bg-meskot-cream p-4 shadow-sm">
        <h1 className="mb-3 font-serif text-2xl font-bold">Friends</h1>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search friends"
          className="mb-3 h-11 w-full rounded-full border-2 border-meskot-gold/30 bg-meskot-paper px-5 text-sm outline-none focus:border-meskot-gold"
        />
        <div className="grid grid-cols-3 gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-2xl border-2 py-2 text-sm font-bold transition ${
                tab === t.key
                  ? "border-meskot-gold bg-meskot-gold/15 text-meskot-ink"
                  : "border-transparent text-meskot-sage hover:text-meskot-ink"
              }`}
            >
              {t.label} <span className="text-xs">({t.count})</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border-2 border-meskot-gold/30 bg-meskot-cream p-3 shadow-sm">
        {tab === "friends" && (
          <ul className="space-y-1">
            {friends.filter(match).map((p) => (
              <Row
                key={p.id}
                p={p}
                actions={<button onClick={() => removeFriend(p.id)} className={ghost}>Remove</button>}
              />
            ))}
            {friends.filter(match).length === 0 && <Empty text="No friends found." />}
          </ul>
        )}

        {tab === "requests" && (
          <ul className="space-y-1">
            {requests.filter(match).map((p) => (
              <Row
                key={p.id}
                p={p}
                actions={
                  <>
                    <button onClick={() => acceptRequest(p)} className={primary}>Accept</button>
                    <button onClick={() => declineRequest(p.id)} className={ghost}>Decline</button>
                  </>
                }
              />
            ))}
            {requests.filter(match).length === 0 && <Empty text="No pending requests." />}
          </ul>
        )}

        {tab === "suggestions" && (
          <ul className="space-y-1">
            {suggestions.filter(match).map((p) => {
              const isSent = sent.includes(p.id);
              return (
                <Row
                  key={p.id}
                  p={p}
                  actions={
                    <button
                      onClick={() => addSuggestion(p)}
                      disabled={isSent}
                      className={isSent ? `${ghost} opacity-60` : primary}
                    >
                      {isSent ? "Requested" : "Add friend"}
                    </button>
                  }
                />
              );
            })}
            {suggestions.filter(match).length === 0 && <Empty text="No suggestions found." />}
          </ul>
        )}
      </section>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <li className="py-8 text-center text-sm text-meskot-sage">{text}</li>;
}
