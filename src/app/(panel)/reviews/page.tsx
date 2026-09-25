"use client";
import { authedApi } from "@/lib/store";
import { AdminTitle, Table, useAdmin } from "@/components/admin";

interface R { id: string; rating: number; comment: string; user: { name: string }; product: { name: string } }

export default function Reviews() {
  const { data, mutate } = useAdmin<R[]>("/admin/reviews");
  return (
    <>
      <AdminTitle>Reviews</AdminTitle>
      <Table head={["Product", "Customer", "Rating", "Comment", ""]}>
        {data?.map((r) => (
          <tr key={r.id}>
            <td>{r.product.name}</td><td>{r.user.name}</td><td>{"★".repeat(r.rating)}</td><td>{r.comment}</td>
            <td><button className="underline text-rosedark" onClick={() => confirm("Delete review?") && mutate(() => authedApi(`/admin/reviews/${r.id}`, { method: "DELETE" }), "Deleted")}>Delete</button></td>
          </tr>
        ))}
      </Table>
    </>
  );
}
