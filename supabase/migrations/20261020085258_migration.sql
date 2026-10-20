CREATE TABLE IF NOT EXISTS public.posts (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, kind text NOT NULL DEFAULT 'post' CHECK (kind IN ('post','reel','story')), body text NOT NULL DEFAULT '', media_url text, media_type text CHECK (media_type IN ('image','video')), is_live boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now());

CREATE TABLE IF NOT EXISTS public.post_likes (post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE, user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (post_id, user_id));

CREATE TABLE IF NOT EXISTS public.comments (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE, author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, body text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());

CREATE TABLE IF NOT EXISTS public.friendships (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, addressee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted')), created_at timestamptz NOT NULL DEFAULT now(), UNIQUE (requester_id, addressee_id), CHECK (requester_id <> addressee_id));

CREATE TABLE IF NOT EXISTS public.follows (follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, followee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (follower_id, followee_id));

CREATE TABLE IF NOT EXISTS public.messages (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, body text NOT NULL, read boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now());

CREATE TABLE IF NOT EXISTS public.market_items (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, title text NOT NULL, price numeric(10,2) NOT NULL DEFAULT 0, category text NOT NULL DEFAULT 'Home', description text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now());

CREATE TABLE IF NOT EXISTS public.saved_items (user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, item_id uuid NOT NULL REFERENCES public.market_items(id) ON DELETE CASCADE, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (user_id, item_id));

CREATE TABLE IF NOT EXISTS public.alerts (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, actor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE, kind text NOT NULL, text text NOT NULL, read boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now());

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.market_items ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS posts_select ON public.posts; CREATE POLICY posts_select ON public.posts FOR SELECT TO authenticated USING (true); DROP POLICY IF EXISTS posts_insert ON public.posts; CREATE POLICY posts_insert ON public.posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id); DROP POLICY IF EXISTS posts_delete ON public.posts; CREATE POLICY posts_delete ON public.posts FOR DELETE TO authenticated USING (auth.uid() = author_id);

DROP POLICY IF EXISTS likes_select ON public.post_likes; CREATE POLICY likes_select ON public.post_likes FOR SELECT TO authenticated USING (true); DROP POLICY IF EXISTS likes_insert ON public.post_likes; CREATE POLICY likes_insert ON public.post_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id); DROP POLICY IF EXISTS likes_delete ON public.post_likes; CREATE POLICY likes_delete ON public.post_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS comments_select ON public.comments; CREATE POLICY comments_select ON public.comments FOR SELECT TO authenticated USING (true); DROP POLICY IF EXISTS comments_insert ON public.comments; CREATE POLICY comments_insert ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id); DROP POLICY IF EXISTS comments_delete ON public.comments; CREATE POLICY comments_delete ON public.comments FOR DELETE TO authenticated USING (auth.uid() = author_id);

DROP POLICY IF EXISTS friends_select ON public.friendships; CREATE POLICY friends_select ON public.friendships FOR SELECT TO authenticated USING (auth.uid() IN (requester_id, addressee_id)); DROP POLICY IF EXISTS friends_insert ON public.friendships; CREATE POLICY friends_insert ON public.friendships FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id); DROP POLICY IF EXISTS friends_update ON public.friendships; CREATE POLICY friends_update ON public.friendships FOR UPDATE TO authenticated USING (auth.uid() = addressee_id) WITH CHECK (auth.uid() = addressee_id); DROP POLICY IF EXISTS friends_delete ON public.friendships; CREATE POLICY friends_delete ON public.friendships FOR DELETE TO authenticated USING (auth.uid() IN (requester_id, addressee_id));

DROP POLICY IF EXISTS follows_select ON public.follows; CREATE POLICY follows_select ON public.follows FOR SELECT TO authenticated USING (true); DROP POLICY IF EXISTS follows_insert ON public.follows; CREATE POLICY follows_insert ON public.follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id); DROP POLICY IF EXISTS follows_delete ON public.follows; CREATE POLICY follows_delete ON public.follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);

DROP POLICY IF EXISTS messages_select ON public.messages; CREATE POLICY messages_select ON public.messages FOR SELECT TO authenticated USING (auth.uid() IN (sender_id, recipient_id)); DROP POLICY IF EXISTS messages_insert ON public.messages; CREATE POLICY messages_insert ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id); DROP POLICY IF EXISTS messages_update ON public.messages; CREATE POLICY messages_update ON public.messages FOR UPDATE TO authenticated USING (auth.uid() = recipient_id) WITH CHECK (auth.uid() = recipient_id);

