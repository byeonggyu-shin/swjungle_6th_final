// Search/CardModal.tsx

import React from "react";
import Image from "next/image";

import { AiOutlineClose } from "react-icons/ai";

const randomColors = [
  "#EE6565",
  "#FB8351",
  "#FAC858",
  "#91CB75",
  "#3AA272",
  "#73C0DE",
  "#5470C6",
  "#9A60B4",
  "#FF88E0",
];

type CardModalProps = {
  card: any;
  closeModal: () => void;
};

const CardModal: React.FC<CardModalProps> = ({ card, closeModal }) => {
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className=" overflow-y-auto flex flex-col items-start gap-[1.5rem] w-[31.75rem] h-[35.25rem] p-6 bg-[#FFF] border-gray-100 rounded shadow-1 ">
          <div className="flex justify-between items-center self-stretch bg-[, #FFF]">
            <div className="flex items-center gap-[1.5rem] flex-1">
              <div
                className="flex h-[2.25rem] px-[1rem] justify-center items-center rounded-md"
                style={{
                  backgroundColor:
                    randomColors[
                      Math.floor(Math.random() * randomColors.length)
                    ],
                }}
              >
                <span className="text-white text-[1.25rem] font-[600] leading-[150%] tracking-[0.0375rem]">
                  # {card.tag}
                </span>
              </div>
            </div>
            <AiOutlineClose
              onClick={closeModal}
              className="text-base leading-normal text-gray-400 cursor-pointer font-xeicon"
            />
          </div>
          {/* <div
            className={`overflow-auto ${styles["mostly-customized-scrollbar"]}`}
          > */}
          <div className="relative w-[28.25rem] flex justify-center items-center bg-lightgray">
            <Image
              src={card.imageUrl}
              alt="Card image"
              layout="responsive"
              objectFit="cover"
              width={500}
              height={300}
            />
          </div>

          <div className="flex flex-col self-stretch">
            <span className="text-gray-900 text-[1.25rem] font-light leading-150">
              {card.content}
            </span>
          </div>
          {/* </div> */}
        </div>
      </div>
    </>
  );
};

export default CardModal;
