"use client";
import { useState } from "react";
import { money } from "@/lib/api";
import { authedApi, useToast } from "@/lib/store";
import type { Category, Paged, Product, Variant } from "@/lib/types";
import Img from "@/components/Img";
import { AdminTitle, Table, useAdmin } from "@/components/admin";

type Form = {
  id?: string; name: string; description: string; fabric: string; price: string; salePrice: string; categoryId: string;
  isNew: boolean; isFeatured: boolean; isActive: boolean; images: string[]; variants: Pick<Variant, "size" | "color" | "stock">[];
};

const blank = (categoryId: string): Form => ({
  name: "", description: "", fabric: "", price: "", salePrice: "", categoryId, isNew: false, isFeatured: false, isActive: true,
  images: [], variants: ["S", "M", "L"].map((size) => ({ size, color: "Blush", stock: 5 })),
});

export default function Products() {
  const { data, mutate } = useAdmin<Paged<Product>>("/admin/products?limit=60");
  const { data: cats } = useAdmin<Category[]>("/categories");
  const push = useToast((s) => s.push);
  const [form, setForm] = useState<Form | null>(null);

  const edit = (p: Product) =>
    setForm({
      id: p.id, name: p.name, description: p.description, fabric: p.fabric ?? "", price: String(p.price),
      salePrice: p.salePrice ? String(p.salePrice) : "", categoryId: p.categoryId, isNew: p.isNew, isFeatured: p.isFeatured,
      isActive: p.isActive, images: p.images.map((i) => i.url),
      variants: p.variants.map(({ size, color, stock }) => ({ size, color, stock })),
    });

  const upload = async (files: FileList | null) => {
    if (!files || !form) return;
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", f);
        urls.push((await authedApi<{ url: string }>("/admin/upload", { method: "POST", body: fd })).url);
      }
      setForm((s) => s && { ...s, images: [...s.images, ...urls] });
    } catch (e) {
      push((e as Error).message);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const body = {
      name: form.name, description: form.description, fabric: form.fabric || undefined, price: +form.price,
      salePrice: form.salePrice ? +form.salePrice : null, categoryId: form.categoryId, isNew: form.isNew,
      isFeatured: form.isFeatured, isActive: form.isActive, images: form.images,
      variants: form.variants.map((v) => ({ ...v, stock: +v.stock })),
    };
    const ok = await mutate(
      () => authedApi(form.id ? `/admin/products/${form.id}` : "/admin/products", { method: form.id ? "PATCH" : "POST", json: body }),
      form.id ? "Product updated" : "Product created",
    );
    if (ok) setForm(null);
  };

  const setVar = (i: number, patch: Partial<Form["variants"][number]>) =>
    setForm((s) => s && { ...s, variants: s.variants.map((v, j) => (j === i ? { ...v, ...patch } : v)) });

  if (form)
    return (
      <form onSubmit={save} className="max-w-3xl space-y-4">
        <AdminTitle action={<button type="button" className="btn-outline" onClick={() => setForm(null)}>Cancel</button>}>
          {form.id ? "Edit product" : "New product"}
        </AdminTitle>
        <input required className="field" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <textarea required rows={3} className="field" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="grid sm:grid-cols-4 gap-3">
          <input className="field" placeholder="Fabric" value={form.fabric} onChange={(e) => setForm({ ...form, fabric: e.target.value })} />
          <input required type="number" min={0} className="field" placeholder="Price (Rs.)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <input type="number" min={0} className="field" placeholder="Sale price" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} />
          <select required className="field" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            {cats?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex gap-6 text-sm">
          {(["isNew", "isFeatured", "isActive"] as const).map((k) => (
            <label key={k} className="flex gap-2"><input type="checkbox" checked={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.checked })} />{k === "isNew" ? "New arrival" : k === "isFeatured" ? "Featured" : "Visible in shop"}</label>
          ))}
        </div>
        <div>
          <p className="text-sm mb-2">Images (first is the cover)</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {form.images.map((u, i) => (
              <div key={u + i} className="relative">
                <Img src={u} alt="" className="w-20 h-24 object-cover" />
                <button type="button" className="absolute top-0 right-0 bg-white/90 px-1.5 text-xs" onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })}>✕</button>
              </div>
            ))}
          </div>
          <input type="file" accept="image/*" multiple onChange={(e) => upload(e.target.files)} />
        </div>
        <div>
          <p className="text-sm mb-2">Variants (stock per size and colour)</p>
          {form.variants.map((v, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input className="field !w-24" placeholder="Size" value={v.size} onChange={(e) => setVar(i, { size: e.target.value })} />
              <input className="field !w-32" placeholder="Colour" value={v.color} onChange={(e) => setVar(i, { color: e.target.value })} />
              <input type="number" min={0} className="field !w-24" value={v.stock} onChange={(e) => setVar(i, { stock: +e.target.value })} />
              {!form.id && <button type="button" onClick={() => setForm({ ...form, variants: form.variants.filter((_, j) => j !== i) })}>✕</button>}
            </div>
          ))}
          <button type="button" className="btn-outline !py-1.5" onClick={() => setForm({ ...form, variants: [...form.variants, { size: "M", color: "Blush", stock: 5 }] })}>+ Variant</button>
          {form.id && <p className="text-xs text-muted mt-2">Set stock to 0 to retire a variant.</p>}
        </div>
        <button className="btn">Save product</button>
      </form>
    );

  return (
    <>
      <AdminTitle action={<button className="btn" onClick={() => cats?.length ? setForm(blank(cats[0].id)) : push("Add a category first")}>+ New product</button>}>Products</AdminTitle>
      <Table head={["", "Name", "Category", "Price", "Stock", "Status", ""]}>
        {data?.items.map((p) => (
          <tr key={p.id}>
            <td><Img src={p.images[0]?.url} alt="" className="w-10 h-12 object-cover" /></td>
            <td>{p.name}</td><td>{p.category.name}</td>
            <td>{p.salePrice ? <><span className="text-rosedark">{money(p.salePrice)}</span> <s className="text-muted">{money(p.price)}</s></> : money(p.price)}</td>
            <td>{p.variants.reduce((n, v) => n + v.stock, 0)}</td>
            <td>{p.isActive ? "Live" : "Hidden"}</td>
            <td className="whitespace-nowrap">
              <button className="underline mr-3" onClick={() => edit(p)}>Edit</button>
              {p.isActive && <button className="underline text-rosedark" onClick={() => confirm("Hide this product from the shop?") && mutate(() => authedApi(`/admin/products/${p.id}`, { method: "DELETE" }), "Product hidden")}>Hide</button>}
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
