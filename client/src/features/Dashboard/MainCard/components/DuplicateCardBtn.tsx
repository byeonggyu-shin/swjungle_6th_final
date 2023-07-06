import React from "react";
// recoil
import { useRecoilValue } from "recoil";
import { ClickedCardDetailAtom,  NodeNameAtom } from "@/recoil/atoms/MainGraphAtom";

import { Duplicate_Card_API } from "@/axios/dashBoardApi";

export default function DuplicateCardBtn() {
  const cardId = useRecoilValue(ClickedCardDetailAtom);
  const nodeName = useRecoilValue(NodeNameAtom);

  const handleDuplicateCard = async () => {
    await Duplicate_Card_API(cardId, nodeName);
  };

  return (
    <>
      <button
        onClick={handleDuplicateCard}
        className="cursor-pointer follow-btn"
      >
        복제
      </button>
    </>
  );
}
