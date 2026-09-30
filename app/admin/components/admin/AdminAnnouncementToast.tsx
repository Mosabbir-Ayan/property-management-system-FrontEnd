"use client";

import { useEffect, useState } from "react";
import { getPusherClient } from "@/lib/pusher";

type Toast = { id: string; title: string; body: string;};

export default function AdminAnnouncementToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const pusher = getPusherClient();

    if (!pusher) return;

    const channel = pusher.subscribe("announcements");

    channel.bind(
      "new-announcement",
      (data: { id: number; title: string; body: string; created_by: string;}) => {
        const id = crypto.randomUUID();

        setToasts((prev) => [
          ...prev,
          {
            id, title: data.title, body: `${data.body} — by ${data.created_by}`,},
        ]);

        setTimeout(() => {
          setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 6000);
      }
    );

    return () => {
      channel.unbind_all();
      pusher.unsubscribe("announcements");
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[80] flex w-[360px] max-w-[calc(100vw-32px)] flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="rounded-2xl border border-[#E8EDF3] bg-white p-4 shadow-[0_12px_32px_rgba(16,42,67,0.12)]"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF0ED] text-[#FF5A3D]">
              <span className="text-sm font-bold">!</span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold text-[#17212B]">
                {toast.title}
              </p>

              <p className="mt-1 text-[11px] leading-[1.6] text-[#718096]">
                {toast.body}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setToasts((prev) =>
                  prev.filter((item) => item.id !== toast.id)
                );
              }}
              className="text-lg leading-none text-[#9AA5B1] transition hover:text-[#FF5A3D]"
              aria-label="Close notification"
            >
              ×
            </button>
          </div>

          <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#FFF0ED]">
            <div className="h-full w-full rounded-full bg-[#FF5A3D]" />
          </div>
        </div>
      ))}
    </div>
  );
}