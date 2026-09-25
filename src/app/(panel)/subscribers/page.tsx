"use client";
import { AdminTitle, Table, useAdmin } from "@/components/admin";

export default function Subscribers() {
  const { data } = useAdmin<{ id: string; email: string; createdAt: string }[]>("/admin/subscribers");
  return (
    <>
      <AdminTitle>Newsletter subscribers</AdminTitle>
      <Table head={["Email", "Subscribed"]}>
        {data?.map((s) => <tr key={s.id}><td>{s.email}</td><td>{new Date(s.createdAt).toLocaleDateString()}</td></tr>)}
      </Table>
    </>
  );
}
