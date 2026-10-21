"use client";
import { getSubscribers } from "@/lib/db";
import { AdminTitle, Table, useAdmin } from "@/components/admin";

export default function Subscribers() {
  const { data } = useAdmin(getSubscribers);
  return (
    <>
      <AdminTitle>Newsletter subscribers</AdminTitle>
      <Table head={["Email", "Subscribed"]}>
        {data?.map((s) => <tr key={s.id}><td>{s.email}</td><td>{new Date(s.createdAt).toLocaleDateString()}</td></tr>)}
      </Table>
    </>
  );
}
