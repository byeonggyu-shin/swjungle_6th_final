import { atom } from "recoil";

export const UploadingAtom = atom({
  key: "UploadingAtom",
  default: false,
});

export const GraphDataAtom = atom({
  key: "GraphDataAtom",
  default: undefined,
});

export const ImgUpLoadAtom = atom({
  key: "imgUpLoadAtom",
  default: false,
});
