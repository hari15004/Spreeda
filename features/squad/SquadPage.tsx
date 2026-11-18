"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { calculateFairScore } from "@/features/squad/lib/fair-score";
import type { LearningAssessment } from "@/features/squad/lib/fair-score";
import styles from "./squad.module.css";

type Squad = { id: string; name: string; invite_code: string; owner_id: string };
type Row = {
  id: string;
  name: string;
  lang: string;
  streak: number;
  score: number | null;
  day: number;
  me: boolean;
};

const LANGS = ["japanese", "english", "french", "german", "italian", "spanish", "korean", "chinese"];
const LANGUAGE_LABELS: Record<string, string> = {
  japanese: "Japanese",
  english: "English",
  french: "French",
  german: "German",
  italian: "Italian",
  spanish: "Spanish",
  korean: "Korean",
  chinese: "Chinese",
};

function todayIST() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

function yesterdayIST() {
  const d = new Date(todayIST() + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

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

  useEffect(() => {
    const theme = window.localStorage.getItem("spreeda-theme") === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, []);

  const fetchSquads = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      return {
        authed: false,
        userId: null,
        language: "japanese",
        squads: [] as Squad[],
      };
    }

    const { data: myProf } = await supabase
      .from("profiles")
      .select("learning_language")
      .eq("id", auth.user.id)
      .single();

    const { data: mem } = await supabase
      .from("squad_members")
      .select("squad_id")
      .eq("user_id", auth.user.id);
    const ids = (mem ?? []).map((m: { squad_id: string }) => m.squad_id);
    if (ids.length === 0) {
      return {
        authed: true,
        userId: auth.user.id,
        language: myProf?.learning_language ?? "japanese",
        squads: [] as Squad[],
      };
    }

    const { data: sq } = await supabase
      .from("squads")
      .select("id, name, invite_code, owner_id")
      .in("id", ids);
    const list = (sq ?? []) as Squad[];
    return {
      authed: true,
      userId: auth.user.id,
      language: myProf?.learning_language ?? "japanese",
      squads: list,
    };
  }, [supabase]);

  const loadSquads = useCallback(async () => {
    const snapshot = await fetchSquads();
    setAuthed(snapshot.authed);
    setMe(snapshot.userId);
    setMyLang(snapshot.language);
    setSquads(snapshot.squads);
    setActive((current) =>
      snapshot.squads.find((squad) => squad.id === current?.id) ??
      snapshot.squads[0] ??
      null,
    );
    if (snapshot.squads.length === 0) {
      setRows([]);
    }
  }, [fetchSquads]);

  useEffect(() => {
    let cancelled = false;
    async function initialize() {
      const snapshot = await fetchSquads();
      if (cancelled) return;
      setAuthed(snapshot.authed);
      setMe(snapshot.userId);
      setMyLang(snapshot.language);
      setSquads(snapshot.squads);
      setActive((current) =>
        snapshot.squads.find((squad) => squad.id === current?.id) ??
        snapshot.squads[0] ??
        null,
      );
      if (snapshot.squads.length === 0) {
        setRows([]);
      }
    }
    void initialize();
    return () => {
      cancelled = true;
    };
  }, [fetchSquads]);

  useEffect(() => {
    if (!active) return;
    (async () => {
      const { data: mem } = await supabase
        .from("squad_members")
        .select("user_id")
        .eq("squad_id", active.id);
      const ids = (mem ?? []).map((m: { user_id: string }) => m.user_id);

      const [{ data: prof }, { data: st }, { data: assessments, error: assessmentError }] = await Promise.all([
        supabase.from("profiles").select("id, display_name, learning_language").in("id", ids),
        supabase
          .from("streaks")
          .select("user_id, language, current_streak, last_active_day, unlocked_day")
          .in("user_id", ids),
        supabase
          .from("learning_assessments")
          .select("user_id, language, skill, is_correct, is_review, studied_on, created_at")
          .in("user_id", ids)
          .gte("created_at", new Date(Date.now() - 14 * 86_400_000).toISOString()),
      ]);
      if (assessmentError) {
        console.warn("Squad learning scores:", assessmentError.message);
      }

      const y = yesterdayIST();
      const out: Row[] = ids.map((id: string) => {
        const p = (prof ?? []).find((x) => x.id === id);
        const lang = p?.learning_language ?? "japanese";
        const s = (st ?? []).find((x) => x.user_id === id && x.language === lang);
        const memberAssessments = ((assessments ?? []) as Array<{
          user_id: string;
          language: string;
          skill: LearningAssessment["skill"];
          is_correct: boolean;
          is_review: boolean;
          studied_on: string;
        }>)
          .filter((event) => event.user_id === id && event.language === lang)
          .map((event) => ({
            skill: event.skill,
            correct: event.is_correct,
            isReview: event.is_review,
            studiedOn: event.studied_on,
          }));
        const score = calculateFairScore(memberAssessments);
        const alive = !!s && !!s.last_active_day && s.last_active_day >= y;
        return {
          id,
          name: p?.display_name ?? "Learner",
          lang,
          streak: alive ? s.current_streak : 0,
          score: score.score,
          day: s?.unlocked_day ?? 1,
          me: id === me,
        };
      });
      out.sort(
        (a, b) =>
          (b.score ?? -1) - (a.score ?? -1) ||
          b.streak - a.streak,
      );
      setRows(out);
    })();
  }, [active, me, myLang, supabase]);

  async function changeLang(l: string) {
    if (!me) return;
    setMsg("");
    const { error } = await supabase.from("profiles").update({ learning_language: l }).eq("id", me);
    if (error) {
      setMsg("Could not update your language. Please try again.");
      return;
    }
    setMyLang(l);
  }

  async function createSquad(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!name.trim()) {
      setMsg("Enter a squad name.");
      return;
    }
    const { error } = await supabase.rpc("create_squad", { p_name: name.trim() });
    if (error) {
      setMsg("Could not create the squad. Please try again.");
      return;
    }
    setName("");
    await loadSquads();
  }

  async function joinSquad(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!code.trim()) {
      setMsg("Enter an invite code.");
      return;
    }
    const { error } = await supabase.rpc("join_squad", { p_code: code });
    if (error) {
      setMsg(error.message.includes("full") ? "This squad is full (maximum 6 members)." : "That invite code is not valid.");
      return;
    }
    setCode("");
    await loadSquads();
  }

  async function deleteSquad() {
    if (!active) return;
    if (!window.confirm(`Delete "${active.name}"? This cannot be undone.`)) return;
    setMsg("");
    const { data, error } = await supabase
      .from("squads")
      .delete()
      .eq("id", active.id)
      .select("id");
    if (error || !data || data.length === 0) {
      setMsg("Could not delete the squad.");
      return;
    }
    await loadSquads();
  }

  async function leaveSquad() {
    if (!active || !me) return;
    if (!window.confirm(`Leave "${active.name}"?`)) return;
    setMsg("");
    const { data, error } = await supabase
      .from("squad_members")
      .delete()
      .eq("squad_id", active.id)
      .eq("user_id", me)
      .select("user_id");
    if (error || !data || data.length === 0) {
      setMsg("Could not leave the squad. Please try again.");
      return;
    }
    setActive(null);
    await loadSquads();
  }

  const scoredRows = rows.filter((row) => row.score !== null);
  const averageScore = scoredRows.length
    ? Math.round(scoredRows.reduce((total, row) => total + (row.score ?? 0), 0) / scoredRows.length)
    : null;
  const activeLearners = rows.filter((row) => row.streak > 0).length;

  if (authed === null) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingCard} role="status">Loading squad…</div>
      </main>
    );
  }

  if (!authed) {
    return (
      <main className={styles.page}>
        <div className={styles.gateCard}>
          <h1>Squad</h1>
          <p>Sign in to learn with friends.</p>
          <Link className={styles.primaryButton} href="/login">Sign in</Link>
          <Link className={styles.backLink} href="/">Back to learning</Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.frame}>
        <header className={styles.topbar}>
          <Link className={styles.backLink} href="/">← Home</Link>
          <Link className={styles.wordmark} href="/" aria-label="Spreeda home">
            <span className={styles.wordmarkIcon} aria-hidden="true">S</span> Spreeda
          </Link>
        </header>

        <section className={styles.pageHeading}>
          <div>
            <h1>Squad</h1>
            <p>Learn together. Stay consistent.</p>
          </div>
          <span className={styles.memberLimit}>Up to 6 members</span>
        </section>

        {msg && <p className={styles.message} role="alert">{msg}</p>}

        {squads.length > 1 && (
          <nav className={styles.squadSwitcher} aria-label="Your squads">
            {squads.map((squad) => (
              <button
                key={squad.id}
                type="button"
                className={`${styles.switcherButton} ${active?.id === squad.id ? styles.switcherActive : ""}`}
                aria-pressed={active?.id === squad.id}
                onClick={() => setActive(squad)}
              >
                {squad.name}
              </button>
            ))}
          </nav>
        )}

        {active ? (
          <div className={styles.contentGrid}>
            <div className={styles.mainColumn}>
              <section className={styles.squadPanel} aria-labelledby="active-squad-name">
                <div className={styles.squadHeading}>
                  <div className={styles.titleLine}>
                    <h2 id="active-squad-name">{active.name}</h2>
                    {active.owner_id === me && <span className={styles.adminBadge}>Owner</span>}
                  </div>
                  {active.owner_id === me ? (
                    <button className={styles.quietDangerButton} type="button" onClick={deleteSquad}>Delete</button>
                  ) : (
                    <button className={styles.quietButton} type="button" onClick={leaveSquad}>Leave</button>
                  )}
                </div>

                <div className={styles.inviteCard}>
                  <div className={styles.inviteCode}>
                    <span>INVITE CODE</span>
                    <strong>{active.invite_code}</strong>
                  </div>
                  <span className={styles.seatCount}>{rows.length} / 6 members</span>
                </div>

                <div className={styles.statsGrid}>
                  <div className={styles.statCard}><span>Members</span><strong>{rows.length}<small> / 6</small></strong></div>
                  <div className={styles.statCard}><span>Average score</span><strong>{averageScore ?? "—"}<small>{averageScore === null ? "" : " / 100"}</small></strong></div>
                  <div className={styles.statCard}><span>Active streaks</span><strong>{activeLearners}<small> / {rows.length}</small></strong></div>
                </div>

                <section className={styles.leaderboardCard} aria-labelledby="leaderboard-title">
                  <div className={styles.cardHeading}>
                    <h3 id="leaderboard-title">Leaderboard</h3>
                    <span>Last 14 days</span>
                  </div>
                  {rows.length ? (
                    <ol className={styles.leaderboard}>
                      {rows.map((row, index) => (
                        <li className={`${styles.learnerRow} ${row.me ? styles.learnerMe : ""}`} key={row.id}>
                          <span className={styles.rankNumber}>{index + 1}</span>
                          <span className={styles.learnerAvatar} aria-hidden="true">{row.name.trim().slice(0, 1).toUpperCase() || "?"}</span>
                          <div className={styles.learnerDetails}>
                            <strong>{row.name}{row.me && <span className={styles.youBadge}>You</span>}</strong>
                            <span className={styles.learnerMeta}>{LANGUAGE_LABELS[row.lang] ?? row.lang} · Day {row.day}</span>
                            <span className={styles.scoreTrack} aria-label={row.score === null ? "Score building" : `${row.score} of 100`}>
                              <span style={{ width: `${Math.max(0, Math.min(100, row.score ?? 0))}%` }} />
                            </span>
                          </div>
                          <strong className={styles.learnerScore}>{row.score ?? "—"}<small>{row.score === null ? "Building" : "pts"}</small></strong>
                          <span className={styles.streakPill} aria-label={`${row.streak} day streak`}>🔥 {row.streak}</span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className={styles.emptyLeaderboard}>Your squad is getting ready.</p>
                  )}
                  <details className={styles.scoreDetails}>
                    <summary>How scoring works</summary>
                    <p>Consistency, review retention, improvement, and skill accuracy count—not raw lesson totals.</p>
                  </details>
                </section>
              </section>
            </div>

            <aside className={styles.sideColumn}>
              <section className={styles.languageCard}>
                <label className={styles.inputLabel} htmlFor="learning-language">Learning language</label>
                <select id="learning-language" className={styles.selectInput} value={myLang} onChange={(event) => changeLang(event.target.value)}>
                  {LANGS.map((language) => (
                    <option key={language} value={language}>{LANGUAGE_LABELS[language] ?? language}</option>
                  ))}
                </select>
                <p>Different languages. Fair competition.</p>
              </section>
            </aside>
          </div>
        ) : (
          <section className={styles.emptyState}>
            <h2>No squad yet</h2>
            <p>Create one or join with an invite code.</p>
          </section>
        )}

        <section className={styles.joinSection} aria-labelledby="join-section-title">
          <h2 id="join-section-title">{active ? "Manage squads" : "Get started"}</h2>
          <div className={styles.formGrid}>
            <form className={styles.actionCard} onSubmit={createSquad}>
              <h3>Create a squad</h3>
              <label className={styles.inputLabel} htmlFor="squad-name">Squad name</label>
              <div className={styles.inputRow}>
                <input id="squad-name" className={styles.textInput} maxLength={32} placeholder="e.g. Morning explorers" value={name} onChange={(event) => setName(event.target.value)} />
                <button className={styles.primaryButton} type="submit">Create</button>
              </div>
            </form>

            <form className={styles.actionCard} onSubmit={joinSquad}>
              <h3>Join a squad</h3>
              <label className={styles.inputLabel} htmlFor="squad-code">Invite code</label>
              <div className={styles.inputRow}>
                <input id="squad-code" className={styles.textInput} autoCapitalize="characters" placeholder="Enter code" value={code} onChange={(event) => setCode(event.target.value)} />
                <button className={styles.secondaryButton} type="submit">Join</button>
              </div>
            </form>
          </div>
        </section>

      </div>
    </main>
  );
}