import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

export const LoginStateAtom = atom({
  key: "LoginStateAtom",
  default: 0,
  effects_UNSTABLE: [persistAtom],
});

export const IsLoginAtom = atom({
  key: "IsLoginAtom",
  default: false,
  effects_UNSTABLE: [persistAtom],
});

export const FollowCntAtom = atom({
  key: "FollowCntAtom",
  default: 0,
});
