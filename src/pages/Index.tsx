import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  Globe,
  Image as ImageIcon,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Share2,
  Sparkles,
  ThumbsUp,
  Video,
} from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { ME, Post, initialFriends, initialPosts } from "@/lib/mockData";

export default function Index() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [draft, setDraft] = useState("");
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [openComments, setOpenComments] = useState<Record<number, boolean>>({});
  const [nextId, setNextId] = useState(100);
  const [composerMode, setComposerMode] = useState<string | null>(null);

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
      color: "",
      time: "Just now",
      text,
      likes: 0,
      liked: false,
      comments: [],
    };
    setPosts((prev) => [post, ...prev]);
    setNextId((n) => n + 1);
    setDraft("");
    setComposerMode(null);
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

  const composerButtons = [
    { label: "Live", icon: null, tone: "bg-meskot-live text-meskot-cream border-transparent" },
    { label: "Story", icon: Camera, tone: "bg-meskot-cream text-meskot-gold-deep border-meskot-gold/40" },
    { label: "Reel", icon: Video, tone: "bg-meskot-gold-deep text-meskot-cream border-transparent" },
    { label: "Photo", icon: ImageIcon, tone: "bg-meskot-cream text-meskot-ink border-meskot-ink/20" },
  ];

  return (
    <div className="space-y-4">
      {/* Stories card */}
      <section className="rounded-[28px] border-2 border-meskot-gold/50 bg-meskot-cream p-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-meskot-gold to-meskot-gold-deep text-meskot-cream">
            <Sparkles className="h-5 w-5" />
          </div>
          <h2 className="font-serif text-lg font-bold">Meskot Stories</h2>
          <span className="rounded-full border-2 border-meskot-live/30 bg-meskot-live/10 px-3 py-0.5 text-xs font-bold tracking-wider text-meskot-live">
            1 LIVE
          </span>
          <button className="ml-auto text-sm font-bold text-meskot-gold-deep">+ Add Moment</button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button className="flex h-72 flex-col overflow-hidden rounded-[24px] border-2 border-meskot-rose/60 bg-meskot-paper text-left">
            <div className="relative h-[62%] overflow-hidden">
              <img src={ME.photo} alt="Create story" className="h-full w-full object-cover object-top" />
            </div>
            <div className="relative flex flex-1 flex-col items-center justify-end pb-4">
              <span className="absolute -top-6 flex h-12 w-12 items-center justify-center rounded-full border-4 border-meskot-cream bg-gradient-to-br from-meskot-gold to-meskot-gold-deep text-meskot-cream shadow-md">
                <Plus className="h-6 w-6" />
              </span>
              <span className="text-base font-bold">Create Story</span>
              <span className="text-sm font-semibold text-meskot-gold-deep">Share moment</span>
            </div>
          </button>

          <div className="relative h-72 overflow-hidden rounded-[24px] border-2 border-meskot-gold bg-meskot-ink shadow-md">
            <img src={ME.photo} alt="Your story" className="h-full w-full object-cover object-top" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-10">
              <span className="text-sm font-bold text-meskot-cream">Your Story</span>
            </div>
            <div className="absolute left-3 top-3">
              <Avatar photo={ME.photo} initials={ME.initials} size="h-11 w-11" ring />
            </div>
          </div>
        </div>
      </section>

      {/* Composer */}
      <section className="rounded-[28px] border-2 border-meskot-gold/30 bg-meskot-cream p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar photo={ME.photo} initials={ME.initials} size="h-14 w-14" />
          <input
            value={draft}
            onFocus={() => setComposerMode("post")}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && publish()}
            placeholder="What's on your mind?"
            className="h-12 flex-1 rounded-full border-2 border-meskot-gold/30 bg-meskot-paper px-5 text-base font-medium text-meskot-ink placeholder:text-meskot-gold-deep/80 outline-none focus:border-meskot-gold"
          />
        </div>
        <div className="my-4 h-px bg-meskot-gold/20" />
        <div className="grid grid-cols-4 gap-2">
          {composerButtons.map(({ label, icon: Icon, tone }) => (
            <button
              key={label}
              onClick={() => setComposerMode(label.toLowerCase())}
              className={`flex h-12 items-center justify-center gap-1.5 rounded-2xl border-2 px-2 text-sm font-bold transition hover:brightness-95 ${tone}`}
            >
              {Icon ? <Icon className="h-4 w-4 shrink-0" /> : <span className="h-2.5 w-2.5 rounded-full bg-meskot-cream" />}
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>
        {draft.trim() && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs font-medium text-meskot-sage">{composerMode ?? "post"}</span>
            <button
              onClick={publish}
              className="rounded-full bg-meskot-gold-deep px-6 py-2 text-sm font-bold text-meskot-cream transition hover:brightness-110"
            >
              Post
            </button>
          </div>
        )}
      </section>

      {/* Posts */}
      {posts.map((post) => (
        <article
          key={post.id}
          className="overflow-hidden rounded-[28px] border-2 border-meskot-gold/30 bg-meskot-cream shadow-sm"
        >
          <div className="h-1.5 bg-gradient-to-r from-meskot-gold/40 via-meskot-gold to-meskot-gold/40" />
          <div className="flex items-start gap-3 p-4">
            <Avatar
              initials={post.initials}
              color={post.color || undefined}
              photo={post.author === ME.name ? ME.photo : undefined}
              size="h-14 w-14"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-serif text-base font-bold">{post.author}</span>
                {post.sponsored && (
                  <span className="rounded-xl bg-meskot-gold-deep px-2.5 py-1 text-[11px] font-bold text-meskot-cream">
                    Sponsored · Boosted
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs font-medium text-meskot-sage">
                {post.time}
                <span>·</span>
                <Globe className="h-3.5 w-3.5" />
              </div>
            </div>
            {post.author === ME.name ? (
              <button
                onClick={() => deletePost(post.id)}
                className="text-xs font-bold text-meskot-sage hover:text-meskot-live"
              >
                Delete
              </button>
            ) : (
              <MoreHorizontal className="h-6 w-6 text-meskot-sage" />
            )}
          </div>

          <p className="px-4 pb-4 text-[15px] leading-relaxed">{post.text}</p>

          {post.id === 1 && (
            <div className="mx-4 mb-4 h-48 overflow-hidden rounded-2xl bg-gradient-to-br from-meskot-ink via-meskot-sage to-meskot-gold-deep" />
          )}

          <div className="flex items-center justify-between px-4 pb-2 text-xs font-medium text-meskot-sage">
            <span className="flex items-center gap-1">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-meskot-gold text-[10px] text-meskot-cream">
                <ThumbsUp className="h-3 w-3" />
              </span>
              {post.likes}
            </span>
            <span>{post.comments.length} comments</span>
          </div>

          <div className="grid grid-cols-3 border-t border-meskot-gold/20 text-sm font-bold text-meskot-sage">
            <button
              onClick={() => toggleLike(post.id)}
              className={`flex items-center justify-center gap-1.5 py-3 transition hover:bg-meskot-gold/10 ${
                post.liked ? "text-meskot-gold-deep" : ""
              }`}
            >
              <ThumbsUp className="h-4 w-4" /> {post.liked ? "Liked" : "Like"}
            </button>
            <button
              onClick={() => setOpenComments((o) => ({ ...o, [post.id]: !o[post.id] }))}
              className="flex items-center justify-center gap-1.5 py-3 transition hover:bg-meskot-gold/10"
            >
              <MessageSquare className="h-4 w-4" /> Comment
            </button>
            <button className="flex items-center justify-center gap-1.5 py-3 transition hover:bg-meskot-gold/10">
              <Share2 className="h-4 w-4" /> Share
            </button>
          </div>

          {openComments[post.id] && (
            <div className="space-y-3 border-t border-meskot-gold/20 bg-meskot-paper/60 p-4">
              {post.comments.map((c) => (
                <div key={c.id} className="flex gap-2">
                  <Avatar
                    initials={c.author.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                    color="bg-meskot-sage"
                    size="h-8 w-8"
                  />
                  <div className="rounded-2xl bg-meskot-cream px-3 py-2">
                    <div className="text-xs font-bold">{c.author}</div>
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
                  className="flex-1 rounded-full border-2 border-meskot-gold/30 bg-meskot-cream px-4 py-2 text-sm outline-none focus:border-meskot-gold"
                />
                <button
                  onClick={() => addComment(post.id)}
                  className="rounded-full bg-meskot-gold-deep px-4 text-sm font-bold text-meskot-cream"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </article>
      ))}

      {/* Contacts */}
      <section className="rounded-[28px] border-2 border-meskot-gold/30 bg-meskot-cream p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-base font-bold">Contacts</h2>
          <Link to="/friends" className="text-sm font-bold text-meskot-gold-deep">
            See all
          </Link>
        </div>
        <ul className="space-y-3">
          {initialFriends.map((f) => (
            <li key={f.id} className="flex items-center gap-3">
              <div className="relative">
                <Avatar initials={f.initials} color={f.color} size="h-10 w-10" />
                {f.online && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-meskot-cream bg-meskot-sage" />
                )}
              </div>
              <span className="text-sm font-semibold">{f.name}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
