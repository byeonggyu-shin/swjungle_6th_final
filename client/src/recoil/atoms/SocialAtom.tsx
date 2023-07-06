import { atom } from "recoil";
import { User } from "@/types/social.types";

export const SocialImgModalAtom = atom({
  key: "SocialImgModalAtom",
  default: false,
});

export const SocialUserAtom = atom<User[]>({
  key: "SocialUserAtom",
  default: [],
});
