import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Camera, Globe, Image as ImageIcon, Loader2, MessageSquare, Plus, Share2, Sparkles, ThumbsUp, Trash2, Video, X } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { useAuth } from "@/context/AuthContext";
import { createPost, deletePost, addComment, fetchPosts, initialsOf, Post, setLiked } from "@/lib/api";

type Mode = "post" | "photo" | "story" | "reel" | "live";

export default function Index() {
  const { profile, user } = useAuth();
  const me = { name: profile?.full_name ?? "You", initials: initialsOf(profile?.full_name ?? "You") };

  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [mode, setMode] = useState<Mode>("post");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const [pickMode, setPickMode] = useState<Mode>("photo");

  const load = useCallback(async () => {
    try {
      const [p, s] = await Promise.all([fetchPosts("post"), fetchPosts("story", 12)]);
      setPosts(p);
      setStories(s);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!file) return setPreviewUrl(null);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const openPicker = (m: Mode) => {
    setPickMode(m);
    if (fileRef.current) {
      fileRef.current.accept = m === "reel" ? "video/*" : "image/*,video/*";
      fileRef.current.click();
    }
  };

  const onFilePicked = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (!f) return;
    if (f.size > 50 * 1024 * 1024) return toast.error("File must be under 50 MB.");
    setFile(f);
    setMode(pickMode === "story" ? "story" : pickMode === "reel" ? "reel" : "photo");
  };

  const clearComposer = () => {
    setDraft("");
    setFile(null);
    setMode("post");
  };

  const publish = async (kind: Mode) => {
    const text = draft.trim();
    const isLive = kind === "live";
    const postKind = kind === "story" ? "story" : kind === "reel" ? "reel" : "post";
    if (!text && !file && !isLive) return toast.error("Write something or add a photo first.");
    setPublishing(true);
    try {
      await createPost({
        kind: postKind,
        body: isLive && !text ? "I'm live now!" : text,
        file,
        isLive,
      });
      toast.success(postKind === "story" ? "Story shared" : postKind === "reel" ? "Reel shared" : "Posted");
      clearComposer();
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setPublishing(false);
    }
  };

  const toggleLike = async (post: Post) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id ? { ...p, likedByMe: !p.likedByMe, likes: p.likes + (p.likedByMe ? -1 : 1) } : p,
      ),
    );
    try {
      await setLiked(post.id, post.likedByMe);
    } catch (e) {
      toast.error((e as Error).message);
      load();
    }
  };

  const sendComment = async (postId: string) => {
    const text = (commentDrafts[postId] ?? "").trim();
    if (!text) return;
    try {
      await addComment(postId, text);
      setCommentDrafts((d) => ({ ...d, [postId]: "" }));
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const removePost = async (id: string) => {
    try {
      await deletePost(id);
      toast.success("Post deleted");
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const share = async (post: Post) => {
    const text = `${post.author.name}: ${post.body}`;
    try {
      if (navigator.share) await navigator.share({ title: "Meskot", text });
      else {
        await navigator.clipboard.writeText(text);
        toast.success("Post copied to clipboard");
      }
    } catch {
      /* user cancelled share */
    }
  };

  const composerButtons: { label: string; icon: any; mode: Mode; tone: string; action: () => void }[] = [
    { label: "Live", icon: null, mode: "live", tone: "bg-meskot-live text-meskot-cream border-transparent", action: () => publish("live") },
    { label: "Story", icon: Camera, mode: "story", tone: "bg-meskot-cream text-meskot-gold-deep border-meskot-gold/40", action: () => openPicker("story") },
    { label: "Reel", icon: Video, mode: "reel", tone: "bg-meskot-gold-deep text-meskot-cream border-transparent", action: () => openPicker("reel") },
    { label: "Photo", icon: ImageIcon, mode: "photo", tone: "bg-meskot-cream text-meskot-ink border-meskot-ink/20", action: () => openPicker("photo") },
  ];

  return (
    <div className="space-y-4">
      <input ref={fileRef} type="file" className="hidden" onChange={onFilePicked} />

      {/* Stories */}
      <section className="rounded-[28px] border-2 border-meskot-gold/50 bg-meskot-cream p-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-meskot-gold to-meskot-gold-deep text-meskot-cream">
            <Sparkles className="h-5 w-5" />
          </div>
          <h2 className="font-serif text-lg font-bold">Meskot Stories</h2>
          <button onClick={() => openPicker("story")} className="ml-auto text-sm font-bold text-meskot-gold-deep">
            + Add Moment
          </button>
        </div>
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          <button
            onClick={() => openPicker("story")}
            className="flex h-56 w-36 shrink-0 flex-col items-center justify-end overflow-hidden rounded-[24px] border-2 border-meskot-rose/60 bg-meskot-paper pb-4"
          >
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border-4 border-meskot-cream bg-gradient-to-br from-meskot-gold to-meskot-gold-deep text-meskot-cream shadow-md">
              <Plus className="h-6 w-6" />
            </span>
            <span className="text-sm font-bold">Create Story</span>
            <span className="text-xs font-semibold text-meskot-gold-deep">Share moment</span>
          </button>
          {stories.map((s) => (
            <div key={s.id} className="relative h-56 w-36 shrink-0 overflow-hidden rounded-[24px] border-2 border-meskot-gold bg-meskot-ink">
              {s.mediaType === "video" ? (
                <video src={s.mediaUrl ?? undefined} className="h-full w-full object-cover" muted />
              ) : s.mediaUrl ? (
                <img src={s.mediaUrl} alt="Story" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-meskot-gold-deep via-meskot-rose to-meskot-ink p-3 text-center text-sm font-bold text-meskot-cream">
                  {s.body}
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                <span className="text-xs font-bold text-meskot-cream">{s.author.name}</span>
              </div>
              <div className="absolute left-2 top-2">
                <Avatar initials={initialsOf(s.author.name)} size="h-8 w-8" ring />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Composer */}
      <section className="rounded-[28px] border-2 border-meskot-gold/30 bg-meskot-cream p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar initials={me.initials} size="h-14 w-14" />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && mode !== "live" && publish(mode)}
            placeholder="What's on your mind?"
            className="h-12 flex-1 rounded-full border-2 border-meskot-gold/30 bg-meskot-paper px-5 text-base font-medium text-meskot-ink placeholder:text-meskot-gold-deep/80 outline-none focus:border-meskot-gold"
          />
        </div>

        {file && (
          <div className="mt-3 flex items-center gap-3 rounded-2xl border-2 border-meskot-gold/30 bg-meskot-paper p-2">
            {file.type.startsWith("video") ? (
              <video src={previewUrl ?? undefined} className="h-16 w-16 rounded-xl object-cover" muted />
            ) : (
              <img src={previewUrl ?? undefined} alt="Selected" className="h-16 w-16 rounded-xl object-cover" />
            )}
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{file.name}</span>
            <button aria-label="Remove file" onClick={() => setFile(null)} className="p-2 text-meskot-sage hover:text-meskot-live">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="my-4 h-px bg-meskot-gold/20" />
        <div className="grid grid-cols-4 gap-2">
          {composerButtons.map(({ label, icon: Icon, tone, action }) => (
            <button
              key={label}
              onClick={action}
              disabled={publishing}
              className={`flex h-12 items-center justify-center gap-1.5 rounded-2xl border-2 px-2 text-sm font-bold transition hover:brightness-95 disabled:opacity-60 ${tone}`}
            >
              {Icon ? <Icon className="h-4 w-4 shrink-0" /> : <span className="h-2.5 w-2.5 rounded-full bg-meskot-cream" />}
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>

        {(draft.trim() || file) && (
          <div className="mt-3 flex items-center justify-between">
            <button onClick={clearComposer} className="text-sm font-bold text-meskot-sage hover:text-meskot-live">
              Discard
            </button>
            <button
              onClick={() => publish(mode)}
              disabled={publishing}
              className="flex items-center gap-2 rounded-full bg-meskot-gold-deep px-6 py-2 text-sm font-bold text-meskot-cream transition hover:brightness-110 disabled:opacity-60"
            >
              {publishing && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "story" ? "Share story" : mode === "reel" ? "Share reel" : "Post"}
            </button>
          </div>
        )}
      </section>

      {/* Feed */}
      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-meskot-gold-deep" />
        </div>
      )}
      {!loading && posts.length === 0 && (
        <p className="rounded-[28px] border-2 border-meskot-gold/30 bg-meskot-cream p-6 text-center text-sm text-meskot-sage">
          No posts yet. Be the first to share something.
        </p>
      )}

      {posts.map((post) => {
        const isMine = post.authorId === user?.id;
        return (
          <article key={post.id} className="overflow-hidden rounded-[28px] border-2 border-meskot-gold/30 bg-meskot-cream shadow-sm">
            <div className="h-1.5 bg-gradient-to-r from-meskot-gold/40 via-meskot-gold to-meskot-gold/40" />
            <div className="flex items-start gap-3 p-4">
              <Avatar initials={initialsOf(post.author.name)} color="bg-meskot-gold" size="h-14 w-14" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-serif text-base font-bold">{isMine ? me.name : post.author.name}</span>
                  {post.isLive && (
                    <span className="rounded-xl bg-meskot-live px-2.5 py-1 text-[11px] font-bold text-meskot-cream">LIVE</span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs font-medium text-meskot-sage">
                  {new Date(post.createdAt).toLocaleString()}
                  <span>·</span>
                  <Globe className="h-3.5 w-3.5" />
                </div>
              </div>
              {isMine && (
                <button
                  aria-label="Delete post"
                  onClick={() => removePost(post.id)}
                  className="rounded-full p-2 text-meskot-sage hover:bg-meskot-live/10 hover:text-meskot-live"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {post.body && <p className="px-4 pb-4 text-[15px] leading-relaxed">{post.body}</p>}

            {post.mediaUrl &&
              (post.mediaType === "video" ? (
                <video src={post.mediaUrl} controls className="mx-auto mb-4 max-h-96 w-[calc(100%-2rem)] rounded-2xl bg-meskot-ink" />
              ) : (
                <img src={post.mediaUrl} alt="Post" className="mx-auto mb-4 max-h-96 w-[calc(100%-2rem)] rounded-2xl object-cover" />
              ))}

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
                onClick={() => toggleLike(post)}
                className={`flex items-center justify-center gap-1.5 py-3 transition hover:bg-meskot-gold/10 ${post.likedByMe ? "text-meskot-gold-deep" : ""}`}
              >
                <ThumbsUp className="h-4 w-4" /> {post.likedByMe ? "Liked" : "Like"}
              </button>
              <button
                onClick={() => setOpenComments((o) => ({ ...o, [post.id]: !o[post.id] }))}
                className="flex items-center justify-center gap-1.5 py-3 transition hover:bg-meskot-gold/10"
              >
                <MessageSquare className="h-4 w-4" /> Comment
              </button>
              <button onClick={() => share(post)} className="flex items-center justify-center gap-1.5 py-3 transition hover:bg-meskot-gold/10">
                <Share2 className="h-4 w-4" /> Share
              </button>
            </div>

            {openComments[post.id] && (
              <div className="space-y-3 border-t border-meskot-gold/20 bg-meskot-paper/60 p-4">
                {post.comments.map((c) => (
                  <div key={c.id} className="flex gap-2">
                    <Avatar initials={initialsOf(c.author.name)} color="bg-meskot-sage" size="h-8 w-8" />
                    <div className="rounded-2xl bg-meskot-cream px-3 py-2">
                      <div className="text-xs font-bold">{c.author.name}</div>
                      <div className="text-sm">{c.body}</div>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    value={commentDrafts[post.id] ?? ""}
                    onChange={(e) => setCommentDrafts((d) => ({ ...d, [post.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && sendComment(post.id)}
                    placeholder="Write a comment..."
                    className="flex-1 rounded-full border-2 border-meskot-gold/30 bg-meskot-cream px-4 py-2 text-sm outline-none focus:border-meskot-gold"
                  />
                  <button onClick={() => sendComment(post.id)} className="rounded-full bg-meskot-gold-deep px-4 text-sm font-bold text-meskot-cream">
                    Send
                  </button>
                </div>
              </div>
            )}
          </article>
        );
      })}

      <p className="text-center text-xs text-meskot-sage">
        Find friends in <Link to="/friends" className="font-bold text-meskot-gold-deep">Friends</Link>
      </p>
    </div>
  );
}
