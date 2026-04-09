"use client";

import { useState, useEffect } from "react";

interface PersonaPolicy {
  name: string;
  style: string;
}

interface Policy {
  personas: Record<string, PersonaPolicy>;
  rules: string;
}

const PERSONA_LABELS: Record<string, string> = {
  frustrated_tech: "Frustrated Tech User",
  confused_elderly: "Confused Elderly Person",
  impatient_business: "Impatient Business Owner",
  anxious_buyer: "Anxious First-Time Buyer",
  angry_billing: "Angry Billing Complaint",
};

export default function AdminPage() {
  const [status, setStatus] = useState<"loading" | "login" | "editor">("loading");
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/policy")
      .then((r) => {
        if (r.status === 401) { setStatus("login"); return null; }
        return r.json();
      })
      .then((data) => {
        if (data) { setPolicy(data); setStatus("editor"); }
      })
      .catch(() => setStatus("login"));
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      const policyRes = await fetch("/api/admin/policy");
      const data = await policyRes.json();
      setPolicy(data);
      setStatus("editor");
    } else {
      setLoginError("Invalid password.");
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setPolicy(null);
    setStatus("login");
    setPassword("");
  }

  async function handleSave() {
    if (!policy) return;
    setSaving(true);
    setSaveMsg("");
    const res = await fetch("/api/admin/policy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(policy),
    });
    setSaving(false);
    setSaveMsg(res.ok ? "Saved!" : "Save failed.");
    setTimeout(() => setSaveMsg(""), 3000);
  }

  function updatePersonaStyle(key: string, style: string) {
    setPolicy((p) =>
      p ? { ...p, personas: { ...p.personas, [key]: { ...p.personas[key], style } } } : p
    );
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-arcade-dark flex items-center justify-center">
        <span className="font-arcade text-arcade-dim text-sm">Loading...</span>
      </div>
    );
  }

  if (status === "login") {
    return (
      <div className="min-h-screen bg-arcade-dark flex items-center justify-center p-4">
        <div className="bg-arcade-card border border-arcade-border rounded-xl p-8 w-full max-w-sm">
          <h1 className="font-arcade text-arcade-pink text-sm mb-2 text-center">Admin</h1>
          <p className="font-body text-arcade-dim text-xs text-center mb-6">
            Chat Policy Editor
          </p>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className="bg-arcade-dark border border-arcade-border rounded-lg px-4 py-3 font-body text-arcade-text text-sm focus:outline-none focus:border-arcade-pink"
            />
            {loginError && (
              <p className="font-body text-red-400 text-xs">{loginError}</p>
            )}
            <button
              type="submit"
              className="bg-arcade-pink text-white font-arcade text-xs py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-arcade-dark p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-arcade text-arcade-pink text-sm">Chat Policy Editor</h1>
            <p className="font-body text-arcade-dim text-xs mt-1">
              Changes apply to new chats immediately after saving.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="font-body text-xs text-arcade-dim hover:text-arcade-text transition-colors border border-arcade-border px-3 py-1.5 rounded-lg"
          >
            Logout
          </button>
        </div>

        {policy && (
          <div className="flex flex-col gap-6">
            <section>
              <h2 className="font-arcade text-[10px] text-arcade-dim mb-4 uppercase tracking-widest">
                Persona Styles
              </h2>
              <div className="flex flex-col gap-4">
                {Object.entries(policy.personas).map(([key, persona]) => (
                  <div
                    key={key}
                    className="bg-arcade-card border border-arcade-border rounded-xl p-5"
                  >
                    <label className="block font-body text-xs text-arcade-text mb-2 font-semibold">
                      {PERSONA_LABELS[key] ?? key}
                    </label>
                    <textarea
                      value={persona.style}
                      onChange={(e) => updatePersonaStyle(key, e.target.value)}
                      rows={3}
                      className="w-full bg-arcade-dark border border-arcade-border rounded-lg px-4 py-3 font-body text-arcade-text text-sm focus:outline-none focus:border-arcade-pink resize-y"
                    />
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-arcade text-[10px] text-arcade-dim mb-4 uppercase tracking-widest">
                Shared Rules
              </h2>
              <div className="bg-arcade-card border border-arcade-border rounded-xl p-5">
                <p className="font-body text-xs text-arcade-dim mb-3">
                  Applied to every persona. One rule per line.
                </p>
                <textarea
                  value={policy.rules}
                  onChange={(e) =>
                    setPolicy((p) => (p ? { ...p, rules: e.target.value } : p))
                  }
                  rows={10}
                  className="w-full bg-arcade-dark border border-arcade-border rounded-lg px-4 py-3 font-body text-arcade-text text-sm focus:outline-none focus:border-arcade-pink resize-y font-mono"
                />
              </div>
            </section>

            <div className="flex items-center gap-4 pb-8">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-arcade-pink text-white font-arcade text-xs py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Policy"}
              </button>
              {saveMsg && (
                <span
                  className={`font-body text-sm ${
                    saveMsg === "Saved!" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {saveMsg}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
