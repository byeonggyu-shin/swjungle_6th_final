import React from "react";

// Recoil
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  CardDetailOpenAtom,
  ClickedCardDetailAtom,
} from "@/recoil/atoms/MainGraphAtom";
// Types
import { CardDataData } from "@/types/dashborad.types";
// Assets
import { BiFullscreen } from "react-icons/bi";

interface CardProps {
  data: CardDataData;
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
      <img src={data?.cardImg} className="object-cover max-w-full max-h-full" />
      <button
        className="absolute svg-button-nomal right-3 bottom-3 cursor-pointer"
        onClick={handleCardClick}
      >
        <BiFullscreen className="self-center z-1" size="1rem" />
      </button>
    </div>
  );
};

export default Card;