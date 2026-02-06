import React, { useMemo, useState } from "react";
import { UserRole, Client, SystemConfig } from "../types";
import { ICONS } from "../constants";

interface LoginProps {
  onLogin: (role: UserRole, data?: any) => void;
  clients: Client[];
  config?: SystemConfig;
}

type AdminAccount = {
  username: string;
  password: string;
  name: string;
  title: string;
  id: string;
};

const DEFAULT_CLIENT_PASSWORD = "784";
const CLIENT_PW_PREFIX = "legalmaster_client_pw_"; // + client.id

const ADMIN_ACCOUNTS: AdminAccount[] = [
  { username: "ahmed", password: "1", name: "المستشار/ أحمد حلمي", title: "المدير العام", id: "owner" },
  { username: "samar", password: "2", name: "أ/ سمر العبد", title: "مساعدة المدير", id: "assistant_manager" },
  { username: "admin", password: "123456", name: "مسؤول إداري", title: "إدارة المكتب", id: "admin" },
];

const normalizeEmiratesId = (s: string) =>
  (s || "").trim().replace(/\s+/g, "").replace(/[^0-9]/g, "");

const Login: React.FC<LoginProps> = ({ onLogin, clients, config }) => {
  const [loginMode, setLoginMode] = useState<"ADMIN" | "CLIENT">("ADMIN");

  const [adminUsername, setAdminUsername] = useState("");
  const [adminPass, setAdminPass] = useState("");

  const [clientIdInput, setClientIdInput] = useState("");
  const [clientPassInput, setClientPassInput] = useState("");

  const [error, setError] = useState("");

  const palette = useMemo(() => {
    // ✅ Light, calm, consistent palette
    return {
      bg: "#f8fafc",           // slate-50
      card: "#ffffff",
      text: "#0f172a",         // slate-900
      muted: "#64748b",        // slate-500
      border: "#e5e7eb",       // gray-200
      primary: "#2563eb",      // blue-600
      primary2: "#93c5fd",     // blue-300
      success: "#22c55e",      // green-500
      success2: "#bbf7d0",     // green-200
    };
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const u = adminUsername.trim().toLowerCase();
    const p = adminPass;

    const hit = ADMIN_ACCOUNTS.find((a) => a.username === u && a.password === p);
    if (!hit) {
      setError("بيانات دخول الإدارة غير صحيحة (اسم المستخدم أو كلمة المرور).");
      return;
    }

    onLogin(UserRole.ADMIN, { name: hit.name, id: hit.id, title: hit.title });
  };

  const getClientStoredPassword = (client: Client) => {
    try {
      const k = CLIENT_PW_PREFIX + client.id;
      const saved = localStorage.getItem(k);
      return saved && saved.trim() ? saved.trim() : DEFAULT_CLIENT_PASSWORD;
    } catch {
      return DEFAULT_CLIENT_PASSWORD;
    }
  };

  const handleClientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const idDigits = normalizeEmiratesId(clientIdInput);
    if (!idDigits) {
      setError("أدخل رقم الهوية بشكل صحيح.");
      return;
    }

    const client = clients.find((c) => normalizeEmiratesId(c.emiratesId || "") === idDigits);
    if (!client) {
      setError("رقم الهوية غير موجود ضمن بيانات الموكلين.");
      return;
    }

    const expected = getClientStoredPassword(client);
    if ((clientPassInput || "").trim() !== expected) {
      setError("كلمة مرور الموكل غير صحيحة.");
      return;
    }

    onLogin(UserRole.CLIENT, client);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-8"
      style={{
        background: `
          radial-gradient(1000px 600px at 20% 10%, rgba(37,99,235,0.10), transparent 60%),
          radial-gradient(900px 540px at 90% 20%, rgba(34,197,94,0.08), transparent 55%),
          radial-gradient(900px 500px at 40% 90%, rgba(147,197,253,0.12), transparent 55%),
          ${palette.bg}
        `,
      }}
    >
      <div
        className="w-full max-w-[420px] sm:max-w-[520px] md:max-w-[560px] rounded-[20px] sm:rounded-[26px] shadow-2xl overflow-hidden"
        style={{ background: palette.card, border: `1px solid ${palette.border}` }}
      >
        {/* Header */}
        <div className="p-6 sm:p-8 pb-4 sm:pb-6 text-center">
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: `linear-gradient(135deg, ${palette.primary}, ${palette.primary2})`,
              boxShadow: "0 18px 34px rgba(37,99,235,0.18)",
            }}
          >
            {config?.logo ? (
              <img src={config.logo} className="w-full h-full object-contain p-2" alt="Logo" />
            ) : (
              <ICONS.Logo className="w-9 h-9 sm:w-10 sm:h-10 text-white" />
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-black" style={{ color: palette.text }}>
            {config?.officeName || "مكتب المستشار أحمد حلمي"}
          </h1>
          <p className="text-xs sm:text-sm font-bold mt-2" style={{ color: palette.muted }}>
            {config?.officeSlogan || "بوابة الخدمات القانونية الرقمية"}
          </p>
        </div>

        {/* Tabs */}
        <div className="px-6 sm:px-8">
          <div
            className="grid grid-cols-2 p-1 rounded-2xl"
            style={{ background: "#f1f5f9", border: `1px solid ${palette.border}` }}
          >
            <button
              onClick={() => { setLoginMode("ADMIN"); setError(""); }}
              className="py-2.5 sm:py-3 rounded-xl font-black text-sm transition-all"
              style={{
                background: loginMode === "ADMIN" ? palette.card : "transparent",
                color: loginMode === "ADMIN" ? palette.text : palette.muted,
                boxShadow: loginMode === "ADMIN" ? "0 10px 18px rgba(2,6,23,0.08)" : "none",
              }}
            >
              الإدارة
            </button>
            <button
              onClick={() => { setLoginMode("CLIENT"); setError(""); }}
              className="py-2.5 sm:py-3 rounded-xl font-black text-sm transition-all"
              style={{
                background: loginMode === "CLIENT" ? palette.card : "transparent",
                color: loginMode === "CLIENT" ? palette.text : palette.muted,
                boxShadow: loginMode === "CLIENT" ? "0 10px 18px rgba(2,6,23,0.08)" : "none",
              }}
            >
              بوابة الموكلين
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="px-6 sm:px-8 pt-4">
            <div
              className="text-xs font-black p-4 rounded-xl text-center"
              style={{
                background: "rgba(239,68,68,0.08)",
                color: "#b91c1c",
                border: "1px solid rgba(239,68,68,0.18)",
              }}
            >
              {error}
            </div>
          </div>
        )}

        {/* Forms */}
        <div className="p-6 sm:p-8 pt-5 sm:pt-6">
          {loginMode === "ADMIN" ? (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-black mb-2" style={{ color: palette.muted }}>
                  اسم المستخدم
                </label>
                <input
                  type="text"
                  className="w-full rounded-2xl px-4 py-3 outline-none"
                  style={{ border: `1px solid ${palette.border}`, background: "#fff", color: palette.text }}
                  placeholder="مثال: ahmed"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-xs font-black mb-2" style={{ color: palette.muted }}>
                  كلمة المرور
                </label>
                <input
                  type="password"
                  className="w-full rounded-2xl px-4 py-3 outline-none"
                  style={{ border: `1px solid ${palette.border}`, background: "#fff", color: palette.text }}
                  placeholder="••••••••"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl py-3 font-black text-sm"
                style={{
                  background: `linear-gradient(135deg, ${palette.primary}, ${palette.primary2})`,
                  color: "white",
                  boxShadow: "0 16px 28px rgba(37,99,235,0.18)",
                }}
              >
                دخول الإدارة
              </button>

              <div className="text-[11px] font-bold text-center" style={{ color: palette.muted }}>
                حسابات الإدارة الحالية: <span className="font-black">ahmed</span>,{" "}
                <span className="font-black">samar</span>, <span className="font-black">admin</span>
              </div>
            </form>
          ) : (
            <form onSubmit={handleClientLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-black mb-2" style={{ color: palette.muted }}>
                  رقم الهوية الإماراتية
                </label>
                <input
                  type="text"
                  className="w-full rounded-2xl px-4 py-3 outline-none font-mono"
                  style={{ border: `1px solid ${palette.border}`, background: "#fff", color: palette.text }}
                  placeholder="784xxxxxxxxxxxxxxx"
                  value={clientIdInput}
                  onChange={(e) => setClientIdInput(e.target.value)}
                  inputMode="numeric"
                />
              </div>

              <div>
                <label className="block text-xs font-black mb-2" style={{ color: palette.muted }}>
                  كلمة المرور
                </label>
                <input
                  type="password"
                  className="w-full rounded-2xl px-4 py-3 outline-none"
                  style={{ border: `1px solid ${palette.border}`, background: "#fff", color: palette.text }}
                  placeholder="••••••"
                  value={clientPassInput}
                  onChange={(e) => setClientPassInput(e.target.value)}
                />
                <div className="mt-2 text-[11px] font-bold" style={{ color: palette.muted }}>
                  افتراضيًا: <span className="font-black">{DEFAULT_CLIENT_PASSWORD}</span> (سنخصص لكل موكل لاحقًا).
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl py-3 font-black text-sm"
                style={{
                  background: `linear-gradient(135deg, ${palette.success}, ${palette.success2})`,
                  color: "#064e3b",
                  boxShadow: "0 16px 28px rgba(34,197,94,0.14)",
                }}
              >
                دخول الموكل
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 pb-6 text-center">
          <div style={{ height: 1, background: palette.border }} className="mb-4" />
          <p className="text-[10px] font-black" style={{ color: palette.muted }}>
            © {new Date().getFullYear()} Helm Smart — Legal Office Manager
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;