export const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const ORIGIN = API.replace(/\/api$/, "");

/** Resolve an image path: uploads live on the API host, placeholders on this site. */
export const imgUrl = (u?: string | null) =>
  !u ? "/ph/blush/Photo" : u.startsWith("/uploads") ? `${ORIGIN}${u}` : u;

export const money = (n: number) => `Rs. ${n.toLocaleString("en-PK")}`;

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

let getToken: () => string | null = () => null;
export const bindToken = (fn: () => string | null) => (getToken = fn);

export async function api<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.json !== undefined) {
    headers.set("Content-Type", "application/json");
    init.body = JSON.stringify(init.json);
  }
  const res = await fetch(`${API}${path}`, { ...init, headers, cache: "no-store" });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const b = await res.json();
      msg = Array.isArray(b.message) ? b.message.join(", ") : (b.message ?? msg);
    } catch {}
    throw new ApiError(msg, res.status);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}
