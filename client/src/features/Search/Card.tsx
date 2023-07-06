import React, { useState } from "react";
import { AiOutlineExpand } from "react-icons/ai";
import CardModal from "./CardModal";

const Card: React.FC<CardProps> = ({ card }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="relative w-[10rem] h-[10rem] rounded-md border border-[#DADADA] bg-[#F4F4F4]">
        <div
          className="absolute inset-0 bg-contain bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${card.imageUrl}')`,
          }}
        ></div>
        <div className="absolute right-[0.75rem] bottom-[0.75rem] w-[1.75rem] h-[1.75rem] flex items-center justify-center rounded-md bg-white  cursor-pointer">
          <AiOutlineExpand onClick={openModal} />
        </div>
      </div>

      {isModalOpen && <CardModal card={card} closeModal={closeModal} />}
    </>
  );
};

export default Card;
