import {
  defaultProfileAvatar,
  isProfileAvatarId,
  type ProfileAvatarId,
} from "@/features/profile/data/profile-avatars";

export const profileAvatarKey = "spreeda-profile-avatar";
const profileAvatarChangeEvent = "spreeda-profile-avatar-change";
let sessionAvatar = defaultProfileAvatar;

export function subscribeToProfileAvatar(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(profileAvatarChangeEvent, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(profileAvatarChangeEvent, onChange);
  };
}

export function getProfileAvatarSnapshot(): ProfileAvatarId {
  try {
    const savedAvatar = window.localStorage.getItem(profileAvatarKey);
    if (savedAvatar && isProfileAvatarId(savedAvatar)) {
      sessionAvatar = savedAvatar;
    }
  } catch {
    return sessionAvatar;
  }

  return sessionAvatar;
}

export function getServerProfileAvatarSnapshot(): ProfileAvatarId {
  return defaultProfileAvatar;
}

export function saveProfileAvatar(avatarId: ProfileAvatarId) {
  sessionAvatar = avatarId;
  let saved = true;
  try {
    window.localStorage.setItem(profileAvatarKey, avatarId);
  } catch {
    saved = false;
  }
  window.dispatchEvent(new Event(profileAvatarChangeEvent));
  return saved;
}
