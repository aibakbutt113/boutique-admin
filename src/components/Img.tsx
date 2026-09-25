import { imgUrl } from "@/lib/api";

/** Plain <img> wrapper: product images come from the API host or the placeholder route. */
export default function Img({ src, alt, className }: { src?: string | null; alt: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={imgUrl(src)} alt={alt} className={className} loading="lazy" />;
}
