import Image from "next/image";
// Recoil
import { useRecoilState } from "recoil";
import {
  ExportedTagsAtom,
  UploadedImgAtom,
  UploadedImgNumAtom,
} from "@/recoil/atoms/MainGraphAtom";
// Components
import NavBar from "@/features/Header/NavBar";
import { Wrapper } from "@/styles/wrapper";
// Assets
import { BiLoader } from "react-icons/bi";
// import { AiOutlineClose } from "react-icons/ai";

const UploadLoading = () => {
  const [imageUrl, setImageUrl] = useRecoilState(UploadedImgAtom);
  const [imgNum, setImgNum] = useRecoilState(UploadedImgNumAtom);
  const [tags, setTags] = useRecoilState(ExportedTagsAtom);

  return (
    <div className="h-screen bg-gray-100">
      <NavBar />
      <Wrapper className="flex flex-col justify-center h-full">
        <div className="flex flex-col items-center self-stretch bg-gray-100 ">
          <div
            className="flex flex-col items-center justify-center w-[52.5rem] pt-[0.75rem] pr-[1.5rem] pb-[1.25rem] pl-[1.5rem] rounded-xl border border-gray-100 bg-white"
            style={{ boxShadow: "0px 4px 8px 0px rgba(0, 0, 0, 0.16)" }}
          >
            <div className="flex h-[3.75rem] justify-start items-center self-stretch">
              <p className="text-[1.5rem]  font-semibold leading-normal tracking-tight">
                분석
              </p>
              {/* <AiOutlineClose className="leading-normal text-gray-400 text-1xl font-xeicon" /> */}
            </div>
            <div className="flex p-[3.75rem] justify-between items-center self-stretch border-b border-gray-900">
              <div className="relative flex items-center justify-center gap-4 w-[14.5rem] h-[14.5rem] flex-shrink-0 rounded-md border border-gray-100 bg-gray-50">
                <Image
                  src={imageUrl[0]}
                  alt="Image description"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
              <div className="flex items-start content-start gap-y-[0.5rem] gap-x-[0.25rem] h-[14.5rem] py-[0.5rem] px-1 justify-center flex-wrap">
                태그들
              </div>
              <div className="flex flex-col w-[14.5rem] h-[14.5rem] justify-center shrink-0 text-gray-900 text-center text-2xl font-semibold leading-6 tracking-tighter">
                추출 태그
              </div>
            </div>
            <div className="flex justify-center items-end h-[2.5rem] gap-[0.25rem] self-stretch rounded-[36px]">
              <BiLoader className="text-blue-500 text-[1.25rem] font-xeicon leading-normal" />
              <p className="text-gray-900 text-[0.875rem] font-semibold leading-tight tracking-tighter">
                {imgNum}개의 스크린샷을 분석중입니다...
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center self-stretch gap-2 p-8">
          <p className="text-base font-light leading-6 tracking-tighter text-gray-800">
            갤러리 속 숨겨진 인사이트를 발견하세요
          </p>
          <p className="flex items-center justify-center w-[8.03944rem] h-5">
            insightLINK
          </p>
        </div>
      </Wrapper>
    </div>
  );
};

export default UploadLoading;
