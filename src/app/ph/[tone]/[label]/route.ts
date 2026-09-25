// Generates soft on-brand placeholder artwork so the shop looks complete before
// real product photos are uploaded. Replace via the admin panel or public/images.
const TONES: Record<string, [string, string, string]> = {
  rose: ["#f6cfd0", "#e9a3ab", "#c9707c"],
  blush: ["#fde9e6", "#f5c9c8", "#dc8b95"],
  cream: ["#fbf3ea", "#efdfd0", "#b89a86"],
  sand: ["#f3e3d3", "#e2c4a8", "#a9805f"],
  blue: ["#dbe7f2", "#a9c3de", "#5f83a8"],
};

const esc = (s: string) => s.replace(/[<>&"]/g, "");

export async function GET(_req: Request, ctx: RouteContext<"/ph/[tone]/[label]">) {
  const { tone, label } = await ctx.params;
  const [a, b, c] = TONES[tone] ?? TONES.blush;
  const text = label === "-" ? "" : esc(decodeURIComponent(label)); // "-" = artwork without a caption
  const words = text.split(" ");
  const mid = Math.ceil(words.length / 2);
  const lines = words.length > 2 ? [words.slice(0, mid).join(" "), words.slice(mid).join(" ")] : [text];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 380" preserveAspectRatio="xMidYMid slice">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
  <rect width="300" height="380" fill="url(#g)"/>
  <circle cx="240" cy="70" r="90" fill="#fff" opacity=".18"/>
  <circle cx="40" cy="340" r="110" fill="#fff" opacity=".14"/>
  <g fill="${c}" opacity=".55" transform="translate(150 150)">
    <path d="M-16 -70 L-30 -50 L-22 -34 L-38 60 Q0 80 38 60 L22 -34 L30 -50 L16 -70 Q0 -56 -16 -70Z"/>
  </g>
  <g font-family="Georgia,serif" font-size="20" fill="${c}" text-anchor="middle">
    ${lines.map((l, i) => `<text x="150" y="${290 + i * 26}">${l}</text>`).join("")}
  </g>
</svg>`;
  return new Response(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
