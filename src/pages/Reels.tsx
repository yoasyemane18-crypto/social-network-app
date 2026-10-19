import { useState } from "react";
import { Heart, MessageCircle, Share2, Volume2 } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Reel, initialReels } from "@/lib/mockData";

export default function Reels() {
  const [reels, setReels] = useState<Reel[]>(initialReels);

  const toggleLike = (id: number) =>
    setReels((prev) =>
      prev.map((r) => (r.id === id ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 } : r))
    );

  const toggleFollow = (id: number) =>
    setReels((prev) => prev.map((r) => (r.id === id ? { ...r, following: !r.following } : r)));

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl font-bold">Reels</h1>
      {reels.map((r) => (
        <article
          key={r.id}
          className="overflow-hidden rounded-[28px] border-2 border-meskot-gold/30 bg-meskot-cream shadow-sm"
        >
          <div className={`relative flex h-96 items-end bg-gradient-to-br ${r.gradient} p-5`}>
            <div className="absolute right-4 top-4 rounded-full bg-black/30 p-2 text-meskot-cream">
              <Volume2 className="h-4 w-4" />
            </div>
            <div className="max-w-[80%] text-meskot-cream">
              <div className="mb-2 flex items-center gap-2">
                <Avatar initials={r.initials} size="h-9 w-9" />
                <span className="font-semibold">{r.author}</span>
              </div>
              <p className="text-sm">{r.caption}</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => toggleFollow(r.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                r.following
                  ? "border-2 border-meskot-gold/40 bg-meskot-paper text-meskot-ink"
                  : "bg-meskot-gold-deep text-meskot-cream hover:brightness-110"
              }`}
            >
              {r.following ? "Following" : "Follow"}
            </button>
            <div className="flex items-center gap-4 text-sm font-bold text-meskot-sage">
              <button
                onClick={() => toggleLike(r.id)}
                className={`flex items-center gap-1 ${r.liked ? "text-meskot-live" : ""}`}
              >
                <Heart className={`h-5 w-5 ${r.liked ? "fill-current" : ""}`} /> {r.likes}
              </button>
              <button className="flex items-center gap-1">
                <MessageCircle className="h-5 w-5" />
              </button>
              <button className="flex items-center gap-1">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
