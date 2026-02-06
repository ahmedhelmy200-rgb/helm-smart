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

// ✅ Admin accounts (Local-first; later we can move to Settings/config)
const ADMIN_ACCOUNTS: AdminAccount[] = [
  {
    username: "ahmed",
    password: "1",
    name: "المستشار/ أحمد حلمي",
    title: "المدير العام",
    id: "owner",
  },
  {
    username: "samar",
    password: "2",
    name: "أ/ سمر العبد",
    title: "مساعدة المدير",
    id: "assistant_manager",
  },
  {
    username: "admin",
    password: "123456",
    name: "مسؤول إداري",
    title: "إدارة المكتب",
    id: "admin",
  },
];

const normalizeEmiratesId = (s: string) =>
  (s || "").trim().replace(/\s+/g, "").replace(/[^0-9]/g, ""); // keep digits only

const Login: React.FC<LoginProps> = ({ onLogin, clients, config }) => {
  const [loginMode, setLoginMode] = useState<"ADMIN" | "CLIENT">("ADMIN");

  // Admin
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPass, setAdminPass] = useState("");

  // Client
  const [clientIdInput, setClientIdInput] = useState("");
  const [clientPassInput, setClientPassInput] = useState("");

  const [error, setError] = useState("");

  const palette = useMemo(() => {
    // Light calm palette (override old navy/gold defaults)
    return {
      bg: "#f6f7fb",
      card: "#ffffff",
      text: "#0f172a",
      muted: "#64748b",
      border: "#e2e8f0",
      primary: "#2563eb", // calm blue
      primary2: "#60a5fa",
      accent: "#22c55e", // green hint for success
    };
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const u = adminUsername.trim().toLowerCase();
    const p = adminPass;

    const hit = ADMIN_ACCOUNTS.find(
      (a) => a.username === u && a.password === p
    );

    if (!hit) {
      setError("بيانات دخول الإدارة غير صحيحة (اسم المستخدم أو كلمة المرور).");
      return;
    }

    onLogin(UserRole.ADMIN, {
      name: hit.name,
      id: hit.id,
      title: hit.title,
    });
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

    const client = clients.find(
      (c) => normalizeEmiratesId(c.emiratesId || "") === idDigits
    );

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
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: `radial-gradient(1200px 600px at 20% 10%, rgba(37,99,235,0.10), transparent 60%),
                     radial-gradient(900px 500px at 80% 20%, rgba(34,197,94,0.08), transparent 55%),
                     ${palette.bg}`,
      }}
    >
      <div
        className="w-full max-w-lg rounded-[28px] shadow-2xl overflow-hidden"
        style={{ background: palette.card, border: `1px solid ${palette.border}` }}
      >
        {/* Header */}
        <div className="p-8 pb-6 text-center">
          <div
            className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: `linear-gradient(135deg, ${palette.primary}, ${palette.primary2})`,
              boxShadow: "0 20px 40px rgba(37,99,235,0.18)",
            }}
          >
            {config?.logo ? (
              <img
                src={config.logo}
                className="w-full h-full object-contain p-2"
                alt="Logo"
              />
            ) : (
              <ICONS.Logo className="w-10 h-10 text-white" />
            )}
          </div>

          <h1 className="text-2xl font-black" style={{ color: palette.text }}>
            {config?.officeName || "مكتب المستشار أحمد حلمي"}
          </h1>
          <p className="text-sm font-bold mt-2" style={{ color: palette.muted }}>
            {config?.officeSlogan || "بوابة الخدمات القانونية الرقمية"}
          </p>
        </div>

        {/* Tabs */}
        <div className="px-8">
          <div
            className="grid grid-cols-2 p-1 rounded-2xl"
            style={{ background: "#f1f5f9", border: `1px solid ${palette.border}` }}
          >
            <button
              onClick={() => {
                setLoginMode("ADMIN");
                setError("");
              }}
              className="py-3 rounded-xl font-black text-sm transition-all"
              style={{
                background: loginMode === "ADMIN" ? palette.card : "transparent",
                color: loginMode === "ADMIN" ? palette.text : palette.muted,
                boxShadow: loginMode === "ADMIN" ? "0 10px 20px rgba(2,6,23,0.08)" : "none",
              }}
            >
              الإدارة
            </button>
            <button
              onClick={() => {
                setLoginMode("CLIENT");
                setError("");
              }}
              className="py-3 rounded-xl font-black text-sm transition-all"
              style={{
                background: loginMode === "CLIENT" ? palette.card : "transparent",
                color: loginMode === "CLIENT" ? palette.text : palette.muted,
                boxShadow: loginMode === "CLIENT" ? "0 10px 20px rgba(2,6,23,0.08)" : "none",
              }}
            >
              بوابة الموكلين
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="px-8 pt-5">
            <div
              className="text-xs font-black p-4 rounded-xl text-center"
              style={{
                background: "rgba(239,68,68,0.10)",
                color: "#b91c1c",
                border: "1px solid rgba(239,68,68,0.25)",
              }}
            >
              {error}
            </div>
          </div>
        )}

        {/* Forms */}
        <div className="p-8 pt-6">
          {loginMode === "ADMIN" ? (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-black mb-2" style={{ color: palette.muted }}>
                  اسم المستخدم
                </label>
                <input
                  type="text"
                  className="w-full rounded-2xl px-4 py-3 outline-none"
                  style={{
                    border: `1px solid ${palette.border}`,
                    background: "#fff",
                    color: palette.text,
                  }}
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
                  style={{
                    border: `1px solid ${palette.border}`,
                    background: "#fff",
                    color: palette.text,
                  }}
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
                  boxShadow: "0 18px 32px rgba(37,99,235,0.20)",
                }}
              >
                دخول الإدارة
              </button>

              <div className="text-[11px] font-bold text-center" style={{ color: palette.muted }}>
                تلميح: حسابات الإدارة الحالية: <span className="font-black">ahmed</span>,{" "}
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
                  style={{
                    border: `1px solid ${palette.border}`,
                    background: "#fff",
                    color: palette.text,
                  }}
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
                  style={{
                    border: `1px solid ${palette.border}`,
                    background: "#fff",
                    color: palette.text,
                  }}
                  placeholder="••••••"
                  value={clientPassInput}
                  onChange={(e) => setClientPassInput(e.target.value)}
                />
                <div className="mt-2 text-[11px] font-bold" style={{ color: palette.muted }}>
                  افتراضيًا: كلمة المرور = <span className="font-black">{DEFAULT_CLIENT_PASSWORD}</span> (سيتم تخصيصها لكل موكل لاحقًا).
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl py-3 font-black text-sm"
                style={{
                  background: `linear-gradient(135deg, ${palette.accent}, #86efac)`,
                  color: "#064e3b",
                  boxShadow: "0 18px 32px rgba(34,197,94,0.18)",
                }}
              >
                دخول الموكل
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-7 text-center">
          <div style={{ height: 1, background: palette.border }} className="mb-5" />
          <p className="text-[10px] font-black" style={{ color: palette.muted }}>
            © {new Date().getFullYear()} Helm Smart — Legal Office Manager
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;