"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signInAdmin, useToast } from "@/lib/store";

export default function AdminLogin() {
  const router = useRouter();
  const push = useToast((s) => s.push);
  const [f, setF] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await signInAdmin(f.email, f.password);
      const next = new URLSearchParams(window.location.search).get("next");
      // Only follow same-site relative redirects.
      router.push(next?.startsWith("/") && !next.startsWith("//") ? next : "/");
    } catch (err) {
      push((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-6 py-16">
      <h1 className="font-script text-4xl text-center mb-8">Admin Login</h1>
      <form onSubmit={submit} className="space-y-3">
        <input required type="email" className="field" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input required minLength={6} type="password" className="field" placeholder="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        <button disabled={busy} className="btn w-full">Log in</button>
      </form>
    </div>
  );
}
