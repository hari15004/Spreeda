"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (password.length < 8) {
      setMsg("पासवर्ड कम से कम 8 अक्षर का रखो।");
      return;
    }

    setBusy(true);
    const supabase = createClient();

    const { error } =
      mode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            options: { data: { display_name: name.trim() || undefined } },
          })
        : await supabase.auth.signInWithPassword({ email, password });

    setBusy(false);

    if (error) {
      setMsg(
        mode === "signup"
          ? "साइन अप नहीं हो पाया। ईमेल चेक करो या दोबारा कोशिश करो।"
          : "ईमेल या पासवर्ड गलत है।"
      );
      return;
    }

    router.push("/");
    router.refresh();
  }

  const box: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    marginBottom: 12,
    borderRadius: 10,
    border: "1px solid #3a3a4a",
    background: "#15151f",
    color: "#fff",
    fontSize: 16,
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#0c0c14",
        padding: 16,
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: "100%",
          maxWidth: 380,
          padding: 28,
          borderRadius: 16,
          background: "#1b1b28",
          color: "#fff",
        }}
      >
        <h1 style={{ fontSize: 26, marginBottom: 4 }}>Spreeda</h1>
        <p style={{ opacity: 0.7, marginBottom: 20 }}>
          {mode === "login" ? "Wapas aao, streak mat todna." : "Naya account banao."}
        </p>

        {mode === "signup" && (
          <input
            style={box}
            placeholder="Naam"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <input
          style={box}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          style={box}
          type="password"
          placeholder="Password (min 8)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {msg && <p style={{ color: "#ff8a8a", marginBottom: 12 }}>{msg}</p>}

        <button
          type="submit"
          disabled={busy}
          style={{
            width: "100%",
            padding: 13,
            borderRadius: 10,
            border: "none",
            background: "#ff5a36",
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {busy ? "..." : mode === "login" ? "Login" : "Sign up"}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setMsg("");
          }}
          style={{
            width: "100%",
            marginTop: 14,
            background: "none",
            border: "none",
            color: "#aaa",
            cursor: "pointer",
          }}
        >
          {mode === "login" ? "Account nahi hai? Sign up" : "Account hai? Login"}
        </button>
      </form>
    </main>
  );
}