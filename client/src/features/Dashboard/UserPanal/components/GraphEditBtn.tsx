import React from "react";
// recoil
import { useRecoilState } from "recoil";
import { EditModeAtom } from "@/recoil/atoms/MainGraphAtom";

import { BiCheck } from "react-icons/bi";
import { SlGraph } from "react-icons/sl";

export default function GraphEditBtn() {
  const [editMode, setEditMode] = useRecoilState(EditModeAtom);

  return (
    <>
      {editMode ? (
        <button
          onClick={() => setEditMode(false)}
          className="cursor-pointer follow-btn text-NodeColor1"
        >
          <BiCheck className="mr-1" />
          편집 완료
        </button>
      ) : (
        <button
          onClick={() => setEditMode(true)}
          className="cursor-pointer follow-btn"
        >
          <SlGraph className="mr-1" />
          편집 시작
        </button>
      )}
    </>
  );
}
