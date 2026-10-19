import { useState } from "react";

type Comment = { id: number; author: string; text: string };
type Post = {
  id: number;
  author: string;
  initials: string;
  color: string;
  time: string;
  text: string;
  likes: number;
  liked: boolean;
  comments: Comment[];
};

const ME = { name: "You", initials: "ME", color: "bg-blue-600" };

const initialPosts: Post[] = [
  {
    id: 1,
    author: "Ava Johnson",
    initials: "AJ",
    color: "bg-rose-500",
    time: "2h",
    text: "Just finished my first marathon! Legs are jelly but my heart is full.",
    likes: 128,
    liked: false,
    comments: [{ id: 1, author: "Ben Lee", text: "Congrats, that is huge!" }],
  },
  {
    id: 2,
    author: "Marcus Chen",
    initials: "MC",
    color: "bg-emerald-500",
    time: "5h",
    text: "Weekend hike was unreal. The view from the top made every step worth it.",
    likes: 64,
    liked: false,
    comments: [],
  },
  {
    id: 3,
    author: "Priya Patel",
    initials: "PP",
    color: "bg-amber-500",
    time: "1d",
    text: "Tried baking sourdough for the first time today. It is flat, but it tastes great!",
    likes: 210,
    liked: false,
    comments: [
      { id: 1, author: "Ava Johnson", text: "Flat bread still counts as a win." },
      { id: 2, author: "Marcus Chen", text: "Send the recipe please!" },
    ],
  },
];

const stories = [
  { name: "Ava", initials: "AJ", color: "bg-rose-500" },
  { name: "Marcus", initials: "MC", color: "bg-emerald-500" },
  { name: "Priya", initials: "PP", color: "bg-amber-500" },
  { name: "Ben", initials: "BL", color: "bg-violet-500" },
  { name: "Sofia", initials: "SR", color: "bg-sky-500" },
];

const friends = [
  { name: "Ben Lee", initials: "BL", color: "bg-violet-500", online: true },
  { name: "Sofia Rossi", initials: "SR", color: "bg-sky-500", online: true },
  { name: "Liam Brown", initials: "LB", color: "bg-teal-500", online: false },
  { name: "Noah Kim", initials: "NK", color: "bg-orange-500", online: true },
];

const menu = ["Friends", "Groups", "Marketplace", "Watch", "Memories", "Saved"];

function Avatar({ initials, color, size = "h-10 w-10" }: { initials: string; color: string; size?: string }) {
  return (
    <div className={`${size} ${color} flex shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white`}>
      {initials}
    </div>
  );
}

