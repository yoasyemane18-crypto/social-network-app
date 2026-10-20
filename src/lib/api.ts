import { supabase } from "@/lib/supabase";

export type Person = { id: string; name: string; username: string | null };

export const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

export async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("You are not signed in.");
  return data.user.id;
}

export async function fetchPeopleMap(): Promise<Map<string, Person>> {
  const { data, error } = await supabase.from("profiles").select("id, full_name, username").limit(500);
  if (error) throw error;
  return new Map(
    (data ?? []).map((p: { id: string; full_name: string; username: string | null }) => [
      p.id,
      { id: p.id, name: p.full_name, username: p.username },
    ]),
  );
}

export function personFrom(map: Map<string, Person>, id: string): Person {
  return map.get(id) ?? { id, name: "Member", username: null };
}

/* ---------- Media ---------- */

export async function uploadMedia(file: File): Promise<{ url: string; type: "image" | "video" }> {
  const uid = await currentUserId();
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${uid}/${Date.now()}-${safe}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return { url: data.publicUrl, type: file.type.startsWith("video") ? "video" : "image" };
}

/* ---------- Posts, reels, stories ---------- */

export type Comment = { id: string; postId: string; authorId: string; body: string; createdAt: string; author: Person };

export type Post = {
  id: string;
  authorId: string;
  body: string;
  mediaUrl: string | null;
  mediaType: "image" | "video" | null;
  kind: "post" | "reel" | "story";
  isLive: boolean;
  createdAt: string;
  author: Person;
  likes: number;
  likedByMe: boolean;
  comments: Comment[];
};

export async function fetchPosts(kind: "post" | "reel" | "story", limit = 50): Promise<Post[]> {
  const uid = await currentUserId();
  const { data: rows, error } = await supabase
    .from("posts")
    .select("id, author_id, body, media_url, media_type, kind, is_live, created_at")
    .eq("kind", kind)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  const posts = rows ?? [];
  if (!posts.length) return [];

  const ids = posts.map((p: { id: string }) => p.id);
  const [people, likesRes, commentsRes] = await Promise.all([
    fetchPeopleMap(),
    supabase.from("post_likes").select("post_id, user_id").in("post_id", ids),
    supabase.from("comments").select("id, post_id, author_id, body, created_at").in("post_id", ids).order("created_at"),
  ]);
  if (likesRes.error) throw likesRes.error;
  if (commentsRes.error) throw commentsRes.error;

  const likeRows = likesRes.data ?? [];
  const commentRows = commentsRes.data ?? [];

  return posts.map((p: any): Post => {
    const postLikes = likeRows.filter((l: any) => l.post_id === p.id);
    return {
      id: p.id,
      authorId: p.author_id,
      body: p.body,
      mediaUrl: p.media_url,
      mediaType: p.media_type,
      kind: p.kind,
      isLive: p.is_live,
      createdAt: p.created_at,
      author: personFrom(people, p.author_id),
      likes: postLikes.length,
      likedByMe: postLikes.some((l: any) => l.user_id === uid),
      comments: commentRows
        .filter((c: any) => c.post_id === p.id)
        .map((c: any): Comment => ({
          id: c.id,
          postId: c.post_id,
          authorId: c.author_id,
          body: c.body,
          createdAt: c.created_at,
          author: personFrom(people, c.author_id),
        })),
    };
  });
}

export async function createPost(input: {
  kind: "post" | "reel" | "story";
  body: string;
  file?: File | null;
  isLive?: boolean;
}): Promise<void> {
  const uid = await currentUserId();
  let mediaUrl: string | null = null;
  let mediaType: "image" | "video" | null = null;
  if (input.file) {
    const up = await uploadMedia(input.file);
    mediaUrl = up.url;
    mediaType = up.type;
  }
  const { error } = await supabase.from("posts").insert({
    author_id: uid,
    kind: input.kind,
    body: input.body.trim(),
    media_url: mediaUrl,
    media_type: mediaType,
    is_live: input.isLive ?? false,
  });
  if (error) throw error;
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
}

