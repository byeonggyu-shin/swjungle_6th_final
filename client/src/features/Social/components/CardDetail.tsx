import { GET } from "@/axios/GET";
import getToken from "@/axios/getToken";
import React, { useEffect, useState } from "react";
import { AiFillPlusCircle, AiOutlinePlusCircle } from "react-icons/ai";

import { CardDetail } from "@/types/social.types";
import { POST } from "@/axios/POST";
import { SocialImgModalAtom } from "@/recoil/atoms/SocialAtom";
import { useRecoilState } from "recoil";

const CardDetail = ({
  modalRef,
  modalOutsideClicked,
  cardId,
  userId,
}: CardDetail) => {
  const [detail, setDetail] = useState<any>();
  const [isPlus, setIsPlus] = useState(false);
  const [showModal, setShowModal] = useRecoilState(SocialImgModalAtom);

  const getDetail = async () => {
    const data = await GET(
      `cards/info?cardId=${cardId}&userId=${userId}`,
      true
    );
    if (data.status === 200) {
      setDetail(data.data);
    }
  };

  const cloneCard = async () => {
    const data = await POST(`social/clone`, { cardId: cardId }, true);
    if (data.status === 200) {
      setIsPlus(true);
      setShowModal(false);
    }
  };

  useEffect(() => {
    getDetail();
  }, []);

  return (
    <div
      className="fixed inset-0 z-20 bg-white bg-opacity-30"
      ref={modalRef}
      onClick={(e) => modalOutsideClicked(e)}
    >
      <div className="absolute flex-col justify-start w-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border top-1/2 left-1/2 h-4/6 drop-shadow-xl rounded-xl">
        <div className="flex flex-row justify-between p-2 p-4 border-b border-current">
          <div className="flex flex-row items-center justify-between w-full">
            <div className="flex items-center">
              <img
                src={detail?.profile_img}
                className="w-24 h-24 rounded-full border-[0.5rem] border-colorBlue"
                alt="profile"
              />
              <p className="ml-5 text-3xl font-semibold">{detail?.userName}</p>
            </div>
            <div className="flex">
              {detail?.cardTag &&
                detail?.cardTag.map((t: string, index: number) => {
                  return (
                    <p key={index} className="p-2 m-2 text-xl font-semibold">
                      #{t}
                    </p>
                  );
                })}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-3/4 pt-5 pt-48 mx-auto overflow-y-auto h-96">
          <img
            src={detail?.cardImage}
            className="w-full cursor-pointer"
            alt="screenshot"
          />
          <p>{detail?.content}</p>
        </div>
        <div className="flex justify-center w-full">
          {isPlus ? (
            <AiFillPlusCircle className="w-12 h-12" />
          ) : (
            <AiOutlinePlusCircle className="w-12 h-12" onClick={cloneCard} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CardDetail;
