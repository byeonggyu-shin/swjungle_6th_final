import React, { useState, useEffect } from "react";
// recoil
import { useRecoilValue } from "recoil";
import { ClickedCardDetailAtom } from "@/recoil/atoms/MainGraphAtom";
// Api call
import { Card_Detail_Api } from "@/axios/dashBoardApi";
// types
import { CardDetail_DTO } from "@/types/dashborad.types";

function useDetail() {
  const [data, setData] = useState<CardDetail_DTO>();
  const cardId = useRecoilValue(ClickedCardDetailAtom);

  useEffect(() => {
    const getCardData = async () => {
      const cardData = await Card_Detail_Api(cardId);
      setData(cardData);
    };
    getCardData();
  }, [cardId]);

  console.log("useDetail data: ", data);
  return data;
}

export default useDetail;
