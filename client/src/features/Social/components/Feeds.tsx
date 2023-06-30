import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

import getToken from "@/axios/getToken";
import { GET } from "@/axios/GET";
import CardDetail from "./CardDetail";
// Types
import { CardData } from "@/types/dashborad.types";
import { AiOutlineClose } from "react-icons/ai";
import { BiFullscreen } from "react-icons/bi";
import { useRecoilState } from "recoil";
import { SocialImgModalAtom } from "@/recoil/atoms/SocialAtom";

const Feeds = () => {
  const [cards, setCards] = useState<CardData[]>();
  // 모달
  const modalRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useRecoilState(SocialImgModalAtom);
  const [userId, setUserId] = useState(1);
  const [cardId, setCardId] = useState(1);

  const router = useRouter();

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

  const handleClick = (userid: number) => {
    router.push(`/dashboard/${userid}`);
  };

  const rejectCard = async (id: number) => {
    const data = await GET(`graph?userId=${id}`, true);
    if (data.status === 200) {
      // const newCards = cards.filter((c) => c.id !== id);
      // setCards(newCards);

      // 리렌더링 처리 필요 🚨
      getFeeds();
    }
  };

  const handleClose = (id: number) => {
    rejectCard(id);
  };

  const modalOutsideClicked = (e: any) => {
    if (modalRef.current === e.target) {
      setShowModal(false);
    }
  };

  return (
    <div className="flex pb-5 flex-col items-start gap-[2rem] self-stretch border-b border-gray-900 shadow-sm w-full">
      <h2 className="text-gray-900 text-[1.5rem] font-kanit font-semibold leading-1.5 tracking-tighter">
        Feed
      </h2>
      <div className="grid grid-cols-5 grid-flow-row gap-y-3 self-stretch flex-wrap min-h-[53rem] w-full">
        {cards &&
          cards.map((c: CardData, index: number) => {
            return (
              <div
                key={index}
                className="w-[10rem] bg-gray-100 h-[10rem] border-2 rounded border-gray-300 relative hover:border-blue-500 flex justify-center items-center"
              >
                <img
                  src={c?.cardImg}
                  className="object-cover max-w-full max-h-full"
                  onClick={() => handleClick(c.cardId)}
                />
                <button
                  onClick={() => handleClose(c?.userId)}
                  className="absolute svg-button-nomal left-3 bottom-3 cursor-pointer"
                >
                  <AiOutlineClose className="self-center z-1" size="1rem" />
                </button>
                <button
                  onClick={() => {
                    setShowModal(true);
                    setCardId(c.cardId);
                    setUserId(c.userId);
                  }}
                  className="absolute svg-button-nomal right-3 bottom-3 cursor-pointer"
                >
                  <BiFullscreen className="self-center z-1" size="1rem" />
                </button>
              </div>
            );
          })}
        {/* {cards &&
          cards.map((c: Card, index: number) => {
            return (
              <li
                key={index}
                className={`flex flex-col py-4 border-t border-b  ${
                  !c.isFriend ? "bg-blue-100" : ""
                }`}
                onClick={() => setCardId(c.cardId)}
              >
                {!c.isFriend && (
                  <p className="mb-4">이런 인사이트는 어떤가요?</p>
                )}
                <div className="flex flex-row items-center w-full">
                  <img
                    src={c.img}
                    className="w-12 h-12 rounded-full cursor-pointer"
                    onClick={() => {
                      handleClick(c.userId);
                    }}
                  />
                  <div className="flex items-center justify-between w-full p-2">
                    <p className="w-full font-bold">{c.userName}</p>
                    <div className="flex items-center justify-end w-full">
                      <p className="mr-2">#{c.tag}</p>
                      <AiOutlineCloseCircle
                        className="text-xl"
                        onClick={() => handleClose(c.cardId)}
                      />
                    </div>
                  </div>
                </div>
                <p
                  className="inline-block w-full p-2 break-words cursor-pointer white space-normal"
                  onClick={() => {
                    setShowModal(true);
                    setCardId(c.cardId);
                    setUserId(c.userId);
                  }}
                >
                  {c.content}
                </p>
              </li>
            );
          })} */}
      </div>
      {showModal && (
        <CardDetail
          modalRef={modalRef}
          modalOutsideClicked={modalOutsideClicked}
          cardId={cardId}
          userId={userId}
        />
      )}
    </div>
  );
};

export default Feeds;
