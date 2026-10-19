import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Bookmark, BookmarkCheck, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export const MARKET_CATEGORIES = ["All", "Fashion", "Home", "Electronics", "Vehicles", "Other"];
const LISTING_CATEGORIES = MARKET_CATEGORIES.filter((c) => c !== "All");
const COLORS = ["bg-meskot-gold-deep", "bg-meskot-rose", "bg-meskot-sage", "bg-meskot-ink"];

type Listing = {
  id: string;
  seller_id: string;
  seller_name: string;
  title: string;
  description: string;
  price: number;
  category: string;
  color: string;
  status: "available" | "sold";
};

type FormState = { title: string; description: string; price: string; category: string };
const emptyForm: FormState = { title: "", description: "", price: "", category: "Home" };

const inputCls =
  "h-11 w-full rounded-xl border-2 border-meskot-gold/30 bg-meskot-cream px-3 text-sm text-meskot-ink outline-none focus:border-meskot-gold";

export default function Market() {
  const { user, profile } = useAuth();
  const [items, setItems] = useState<Listing[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);
  const [mineOnly, setMineOnly] = useState(false);
  const [editing, setEditing] = useState<Listing | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Listing | null>(null);

  const sellerName = profile?.full_name ?? "You";

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [itemsRes, savesRes] = await Promise.all([
      supabase
        .from("market_items")
        .select("id, seller_id, seller_name, title, description, price, category, color, status")
        .order("created_at", { ascending: false })
        .limit(100),
      user
        ? supabase.from("market_saves").select("item_id").eq("user_id", user.id)
        : Promise.resolve({ data: [], error: null }),
    ]);
    if (itemsRes.error) setError(itemsRes.error.message);
    else setItems((itemsRes.data ?? []).map((r) => ({ ...r, price: Number(r.price) })) as Listing[]);
    if (!savesRes.error) setSavedIds(new Set((savesRes.data ?? []).map((r: { item_id: string }) => r.item_id)));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (i) =>
        (category === "All" || i.category === category) &&
        (!savedOnly || savedIds.has(i.id)) &&
        (!mineOnly || i.seller_id === user?.id) &&
        (i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q))
    );
  }, [items, category, query, savedOnly, mineOnly, savedIds, user]);

  const toggleSave = async (item: Listing) => {
    if (!user) return;
    const isSaved = savedIds.has(item.id);
    setSavedIds((prev) => {
      const next = new Set(prev);
      isSaved ? next.delete(item.id) : next.add(item.id);
      return next;
    });
    const { error: err } = isSaved
      ? await supabase.from("market_saves").delete().eq("user_id", user.id).eq("item_id", item.id)
      : await supabase.from("market_saves").insert({ user_id: user.id, item_id: item.id });
    if (err) {
      setError(err.message);
      load();
    }
  };

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (item: Listing) => {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description,
      price: String(item.price),
      category: item.category,
    });
    setFormError(null);
    setShowForm(true);
    setSelected(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const price = Number(form.price);
    if (!form.title.trim()) return setFormError("Please add a title.");
    if (!price || price <= 0) return setFormError("Please enter a valid price.");
    if (!LISTING_CATEGORIES.includes(form.category)) return setFormError("Please choose a category.");

    setSaving(true);
    setFormError(null);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      price,
      category: form.category,
    };

    if (editing) {
      const { error: err } = await supabase
        .from("market_items")
        .update(payload)
        .eq("id", editing.id)
        .eq("seller_id", user.id);
      if (err) setFormError(err.message);
      else {
        closeForm();
        load();
      }
    } else {
      const { error: err } = await supabase.from("market_items").insert({
        ...payload,
        seller_id: user.id,
        seller_name: sellerName,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
      if (err) setFormError(err.message);
      else {
        closeForm();
        load();
      }
    }
    setSaving(false);
  };

  const toggleSold = async (item: Listing) => {
    const next = item.status === "sold" ? "available" : "sold";
    const { error: err } = await supabase
      .from("market_items")
      .update({ status: next })
      .eq("id", item.id)
      .eq("seller_id", user?.id ?? "");
    if (err) setError(err.message);
    else {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: next } : i)));
      setSelected((s) => (s && s.id === item.id ? { ...s, status: next } : s));
    }
  };

  const deleteItem = async (item: Listing) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    const { error: err } = await supabase.from("market_items").delete().eq("id", item.id).eq("seller_id", user?.id ?? "");
    if (err) setError(err.message);
    else {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      setSelected(null);
    }
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
            onClick={() => (showForm ? closeForm() : openNew())}
            className="flex items-center gap-1 rounded-full bg-meskot-gold-deep px-4 py-2 text-sm font-bold text-meskot-cream transition hover:brightness-110"
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Close" : "Sell item"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={submit} className="mb-4 grid gap-2 rounded-2xl border-2 border-meskot-gold/30 bg-meskot-paper p-3">
            <p className="text-sm font-bold">{editing ? "Edit listing" : "New listing"}</p>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Item title"
              maxLength={80}
              className={inputCls}
            />
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your item (condition, size, pickup area)"
              maxLength={500}
              rows={3}
              className={`${inputCls} h-auto py-2`}
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
                {LISTING_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            {formError && <p className="text-xs font-semibold text-meskot-live">{formError}</p>}
            <button
              type="submit"
              disabled={saving}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-meskot-gold-deep text-sm font-bold text-meskot-cream disabled:opacity-70"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Save changes" : "List item"}
            </button>
          </form>
        )}

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Market"
          className="mb-3 h-11 w-full rounded-full border-2 border-meskot-gold/30 bg-meskot-paper px-5 text-sm text-meskot-ink outline-none focus:border-meskot-gold"
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
          <button onClick={() => setMineOnly((s) => !s)} className={chip(mineOnly)}>
            My listings
          </button>
        </div>
      </section>

      {error && (
        <p className="rounded-2xl border border-meskot-live/30 bg-meskot-live/10 px-4 py-2 text-sm font-medium text-meskot-live">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-meskot-gold-deep" />
        </div>
      ) : visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-meskot-sage">No items match your filters.</p>
      ) : (
        <section className="grid grid-cols-2 gap-3">
          {visible.map((i) => {
            const isSaved = savedIds.has(i.id);
            return (
              <article
                key={i.id}
                onClick={() => setSelected(i)}
                className="cursor-pointer overflow-hidden rounded-[24px] border-2 border-meskot-gold/30 bg-meskot-cream shadow-sm transition hover:border-meskot-gold/60"
              >
                <div className={`relative h-32 ${i.color}`}>
                  {i.status === "sold" && (
                    <span className="absolute left-2 top-2 rounded-full bg-meskot-ink px-2 py-0.5 text-[10px] font-bold text-meskot-cream">
                      SOLD
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSave(i);
                    }}
                    aria-label={isSaved ? "Unsave item" : "Save item"}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-meskot-cream text-meskot-gold-deep shadow"
                  >
                    {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  </button>
                </div>
                <div className="p-3">
                  <div className="truncate text-sm font-semibold">{i.title}</div>
                  <div className="font-serif text-lg font-bold text-meskot-gold-deep">${i.price.toFixed(2)}</div>
                  <div className="truncate text-xs text-meskot-sage">
                    {i.category} · {i.seller_id === user?.id ? "You" : i.seller_name}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-meskot-ink/50 p-4 sm:items-center"
          onClick={() => setSelected(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-[28px] border-2 border-meskot-gold/40 bg-meskot-cream shadow-xl"
          >
            <div className={`relative h-44 ${selected.color}`}>
              <button
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-meskot-cream text-meskot-ink shadow"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2 p-5">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-serif text-xl font-bold">{selected.title}</h2>
                {selected.status === "sold" && (
                  <span className="rounded-full bg-meskot-ink px-2 py-0.5 text-[11px] font-bold text-meskot-cream">SOLD</span>
                )}
              </div>
              <div className="font-serif text-2xl font-bold text-meskot-gold-deep">${selected.price.toFixed(2)}</div>
              <div className="text-xs font-semibold text-meskot-sage">
                {selected.category} · Listed by {selected.seller_id === user?.id ? "you" : selected.seller_name}
              </div>
              {selected.description && <p className="text-sm leading-relaxed">{selected.description}</p>}

              <div className="grid grid-cols-2 gap-2 pt-3">
                {selected.seller_id === user?.id ? (
                  <>
                    <button
                      onClick={() => toggleSold(selected)}
                      className="h-11 rounded-full bg-meskot-gold-deep text-sm font-bold text-meskot-cream"
                    >
                      {selected.status === "sold" ? "Mark available" : "Mark as sold"}
                    </button>
                    <button
                      onClick={() => openEdit(selected)}
                      className="flex h-11 items-center justify-center gap-1 rounded-full border-2 border-meskot-gold/60 text-sm font-bold text-meskot-gold-deep"
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </button>
                    <button
                      onClick={() => deleteItem(selected)}
                      className="col-span-2 flex h-11 items-center justify-center gap-1 rounded-full border-2 border-meskot-live/40 text-sm font-bold text-meskot-live"
                    >
                      <Trash2 className="h-4 w-4" /> Delete listing
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => toggleSave(selected)}
                      className="h-11 rounded-full border-2 border-meskot-gold/60 text-sm font-bold text-meskot-gold-deep"
                    >
                      {savedIds.has(selected.id) ? "Unsave" : "Save item"}
                    </button>
                    <a
                      href={`/messages`}
                      className="flex h-11 items-center justify-center rounded-full bg-meskot-gold-deep text-sm font-bold text-meskot-cream"
                    >
                      Message seller
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
