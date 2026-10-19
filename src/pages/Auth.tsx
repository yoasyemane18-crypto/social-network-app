import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const inputCls =
  "h-12 w-full rounded-full border-2 border-meskot-gold/30 bg-meskot-paper px-5 text-base outline-none placeholder:text-meskot-sage focus:border-meskot-gold";

export default function Auth() {
  const { session, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!loading && session) return <Navigate to={from} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email.trim() || !password) return setError("Please enter your email and password.");
    if (mode === "signup") {
      if (!fullName.trim()) return setError("Please enter your full name.");
      if (!/^[a-z0-9_]{3,20}$/i.test(username.trim())) {
        return setError("Username must be 3–20 letters, numbers or underscores.");
      }
      if (password.length < 6) return setError("Password must be at least 6 characters.");
    }

    setBusy(true);
    const err =
      mode === "login"
        ? await signIn(email, password)
        : await signUp(fullName, username, email, password);
    setBusy(false);

    if (err) {
      setError(err);
      return;
    }
    if (mode === "signup") {
      setInfo("Account created. Check your email to confirm, then log in.");
      setMode("login");
      setPassword("");
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-meskot-paper p-4 font-sans text-meskot-ink">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-meskot-gold bg-meskot-cream font-serif text-4xl font-bold italic text-meskot-gold-deep shadow-sm">
            M
          </div>
          <h1 className="font-serif text-4xl font-bold tracking-tight">Meskot</h1>
          <p className="text-sm text-meskot-sage">
            {mode === "login" ? "Log in to see what your friends are up to." : "Create an account to get started."}
          </p>
        </div>

        <form
          onSubmit={submit}
          className="space-y-3 rounded-[28px] border-2 border-meskot-gold/30 bg-meskot-cream p-6 shadow-md"
        >
          {mode === "signup" && (
            <>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                autoComplete="name"
                className={inputCls}
              />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                autoComplete="username"
                className={inputCls}
              />
            </>
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            autoComplete="email"
            className={inputCls}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "signup" ? "New password (min. 6 characters)" : "Password"}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            className={inputCls}
          />

          {error && <p className="rounded-xl bg-meskot-live/10 px-4 py-2 text-sm font-medium text-meskot-live">{error}</p>}
          {info && <p className="rounded-xl bg-meskot-gold/15 px-4 py-2 text-sm font-medium text-meskot-gold-deep">{info}</p>}

          <button
            type="submit"
            disabled={busy}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-meskot-gold-deep text-base font-bold text-meskot-cream transition hover:brightness-110 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "login" ? "Log in" : "Create account"}
          </button>

          {mode === "login" && (
            <p className="pt-1 text-center text-sm text-meskot-gold-deep">Forgotten password?</p>
          )}
        </form>

        <div className="rounded-[28px] border-2 border-meskot-gold/30 bg-meskot-cream p-5 text-center shadow-sm">
          <p className="text-sm text-meskot-sage">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
              setInfo(null);
            }}
            className="mt-2 rounded-full border-2 border-meskot-gold/60 px-6 py-2 text-sm font-bold text-meskot-gold-deep transition hover:bg-meskot-gold/10"
          >
            {mode === "login" ? "Create new account" : "Log in instead"}
          </button>
        </div>
      </div>
    </div>
  );
}
