import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
// recoil
import { useRecoilValue } from "recoil";
import { NodeNameAtom } from "@/recoil/atoms/MainGraphAtom";
// Api call
import { Card_Info_Api } from "@/axios/dashBoardApi";
// types
import { CardData } from "@/types/dashborad.types";

function useCard() {
  const [data, setData] = useState<CardData>();
  const nodeName = useRecoilValue(NodeNameAtom);
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    const getCardData = async () => {
      const userid = Array.isArray(router.query.userid)
        ? router.query.userid[0]
        : router.query.userid;
      
      const page = router.query.page ? String(router.query.page) : "0";
      const perPage = router.query.perPage ? String(router.query.perPage) : "9";;

      const cardData = await Card_Info_Api(nodeName, userid, parseInt(page), parseInt(perPage));
      setData(cardData);
    };
    getCardData();
  }, [router.isReady, nodeName]);

  return data;
}

export default useCard;
