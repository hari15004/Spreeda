"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { UiLanguage } from "@/types/learning";

type Props = { language: UiLanguage };

export function AccountMenu({ language }: Props) {
  const [supabase] = useState(() => createClient());
  const [name, setName] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        if (active) {
          setName(null);
          setReady(true);
        }
        return;
      }
      const { data: prof } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", data.user.id)
        .single();
      if (active) {
        setName(prof?.display_name ?? "Learner");
        setReady(true);
      }
    }

    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      setTimeout(() => {
        load();
      }, 0);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  async function logout() {
    await supabase.auth.signOut();
    setName(null);
  }

  if (!ready) return null;

  const pill: React.CSSProperties = {
    padding: "6px 12px",
    borderRadius: 999,
    border: "1px solid currentColor",
    background: "transparent",
    color: "inherit",
    fontSize: 14,
    cursor: "pointer",
    textDecoration: "none",
    whiteSpace: "nowrap",
  };

  if (!name) {
    return (
      <Link href="/login" style={pill}>
        {language === "en" ? "Login" : "लॉगिन"}
      </Link>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 14, whiteSpace: "nowrap" }}>👤 {name}</span>
      <Link href="/squad" style={pill}>
        Squad
      </Link>
      <button type="button" onClick={logout} style={pill}>
        {language === "en" ? "Logout" : "लॉगआउट"}
      </button>
    </div>
  );
}