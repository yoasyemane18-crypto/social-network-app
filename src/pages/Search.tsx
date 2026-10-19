import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "@/components/Avatar";
import { initialFriends, initialMarket, initialPosts, initialReels } from "@/lib/mockData";

export default function Search() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const people = q ? initialFriends.filter((f) => f.name.toLowerCase().includes(q)) : [];
  const posts = q ? initialPosts.filter((p) => p.text.toLowerCase().includes(q) || p.author.toLowerCase().includes(q)) : [];
  const market = q ? initialMarket.filter((m) => m.title.toLowerCase().includes(q)) : [];
  const reels = q ? initialReels.filter((r) => r.caption.toLowerCase().includes(q) || r.author.toLowerCase().includes(q)) : [];
  const total = people.length + posts.length + market.length + reels.length;

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] border-2 border-meskot-gold/30 bg-meskot-cream p-4 shadow-sm">
        <h1 className="mb-3 font-serif text-2xl font-bold">Search</h1>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people, posts, reels, market"
          className="h-11 w-full rounded-full border-2 border-meskot-gold/30 bg-meskot-paper px-5 text-sm outline-none focus:border-meskot-gold"
        />
      </section>

      {q && total === 0 && (
        <p className="py-8 text-center text-sm text-meskot-sage">No results for "{query}".</p>
      )}

      {people.length > 0 && (
        <section className="rounded-[28px] border-2 border-meskot-gold/30 bg-meskot-cream p-4 shadow-sm">
          <h2 className="mb-2 font-serif font-bold">People</h2>
          <ul className="space-y-2">
            {people.map((p) => (
              <li key={p.id} className="flex items-center gap-3">
                <Avatar initials={p.initials} color={p.color} size="h-10 w-10" />
                <span className="font-semibold">{p.name}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {posts.length > 0 && (
        <section className="rounded-[28px] border-2 border-meskot-gold/30 bg-meskot-cream p-4 shadow-sm">
          <h2 className="mb-2 font-serif font-bold">Posts</h2>
          <ul className="space-y-3">
            {posts.map((p) => (
              <li key={p.id} className="text-sm">
                <span className="font-semibold">{p.author}: </span>
                {p.text}
              </li>
            ))}
          </ul>
        </section>
      )}

      {reels.length > 0 && (
        <section className="rounded-[28px] border-2 border-meskot-gold/30 bg-meskot-cream p-4 shadow-sm">
          <h2 className="mb-2 font-serif font-bold">Reels</h2>
          <ul className="space-y-2 text-sm">
            {reels.map((r) => (
              <li key={r.id}>
                <Link to="/reels" className="font-semibold text-meskot-gold-deep">{r.author}</Link>: {r.caption}
              </li>
            ))}
          </ul>
        </section>
      )}

      {market.length > 0 && (
        <section className="rounded-[28px] border-2 border-meskot-gold/30 bg-meskot-cream p-4 shadow-sm">
          <h2 className="mb-2 font-serif font-bold">Market</h2>
          <ul className="space-y-2 text-sm">
            {market.map((m) => (
              <li key={m.id} className="flex justify-between">
                <Link to="/market" className="font-semibold text-meskot-gold-deep">{m.title}</Link>
                <span>${m.price}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
