import React, { useEffect, useRef, useState } from "react";

import getToken from "@/axios/getToken";
import { GET } from "@/axios/GET";
import CardDetail from "@/features/Social/components/CardDetail";
// Types
import { Friends } from "@/types/social.types";
// Assets
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const listRef = useRef<HTMLUListElement>(null);
  // 마우스로 드래그 앤 드롭
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [scrollLeft, setScrollLeft] = useState<number>(0);
  // 모달
  const modalRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [userId, setUserId] = useState(1);
  const [cardId, setCardId] = useState(1);

  // 최근 업데이트 친구 조회
  const getFriends = async () => {
    const data = await GET("social/updated", true);
    if (data.status === 200) {
      setFriends(data.data);
    }
  };

  useEffect(() => {
    getFriends();
  }, []);

  const handleMouseDown = (
    e: React.MouseEvent<HTMLUListElement, MouseEvent>
  ) => {
    setIsMouseDown(true);
    setStartX(e.clientX - (listRef.current?.offsetLeft || 0));
    setScrollLeft(listRef.current?.scrollLeft || 0);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (
    e: React.MouseEvent<HTMLUListElement, MouseEvent>
  ) => {
    if (!isMouseDown) return;
    e.preventDefault();
    const x = e.clientX - (listRef.current?.offsetLeft || 0);
    const walk = x - startX;
    if (listRef.current) {
      listRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const modalOutsideClicked = (e: any) => {
    if (modalRef.current === e.target) {
      setShowModal(false);
    }
  };

  return (
    <div className="flex h-60 pb-10 flex-col items-start gap-10 self-stretch shadow-sm">
      <h2 className="text-gray-900 text-[1.5rem] font-kanit font-semibold leading-1.5 tracking-tighter">
        News
      </h2>
      <div className="flex items-center gap-8 flex-1 self-stretch">
        <div className="flex w-[1.75rem] h-[1.75rem] flex-col justify-center items-center">
          <BsChevronLeft className="text-gray-800 text-base font-xeicon leading-normal" />
        </div>
        <ul
          ref={listRef}
          className="flex justify-start w-full py-5 overflow-x-hidden overflow-y-hidden scrolling-touch cursor-grab"
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseLeave}
          onMouseMove={handleMouseMove}
        >
          {friends &&
            friends?.map((f: Friends) => {
              return (
                <li
                  key={f.userId}
                  className="flex flex-col justify-center items-center w-[6.25rem] h-[8.25rem] flex-shrink-0 m-2 gap-3"
                >
                  <div className="w-[6.25rem] h-[6.25rem] transition transform rounded-full cursor-pointer hover:-rotate-6 bg-colorBlue flex justify-center items-center">
                    <img
                      src={f.profile_img}
                      className="w-[5.25rem] h-[5.25rem] rounded-full"
                      alt="profile"
                      onClick={() => {
                        setShowModal(true);
                        setCardId(f.cardId);
                        setUserId(f.userId);
                      }}
                    />
                  </div>
                  <p className="flex flex-col items-center justify-center overflow-hidden text-center w-6.0625rem h-auto text-gray-900 font-kanit text-lg leading-normal tracking-wider">
                    {f.userName}
                  </p>
                </li>
              );
            })}
        </ul>
        <div className="flex w-[1.75rem] h-[1.75rem] flex-col justify-center items-center">
          <BsChevronRight className="text-gray-800 text-base font-xeicon leading-normal" />
        </div>
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

export default Friends;
