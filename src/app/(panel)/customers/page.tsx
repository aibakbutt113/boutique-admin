"use client";
import { AdminTitle, Table, useAdmin } from "@/components/admin";

interface Customer { id: string; name: string; email: string; phone: string | null; createdAt: string; _count: { orders: number } }

export default function Customers() {
  const { data } = useAdmin<Customer[]>("/admin/customers");
  return (
    <>
      <AdminTitle>Customers</AdminTitle>
      <Table head={["Name", "Email", "Phone", "Orders", "Joined"]}>
        {data?.map((c) => (
          <tr key={c.id}><td>{c.name}</td><td>{c.email}</td><td>{c.phone ?? "—"}</td><td>{c._count.orders}</td><td>{new Date(c.createdAt).toLocaleDateString()}</td></tr>
        ))}
      </Table>
    </>
  );
}
