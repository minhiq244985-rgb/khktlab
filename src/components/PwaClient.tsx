"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, Smartphone, Monitor, Share, PlusSquare, WifiOff, X, CheckCircle2 } from "lucide-react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type DevicePlatform = "ios-safari" | "ios-other" | "android" | "desktop";

function detectPlatform(): DevicePlatform {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  const isIos =
    /iPad|iPhone|iPod/.test(ua) ||
    (ua.includes("Mac") && typeof document !== "undefined" && "ontouchend" in document);

  if (isIos) {
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/.test(ua);
    return isSafari ? "ios-safari" : "ios-other";
  }
  if (/Android/i.test(ua)) {
    return "android";
  }
  return "desktop";
}

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export default function PwaClient() {
  const pathname = usePathname();
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<DevicePlatform>("desktop");
  const [installed, setInstalled] = useState(false);
  const [showAutoBanner, setShowAutoBanner] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOffline(!navigator.onLine);
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      const registerSw = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            reg.addEventListener("updatefound", () => {
              const newWorker = reg.installing;
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                    newWorker.postMessage({ type: "SKIP_WAITING" });
                  }
                });
              }
            });
          })
          .catch(() => {});
      };
      if (document.readyState === "complete") registerSw();
      else window.addEventListener("load", registerSw, { once: true });
    }

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const detected = detectPlatform();
    setPlatform(detected);

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;

    if (standalone) {
      setInstalled(true);
      return;
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as InstallPromptEvent);
      if (safeGet("pwa-dismissed-v2") !== "1") {
        setShowAutoBanner(true);
      }
    };

    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
      setShowAutoBanner(false);
      setShowGuideModal(false);
    };

    const onOpenGuide = () => {
      setShowGuideModal(true);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("open-pwa-install-guide", onOpenGuide);

    if ((detected === "ios-safari" || detected === "ios-other") && safeGet("pwa-dismissed-v2") !== "1") {
      setShowAutoBanner(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("open-pwa-install-guide", onOpenGuide);
    };
  }, []);

  const triggerNativeInstall = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === "accepted") {
      setPromptEvent(null);
      setShowAutoBanner(false);
      setShowGuideModal(false);
    }
  };

  const dismissBanner = () => {
    safeSet("pwa-dismissed-v2", "1");
    setShowAutoBanner(false);
  };

  return (
    <>
      {isOffline && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/95 text-slate-950 text-xs font-bold shadow-lg">
          <WifiOff size={14} />
          <span>Chế độ Offline — Các thí nghiệm đã mở vẫn hoạt động bình thường</span>
        </div>
      )}

      {!installed && pathname === "/" && showAutoBanner && !showGuideModal && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-5 sm:max-w-sm z-50 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-purple-500/40 p-4 text-gray-100 shadow-2xl">
          <button
            aria-label="Đóng"
            onClick={dismissBanner}
            className="absolute top-2.5 right-2.5 p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
          >
            <X size={16} />
          </button>

          <div className="flex items-start gap-3 pr-5">
            <div className="p-2.5 rounded-xl bg-linear-to-br from-blue-600 to-purple-600 text-white shrink-0">
              {platform === "desktop" ? <Monitor size={20} /> : <Smartphone size={20} />}
            </div>
            <div className="space-y-1.5">
              <div className="font-bold text-sm text-white">
                Cài đặt ScienceLab 3D lên thiết bị
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {platform === "ios-safari" && (
                  <>
                    Trên iPhone/iPad: bấm nút <b>Chia sẻ</b>{" "}
                    <Share size={12} className="inline text-sky-400" /> ở thanh dưới Safari, sau đó chọn{" "}
                    <b>Thêm vào MH chính</b> <PlusSquare size={12} className="inline text-sky-400" />.
                  </>
                )}
                {platform === "ios-other" && (
                  <>
                    Bạn đang dùng trình duyệt phụ trên iOS. Hãy mở link này bằng <b>Safari</b> để cài ứng dụng ra màn hình chính.
                  </>
                )}
                {(platform === "android" || platform === "desktop") && (
                  <>
                    Mở toàn màn hình không thanh địa chỉ, tải mô hình 3D siêu nhanh và học được cả khi mất mạng.
                  </>
                )}
              </p>

              <div className="pt-1 flex items-center gap-2">
                {promptEvent ? (
                  <button
                    onClick={triggerNativeInstall}
                    className="px-3.5 py-1.5 rounded-lg bg-linear-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold hover:opacity-95 transition-opacity flex items-center gap-1.5"
                  >
                    <Download size={13} />
                    <span>Cài đặt ngay</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowGuideModal(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-purple-600/80 hover:bg-purple-600 text-white text-xs font-semibold transition-colors"
                  >
                    Xem hướng dẫn từng bước
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-950 border border-white/15 p-5 sm:p-6 text-gray-100 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              aria-label="Đóng hộp thoại"
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg sm:text-xl font-bold text-white mb-1 flex items-center gap-2">
              <Download size={20} className="text-purple-400" />
              <span>Cài Đặt Ứng Dụng ScienceLab 3D (PWA)</span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 mb-4">
              Chạy độc lập như ứng dụng gốc trên mọi thiết bị, hỗ trợ lưu bộ nhớ đệm để thực hành cả khi mạng yếu.
            </p>

            {installed ? (
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-sm">
                <CheckCircle2 size={20} className="shrink-0" />
                <span>Thiết bị của bạn đã cài đặt và đang chạy ở chế độ ứng dụng độc lập!</span>
              </div>
            ) : (
              <div className="space-y-3 text-xs sm:text-sm">
                {promptEvent && (
                  <div className="p-3.5 rounded-xl bg-linear-to-r from-blue-600/25 to-purple-600/25 border border-purple-400/40 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-white">Cài đặt tự động 1 chạm</div>
                      <div className="text-xs text-gray-300">Trình duyệt của bạn đã sẵn sàng cài ngay.</div>
                    </div>
                    <button
                      onClick={triggerNativeInstall}
                      className="px-4 py-2 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold text-xs shrink-0 shadow-lg"
                    >
                      Cài Ngay
                    </button>
                  </div>
                )}

                <div className={`p-3.5 rounded-xl border ${platform === "desktop" ? "bg-blue-950/35 border-blue-400/50" : "bg-white/5 border-white/10"}`}>
                  <div className="font-bold text-sky-300 mb-1 flex items-center gap-1.5">
                    <Monitor size={15} />
                    <span>1. Máy tính (Windows / macOS — Chrome, Edge)</span>
                    {platform === "desktop" && <span className="ml-auto text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">Thiết bị hiện tại</span>}
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-gray-300 text-xs">
                    <li>Nhìn góc phải thanh địa chỉ URL, bấm biểu tượng <b>Cài đặt (màn hình có mũi tên tải xuống)</b>.</li>
                    <li>Hoặc bấm menu <b>⋮</b> (góc trên bên phải) → <b>Lưu và chia sẻ</b> → <b>Cài đặt ScienceLab 3D...</b></li>
                  </ol>
                </div>

                <div className={`p-3.5 rounded-xl border ${platform.startsWith("ios") ? "bg-purple-950/35 border-purple-400/50" : "bg-white/5 border-white/10"}`}>
                  <div className="font-bold text-purple-300 mb-1 flex items-center gap-1.5">
                    <Smartphone size={15} />
                    <span>2. iPhone / iPad (iOS / iPadOS — Safari)</span>
                    {platform.startsWith("ios") && <span className="ml-auto text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">Thiết bị hiện tại</span>}
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-gray-300 text-xs">
                    <li>Mở trang web bằng trình duyệt <b>Safari</b>.</li>
                    <li>Bấm nút <b>Chia sẻ (Share — ô vuông có mũi tên hướng lên)</b> ở thanh công cụ.</li>
                    <li>Cuộn xuống chọn <b>Thêm vào Màn hình chính (Add to Home Screen)</b> → bấm <b>Thêm</b>.</li>
                  </ol>
                </div>

                <div className={`p-3.5 rounded-xl border ${platform === "android" ? "bg-emerald-950/35 border-emerald-400/50" : "bg-white/5 border-white/10"}`}>
                  <div className="font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
                    <Smartphone size={15} />
                    <span>3. Điện thoại / Máy tính bảng Android (Chrome / Edge)</span>
                    {platform === "android" && <span className="ml-auto text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Thiết bị hiện tại</span>}
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-gray-300 text-xs">
                    <li>Bấm biểu tượng <b>⋮</b> ở góc trên bên phải trình duyệt Chrome.</li>
                    <li>Chọn <b>Cài đặt ứng dụng (Install app)</b> hoặc <b>Thêm vào Màn hình chính</b> → <b>Cài đặt</b>.</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
