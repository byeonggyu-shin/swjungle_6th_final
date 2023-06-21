import React, { useEffect, useState } from "react";
//recoil
import { useRecoilState } from "recoil";
import { CardDetailOpenAtom } from "@/recoil/atoms/MainGraphAtom";
//  custom hook
import useDetail from "@/features/MainCard/hook/useCard";
// type
import { CardDetail_DTO } from "@/types/dashborad.types";

import { BiUndo } from "react-icons/bi";

function CardDetail() {
  const [cardDetailData, setCardDetailData] = useState<any>({});
  const [detailOpen, setDetailOpen] = useRecoilState(CardDetailOpenAtom);
  const detailData = useDetail();

  const handleDetailOpen = () => {
    setDetailOpen(!detailOpen);
  };

  useEffect(() => {
    if (detailData) {
      setCardDetailData(detailData);
    }
  }, [detailData]);

  return (
    <div className="w-full h-full bg-red-200">
      <div className="flex ml-auto">
        <button onClick={handleDetailOpen}>
          <BiUndo />
        </button>
      </div>
      <div> tag {cardDetailData[0].cardTag}</div>
      <div> Content {cardDetailData[0].cardContent}</div>
      <div> Image {cardDetailData[0].cardImage}</div>
    </div>
  );
}

export default CardDetail;
