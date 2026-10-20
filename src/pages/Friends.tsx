import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import {
  Person,
  Relations,
  acceptFriendRequest,
  fetchFollowing,
  fetchRelations,
  initialsOf,
  removeFriendship,
  sendFriendRequest,
  setFollowing,
} from "@/lib/api";

type Tab = "friends" | "requests" | "suggestions";

const EMPTY: Relations = { friends: [], incoming: [], outgoing: [], suggestions: [] };

export default function Friends() {
  const [tab, setTab] = useState<Tab>("friends");
  const [query, setQuery] = useState("");
  const [rel, setRel] = useState<Relations>(EMPTY);
  const [following, setFollowingSet] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [r, f] = await Promise.all([fetchRelations(), fetchFollowing()]);
      setRel(r);
      setFollowingSet(f);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (id: string, fn: () => Promise<void>, success: string) => {
    setBusyId(id);
    try {
      await fn();
      toast.success(success);
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const q = query.trim().toLowerCase();
  const match = (p: Person) => p.name.toLowerCase().includes(q) || (p.username ?? "").toLowerCase().includes(q);

  const tabs: { key: Tab; label: string; count: number }[] = useMemo(
    () => [
      { key: "friends", label: "Friends", count: rel.friends.length },
      { key: "requests", label: "Requests", count: rel.incoming.length },
      { key: "suggestions", label: "Suggestions", count: rel.suggestions.length },
    ],
    [rel],
  );

  const btn = "rounded-full px-3 py-1.5 text-xs font-bold transition disabled:opacity-50";
  const primary = `${btn} bg-meskot-gold-deep text-meskot-cream hover:brightness-110`;
  const ghost = `${btn} border-2 border-meskot-gold/40 bg-meskot-paper text-meskot-ink hover:bg-meskot-gold/10`;

  const Row = ({ p, actions }: { p: Person; actions: ReactNode }) => (
    <li className="flex items-center gap-3 rounded-2xl p-2 hover:bg-meskot-gold/5">
      <Avatar initials={initialsOf(p.name)} color="bg-meskot-gold-deep" size="h-12 w-12" />
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold">{p.name}</div>
        <div className="truncate text-xs text-meskot-sage">{p.username ? `@${p.username}` : "Meskot member"}</div>
      </div>
      <div className="flex flex-wrap justify-end gap-2">{actions}</div>
    </li>
  );

  const Empty = ({ text }: { text: string }) => <li className="py-8 text-center text-sm text-meskot-sage">{text}</li>;

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
                tab === t.key ? "border-meskot-gold bg-meskot-gold/15 text-meskot-ink" : "border-transparent text-meskot-sage hover:text-meskot-ink"
              }`}
            >
              {t.label} <span className="text-xs">({t.count})</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border-2 border-meskot-gold/30 bg-meskot-cream p-3 shadow-sm">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-meskot-gold-deep" />
          </div>
        ) : (
          <>
            {tab === "friends" && (
              <ul className="space-y-1">
                {rel.friends.filter(match).map((p) => (
                  <Row
                    key={p.id}
                    p={p}
                    actions={
                      <button disabled={busyId === p.id} onClick={() => run(p.id, () => removeFriendship(p.id), "Friend removed")} className={ghost}>
                        Remove
                      </button>
                    }
                  />
                ))}
                {rel.friends.filter(match).length === 0 && <Empty text="No friends yet. Add some from Suggestions." />}
              </ul>
            )}

            {tab === "requests" && (
              <ul className="space-y-1">
                {rel.incoming.filter(match).map((p) => (
                  <Row
                    key={p.id}
                    p={p}
                    actions={
                      <>
                        <button disabled={busyId === p.id} onClick={() => run(p.id, () => acceptFriendRequest(p.id), "Friend request accepted")} className={primary}>
                          Accept
                        </button>
                        <button disabled={busyId === p.id} onClick={() => run(p.id, () => removeFriendship(p.id), "Request declined")} className={ghost}>
                          Decline
                        </button>
                      </>
                    }
                  />
                ))}
                {rel.incoming.filter(match).length === 0 && <Empty text="No pending requests." />}
              </ul>
            )}

            {tab === "suggestions" && (
              <ul className="space-y-1">
                {rel.outgoing.filter(match).map((p) => (
                  <Row
                    key={p.id}
                    p={p}
                    actions={
                      <button disabled={busyId === p.id} onClick={() => run(p.id, () => removeFriendship(p.id), "Request cancelled")} className={ghost}>
                        Requested · Cancel
                      </button>
                    }
                  />
                ))}
                {rel.suggestions.filter(match).map((p) => (
                  <Row
                    key={p.id}
                    p={p}
                    actions={
                      <>
                        <button disabled={busyId === p.id} onClick={() => run(p.id, () => sendFriendRequest(p.id), "Friend request sent")} className={primary}>
                          Add friend
                        </button>
                        <button
                          disabled={busyId === p.id}
                          onClick={() =>
                            run(
                              p.id,
                              () => setFollowing(p.id, !following.has(p.id)),
                              following.has(p.id) ? "Unfollowed" : "Following",
                            )
                          }
                          className={ghost}
                        >
                          {following.has(p.id) ? "Following" : "Follow"}
                        </button>
                      </>
                    }
                  />
                ))}
                {rel.suggestions.filter(match).length === 0 && rel.outgoing.filter(match).length === 0 && (
                  <Empty text="No suggestions right now." />
                )}
              </ul>
            )}
          </>
        )}
      </section>
    </div>
  );
}
