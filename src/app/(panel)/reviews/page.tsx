"use client";
import { deleteReview, getReviews } from "@/lib/db";
import { AdminTitle, Table, useAdmin } from "@/components/admin";

export default function Reviews() {
  const { data, mutate } = useAdmin(getReviews);
  return (
    <>
      <AdminTitle>Reviews</AdminTitle>
      <Table head={["Product", "Customer", "Rating", "Comment", ""]}>
        {data?.map((r) => (
          <tr key={r.id}>
            <td>{r.product.name}</td><td>{r.user.name}</td><td>{"★".repeat(r.rating)}</td><td>{r.comment}</td>
            <td><button className="underline text-rosedark" onClick={() => confirm("Delete review?") && mutate(() => deleteReview(r.id), "Deleted")}>Delete</button></td>
          </tr>
        ))}
      </Table>
    </>
  );
}
