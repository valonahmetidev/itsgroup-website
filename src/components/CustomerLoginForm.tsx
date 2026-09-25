"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { customerLogin } from "@/app/customer/actions";
import { useLocale } from "@/components/LocaleProvider";
import { validateEmail, validateRequired } from "@/lib/form-validation";

export function CustomerLoginForm() {
  const router = useRouter();
  const { dict } = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const emailErr = validateEmail(email, dict, true);
    const passwordErr = validateRequired(password, dict);
    const next = { email: emailErr, password: passwordErr };
    setFieldErrors(next);
    if (emailErr || passwordErr) {
      setError(dict.validation.fixFields);
      return;
    }

    setLoading(true);
    setError("");
    const result = await customerLogin(email, password);
    setLoading(false);
    if (!result.ok) {
      setError(dict.customer.loginError);
      return;
    }
    router.push("/profil");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4 rounded-3xl border border-ink/10 bg-card p-6" noValidate>
      <h1 className="font-display text-3xl">{dict.customer.loginTitle}</h1>
      <p className="text-sm text-ink/60">{dict.customer.loginText}</p>
      <label className="grid gap-1 text-sm">
        <span>{dict.customer.email}</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={Boolean(fieldErrors.email)}
          className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5 outline-none focus:border-tech aria-[invalid=true]:border-home"
        />
        {fieldErrors.email && <span className="text-sm text-home">{fieldErrors.email}</span>}
      </label>
      <label className="grid gap-1 text-sm">
        <span>{dict.customer.password}</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={Boolean(fieldErrors.password)}
          className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5 outline-none focus:border-tech aria-[invalid=true]:border-home"
        />
        {fieldErrors.password && <span className="text-sm text-home">{fieldErrors.password}</span>}
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-tech px-5 py-3 text-sm font-semibold text-cream disabled:opacity-50"
      >
        {loading ? dict.customer.loggingIn : dict.customer.loginButton}
      </button>
      {error && <p className="text-sm text-home">{error}</p>}
    </form>
  );
}
