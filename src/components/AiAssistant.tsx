"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { EXPERIMENTS, slugFromPath } from "@/lib/aiContext";

type Msg = { role: "user" | "assistant"; content: string };
type Role = "student" | "teacher";

const ROLE_KEY = "sl3d-ai-role";

// Giữ lại nội dung khung WebGL sau khi vẽ để có thể chụp ảnh. Phải chạy trước khi thí nghiệm tạo canvas.
if (typeof window !== "undefined" && !(window as unknown as { __sl3dGl?: boolean }).__sl3dGl) {
  (window as unknown as { __sl3dGl?: boolean }).__sl3dGl = true;
  const orig = HTMLCanvasElement.prototype.getContext as (this: HTMLCanvasElement, id: string, attrs?: unknown) => unknown;
  HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, id: string, attrs?: unknown) {
    if (id === "webgl" || id === "webgl2" || id === "experimental-webgl") {
      attrs = { ...((attrs as object) || {}), preserveDrawingBuffer: true };
    }
    return orig.call(this, id, attrs);
  } as typeof HTMLCanvasElement.prototype.getContext;
}

// Chụp khung 3D lớn nhất trên trang, thu nhỏ còn tối đa 768px, nén JPEG.
function captureCanvas(): string | null {
  try {
    const list = Array.from(document.querySelectorAll("canvas")).filter((c) => c.width > 50 && c.height > 50);
    if (!list.length) return null;
    list.sort((a, b) => b.width * b.height - a.width * a.height);
    const c = list[0];
    const k = Math.min(1, 768 / Math.max(c.width, c.height));
    const o = document.createElement("canvas");
    o.width = Math.max(1, Math.round(c.width * k));
    o.height = Math.max(1, Math.round(c.height * k));
    const ctx = o.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, o.width, o.height);
    ctx.drawImage(c, 0, 0, o.width, o.height);
    return o.toDataURL("image/jpeg", 0.7);
  } catch {
    return null;
  }
}

// Đọc giá trị thanh trượt, ô nhập, lựa chọn và chữ đang hiện trên trang (bỏ khung chat).
function readScreenText(): string {
  try {
    const rows: string[] = [];
    const seen = new Set<string>();
    document.querySelectorAll("input, select, textarea").forEach((el) => {
      if (el.closest("[data-ai-ignore]")) return;
      const inp = el as HTMLInputElement;
      const type: string = inp.type;
      if (type === "hidden" || type === "password") return;
      const label =
        el.getAttribute("aria-label") ||
        inp.labels?.[0]?.textContent ||
        el.closest("label")?.textContent ||
        el.previousElementSibling?.textContent ||
        el.parentElement?.textContent ||
        "";
      let value = "";
      if (type === "checkbox" || type === "radio") value = inp.checked ? "bật" : "tắt";
      else if (el.tagName === "SELECT") value = Array.from((el as HTMLSelectElement).selectedOptions || []).map((o) => o.text).join(", ");
      else value = inp.value;
      const line = `${label.replace(/\s+/g, " ").trim().slice(0, 60)}: ${value}`;
      if (!seen.has(line) && rows.length < 40) {
        seen.add(line);
        rows.push(line);
      }
    });
    const clone = document.body.cloneNode(true) as HTMLElement;
    clone.querySelectorAll("[data-ai-ignore], script, style, noscript, canvas, svg, nav, header, footer").forEach((n) => n.remove());
    const text = (clone.textContent || "").replace(/\s+/g, " ").trim().slice(0, 1500);
    return `Các điều khiển: ${rows.join(" | ") || "(không đọc được)"}\nChữ đang hiển thị: ${text}`;
  } catch {
    return "";
  }
}

const SUGGEST: Record<Role, { exp: string[]; home: string[] }> = {
  student: {
    exp: [
      "Thí nghiệm này mô phỏng điều gì?",
      "Mình nên thay đổi biến nào để quan sát rõ nhất?",
      "Gợi ý cho mình cách giải thích hiện tượng này",
    ],
    home: [
      "Mình mới học, nên bắt đầu từ thí nghiệm nào?",
      "Thí nghiệm nào giúp hiểu về sóng?",
    ],
  },
  teacher: {
    exp: [
      "Gợi ý cách dùng thí nghiệm này trong một tiết học 45 phút",
      "Soạn 5 câu trắc nghiệm kèm đáp án về thí nghiệm này",
      "Học sinh hay hiểu sai điều gì ở bài này?",
    ],
    home: [
      "Gợi ý thí nghiệm phù hợp cho bài giảng về dao động",
      "Làm sao dùng web này để dạy học theo dự án?",
    ],
  },
};

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") && p.length > 4 ? (
      <strong key={i}>{p.slice(2, -2)}</strong>
    ) : (
      <Fragment key={i}>{p}</Fragment>
    )
  );
}

function renderText(text: string) {
  return text.split("\n").map((line, i) => {
    const m = line.match(/^\s*[*\-•]\s+(.*)$/);
    if (m) {
      return (
        <div key={i} style={{ paddingLeft: 14, textIndent: -12, margin: "2px 0" }}>
          {"• "}
          {renderInline(m[1])}
        </div>
      );
    }
    if (!line.trim()) return <div key={i} style={{ height: 6 }} />;
    return (
      <div key={i} style={{ margin: "2px 0" }}>
        {renderInline(line)}
      </div>
    );
  });
}

