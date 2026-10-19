import { useMemo, useState } from "react";
import { Bookmark, BookmarkCheck, Plus, X } from "lucide-react";
import { MARKET_CATEGORIES, MarketItem, initialMarket } from "@/lib/mockData";

const COLORS = ["bg-meskot-gold-deep", "bg-meskot-rose", "bg-meskot-sage", "bg-meskot-ink"];
const inputCls =
  "h-10 rounded-xl border-2 border-meskot-gold/30 bg-meskot-cream px-3 text-sm outline-none focus:border-meskot-gold";

export default function Market() {
  const [items, setItems] = useState<MarketItem[]>(initialMarket);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);
  const [showSell, setShowSell] = useState(false);
  const [form, setForm] = useState({ title: "", price: "", category: "Home" });

  const visible = useMemo(
    () =>
      items.filter(
        (i) =>
          (category === "All" || i.category === category) &&
          (!savedOnly || i.saved) &&
          i.title.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [items, category, query, savedOnly]
  );

  const toggleSave = (id: number) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, saved: !i.saved } : i)));

  const submit = () => {
    const price = Number(form.price);
    if (!form.title.trim() || !price || price <= 0) return;
    const item: MarketItem = {
      id: Date.now(),
      title: form.title.trim(),
      price,
      category: form.category,
      seller: "You",
      color: COLORS[items.length % COLORS.length],
      saved: false,
    };
    setItems((prev) => [item, ...prev]);
    setForm({ title: "", price: "", category: "Home" });
    setShowSell(false);
  };

  const chip = (active: boolean) =>
    `shrink-0 rounded-full border-2 px-3 py-1 text-xs font-bold transition ${
      active ? "border-meskot-gold bg-meskot-gold/15 text-meskot-ink" : "border-meskot-gold/20 text-meskot-sage"
    }`;

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] border-2 border-meskot-gold/30 bg-meskot-cream p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="font-serif text-2xl font-bold">Market</h1>
          <button
            onClick={() => setShowSell((s) => !s)}
            className="flex items-center gap-1 rounded-full bg-meskot-gold-deep px-4 py-2 text-sm font-bold text-meskot-cream"
          >
            {showSell ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showSell ? "Close" : "Sell item"}
          </button>
        </div>

        {showSell && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="mb-4 grid gap-2 rounded-2xl border-2 border-meskot-gold/30 bg-meskot-paper p-3"
          >
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Item title"
              className={inputCls}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="Price ($)"
                inputMode="decimal"
                className={inputCls}
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={inputCls}
              >
                {MARKET_CATEGORIES.filter((c) => c !== "All").map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="h-10 rounded-xl bg-meskot-gold-deep text-sm font-bold text-meskot-cream">
              List item
            </button>
          </form>
        )}

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Market"
          className="mb-3 h-11 w-full rounded-full border-2 border-meskot-gold/30 bg-meskot-paper px-5 text-sm outline-none focus:border-meskot-gold"
        />

        <div className="flex gap-2 overflow-x-auto pb-1">
          {MARKET_CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={chip(category === c)}>
              {c}
            </button>
          ))}
          <button onClick={() => setSavedOnly((s) => !s)} className={chip(savedOnly)}>
            Saved
          </button>
        </div>
      </section>

      {visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-meskot-sage">No items match your filters.</p>
      ) : (
        <section className="grid grid-cols-2 gap-3">
          {visible.map((i) => (
            <article
              key={i.id}
              className="overflow-hidden rounded-[24px] border-2 border-meskot-gold/30 bg-meskot-cream shadow-sm"
            >
              <div className={`relative h-32 ${i.color}`}>
                <button
                  onClick={() => toggleSave(i.id)}
                  aria-label={i.saved ? "Unsave item" : "Save item"}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-meskot-cream text-meskot-gold-deep shadow"
                >
                  {i.saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                </button>
              </div>
              <div className="p-3">
                <div className="truncate text-sm font-semibold">{i.title}</div>
                <div className="font-serif text-lg font-bold text-meskot-gold-deep">${i.price}</div>
                <div className="truncate text-xs text-meskot-sage">
                  {i.category} · {i.seller}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
