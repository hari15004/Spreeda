export const profileAvatars = [
  {
    id: "mika",
    name: { en: "Mika", hi: "मीका" },
    background: "#f6c889",
    skin: "#e9a982",
    hair: "#382c37",
    shirt: "#426a75",
    style: 0,
  },
  {
    id: "rio",
    name: { en: "Rio", hi: "रियो" },
    background: "#b8d9cf",
    skin: "#f0c39a",
    hair: "#6b392a",
    shirt: "#d16d50",
    style: 1,
  },
  {
    id: "sora",
    name: { en: "Sora", hi: "सोरा" },
    background: "#c7c8ec",
    skin: "#9b5d46",
    hair: "#211f31",
    shirt: "#e5a645",
    style: 2,
  },
  {
    id: "yuki",
    name: { en: "Yuki", hi: "युकी" },
    background: "#f3b9b0",
    skin: "#f3c6a5",
    hair: "#ad493e",
    shirt: "#487a65",
    style: 3,
  },
  {
    id: "ren",
    name: { en: "Ren", hi: "रेन" },
    background: "#a9c5e1",
    skin: "#d99b73",
    hair: "#242a3d",
    shirt: "#f2cb73",
    style: 4,
  },
  {
    id: "hana",
    name: { en: "Hana", hi: "हाना" },
    background: "#e8c9dd",
    skin: "#edbd98",
    hair: "#59404d",
    shirt: "#6a64a1",
    style: 5,
  },
  {
    id: "kai",
    name: { en: "Kai", hi: "काई" },
    background: "#f0d7a4",
    skin: "#85513f",
    hair: "#282226",
    shirt: "#3d7681",
    style: 6,
  },
  {
    id: "emi",
    name: { en: "Emi", hi: "एमी" },
    background: "#b6d6e0",
    skin: "#f4d0ad",
    hair: "#a86a35",
    shirt: "#bb5d70",
    style: 7,
  },
  {
    id: "tomo",
    name: { en: "Tomo", hi: "तोमो" },
    background: "#d6d5aa",
    skin: "#c77d5e",
    hair: "#302b27",
    shirt: "#687b4d",
    style: 8,
  },
  {
    id: "aki",
    name: { en: "Aki", hi: "आकी" },
    background: "#c6b5a3",
    skin: "#f1c7a2",
    hair: "#574035",
    shirt: "#bd6947",
    style: 9,
  },
] as const;

export type ProfileAvatarId = (typeof profileAvatars)[number]["id"];

export const defaultProfileAvatar: ProfileAvatarId = "mika";

export function isProfileAvatarId(value: string): value is ProfileAvatarId {
  return profileAvatars.some((avatar) => avatar.id === value);
}
