"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/store";

const LINKS = [
  ["/", "Dashboard"], ["/products", "Products"], ["/categories", "Categories"], ["/orders", "Orders"],
  ["/customers", "Customers"], ["/coupons", "Coupons"], ["/reviews", "Reviews"], ["/subscribers", "Subscribers"],
];
const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL ?? "http://localhost:3000";

export default function PanelLayout({ children }: LayoutProps<"/">) {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const router = useRouter();
  const path = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 50); // wait for persisted auth to hydrate
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (ready && user?.role !== "ADMIN") router.replace(path === "/" ? "/login" : `/login?next=${encodeURIComponent(path)}`);
  }, [ready, user, router, path]);

  if (user?.role !== "ADMIN") return null;
  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-blush md:w-56 shrink-0 p-4 md:min-h-screen">
        <Link href="/" className="font-script text-3xl text-rosedark block mb-4">My Friendly</Link>
        <nav className="flex md:flex-col gap-1 overflow-x-auto text-sm">
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href} className={`px-3 py-2 whitespace-nowrap ${path === href ? "bg-rose text-white" : "hover:bg-pinkbar"}`}>{label}</Link>
          ))}
          <a href={STORE_URL} className="px-3 py-2 text-muted whitespace-nowrap">← Back to shop</a>
          <button onClick={() => { logout(); router.replace("/login"); }} className="px-3 py-2 text-muted whitespace-nowrap text-left cursor-pointer">Log out</button>
        </nav>
      </aside>
      <div className="flex-1 p-6 min-w-0">{children}</div>
    </div>
  );
}