export async function setLiked(postId: string, liked: boolean): Promise<void> {
  const uid = await currentUserId();
  if (liked) {
    const { error } = await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", uid);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("post_likes").insert({ post_id: postId, user_id: uid });
    if (error) throw error;
  }
}

export async function addComment(postId: string, body: string): Promise<void> {
  const uid = await currentUserId();
  const { error } = await supabase.from("comments").insert({ post_id: postId, author_id: uid, body: body.trim() });
  if (error) throw error;
}

/* ---------- Friends & follows ---------- */

export type Relations = {
  friends: Person[];
  incoming: Person[];
  outgoing: Person[];
  suggestions: Person[];
};

export async function fetchRelations(): Promise<Relations> {
  const uid = await currentUserId();
  const [people, fr] = await Promise.all([
    fetchPeopleMap(),
    supabase
      .from("friendships")
      .select("requester_id, addressee_id, status")
      .or(`requester_id.eq.${uid},addressee_id.eq.${uid}`),
  ]);
  if (fr.error) throw fr.error;

  const friends: Person[] = [];
  const incoming: Person[] = [];
  const outgoing: Person[] = [];
  const related = new Set<string>([uid]);

  for (const row of fr.data ?? []) {
    const other = row.requester_id === uid ? row.addressee_id : row.requester_id;
    related.add(other);
    if (row.status === "accepted") friends.push(personFrom(people, other));
    else if (row.addressee_id === uid) incoming.push(personFrom(people, other));
    else outgoing.push(personFrom(people, other));
  }

  const suggestions = [...people.values()].filter((p) => !related.has(p.id));
  return { friends, incoming, outgoing, suggestions };
}

export async function sendFriendRequest(to: string): Promise<void> {
  const uid = await currentUserId();
  const { error } = await supabase.from("friendships").insert({ requester_id: uid, addressee_id: to });
  if (error) throw error;
}

export async function acceptFriendRequest(from: string): Promise<void> {
  const uid = await currentUserId();
  const { error } = await supabase
    .from("friendships")
    .update({ status: "accepted" })
    .eq("requester_id", from)
    .eq("addressee_id", uid);
  if (error) throw error;
}

export async function removeFriendship(other: string): Promise<void> {
  const uid = await currentUserId();
  const { error } = await supabase
    .from("friendships")
    .delete()
    .or(
      `and(requester_id.eq.${uid},addressee_id.eq.${other}),and(requester_id.eq.${other},addressee_id.eq.${uid})`,
    );
  if (error) throw error;
}

export async function fetchFollowing(): Promise<Set<string>> {
  const uid = await currentUserId();
  const { data, error } = await supabase.from("follows").select("followee_id").eq("follower_id", uid);
  if (error) throw error;
  return new Set((data ?? []).map((r: { followee_id: string }) => r.followee_id));
}

export async function setFollowing(followee: string, follow: boolean): Promise<void> {
  const uid = await currentUserId();
  if (follow) {
    const { error } = await supabase.from("follows").insert({ follower_id: uid, followee_id: followee });
    if (error) throw error;
  } else {
    const { error } = await supabase.from("follows").delete().eq("follower_id", uid).eq("followee_id", followee);
    if (error) throw error;
  }
}

/* ---------- Messages ---------- */

export type Message = { id: string; senderId: string; recipientId: string; body: string; createdAt: string; read: boolean };

export async function fetchMessages(): Promise<Message[]> {
  const uid = await currentUserId();
  const { data, error } = await supabase
    .from("messages")
    .select("id, sender_id, recipient_id, body, read, created_at")
    .or(`sender_id.eq.${uid},recipient_id.eq.${uid}`)
    .order("created_at", { ascending: true })
    .limit(1000);
  if (error) throw error;
  return (data ?? []).map((m: any): Message => ({
    id: m.id,
    senderId: m.sender_id,
    recipientId: m.recipient_id,
    body: m.body,
    read: m.read,
    createdAt: m.created_at,
  }));
}

