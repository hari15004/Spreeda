"use client";

import {
  profileAvatars,
  type ProfileAvatarId,
} from "@/features/profile/data/profile-avatars";
import type { UiLanguage } from "@/features/learning/types/learning";
import { ProfileAvatar } from "./ProfileAvatar";
import styles from "./ProfileAvatarPicker.module.css";

type Props = {
  language: UiLanguage;
  selectedAvatar: ProfileAvatarId;
  onSelect: (avatarId: ProfileAvatarId) => void;
};

export function ProfileAvatarPicker({
  language,
  selectedAvatar,
  onSelect,
}: Props) {
  const english = language === "en";

  return (
    <section className={styles.section} aria-labelledby="avatar-title">
      <div className={styles.heading}>
        <p className={styles.eyebrow}>{english ? "YOUR PROFILE" : "आपकी प्रोफ़ाइल"}</p>
        <h2 id="avatar-title">
          {english ? "Choose your character" : "अपना किरदार चुनें"}
        </h2>
        <p>
          {english
            ? "Pick one of these ten illustrated avatars."
            : "इन दस चित्रों में से अपना अवतार चुनें।"}
        </p>
      </div>
      <div
        className={styles.grid}
        role="group"
        aria-label={english ? "Profile avatars" : "प्रोफ़ाइल अवतार"}
      >
        {profileAvatars.map((avatar) => (
          <button
            type="button"
            className={`${styles.option} ${
              selectedAvatar === avatar.id ? styles.selected : ""
            }`}
            key={avatar.id}
            aria-pressed={selectedAvatar === avatar.id}
            aria-label={`${avatar.name[language]}${
              selectedAvatar === avatar.id
                ? english
                  ? ", selected"
                  : ", चुना गया"
                : ""
            }`}
            onClick={() => onSelect(avatar.id)}
          >
            <ProfileAvatar avatarId={avatar.id} className={styles.avatar} />
            <span>{avatar.name[language]}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
