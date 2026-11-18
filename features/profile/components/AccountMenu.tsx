"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import type { ProfileAvatarId } from "@/features/profile/data/profile-avatars";
import type { UiLanguage } from "@/features/learning/types/learning";
import styles from "./AccountMenu.module.css";

type Props = { language: UiLanguage; avatarId: ProfileAvatarId };

export function AccountMenu({ language, avatarId }: Props) {
  const [supabase] = useState(() => createClient());
  const [name, setName] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [logoutError, setLogoutError] = useState(false);

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
    const { error } = await supabase.auth.signOut();
    if (error) {
      setLogoutError(true);
      return;
    }
    setLogoutError(false);
    setName(null);
  }

  if (!ready) return null;

  if (!name) {
    return (
      <section className={styles.menu}>
        <p className={styles.guest}>
          {language === "en"
            ? "Sign in to sync your learning across devices."
            : "अपनी सीखने की प्रगति दूसरे डिवाइस पर पाने के लिए लॉगिन करें।"}
        </p>
        <Link className={styles.login} href="/login">
          {language === "en" ? "Log in" : "लॉगिन करें"}
          <span aria-hidden="true">→</span>
        </Link>
      </section>
    );
  }

  return (
    <section className={styles.menu}>
      <div className={styles.identity}>
        <ProfileAvatar avatarId={avatarId} className={styles.avatar} />
        <div>
          <p className={styles.eyebrow}>
            {language === "en" ? "SIGNED IN AS" : "लॉगिन किया है"}
          </p>
          <strong>{name}</strong>
        </div>
      </div>
      <button type="button" className={styles.logout} onClick={logout}>
        <span aria-hidden="true">↗</span>
        {language === "en" ? "Log out" : "लॉगआउट"}
      </button>
      {logoutError && (
        <p className={styles.error} role="alert">
          {language === "en"
            ? "Could not log out. Please try again."
            : "लॉगआउट नहीं हो सका। फिर से कोशिश करें।"}
        </p>
      )}
    </section>
  );
}