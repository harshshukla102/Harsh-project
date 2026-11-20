"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/studio";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [guestName, setGuestName] = useState("");
  const [guestLoading, setGuestLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to sign in");
        setLoading(false);
        return;
      }

      router.push(redirectUrl);
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  async function handleGuestLogin() {
    setError(null);
    setGuestLoading(true);

    try {
      const res = await fetch("/api/auth/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: guestName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to start guest session");
        setGuestLoading(false);
        return;
      }

      router.push(redirectUrl);
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setGuestLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-7 rounded-[2rem] border border-border/70 bg-card/60 p-8 shadow-2xl backdrop-blur-xl">
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-5">
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-visible">
            <Image
              src="/logo.png"
              alt="Luma Studio"
              width={72}
              height={72}
              className="h-10 w-10 max-h-none max-w-none origin-left scale-[1.55] object-cover"
              priority
            />
          </span>
          <span className="text-2xl font-mono font-semibold uppercase tracking-wide text-primary">
            Luma Studio
          </span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Sign in or enter as a guest to create styled images
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Guest Login Section */}
      <div className="space-y-3 rounded-2xl border border-primary/25 bg-primary/5 p-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-primary mb-1">
            ⚡ Quick Guest Access
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            No password or email required. Just type your name:
          </p>
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Your name (e.g. Alex)"
            className="w-full rounded-xl border border-border/80 bg-background/50 px-3.5 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors text-sm"
          />
        </div>

        <Button
          type="button"
          onClick={handleGuestLogin}
          disabled={guestLoading}
          className="w-full rounded-xl py-2 font-medium text-sm transition-all"
        >
          {guestLoading ? "Entering as Guest..." : "Continue as Guest"}
        </Button>
      </div>

      <div className="relative my-4 flex items-center justify-center">
        <div className="w-full border-t border-border/70" />
        <span className="absolute bg-card px-3 text-xs uppercase tracking-wider text-muted-foreground">
          or sign in with email
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Email address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-border/80 bg-background/50 px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-border/80 bg-background/50 px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors text-sm"
          />
        </div>

        <Button
          type="submit"
          variant="outline"
          disabled={loading}
          className="w-full rounded-xl py-2.5 font-medium text-sm transition-all"
        >
          {loading ? "Signing in..." : "Sign In with Password"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href={`/register${redirectUrl !== "/studio" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
          className="font-medium text-primary hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-background">
      <Suspense fallback={<div className="text-muted-foreground text-sm">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
