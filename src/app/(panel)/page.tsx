"use client";
import { money } from "@/lib/api";
import { AdminTitle, Table, useAdmin } from "@/components/admin";

interface Stats {
  revenue: number; orders: number; customers: number; products: number; pending: number;
  lowStock: { id: string; size: string; color: string; stock: number; product: { name: string } }[];
  recent: { id: string; number: string; total: number; status: string; user: { name: string } }[];
}

export default function Dashboard() {
  const { data } = useAdmin<Stats>("/admin/stats");
  if (!data) return null;
  const cards = [
    ["Revenue", money(data.revenue)], ["Orders", data.orders], ["Pending orders", data.pending],
    ["Customers", data.customers], ["Active products", data.products],
  ];
  return (
    <>
      <AdminTitle>Dashboard</AdminTitle>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {cards.map(([l, v]) => (
          <div key={l} className="bg-white border border-line p-4">
            <p className="text-xs uppercase text-muted">{l}</p>
            <p className="font-serif text-2xl mt-1">{v}</p>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="font-serif text-xl mb-2">Recent orders</h2>
          <Table head={["Order", "Customer", "Total", "Status"]}>
            {data.recent.map((o) => <tr key={o.id}><td>{o.number}</td><td>{o.user.name}</td><td>{money(o.total)}</td><td>{o.status}</td></tr>)}
          </Table>
        </div>
        <div>
          <h2 className="font-serif text-xl mb-2">Low stock</h2>
          <Table head={["Product", "Variant", "Left"]}>
            {data.lowStock.map((v) => <tr key={v.id}><td>{v.product.name}</td><td>{v.size} / {v.color}</td><td className="text-rosedark">{v.stock}</td></tr>)}
          </Table>
        </div>
      </div>
    </>
  );
}