DROP POLICY IF EXISTS market_select ON public.market_items; CREATE POLICY market_select ON public.market_items FOR SELECT TO authenticated USING (true); DROP POLICY IF EXISTS market_insert ON public.market_items; CREATE POLICY market_insert ON public.market_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id); DROP POLICY IF EXISTS market_delete ON public.market_items; CREATE POLICY market_delete ON public.market_items FOR DELETE TO authenticated USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS saved_select ON public.saved_items; CREATE POLICY saved_select ON public.saved_items FOR SELECT TO authenticated USING (auth.uid() = user_id); DROP POLICY IF EXISTS saved_insert ON public.saved_items; CREATE POLICY saved_insert ON public.saved_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id); DROP POLICY IF EXISTS saved_delete ON public.saved_items; CREATE POLICY saved_delete ON public.saved_items FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS alerts_select ON public.alerts; CREATE POLICY alerts_select ON public.alerts FOR SELECT TO authenticated USING (auth.uid() = user_id); DROP POLICY IF EXISTS alerts_update ON public.alerts; CREATE POLICY alerts_update ON public.alerts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); DROP POLICY IF EXISTS alerts_delete ON public.alerts; CREATE POLICY alerts_delete ON public.alerts FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.actor_name(p_id uuid) RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT COALESCE(full_name, 'Someone') FROM public.profiles WHERE id = p_id $$;

CREATE OR REPLACE FUNCTION public.notify_friendship() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN IF TG_OP = 'INSERT' THEN INSERT INTO public.alerts (user_id, actor_id, kind, text) VALUES (NEW.addressee_id, NEW.requester_id, 'friend', public.actor_name(NEW.requester_id) || ' sent you a friend request'); ELSIF TG_OP = 'UPDATE' AND NEW.status = 'accepted' AND OLD.status <> 'accepted' THEN INSERT INTO public.alerts (user_id, actor_id, kind, text) VALUES (NEW.requester_id, NEW.addressee_id, 'friend', public.actor_name(NEW.addressee_id) || ' accepted your friend request'); END IF; RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS on_friendship_change ON public.friendships; CREATE TRIGGER on_friendship_change AFTER INSERT OR UPDATE ON public.friendships FOR EACH ROW EXECUTE FUNCTION public.notify_friendship();

CREATE OR REPLACE FUNCTION public.notify_like() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ DECLARE v_author uuid; BEGIN SELECT author_id INTO v_author FROM public.posts WHERE id = NEW.post_id; IF v_author IS NOT NULL AND v_author <> NEW.user_id THEN INSERT INTO public.alerts (user_id, actor_id, kind, text) VALUES (v_author, NEW.user_id, 'like', public.actor_name(NEW.user_id) || ' liked your post'); END IF; RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS on_post_like ON public.post_likes; CREATE TRIGGER on_post_like AFTER INSERT ON public.post_likes FOR EACH ROW EXECUTE FUNCTION public.notify_like();

CREATE OR REPLACE FUNCTION public.notify_comment() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ DECLARE v_author uuid; BEGIN SELECT author_id INTO v_author FROM public.posts WHERE id = NEW.post_id; IF v_author IS NOT NULL AND v_author <> NEW.author_id THEN INSERT INTO public.alerts (user_id, actor_id, kind, text) VALUES (v_author, NEW.author_id, 'comment', public.actor_name(NEW.author_id) || ' commented on your post'); END IF; RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS on_comment_insert ON public.comments; CREATE TRIGGER on_comment_insert AFTER INSERT ON public.comments FOR EACH ROW EXECUTE FUNCTION public.notify_comment();

CREATE OR REPLACE FUNCTION public.notify_message() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN INSERT INTO public.alerts (user_id, actor_id, kind, text) VALUES (NEW.recipient_id, NEW.sender_id, 'message', 'New message from ' || public.actor_name(NEW.sender_id)); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS on_message_insert ON public.messages; CREATE TRIGGER on_message_insert AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.notify_message();

INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS media_read ON storage.objects; CREATE POLICY media_read ON storage.objects FOR SELECT USING (bucket_id = 'media');

DROP POLICY IF EXISTS media_upload ON storage.objects; CREATE POLICY media_upload ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS media_delete ON storage.objects; CREATE POLICY media_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media' AND (storage.foldername(name))[1] = auth.uid()::text);