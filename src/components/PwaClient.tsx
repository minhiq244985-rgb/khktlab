"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function safeGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSet(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* ignore */ }
}

export default function PwaClient() {
  const pathname = usePathname();
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [showIosTip, setShowIosTip] = useState(false);
  const [installed, setInstalled] = useState(false);

  // Đăng ký service worker (chỉ ở bản chạy thật).
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    const register = () => navigator.serviceWorker.register("/sw.js").catch(() => {});
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) { setInstalled(true); return; }

    const onPrompt = (e: Event) => { e.preventDefault(); setPromptEvent(e as InstallPromptEvent); };
    const onInstalled = () => { setInstalled(true); setPromptEvent(null); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    // iPhone/iPad (Safari) không có nút cài tự động: hiện hướng dẫn.
    const ua = navigator.userAgent;
    const isIos = /iPad|iPhone|iPod/.test(ua) || (ua.includes("Mac") && "ontouchend" in document);
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
    if (isIos && isSafari && safeGet("pwa-ios-tip") !== "1") setShowIosTip(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Chỉ hiện ở trang chủ để không che bảng điều khiển thí nghiệm.
  if (installed || pathname !== "/") return null;

  const install = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    await promptEvent.userChoice;
    setPromptEvent(null);
  };

  if (promptEvent) {
    return (
      <button
        onClick={install}
        className="fixed bottom-5 right-5 z-50 px-5 py-3 rounded-full bg-linear-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/30 hover:scale-105 transition-transform"
      >
        Cài ứng dụng
      </button>
    );
  }

  if (showIosTip) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm glass rounded-2xl p-4 text-sm text-[var(--text-primary)] shadow-lg">
        <p className="pr-6">
          Để cài ứng dụng: bấm nút <b>Chia sẻ</b> của Safari rồi chọn <b>Thêm vào MH chính</b>.
        </p>
        <button
          aria-label="Đóng"
          onClick={() => { safeSet("pwa-ios-tip", "1"); setShowIosTip(false); }}
          className="absolute top-2 right-3 text-lg leading-none text-gray-400 hover:text-[var(--text-primary)]"
        >
          ×
        </button>
      </div>
    );
  }

  return null;
}