export async function sendMessage(to: string, body: string): Promise<void> {
  const uid = await currentUserId();
  const { error } = await supabase.from("messages").insert({ sender_id: uid, recipient_id: to, body: body.trim() });
  if (error) throw error;
}

export async function markThreadRead(from: string): Promise<void> {
  const uid = await currentUserId();
  const { error } = await supabase
    .from("messages")
    .update({ read: true })
    .eq("sender_id", from)
    .eq("recipient_id", uid)
    .eq("read", false);
  if (error) throw error;
}

/* ---------- Market ---------- */

export type MarketItem = {
  id: string;
  sellerId: string;
  title: string;
  price: number;
  category: string;
  description: string;
  seller: Person;
  saved: boolean;
  createdAt: string;
};

export async function fetchMarket(): Promise<MarketItem[]> {
  const uid = await currentUserId();
  const [people, itemsRes, savedRes] = await Promise.all([
    fetchPeopleMap(),
    supabase
      .from("market_items")
      .select("id, seller_id, title, price, category, description, created_at")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("saved_items").select("item_id").eq("user_id", uid),
  ]);
  if (itemsRes.error) throw itemsRes.error;
  if (savedRes.error) throw savedRes.error;
  const saved = new Set((savedRes.data ?? []).map((s: { item_id: string }) => s.item_id));
  return (itemsRes.data ?? []).map((i: any): MarketItem => ({
    id: i.id,
    sellerId: i.seller_id,
    title: i.title,
    price: Number(i.price),
    category: i.category,
    description: i.description,
    seller: personFrom(people, i.seller_id),
    saved: saved.has(i.id),
    createdAt: i.created_at,
  }));
}

export async function createMarketItem(input: {
  title: string;
  price: number;
  category: string;
  description: string;
}): Promise<void> {
  const uid = await currentUserId();
  const { error } = await supabase.from("market_items").insert({ seller_id: uid, ...input });
  if (error) throw error;
}

export async function deleteMarketItem(id: string): Promise<void> {
  const { error } = await supabase.from("market_items").delete().eq("id", id);
  if (error) throw error;
}

export async function setSaved(itemId: string, save: boolean): Promise<void> {
  const uid = await currentUserId();
  if (save) {
    const { error } = await supabase.from("saved_items").insert({ user_id: uid, item_id: itemId });
    if (error) throw error;
  } else {
    const { error } = await supabase.from("saved_items").delete().eq("user_id", uid).eq("item_id", itemId);
    if (error) throw error;
  }
}

/* ---------- Alerts ---------- */

export type AlertRow = { id: string; kind: string; text: string; read: boolean; createdAt: string };

export async function fetchAlerts(): Promise<AlertRow[]> {
  const uid = await currentUserId();
  const { data, error } = await supabase
    .from("alerts")
    .select("id, kind, text, read, created_at")
    .eq("user_id", uid)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []).map((a: any): AlertRow => ({
    id: a.id,
    kind: a.kind,
    text: a.text,
    read: a.read,
    createdAt: a.created_at,
  }));
}

export async function markAlertsRead(ids?: string[]): Promise<void> {
  const uid = await currentUserId();
  let q = supabase.from("alerts").update({ read: true }).eq("user_id", uid);
  if (ids) q = q.in("id", ids);
  const { error } = await q;
  if (error) throw error;
}

export async function deleteAlert(id: string): Promise<void> {
  const { error } = await supabase.from("alerts").delete().eq("id", id);
  if (error) throw error;
}

/* ---------- Search ---------- */

export async function searchPeople(q: string): Promise<Person[]> {
  const term = q.trim().replace(/[%,]/g, "");
  if (!term) return [];
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, username")
    .or(`full_name.ilike.%${term}%,username.ilike.%${term}%`)
    .limit(20);
  if (error) throw error;
  return (data ?? []).map((p: any) => ({ id: p.id, name: p.full_name, username: p.username }));
}

/* ---------- Profile ---------- */

export async function updateProfile(input: { full_name: string; username: string; bio: string }): Promise<void> {
  const uid = await currentUserId();
  const { error } = await supabase.from("profiles").update(input).eq("id", uid);
  if (error) throw error;
}
