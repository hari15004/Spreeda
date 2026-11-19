"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./login.module.css";

type MessageKind = "error" | "success";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [messageKind, setMessageKind] = useState<MessageKind>("error");
  const [busy, setBusy] = useState(false);

  async function googleLogin() {
    setMsg("");
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) {
      setBusy(false);
      setMessageKind("error");
      setMsg("Google login शुरू नहीं हो पाया। दोबारा कोशिश करो।");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (password.length < 8) {
      setMessageKind("error");
      setMsg("पासवर्ड कम से कम 8 अक्षर का रखो।");
      return;
    }

    setBusy(true);
    const supabase = createClient();

    const { data, error } =
      mode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            options: { data: { display_name: name.trim() || undefined } },
          })
        : await supabase.auth.signInWithPassword({ email, password });

    setBusy(false);

    if (error) {
      setMessageKind("error");
      setMsg(
        mode === "signup"
          ? "साइन अप नहीं हो पाया। ईमेल चेक करो या दोबारा कोशिश करो।"
          : "ईमेल या पासवर्ड गलत है।"
      );
      return;
    }

    if (mode === "signup" && !data.session) {
      setMode("login");
      setPassword("");
      setMessageKind("success");
      setMsg("अकाउंट बन गया। अब login करो।");
      return;
    }

    router.push("/");
    router.refresh();
  }

  function toggleMode() {
    setMode((current) => (current === "login" ? "signup" : "login"));
    setMsg("");
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <aside className={styles.story}>
          <div className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true">S</span>
            <span>Spreeda</span>
          </div>

          <div className={styles.storyCopy}>
            <p className={styles.eyebrow}>A little practice. A bigger world.</p>
            <h1>Say more than just hello.</h1>
            <p>
              Build a language habit that fits your day, then take it into the
              conversations that matter.
            </p>
          </div>

          <div className={styles.storyArt} aria-hidden="true">
            <span className={styles.orbit} />
            <span className={styles.artCenter}>話</span>
            <span className={`${styles.wordBubble} ${styles.wordOne}`}>hello</span>
            <span className={`${styles.wordBubble} ${styles.wordTwo}`}>नमस्ते</span>
            <span className={`${styles.wordBubble} ${styles.wordThree}`}>こんにちは</span>
            <span className={styles.artSpark}>✦</span>
          </div>

          <p className={styles.storyFoot}>Small steps, real-world confidence.</p>
        </aside>

        <section className={styles.formPanel} aria-labelledby="login-title">
          <div className={styles.mobileBrand}>
            <span className={styles.brandMark} aria-hidden="true">S</span>
            <span>Spreeda</span>
          </div>

          <div className={styles.formIntro}>
            <p className={styles.formEyebrow}>
              {mode === "login" ? "YOUR NEXT LESSON AWAITS" : "YOUR LANGUAGE JOURNEY STARTS HERE"}
            </p>
            <h2 id="login-title">
              {mode === "login" ? "Welcome back" : "Let’s get you started"}
            </h2>
            <p>
              {mode === "login"
                ? "Pick up where you left off. Your next conversation is closer than you think."
                : "Make a little room for a new language in your everyday life."}
            </p>
          </div>

          <button
            className={styles.googleButton}
            type="button"
            onClick={googleLogin}
            disabled={busy}
          >
            <span className={styles.googleMark} aria-hidden="true">G</span>
            Continue with Google
          </button>

          <div className={styles.separator}><span>or continue with email</span></div>

          <form className={styles.form} onSubmit={submit} aria-busy={busy}>
            {mode === "signup" && (
              <label className={styles.field}>
                <span>Your name <span className={styles.optional}>(optional)</span></span>
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="What should we call you?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={busy}
                />
              </label>
            )}

            <label className={styles.field}>
              <span>Email address</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={busy}
              />
            </label>

            <label className={styles.field}>
              <span>Password</span>
              <input
                type="password"
                name="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={busy}
              />
            </label>

            {msg && (
              <p
                className={messageKind === "success" ? styles.successMessage : styles.errorMessage}
                role={messageKind === "success" ? "status" : "alert"}
              >
                {msg}
              </p>
            )}

            <button className={styles.submitButton} type="submit" disabled={busy}>
              {busy ? "One moment…" : mode === "login" ? "Sign in" : "Create account"}
              {!busy && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className={styles.switchMode}>
            {mode === "login" ? "New to Spreeda?" : "Already have an account?"}
            <button type="button" onClick={toggleMode} disabled={busy}>
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>

          <p className={styles.privacyNote}>
            Your learning journey is yours. We’ll never share your personal details.
          </p>
        </section>
      </div>
    </main>
  );
}
