// Every read and write the admin panel makes. Replaces the old /admin/* REST endpoints.
// Admin rights are enforced in the database: RLS policies and functions check is_admin().
import { q } from "./api";
import { supabase } from "./supabase";
import type { Category, Order, Paged, Product } from "./types";

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// ---------- dashboard ----------

export interface Stats {
  revenue: number; orders: number; customers: number; products: number; pending: number;
  lowStock: { id: string; size: string; color: string; stock: number; product: { name: string } }[];
  recent: { id: string; number: string; total: number; status: string; user: { name: string } }[];
}
export const getStats = () => q<Stats>(supabase.rpc("admin_stats"));

// ---------- image uploads (Supabase Storage, public "images" bucket) ----------

export async function uploadImage(file: File, folder = "uploads") {
  if (!file.type.startsWith("image/")) throw new Error("Images only");
  if (file.size > 5 * 1024 * 1024) throw new Error("Images must be under 5 MB");
  const ext = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "jpg";
  const path = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
  const { error } = await supabase.storage.from("images").upload(path, file, { contentType: file.type });
  if (error) throw new Error(error.message);
  return supabase.storage.from("images").getPublicUrl(path).data.publicUrl;
}

// ---------- products ----------

export const getProducts = () => q<Paged<Product>>(supabase.rpc("search_products", { q: { limit: "60" }, include_hidden: true }));

export interface ProductInput {
  name: string; description: string; fabric?: string; price: number; salePrice: number | null;
  categoryId: string; brandId: string | null; isNew: boolean; isFeatured: boolean; isActive: boolean;
  images: string[]; variants: { size: string; color: string; stock: number }[];
}
/** Create (id undefined) or update a product with its images and variants in one transaction. */
export const saveProduct = (id: string | undefined, d: ProductInput) =>
  q<Product>(supabase.rpc("admin_save_product", { p_id: id ?? null, d }));

/** Soft delete: hidden from the shop, kept for past orders. */
export const hideProduct = (id: string) => q(supabase.from("Product").update({ isActive: false }).eq("id", id));

// ---------- categories ----------

export async function getCategories(): Promise<Category[]> {
  const rows = await q<(Category & { parentId: string | null })[]>(
    supabase.from("Category").select("id, name, slug, image, parentId").order("position"),
  );
  return rows.map((c) => ({ ...c, children: rows.filter((x) => x.parentId === c.id) }));
}
export const createCategory = (name: string, image?: string) =>
  q(supabase.from("Category").insert({ name: name.trim(), slug: slugify(name), image: image || null }));
export const deleteCategory = (id: string) => q(supabase.from("Category").delete().eq("id", id));

// ---------- brands ----------

export interface Brand { id: string; name: string; slug: string; image: string | null; position: number; active: boolean }
export const getBrands = () => q<Brand[]>(supabase.from("Brand").select("*").order("position"));
export const createBrand = (name: string, image?: string) =>
  q(supabase.from("Brand").insert({ name: name.trim(), slug: slugify(name), image: image || null }));
export const updateBrand = (id: string, d: Partial<Pick<Brand, "name" | "image" | "position" | "active">>) =>
  q(supabase.from("Brand").update(d).eq("id", id));
export const deleteBrand = (id: string) => q(supabase.from("Brand").delete().eq("id", id));

// ---------- banners ----------

export interface Banner { id: string; imageUrl: string; position: number; active: boolean }
export const getBanners = () => q<Banner[]>(supabase.from("Banner").select("*").order("position"));
export const createBanner = (imageUrl: string) => q(supabase.from("Banner").insert({ imageUrl }));
export const updateBanner = (id: string, d: Partial<Pick<Banner, "position" | "active">>) =>
  q(supabase.from("Banner").update(d).eq("id", id));
export const deleteBanner = (id: string) => q(supabase.from("Banner").delete().eq("id", id));

// ---------- orders ----------

export const getOrders = () =>
  q<Order[]>(
    supabase.from("Order").select("*, items:OrderItem(*), user:User(name, email)").order("createdAt", { ascending: false }),
  );
/** Restocks on cancel/return and marks COD orders paid on delivery (see apply_order_status). */
export const setOrderStatus = (id: string, status: string) =>
  q<Order>(supabase.rpc("admin_set_order_status", { p_id: id, p_status: status }));

// ---------- customers ----------

export interface Customer { id: string; name: string; email: string; phone: string | null; createdAt: string; _count: { orders: number } }
export async function getCustomers(): Promise<Customer[]> {
  const rows = await q<(Omit<Customer, "_count"> & { orders: { count: number }[] })[]>(
    supabase.from("User").select("id, name, email, phone, createdAt, orders:Order(count)")
      .eq("role", "CUSTOMER").order("createdAt", { ascending: false }),
  );
  return rows.map(({ orders, ...c }) => ({ ...c, _count: { orders: orders[0]?.count ?? 0 } }));
}

// ---------- coupons ----------

export interface Coupon { id: string; code: string; type: "PERCENT" | "FIXED"; value: number; minOrder: number; expiresAt: string | null; active: boolean }
export const getCoupons = () => q<Coupon[]>(supabase.from("Coupon").select("*").order("code"));
export const createCoupon = (d: { code: string; type: string; value: number; minOrder: number; expiresAt?: string }) =>
  q(supabase.from("Coupon").insert({ ...d, code: d.code.trim().toUpperCase(), expiresAt: d.expiresAt || null }));
export const deactivateCoupon = (id: string) => q(supabase.from("Coupon").update({ active: false }).eq("id", id));

// ---------- reviews & subscribers ----------

export interface AdminReview { id: string; rating: number; comment: string; user: { name: string }; product: { name: string } }
export const getReviews = () =>
  q<AdminReview[]>(
    supabase.from("Review").select("id, rating, comment, createdAt, user:User(name), product:Product(name)")
      .order("createdAt", { ascending: false }),
  );
export const deleteReview = (id: string) => q(supabase.from("Review").delete().eq("id", id));

export const getSubscribers = () =>
  q<{ id: string; email: string; createdAt: string }[]>(supabase.from("Subscriber").select("*").order("createdAt", { ascending: false }));
