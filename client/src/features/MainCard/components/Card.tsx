import React from "react";
//recoil
import { useRecoilState } from "recoil";
import {
  CardDetailOpenAtom,
  ClickedCardDetailAtom,
} from "@/recoil/atoms/MainGraphAtom";
// 타입 임포트
import { CardData } from "@/types/dashborad.types";

function Card({ data }: { data: CardData }) {
  const [detailOpen, setDetailOpen] = useRecoilState(CardDetailOpenAtom);
  const [clickedDetail, setClickedDetail] = useRecoilState(
    ClickedCardDetailAtom
  );

  const handleCardClick = () => {
    setDetailOpen(!detailOpen);
    setClickedDetail(data?.cardId);
  };

  return (
    <div className="w-1/2 bg-red-200 h-1/3" onClick={handleCardClick}>
      {data !== undefined ? (
        <div>
          <div> card </div>
          <div> tag {data?.cardTag}</div>
          <div> Content {data?.cardContent}</div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default Card;
