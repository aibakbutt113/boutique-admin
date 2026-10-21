/** Resolve an image path: uploads are full Supabase Storage URLs, placeholders live on this site. */
export const imgUrl = (u?: string | null) => (!u ? "/ph/blush/Photo" : u);

export const money = (n: number) => `Rs. ${n.toLocaleString("en-PK")}`;

export class ApiError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
  }
}

type PgError = { message: string; code?: string; details?: string | null } | null;

/** Friendlier text for the database errors a customer can actually hit. */
function message(e: NonNullable<PgError>) {
  if (e.code === "23505") return "That already exists";
  if (e.code === "23503") return "This is still in use elsewhere";
  if (e.code === "PGRST301" || /JWT/i.test(e.message)) return "Please log in again";
  return e.message;
}

/**
 * Unwrap a Supabase result: return data or throw an Error carrying the database's message.
 * `T` is the shape the caller declares. Without generated database types, supabase-js infers
 * every embedded relation (e.g. `user:User(name)`) as an array, even many-to-one ones that
 * PostgREST actually returns as a single object, so its inferred type is deliberately ignored.
 */
export async function q<T = unknown>(p: PromiseLike<{ data: unknown; error: PgError }>): Promise<T> {
  const { data, error } = await p;
  if (error) throw new ApiError(message(error), error.code);
  return data as T;
}
