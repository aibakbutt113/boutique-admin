"use client";
import { money } from "@/lib/api";
import { authedApi } from "@/lib/store";
import type { Order } from "@/lib/types";
import { AdminTitle, Table, useAdmin } from "@/components/admin";

const STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURN_REQUESTED", "RETURNED"];

export default function Orders() {
  const { data, mutate } = useAdmin<Order[]>("/admin/orders");
  return (
    <>
      <AdminTitle>Orders</AdminTitle>
      <Table head={["Order", "Customer", "Ship to", "Items", "Total", "Payment", "Status"]}>
        {data?.map((o) => (
          <tr key={o.id}>
            <td>{o.number}<br /><span className="text-xs text-muted">{new Date(o.createdAt).toLocaleDateString()}</span></td>
            <td>{o.user?.name}<br /><span className="text-xs text-muted">{o.user?.email}</span></td>
            <td>{o.shipName}, {o.shipCity}<br /><span className="text-xs text-muted">{o.shipPhone}</span></td>
            <td>{o.items.map((i) => `${i.name} (${i.size}) ×${i.quantity}`).join(", ")}
              {o.returnReason && <><br /><span className="text-xs text-rosedark">Return: {o.returnReason}</span></>}</td>
            <td>{money(o.total)}</td>
            <td>{o.paymentMethod}<br /><span className="text-xs text-muted">{o.paymentStatus}</span></td>
            <td>
              <select className="field !py-1" value={o.status}
                onChange={(e) => mutate(() => authedApi(`/admin/orders/${o.id}/status`, { method: "PATCH", json: { status: e.target.value } }), "Status updated")}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
