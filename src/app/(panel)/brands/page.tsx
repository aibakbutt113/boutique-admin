"use client";
import { useState } from "react";
import { authedApi, useToast } from "@/lib/store";
import Img from "@/components/Img";
import { AdminTitle, Table, useAdmin } from "@/components/admin";

interface Brand {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  position: number;
  active: boolean;
}

export default function Brands() {
  const { data, mutate } = useAdmin<Brand[]>("/admin/brands");
  const push = useToast((s) => s.push);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      setImage((await authedApi<{ url: string }>("/admin/upload", { method: "POST", body: fd })).url);
    } catch (e) {
      push((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await mutate(() => authedApi("/admin/brands", { method: "POST", json: { name, image: image || undefined } }), "Brand added")) {
      setName("");
      setImage("");
    }
  };

  // Swap position with the neighbour above/below so the home page order follows the table.
  const move = (list: Brand[], index: number, dir: -1 | 1) => {
    const other = list[index + dir];
    if (!other) return;
    const a = list[index];
    mutate(() =>
      Promise.all([
        authedApi(`/admin/brands/${a.id}`, { method: "PATCH", json: { position: other.position } }),
        authedApi(`/admin/brands/${other.id}`, { method: "PATCH", json: { position: a.position } }),
      ]), "Reordered");
  };

  return (
    <>
      <AdminTitle>Brands</AdminTitle>
      <p className="text-sm text-muted mb-4 max-w-2xl">
        Shown on the home page as &quot;Shop by Brand&quot;, five at a time. Active ones appear in the order below;
        clicking one takes a customer to every product assigned to it.
      </p>
      <form className="flex flex-wrap items-center gap-2 mb-6" onSubmit={add}>
        <input required className="field !w-56" placeholder="Brand name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="file" accept="image/*" disabled={uploading} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        {image && <Img src={image} alt="" className="w-10 h-10 object-cover" />}
        <button className="btn" disabled={uploading}>Add</button>
      </form>
      <Table head={["Image", "Name", "Order", "Active", ""]}>
        {data?.map((b, i) => (
          <tr key={b.id}>
            <td><Img src={b.image} alt="" className="w-16 h-16 object-cover" /></td>
            <td>{b.name}</td>
            <td className="whitespace-nowrap">
              <button className="px-1.5 disabled:opacity-30" disabled={i === 0} onClick={() => data && move(data, i, -1)}>▲</button>
              <button className="px-1.5 disabled:opacity-30" disabled={i === data.length - 1} onClick={() => data && move(data, i, 1)}>▼</button>
            </td>
            <td>
              <input
                type="checkbox" checked={b.active}
                onChange={(e) => mutate(() => authedApi(`/admin/brands/${b.id}`, { method: "PATCH", json: { active: e.target.checked } }), b.active ? "Hidden" : "Shown")}
              />
            </td>
            <td>
              <button
                className="underline text-rosedark"
                onClick={() => confirm("Delete this brand? Its products stay, just unassigned from any brand.") && mutate(() => authedApi(`/admin/brands/${b.id}`, { method: "DELETE" }), "Deleted")}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