export default function Index() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [draft, setDraft] = useState("");
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [openComments, setOpenComments] = useState<Record<number, boolean>>({});
  const [nextId, setNextId] = useState(100);

  const toggleLike = (id: number) =>
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
      )
    );

  const publish = () => {
    const text = draft.trim();
    if (!text) return;
    const post: Post = {
      id: nextId,
      author: ME.name,
      initials: ME.initials,
      color: ME.color,
      time: "Just now",
      text,
      likes: 0,
      liked: false,
      comments: [],
    };
    setPosts((prev) => [post, ...prev]);
    setNextId((n) => n + 1);
    setDraft("");
  };

  const addComment = (postId: number) => {
    const text = (commentDrafts[postId] ?? "").trim();
    if (!text) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, comments: [...p.comments, { id: Date.now(), author: ME.name, text }] }
          : p
      )
    );
    setCommentDrafts((d) => ({ ...d, [postId]: "" }));
  };

  const deletePost = (id: number) => setPosts((prev) => prev.filter((p) => p.id !== id));

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Top bar */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
            f
          </div>
          <input
            placeholder="Search Buildify"
            className="hidden w-64 rounded-full bg-slate-100 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 md:block"
          />
        </div>
        <nav className="hidden gap-6 text-sm font-medium text-slate-500 sm:flex">
          <span className="border-b-2 border-blue-600 pb-3 pt-3 text-blue-600">Home</span>
          <span className="pt-3 hover:text-slate-800">Reels</span>
          <span className="pt-3 hover:text-slate-800">Market</span>
        </nav>
        <Avatar initials={ME.initials} color={ME.color} size="h-9 w-9" />
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-3 py-6 md:grid-cols-[220px_1fr] lg:grid-cols-[220px_1fr_260px]">
        {/* Left sidebar */}
        <aside className="hidden space-y-1 md:block">
          <div className="mb-3 flex items-center gap-3 rounded-lg p-2 hover:bg-slate-200">
            <Avatar initials={ME.initials} color={ME.color} size="h-8 w-8" />
            <span className="text-sm font-semibold">{ME.name}</span>
          </div>
          {menu.map((item) => (
            <div key={item} className="cursor-pointer rounded-lg px-2 py-2 text-sm font-medium hover:bg-slate-200">
              {item}
            </div>
          ))}
        </aside>

        {/* Feed */}
        <main className="space-y-4">
          {/* Stories */}
          <div className="flex gap-3 overflow-x-auto pb-1">
            {stories.map((s) => (
              <div
                key={s.name}
                className="flex h-44 w-28 shrink-0 cursor-pointer flex-col justify-between overflow-hidden rounded-xl bg-white shadow-sm"
              >
                <div className={`${s.color} flex flex-1 items-center justify-center text-2xl font-bold text-white`}>
                  {s.initials}
                </div>
                <div className="p-2 text-center text-xs font-semibold">{s.name}</div>
              </div>
            ))}
          </div>

          {/* Composer */}
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex gap-3">
              <Avatar initials={ME.initials} color={ME.color} />
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="What is on your mind?"
                rows={2}
                className="flex-1 resize-none rounded-lg bg-slate-100 p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">{draft.trim().length} characters</span>
              <button
                onClick={publish}
                disabled={!draft.trim()}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Post
              </button>
            </div>
          </div>

          {/* Posts */}
          {posts.length === 0 && (
            <p className="rounded-xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
              No posts yet. Share something above!
            </p>
          )}
          {posts.map((post) => (
            <article key={post.id} className="rounded-xl bg-white shadow-sm">
              <div className="flex items-start justify-between p-4">
                <div className="flex gap-3">
                  <Avatar initials={post.initials} color={post.color} />
                  <div>
                    <div className="text-sm font-semibold">{post.author}</div>
                    <div className="text-xs text-slate-500">{post.time}</div>
                  </div>
                </div>
                {post.author === ME.name && (
                  <button
                    onClick={() => deletePost(post.id)}
                    className="text-xs font-medium text-slate-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="px-4 pb-4 text-sm leading-relaxed">{post.text}</p>

              <div className="flex justify-between border-t border-slate-200 px-4 py-2 text-xs text-slate-500">
                <span>{post.likes} likes</span>
                <span>{post.comments.length} comments</span>
              </div>
              <div className="grid grid-cols-2 border-t border-slate-200 text-sm font-semibold text-slate-600">
                <button
                  onClick={() => toggleLike(post.id)}
                  className={`py-2 transition hover:bg-slate-100 ${post.liked ? "text-blue-600" : ""}`}
                >
                  {post.liked ? "Liked" : "Like"}
                </button>
                <button
                  onClick={() => setOpenComments((o) => ({ ...o, [post.id]: !o[post.id] }))}
                  className="py-2 transition hover:bg-slate-100"
                >
                  Comment
                </button>
              </div>

              {openComments[post.id] && (
                <div className="space-y-3 border-t border-slate-200 p-4">
                  {post.comments.map((c) => (
                    <div key={c.id} className="flex gap-2">
                      <Avatar initials={c.author.split(" ").map((w) => w[0]).join("").slice(0, 2)} color="bg-slate-400" size="h-8 w-8" />
                      <div className="rounded-xl bg-slate-100 px-3 py-2">
                        <div className="text-xs font-semibold">{c.author}</div>
                        <div className="text-sm">{c.text}</div>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      value={commentDrafts[post.id] ?? ""}
                      onChange={(e) => setCommentDrafts((d) => ({ ...d, [post.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && addComment(post.id)}
                      placeholder="Write a comment..."
                      className="flex-1 rounded-full bg-slate-100 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => addComment(post.id)}
                      className="rounded-full bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </main>

        {/* Right sidebar */}
        <aside className="hidden space-y-3 lg:block">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-500">Contacts</h2>
            <ul className="space-y-3">
              {friends.map((f) => (
                <li key={f.name} className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar initials={f.initials} color={f.color} size="h-8 w-8" />
                    {f.online && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{f.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <footer className="pb-6 text-center text-xs text-slate-500">
        Sample data only. Posts, likes and comments work during this session.
      </footer>
    </div>
  );
}
