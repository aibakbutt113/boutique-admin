"use client";
import { useState } from "react";
import { money } from "@/lib/api";
import { authedApi } from "@/lib/store";
import { AdminTitle, Table, useAdmin } from "@/components/admin";

interface C { id: string; code: string; type: "PERCENT" | "FIXED"; value: number; minOrder: number; expiresAt: string | null; active: boolean }

export default function Coupons() {
  const { data, mutate } = useAdmin<C[]>("/admin/coupons");
  const [f, setF] = useState({ code: "", type: "PERCENT", value: "10", minOrder: "0", expiresAt: "" });
  return (
    <>
      <AdminTitle>Coupons</AdminTitle>
      <form className="flex flex-wrap gap-2 mb-6" onSubmit={async (e) => {
        e.preventDefault();
        await mutate(() => authedApi("/admin/coupons", { method: "POST", json: {
          code: f.code, type: f.type, value: +f.value, minOrder: +f.minOrder, expiresAt: f.expiresAt || undefined } }), "Coupon created");
        setF({ ...f, code: "" });
      }}>
        <input required className="field !w-40" placeholder="CODE" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} />
        <select className="field !w-32" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}><option value="PERCENT">Percent</option><option value="FIXED">Fixed (Rs.)</option></select>
        <input required type="number" min={1} className="field !w-24" value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} />
        <input type="number" min={0} className="field !w-32" placeholder="Min order" value={f.minOrder} onChange={(e) => setF({ ...f, minOrder: e.target.value })} />
        <input type="date" className="field !w-40" value={f.expiresAt} onChange={(e) => setF({ ...f, expiresAt: e.target.value })} />
        <button className="btn">Add</button>
      </form>
      <Table head={["Code", "Discount", "Min order", "Expires", "Active", ""]}>
        {data?.map((c) => (
          <tr key={c.id}>
            <td>{c.code}</td><td>{c.type === "PERCENT" ? `${c.value}%` : money(c.value)}</td><td>{money(c.minOrder)}</td>
            <td>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "—"}</td><td>{c.active ? "Yes" : "No"}</td>
            <td>{c.active && <button className="underline text-rosedark" onClick={() => mutate(() => authedApi(`/admin/coupons/${c.id}`, { method: "DELETE" }), "Deactivated")}>Deactivate</button>}</td>
          </tr>
        ))}
      </Table>
    </>
  );
}
