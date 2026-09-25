"use client";
import { useCallback, useEffect, useState } from "react";
import { authedApi, useToast } from "@/lib/store";

/** Fetch an admin endpoint; returns data plus reload and a toast-wrapped mutate helper. */
export function useAdmin<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const push = useToast((s) => s.push);
  const reload = useCallback(() => authedApi<T>(path).then(setData).catch((e) => push(e.message)), [path, push]);
  useEffect(() => { reload(); }, [reload]);
  const mutate = async (fn: () => Promise<unknown>, ok = "Saved") => {
    try { await fn(); push(ok); await reload(); return true; } catch (e) { push((e as Error).message); return false; }
  };
  return { data, reload, mutate };
}

export const AdminTitle = ({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-6">
    <h1 className="font-serif text-3xl">{children}</h1>
    {action}
  </div>
);

export const Table = ({ head, children }: { head: string[]; children: React.ReactNode }) => (
  <div className="overflow-x-auto bg-white border border-line">
    <table className="w-full text-sm text-left">
      <thead className="bg-blush text-xs uppercase tracking-wide">
        <tr>{head.map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
      </thead>
      <tbody className="[&_td]:px-4 [&_td]:py-3 [&_tr]:border-t [&_tr]:border-line">{children}</tbody>
    </table>
  </div>
);
