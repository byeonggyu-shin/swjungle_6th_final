import Image from "next/image";
import { useRecoilState } from "recoil";
import {
  ExportedTagsAtom,
  UploadedImgAtom,
  UploadedImgNumAtom,
} from "@/recoil/atoms/MainGraphAtom";
import NavBar from "@/features/Header/NavBar";
import { Wrapper } from "@/styles/wrapper";
import { useEffect, useState } from "react";

const UploadLoading = () => {
  const [imageUrl, setImageUrl] = useRecoilState(UploadedImgAtom);
  const [tags, setTags] = useRecoilState(ExportedTagsAtom);
  const [imgNum, setImgNum] = useRecoilState(UploadedImgNumAtom);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImageUrl, setCurrentImageUrl] = useState("");

  const showNextImage = () => {
    setCurrentImageIndex((prevIndex: number) => {
      const nextIndex = prevIndex + 1;
      if (nextIndex >= imageUrl.length) {
        return 0;
      }
      setCurrentImageUrl(imageUrl[nextIndex]);
      return nextIndex;
    });
  };

  useEffect(() => {
    setCurrentImageUrl(imageUrl[currentImageIndex]);
  }, [imageUrl]);

  useEffect(() => {
    const interval = setInterval(showNextImage, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [imageUrl]);

  return (
    <div className="h-screen bg-gray-100">
      <NavBar />
      <Wrapper className="flex flex-col justify-center h-full">
        <div className="flex flex-col items-center self-stretch bg-gray-100 ">
          <div
            className="flex flex-col items-center justify-center w-[30rem] max-md:w-[20rem] pt-[0.75rem] pr-[1.5rem] pb-[1.25rem] pl-[1.5rem] rounded-xl border border-gray-100 bg-white"
            style={{ boxShadow: "0px 4px 8px 0px rgba(0, 0, 0, 0.16)" }}
          >
            <div className="flex h-[3.75rem] justify-center items-center self-stretch">
              <p className="text-[1.5rem]  font-semibold leading-normal tracking-tight">
                Link your insight !
              </p>
            </div>
            <div className="flex p-[3.75rem] justify-center items-center self-stretch border-b border-gray-900">
              {imageUrl.length > 0 ? (
                <div className="relative flex items-center justify-center gap-4 w-[17rem] max-md:w-[15rem] h-[20rem] max-md:h-[17rem] flex-shrink-0 rounded-md border border-gray-100 bg-gray-50">
                  <Image
                    src={currentImageUrl}
                    alt="Image"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              ) : (
                <div>No image available</div>
              )}
            </div>
            <div className="flex justify-center items-center h-[2.5rem] gap-[0.25rem] self-stretch rounded-[36px]">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-colorSkyblue opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-400"></span>
              </span>
              <p className="text-gray-900 text-[0.875rem] px-[0.5rem] font-semibold leading-tight tracking-tighter">
                {imgNum}개의 스크린샷을 분석중입니다...
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center self-stretch gap-2 p-8">
          <p className="text-base max-md:text-sm font-light leading-6 tracking-tighter text-gray-800">
            갤러리 속 숨겨진 인사이트를 발견하세요
          </p>
          <p className="flex items-center justify-center w-[8.03944rem] h-5 text-lg">
            insightLINK
          </p>
        </div>
      </Wrapper>
    </div>
  );
};

export default UploadLoading;
