import React, { useEffect, useState } from "react";
import Image from "next/image";
// recoil
import { useRecoilState, useRecoilValue } from "recoil";
import { CardDetailOpenAtom } from "@/recoil/atoms/MainGraphAtom";
import { LoginStateAtom } from "@/recoil/atoms/LoginStateAtom";
// library
import { BsXLg, BsTrashFill, BsPencilFill } from "react-icons/bs";
// custom hook
import useDetail from "@/features/Dashboard/MainCard/hook/useDetail";
// types
import { CardDataDetail } from "@/types/dashborad.types";
// API
import { Card_Edit_Api, Card_Delete_Api } from "@/axios/dashBoardApi";
import DuplicatiobCardBtn from "@/features/Dashboard/MainCard/components/DuplicateCardBtn";

function CardDetail() {
  const [cardDetailData, setCardDetailData] = useState<Partial<CardDataDetail>>(
    {}
  );
  const [detailOpen, setDetailOpen] = useRecoilState(CardDetailOpenAtom);
  const [isLogin, setIsLogin] = useState<boolean>(false);

  const loginId = useRecoilValue(LoginStateAtom);

  const [editedContent, setEditedContent] = useState<any>("");
  const [isEditingContent, setIsEditingContent] = useState(false);
  // 데이터 fetch
  const detailData = useDetail();

  const handleDetailOpen = () => {
    setDetailOpen(!detailOpen);
  };

  const handleContentEdit = () => {
    setIsEditingContent(true);
    setEditedContent(cardDetailData?.content);
  };

  const handleCardDelete = async () => {
    Card_Delete_Api(cardDetailData?.cardId);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value);
  };

  const handleContentSave = async () => {
    const response = await Card_Edit_Api(cardDetailData?.cardId, editedContent);

    if (response.data.success) {
      setIsEditingContent(false);
    }
  };

  useEffect(() => {
    if (detailData) {
      setCardDetailData(detailData);
    }
    console.log(cardDetailData)
  }, [detailOpen, detailData]);

  useEffect(() => {
    if (loginId === cardDetailData?.userId) {
      setIsLogin(true);
    } else {
      setIsLogin(false);
    }
  }, [loginId, cardDetailData?.userId]);

  return (
    <>
      <div className="relative w-full h-full px-8 pb-8 overflow-auto border rounded-lg shadow-md">
        <div className="sticky top-0 flex pt-6 pb-4 bg-white">
          <div className="flex items-center justify-start w-full h-full">
            {cardDetailData?.cardTag ? (
              cardDetailData?.cardTag.map((data: string, index: number) => {
                return (
                  <div
                    className="flex items-center justify-center px-4 mr-2 font-semibold text-center text-white bg-blue-600 rounded"
                    key={index}
                  >
                    # {data}
                  </div>
                );
              })
            ) : (
              <></>
            )}
            {isLogin ? (
              isEditingContent ? (
                <>
                  <div className="h-full card-detail-edit-btn">
                    <button
                      className="cursor-pointer svg-button-nomal"
                      onClick={() => setIsEditingContent(false)}
                    >
                      <BsXLg />
                    </button>
                    <button
                      className="cursor-pointer svg-button-nomal"
                      onClick={handleContentSave}
                    >
                      <BsPencilFill />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-full card-detail-edit-btn">
                    <button
                      className="cursor-pointer svg-button-nomal"
                      onClick={handleCardDelete}
                    >
                      <BsTrashFill />
                    </button>
                    <button
                      className="cursor-pointer svg-button-nomal"
                      onClick={handleContentEdit}
                    >
                      <BsPencilFill />
                    </button>
                  </div>
                </>
              )
            ) : (
              <>
                <DuplicatiobCardBtn />
              </>
            )}
          </div>
          <button
            className="ml-auto cursor-pointer svg-button-nomal"
            onClick={handleDetailOpen}
          >
            <BsXLg />
          </button>
        </div>
        <div className="relative max-w-full max-h-full w-full h-[25rem] mb-6 flex justify-center items-center">
          <Image
            src={cardDetailData?.cardImage || ""}
            alt="Card Detail"
            layout="fill"
            objectFit="cover"
          />
        </div>
        {isLogin ? (
          <>
            {isEditingContent ? (
              <>
                <textarea
                  value={editedContent}
                  onChange={handleContentChange}
                  rows={editedContent?.length / 15}
                  className="w-full bg-gray-100 outline-none resize-none h-1/3"
                />
              </>
            ) : (
              <>{editedContent || cardDetailData?.content}</>
            )}
          </>
        ) : (
          <>
            <div>{cardDetailData?.content}</div>
          </>
        )}
      </div>
    </>
  );
}

export default CardDetail;
