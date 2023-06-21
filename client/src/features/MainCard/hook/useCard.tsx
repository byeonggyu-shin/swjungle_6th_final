import React, { useState, useEffect } from "react";
// recoil
import { useRecoilValue } from "recoil";
import { NodeNameAtom } from "@/recoil/atoms/MainGraphAtom";
// Api call
import { Card_Info_Api } from "@/axios/dashBoardApi";
// types
import { CardData_DTO } from "@/types/dashborad.types";

function useCard() {
  const [data, setData] = useState<CardData_DTO>();
  const nodeName = useRecoilValue(NodeNameAtom);


  useEffect(() => {
    const getCardData = async () => {
      const cardData = await Card_Info_Api(nodeName);
      setData(cardData);
    };
    getCardData();
  }, [nodeName]);

  return data;
}

export default useCard;
