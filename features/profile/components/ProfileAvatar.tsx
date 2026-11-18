import type { CSSProperties } from "react";
import {
  profileAvatars,
  type ProfileAvatarId,
} from "@/features/profile/data/profile-avatars";

type Props = {
  avatarId: ProfileAvatarId;
  className?: string;
  style?: CSSProperties;
};

export function ProfileAvatar({ avatarId, className, style }: Props) {
  const avatar =
    profileAvatars.find((option) => option.id === avatarId) ?? profileAvatars[0];
  const hairShapes = [
    "M20 42c-3-19 6-31 20-31 15 0 24 11 20 31l-5 5V31c-7 3-17 3-30 0v16z",
    "M18 42c-5-17 3-31 22-31 18 0 27 14 22 31l-7-8-4-10c-7 8-18 12-29 12z",
    "M19 41c-4-19 5-30 21-30 16 0 25 12 21 31l-8 7V27c-7 4-17 4-27 1v20z",
    "M19 43c-4-18 5-32 21-32 18 0 25 14 21 33l-7-4-3-11c-8 7-19 10-31 8z",
    "M18 41c-4-18 5-30 22-30 17 0 26 12 22 30l-7 7V29c-9 5-19 5-30 1v18z",
    "M19 41c-3-18 5-30 21-30 17 0 25 11 22 30l-8 6V27c-8 5-18 6-29 2v18z",
    "M18 42c-4-19 5-31 22-31 16 0 25 12 22 31l-6-4-5-12c-8 7-18 10-30 9z",
    "M18 42c-5-19 4-31 22-31 18 0 27 14 22 32l-7 5V29c-8 5-18 5-30 2v19z",
    "M20 42c-4-19 4-31 20-31 16 0 25 12 21 31l-7 7V27c-8 7-18 9-30 8v14z",
    "M19 42c-4-18 5-31 21-31 17 0 26 13 22 31l-7 5-2-17c-9 7-19 10-33 9z",
  ];

  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 80 80"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="40" cy="40" r="40" fill={avatar.background} />
      <path d="M10 80c2-17 12-25 30-25s28 8 30 25" fill={avatar.shirt} />
      <path d="M33 53h14v11H33z" fill={avatar.skin} />
      <path d={hairShapes[avatar.style]} fill={avatar.hair} />
      <ellipse cx="22" cy="40" rx="4" ry="6" fill={avatar.skin} />
      <ellipse cx="58" cy="40" rx="4" ry="6" fill={avatar.skin} />
      <ellipse cx="40" cy="38" rx="18" ry="21" fill={avatar.skin} />
      <path d={hairShapes[avatar.style]} fill={avatar.hair} />
      <path
        d="M30 38h3m14 0h3"
        fill="none"
        stroke="#302a2a"
        strokeLinecap="round"
        strokeWidth="2.5"
      />
      <path
        d="M36 47c2 2 6 2 8 0"
        fill="none"
        stroke="#9e5149"
        strokeLinecap="round"
        strokeWidth="2"
      />
      {avatar.style % 3 === 1 && (
        <path
          d="M22 30c5-12 26-15 36-2"
          fill="none"
          stroke="#f1ca70"
          strokeLinecap="round"
          strokeWidth="4"
        />
      )}
      {avatar.style % 4 === 2 && (
        <g fill="none" stroke="#3b3943" strokeWidth="1.8">
          <circle cx="32" cy="39" r="5" />
          <circle cx="48" cy="39" r="5" />
          <path d="M37 39h6" />
        </g>
      )}
      {avatar.style % 5 === 3 && (
        <path d="M56 22l6-6 2 8 7 3-8 2-3 7-2-8-7-3z" fill="#f3d16f" />
      )}
    </svg>
  );
}