export default function AiAssistant() {
  const pathname = usePathname() || "/";
  const slug = slugFromPath(pathname);
  const expTitle = slug ? EXPERIMENTS[slug].title : null;

  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<Role>("student");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [seeScreen, setSeeScreen] = useState(true);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const r = localStorage.getItem(ROLE_KEY);
      if (r === "teacher" || r === "student") setRole(r);
    } catch {}
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, open]);

  function chooseRole(r: Role) {
    setRole(r);
    try {
      localStorage.setItem(ROLE_KEY, r);
    } catch {}
  }

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    const next: Msg[] = [...msgs, { role: "user", content: q }];
    setMsgs([...next, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const look = slug && seeScreen;
      const image = look ? captureCanvas() : null;
      const screen = look ? readScreenText() : "";
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, role, slug, image, screen }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const err = (await res.text().catch(() => "")) || "Trợ lý đang gặp sự cố, thử lại sau nhé.";
        setMsgs([...next, { role: "assistant", content: err }]);
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMsgs([...next, { role: "assistant", content: acc }]);
      }
      if (!acc.trim()) setMsgs([...next, { role: "assistant", content: "Mình chưa có câu trả lời, bạn hỏi lại giúp mình nhé." }]);
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setMsgs([...next, { role: "assistant", content: "Không kết nối được. Kiểm tra mạng rồi thử lại nhé." }]);
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  const chips = slug ? SUGGEST[role].exp : SUGGEST[role].home;

  const panel: React.CSSProperties = {
    position: "fixed",
    right: 16,
    bottom: 80,
    width: "min(400px, calc(100vw - 32px))",
    height: "min(560px, calc(100dvh - 110px))",
    display: "flex",
    flexDirection: "column",
    background: "#0f1226",
    color: "#e8eaf6",
    border: "1px solid rgba(129,140,248,0.4)",
    borderRadius: 16,
    boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
    zIndex: 70,
    overflow: "hidden",
    fontSize: 14,
    lineHeight: 1.5,
  };

  return (
    <>
      {open && (
        <div style={panel} role="dialog" aria-label="Trợ lý AI" data-ai-ignore>
          <div style={{ padding: "10px 12px", background: "#1b1f45", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700 }}>Trợ lý ScienceLab</div>
              <div style={{ fontSize: 12, opacity: 0.75, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {expTitle ? `Đang mở: ${expTitle}` : "Hỏi đáp khoa học"}
              </div>
            </div>
            <div style={{ display: "flex", background: "#0f1226", borderRadius: 999, padding: 2 }}>
              {(["student", "teacher"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => chooseRole(r)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 999,
                    border: 0,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    background: role === r ? "#6366f1" : "transparent",
                    color: "#fff",
                  }}
                >
                  {r === "student" ? "Học sinh" : "Thầy cô"}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Đóng"
              style={{ border: 0, background: "transparent", color: "#fff", fontSize: 20, cursor: "pointer", padding: "0 4px" }}
            >
              ×
            </button>
          </div>

          {slug && (
            <label style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 12, background: "#151937", cursor: "pointer" }}>
              <input type="checkbox" checked={seeScreen} onChange={(e) => setSeeScreen(e.target.checked)} />
              <span>AI tự xem khung thí nghiệm và các thông số khi bạn hỏi</span>
            </label>
          )}

          <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {msgs.length === 0 && (
              <div>
                <div style={{ opacity: 0.85, marginBottom: 10 }}>
                  {role === "student"
                    ? "Chào bạn! Mình sẽ gợi ý từng bước để bạn tự hiểu bài. Bạn muốn hỏi gì?"
                    : "Chào thầy cô! Mình có thể gợi ý bài giảng, soạn câu hỏi và giải thích hiện tượng."}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {chips.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => send(c)}
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        borderRadius: 10,
                        border: "1px solid rgba(129,140,248,0.45)",
                        background: "rgba(99,102,241,0.12)",
                        color: "#e8eaf6",
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {msgs.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "88%",
                  padding: "8px 11px",
                  borderRadius: 12,
                  background: m.role === "user" ? "#4f46e5" : "#1b1f45",
                  wordBreak: "break-word",
                }}
              >
                {m.content ? renderText(m.content) : <span style={{ opacity: 0.7 }}>Đang suy nghĩ…</span>}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            style={{ display: "flex", gap: 6, padding: 10, borderTop: "1px solid rgba(129,140,248,0.25)" }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi…"
              maxLength={2000}
              style={{
                flex: 1,
                minWidth: 0,
                padding: "9px 11px",
                borderRadius: 10,
                border: "1px solid rgba(129,140,248,0.4)",
                background: "#0b0d20",
                color: "#fff",
                outline: "none",
                fontSize: 14,
              }}
            />
            {loading ? (
              <button type="button" onClick={stop} style={btn("#b91c1c")}>
                Dừng
              </button>
            ) : (
              <button type="submit" disabled={!input.trim()} style={btn("#6366f1", !input.trim())}>
                Gửi
              </button>
            )}
          </form>
          <div style={{ padding: "0 10px 8px", fontSize: 11, opacity: 0.6, display: "flex", justifyContent: "space-between" }}>
            <span>AI có thể sai, hãy kiểm tra lại với sách giáo khoa.</span>
            {msgs.length > 0 && !loading && (
              <button
                type="button"
                onClick={() => setMsgs([])}
                style={{ border: 0, background: "transparent", color: "#a5b4fc", cursor: "pointer", fontSize: 11 }}
              >
                Xóa cuộc trò chuyện
              </button>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        data-ai-ignore
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Đóng trợ lý AI" : "Mở trợ lý AI"}
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          zIndex: 70,
          height: 52,
          padding: "0 18px",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.3)",
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 14,
          cursor: "pointer",
          boxShadow: "0 6px 20px rgba(99,102,241,0.5)",
        }}
      >
        {open ? "Đóng" : "✨ Hỏi AI"}
      </button>
    </>
  );
}

function btn(bg: string, disabled = false): React.CSSProperties {
  return {
    padding: "0 14px",
    borderRadius: 10,
    border: 0,
    background: bg,
    color: "#fff",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
  };
}
