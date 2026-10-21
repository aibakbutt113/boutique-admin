"use client";
import { useState } from "react";
import { createCategory, deleteCategory, getCategories, uploadImage } from "@/lib/db";
import { useToast } from "@/lib/store";
import Img from "@/components/Img";
import { AdminTitle, Table, useAdmin } from "@/components/admin";

export default function Categories() {
  const { data, mutate } = useAdmin(getCategories);
  const push = useToast((s) => s.push);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");

  const upload = async (file: File) => {
    try {
      setImage(await uploadImage(file, "categories"));
    } catch (e) {
      push((e as Error).message);
    }
  };

  return (
    <>
      <AdminTitle>Categories</AdminTitle>
      <form className="flex flex-wrap gap-2 mb-6 items-center" onSubmit={async (e) => {
        e.preventDefault();
        if (await mutate(() => createCategory(name, image), "Category added")) { setName(""); setImage(""); }
      }}>
        <input required className="field !w-56" placeholder="Category name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        {image && <Img src={image} alt="" className="w-10 h-10 object-cover" />}
        <button className="btn">Add</button>
      </form>
      <Table head={["Image", "Name", "Slug", ""]}>
        {data?.map((c) => (
          <tr key={c.id}>
            <td><Img src={c.image} alt="" className="w-10 h-12 object-cover" /></td><td>{c.name}</td><td>{c.slug}</td>
            <td><button className="underline text-rosedark" onClick={() => confirm("Delete category? Categories with products can't be deleted.") && mutate(() => deleteCategory(c.id), "Deleted")}>Delete</button></td>
          </tr>
        ))}
      </Table>
    </>
  );
}
