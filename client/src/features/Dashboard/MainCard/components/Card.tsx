import React from "react";
import Image from "next/image";
// Recoil
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  CardDetailOpenAtom,
  ClickedCardDetailAtom,
} from "@/recoil/atoms/MainGraphAtom";
// Types
import { FeedCardData } from "@/types/dashborad.types";
// Assets
import { BiFullscreen } from "react-icons/bi";

interface CardProps {
  data: FeedCardData;
}

const Card: React.FC<CardProps> = ({ data }) => {
  const [detailOpen, setDetailOpen] = useRecoilState(CardDetailOpenAtom);
  const setClickedDetail = useSetRecoilState(ClickedCardDetailAtom);

  const handleCardClick = () => {
    setDetailOpen(!detailOpen);
    setClickedDetail(data?.cardId);
  };

  return (
    <div className="w-[10rem] bg-gray-100 h-[10rem] border-2 rounded border-gray-300 relative hover:border-blue-500 flex justify-center items-center">
      <Image src={data?.cardImg} alt="" objectFit="cover" layout="fill" />
      <button
        className="absolute cursor-pointer svg-button-nomal right-3 bottom-3"
        onClick={handleCardClick}
      >
        <BiFullscreen className="self-center z-1" size="1rem" />
      </button>
    </div>
  );
};

export default Card;
