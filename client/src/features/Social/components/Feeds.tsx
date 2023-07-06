import React, { useEffect, useState } from "react";
import Image from "next/image";
// Recoil
import { useRecoilState } from "recoil";
import { SocialImgModalAtom } from "@/recoil/atoms/SocialAtom";

import { GET } from "@/axios/GET";
import CardDetail from "./CardDetail";
// Types
import { FeedCardData } from "@/types/dashborad.types";
// Assets
import { AiOutlineClose } from "react-icons/ai";

const Feeds = () => {
  const [cards, setCards] = useState<FeedCardData[]>();
  // 모달
  const [showModal, setShowModal] = useRecoilState(SocialImgModalAtom);
  const [userId, setUserId] = useState(0);
  const [cardId, setCardId] = useState(0);

  const getFeeds = async () => {
    const data = await GET(`social/card`, true);
    if (data.status === 200) {
      setCards(data.data);
    }
    if (data.response?.status === 400) {
      setCards([]);
    }
  };

  useEffect(() => {
    getFeeds();
  }, []);

  const rejectCard = async (id: number) => {
    const data = await GET(`graph?userId=${id}`, true);
    if (data.status === 200) {
      getFeeds();
    }
  };

  const handleClose = (id: number) => {
    rejectCard(id);
  };

  return (
    <div className="flex pb-5 flex-col items-start gap-[2rem] self-stretch border-b border-gray-900 shadow-sm w-full">
      <h2 className="text-gray-900 text-[1.5rem]  font-semibold leading-1.5 tracking-tighter">
        Feed
      </h2>
      <div className="grid grid-cols-5 grid-flow-row gap-y-3 self-stretch flex-wrap w-full">
        {cards &&
          cards.map((c: FeedCardData, index: number) => {
            return (
              <div
                key={index}
                className="relative w-[10rem] h-[10rem] bg-gray-100 border-2 rounded border-gray-300 hover:border-blue-500 flex justify-center items-center cursor-pointer"
              >
                <Image
                  src={c?.cardImg}
                  alt=""
                  layout="fill"
                  objectFit="cover"
                  className="cursor-pointer"
                  onClick={() => {
                    setCardId(c.cardId);
                    setUserId(c.userId);
                    setShowModal(true);
                  }}
                />
                <button
                  onClick={() => handleClose(c?.userId)}
                  className="absolute cursor-pointer svg-button-nomal right-3 top-3"
                >
                  <AiOutlineClose className="self-center z-1" size="1rem" />
                </button>
              </div>
            );
          })}
      </div>
      {showModal && cardId && userId && (
        <CardDetail cardId={cardId} userId={userId} />
      )}
    </div>
  );
};

export default Feeds;
