"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/app/admin/auth-actions";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLocale } from "@/components/LocaleProvider";

export function LoginForm() {
  const router = useRouter();
  const { dict } = useLocale();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const result = await adminLogin(password);
    setLoading(false);
    if (!result.ok) {
      setError(dict.admin.loginError);
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <div className="shell py-6">
      <div className="flex justify-end">
        <ThemeToggle className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 bg-card shadow-sm hover:bg-surface" />
      </div>
      <form onSubmit={onSubmit} className="mx-auto mt-8 max-w-md rounded-3xl border border-ink/10 bg-card p-6 shadow-sm sm:mt-12 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-tech">{dict.admin.title}</p>
      <h1 className="mt-2 font-display text-3xl">{dict.admin.loginTitle}</h1>
      <p className="mt-2 text-sm text-ink/60">{dict.admin.loginText}</p>
      <label className="mt-6 grid gap-1 text-sm">
        <span className="text-ink/60">{dict.admin.password}</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-2xl border border-ink/10 bg-surface px-4 py-3 outline-none focus:border-tech"
          required
          autoComplete="current-password"
        />
      </label>
      {error && <p className="mt-3 text-sm text-home">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-full bg-tech px-5 py-3 text-sm font-semibold text-cream disabled:opacity-50"
      >
        {loading ? dict.admin.loggingIn : dict.admin.loginButton}
      </button>
      </form>
    </div>
  );
}
