"use client";
import { useToast } from "@/lib/store";

export default function Toasts() {
  const toasts = useToast((s) => s.toasts);
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className="bg-ink text-white text-sm px-4 py-2.5 shadow-lg">
          {t.text}
        </div>
      ))}
    </div>
  );
}
