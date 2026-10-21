"use client";
import { useState } from "react";
import { type Banner, createBanner, deleteBanner, getBanners, updateBanner, uploadImage } from "@/lib/db";
import { useToast } from "@/lib/store";
import Img from "@/components/Img";
import { AdminTitle, Table, useAdmin } from "@/components/admin";

export default function Banners() {
  const { data, mutate } = useAdmin(getBanners);
  const push = useToast((s) => s.push);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadImage(file, "banners");
      await mutate(() => createBanner(url), "Banner added");
    } catch (e) {
      push((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  // Swap position with the neighbour above/below so the home page slide order follows the table.
  const move = (list: Banner[], index: number, dir: -1 | 1) => {
    const other = list[index + dir];
    if (!other) return;
    const a = list[index];
    mutate(() =>
      Promise.all([
        updateBanner(a.id, { position: other.position }),
        updateBanner(other.id, { position: a.position }),
      ]), "Reordered");
  };

  return (
    <>
      <AdminTitle>Banners</AdminTitle>
      <p className="text-sm text-muted mb-4 max-w-2xl">
        These photos auto-slide on the home page banner. Active ones appear in order, top to bottom below.
      </p>
      <div className="flex items-center gap-2 mb-6">
        <input type="file" accept="image/*" disabled={uploading} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        {uploading && <span className="text-sm text-muted">Uploading…</span>}
      </div>
      <Table head={["Image", "Order", "Active", ""]}>
        {data?.map((b, i) => (
          <tr key={b.id}>
            <td><Img src={b.imageUrl} alt="" className="w-28 h-16 object-cover" /></td>
            <td className="whitespace-nowrap">
              <button className="px-1.5 disabled:opacity-30" disabled={i === 0} onClick={() => data && move(data, i, -1)}>▲</button>
              <button className="px-1.5 disabled:opacity-30" disabled={i === data.length - 1} onClick={() => data && move(data, i, 1)}>▼</button>
            </td>
            <td>
              <input
                type="checkbox" checked={b.active}
                onChange={(e) => mutate(() => updateBanner(b.id, { active: e.target.checked }), b.active ? "Hidden" : "Shown")}
              />
            </td>
            <td>
              <button
                className="underline text-rosedark"
                onClick={() => confirm("Delete this banner?") && mutate(() => deleteBanner(b.id), "Deleted")}
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
