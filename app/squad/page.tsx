"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Squad = { id: string; name: string; invite_code: string; owner_id: string };
type Row = { id: string; name: string; lang: string; streak: number; xp: number; day: number; me: boolean; lastDay: string | null; restoreNeed: number; restoreDone: number; lost: number };

const LANGS = ["japanese", "spanish", "french", "german", "english", "korean", "chinese"];

function todayIST() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

function yesterdayIST() {
  const d = new Date(todayIST() + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

import StreakBars from "./StreakBars";

export default function SquadPage() {
  const [supabase] = useState(() => createClient());
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [me, setMe] = useState<string | null>(null);
  const [myLang, setMyLang] = useState("japanese");
  const [squads, setSquads] = useState<Squad[]>([]);
  const [active, setActive] = useState<Squad | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const loadSquads = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setAuthed(false);
      return;
    }
    setAuthed(true);
    setMe(auth.user.id);

    const { data: myProf } = await supabase
      .from("profiles")
      .select("learning_language")
      .eq("id", auth.user.id)
      .single();
    if (myProf) setMyLang(myProf.learning_language);

    const { data: mem } = await supabase
      .from("squad_members")
      .select("squad_id")
      .eq("user_id", auth.user.id);
    const ids = (mem ?? []).map((m: { squad_id: string }) => m.squad_id);
    if (ids.length === 0) {
      setSquads([]);
      setActive(null);
      setRows([]);
      return;
    }

    const { data: sq } = await supabase
      .from("squads")
      .select("id, name, invite_code, owner_id")
      .in("id", ids);
    const list = (sq ?? []) as Squad[];
    setSquads(list);
    setActive((cur) => list.find((s) => s.id === cur?.id) ?? list[0] ?? null);
  }, [supabase]);

  useEffect(() => {
    loadSquads();
  }, [loadSquads]);

  useEffect(() => {
    if (!active) return;
    (async () => {
      const { data: mem } = await supabase
        .from("squad_members")
        .select("user_id")
        .eq("squad_id", active.id);
      const ids = (mem ?? []).map((m: { user_id: string }) => m.user_id);

      const [{ data: prof }, { data: st }] = await Promise.all([
        supabase.from("profiles").select("id, display_name, learning_language").in("id", ids),
        supabase
          .from("streaks")
          .select("user_id, language, current_streak, last_active_day, total_xp, unlocked_day, restore_need, restore_done, lost_streak")
          .in("user_id", ids),
      ]);

      const y = yesterdayIST();
      const out: Row[] = ids.map((id: string) => {
        const p = (prof ?? []).find((x) => x.id === id);
        const lang = p?.learning_language ?? "japanese";
        const s = (st ?? []).find((x) => x.user_id === id && x.language === lang);
        const alive = !!s && !!s.last_active_day && s.last_active_day >= y;
        return {
          id,
          name: p?.display_name ?? "Learner",
          lang,
          streak: alive ? s.current_streak : 0,
          xp: s?.total_xp ?? 0,
          day: s?.unlocked_day ?? 1,
          me: id === me,
          lastDay: s?.last_active_day ?? null,
          restoreNeed: s?.restore_need ?? 0,
          restoreDone: s?.restore_done ?? 0,
          lost: s?.lost_streak ?? 0,
        };
      });
      out.sort((a, b) => b.streak - a.streak || b.xp - a.xp);
      setRows(out);
    })();
  }, [active, myLang, supabase]);

  async function changeLang(l: string) {
    if (!me) return;
    setMsg("");
    const { error } = await supabase.from("profiles").update({ learning_language: l }).eq("id", me);
    if (error) {
      setMsg("Language badal nahi paayi, dobara try karo.");
      return;
    }
    setMyLang(l);
  }

  async function createSquad(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!name.trim()) {
      setMsg("Squad ka naam daalo.");
      return;
    }
    const { error } = await supabase.rpc("create_squad", { p_name: name.trim() });
    if (error) {
      setMsg("Squad nahi ban paya, dobara try karo.");
      return;
    }
    setName("");
    await loadSquads();
  }

  async function joinSquad(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!code.trim()) {
      setMsg("Invite code daalo.");
      return;
    }
    const { error } = await supabase.rpc("join_squad", { p_code: code });
    if (error) {
      setMsg(error.message.includes("full") ? "Squad full hai (max 6)." : "Code galat hai.");
      return;
    }
    setCode("");
    await loadSquads();
  }

  async function deleteSquad() {
    if (!active) return;
    if (!window.confirm(`"${active.name}" squad delete karna hai? Ye wapas nahi aayega.`)) return;
    setMsg("");
    const { data, error } = await supabase
      .from("squads")
      .delete()
      .eq("id", active.id)
      .select("id");
    if (error || !data || data.length === 0) {
      setMsg("Squad delete nahi ho paaya.");
      return;
    }
    await loadSquads();
  }

  async function leaveSquad() {
    if (!active || !me) return;
    if (!window.confirm(`"${active.name}" squad chhodna hai?`)) return;
    setMsg("");
    const { data, error } = await supabase
      .from("squad_members")
      .delete()
      .eq("squad_id", active.id)
      .eq("user_id", me)
      .select("user_id");
    if (error || !data || data.length === 0) {
      setMsg("Squad chhod nahi paaye, dobara try karo.");
      return;
    }
    setActive(null);
    await loadSquads();
  }

  const box: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #3a3a4a",
    background: "#15151f",
    color: "#fff",
    fontSize: 16,
  };
  const btn: React.CSSProperties = {
    padding: "10px 16px",
    borderRadius: 10,
    border: "none",
    background: "#ff5a36",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  };
  const card: React.CSSProperties = {
    background: "#1b1b28",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  };

  if (authed === null) {
    return <main style={{ padding: 24, color: "#fff", background: "#0c0c14", minHeight: "100vh" }}>Loading...</main>;
  }

  if (!authed) {
    return (
      <main style={{ padding: 24, color: "#fff", background: "#0c0c14", minHeight: "100vh" }}>
        <p>Pehle login karo.</p>
        <Link href="/login" style={{ color: "#ff5a36" }}>Login page</Link>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0c0c14", color: "#fff", padding: 16 }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#aaa" }}>← Dashboard</Link>
        <h1 style={{ fontSize: 26, margin: "12px 0 16px" }}>Squad</h1>

        <div style={{ ...card, display: "grid", gap: 10 }}>
          <b>Main seekh raha hoon</b>
          <select style={box} value={myLang} onChange={(e) => changeLang(e.target.value)}>
            {LANGS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {squads.length > 1 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {squads.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s)}
                style={{ ...btn, background: active?.id === s.id ? "#ff5a36" : "#2a2a3a" }}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}

        {active && (
          <div style={card}>
            <h2 style={{ fontSize: 20 }}>
              {active.name}
              {active.owner_id === me && (
                <span style={{ fontSize: 12, marginLeft: 8, opacity: 0.7 }}>👑 Admin</span>
              )}
            </h2>
            <p style={{ opacity: 0.7, margin: "4px 0 14px" }}>
              Invite code: <b>{active.invite_code}</b> ({rows.length}/6)
            </p>
            {active.owner_id === me ? (
              <button onClick={deleteSquad} style={{ ...btn, background: "#8b2d2d", marginBottom: 14 }}>
                Squad delete karo
              </button>
            ) : (
              <button onClick={leaveSquad} style={{ ...btn, background: "#2a2a3a", marginBottom: 14 }}>
                Squad chhodo
              </button>
            )}
            <StreakBars rows={rows} meId={me} />
            {rows.map((r, i) => (
              <div
                key={r.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                  padding: "10px 0",
                  borderTop: "1px solid #2a2a3a",
                }}
              >
                <span>{i + 1}. {r.name} <span style={{ opacity: 0.6 }}>({r.lang})</span></span>
                <span>🔥 {r.streak} · {r.xp} XP · Day {r.day}</span>
              </div>
            ))}
          </div>
        )}

        {msg && <p style={{ color: "#ff8a8a", marginBottom: 12 }}>{msg}</p>}

        <form onSubmit={createSquad} style={{ ...card, display: "grid", gap: 10 }}>
          <b>Naya squad banao</b>
          <input style={box} placeholder="Squad ka naam" value={name} onChange={(e) => setName(e.target.value)} />
          <button type="submit" style={btn}>Create</button>
        </form>

        <form onSubmit={joinSquad} style={{ ...card, display: "grid", gap: 10 }}>
          <b>Dost ke code se join karo</b>
          <input style={box} placeholder="Invite code" value={code} onChange={(e) => setCode(e.target.value)} />
          <button type="submit" style={btn}>Join</button>
        </form>
      </div>
    </main>
  );
}