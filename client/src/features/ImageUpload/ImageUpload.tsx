import React, { useRef, useState } from "react";
// recoil
import { UploadingAtom } from "@/recoil/atoms/MainGraphAtom";
import AWS from "aws-sdk";

import getToken from "@/axios/getToken";
import { POST } from "@/axios/POST";
import ImageList from "@/features/ImageUpload/ImgList";
// Recoil
import { useRecoilState } from "recoil";
import {
  ExportedTagsAtom,
  ImgModalAtom,
  UploadedImgAtom,
  UploadedImgNumAtom,
  ImgUpLoadAtom,
} from "@/recoil/atoms/MainGraphAtom";
// Assets
import { BiLoader } from "react-icons/bi";
import {
  AiOutlineCheck,
  AiOutlineClose,
  AiOutlineUpload,
} from "react-icons/ai";

type ImgInfo = {
  blob: Blob;
  name: string;
  size: number;
  type: string;
};

export default function ImageUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // const modalRef = useRef<HTMLDivElement>(null);
  const [imgList, setImgList] = useState<ImgInfo[]>([]);
  const [tags, setTags] = useRecoilState(ExportedTagsAtom);
  const [imageUrl, setImageUrl] = useRecoilState(UploadedImgAtom);
  const [imgNum, setImgNum] = useRecoilState(UploadedImgNumAtom);
  const [showImgModal, setShowImgModal] = useRecoilState(ImgModalAtom);
  const [uploading, setUploading] = useRecoilState(UploadingAtom);

  const [imgUpLoad, setImgUpLoad] = useRecoilState(ImgUpLoadAtom);

  const handleInput = () => {
    fileInputRef.current?.click();
  };

  // image input 받기
  const handleImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedImg = e.target.files;
    if (!selectedImg) {
      e.preventDefault();
      return;
    }
    const selectedImgArray = Array.from(selectedImg).map((file) => {
      const blob = new Blob([file], { type: file.type });
      return { name: file.name, type: file.type, size: file.size, blob };
    });
    setImgList(selectedImgArray);
    setImgNum(selectedImgArray.length);
  };

  const deleteImg = (selectedIndex: number) => {
    const newImgList = imgList.filter((_, index) => index !== selectedIndex);
    setImgList(newImgList);
    setImgNum(newImgList.length);
  };

  if (process.env.S3_ACCESS_KEY && process.env.S3_SECRET_KEY) {
    AWS.config.update({
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
      },
      region: "ap-northeast-2",
      signatureVersion: "2023-06-23",
    });
  }

  const resizeImage = (image: Blob, width: number): Promise<Blob> => {
    return new Promise<Blob>((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(image);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (ctx) {
          const aspectRatio = img.width / img.height;
          const height = width / aspectRatio;

          canvas.width = width;
          canvas.height = height;

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (resizedBlob) => {
              if (resizedBlob) {
                resolve(resizedBlob);
              } else {
                reject(new Error("이미지 리사이징 실패"));
              }
            },
            "image/jpeg",
            0.9
          );
        } else {
          reject(new Error("캔버스 컨텍스트 가져오기 실패"));
        }
      };

      img.onerror = () => {
        reject(new Error("이미지 로딩 실패"));
      };
    });
  };

  const uploadImages = async () => {
    setShowImgModal(false);
    const startTime = performance.now();
    try {
      const promises = imgList.map((file) => {
        return new Promise<string>((resolve, reject) => {
          const { blob } = file;
          const fileName = `${Date.now()}.${file.name}`;

          // 이미지 리사이징
          const width = 400;
          resizeImage(blob, width)
            .then((resizedBlob) => {
              console.log("원본 Image Size:", blob.size);
              console.log("Resized Image Size:", resizedBlob.size);

              // 리사이즈된 이미지 업로드
              const s3 = new AWS.S3();
              s3.upload(
                {
                  Bucket: "sw-jungle-s3",
                  Key: fileName,
                  Body: resizedBlob,
                  ContentType: file.type,
                },
                (
                  uploadError: Error | null,
                  data: AWS.S3.ManagedUpload.SendData
                ) => {
                  if (uploadError) {
                    reject(uploadError);
                  } else if (data && data.Location) {
                    resolve(data.Location);
                  } else {
                    reject(new Error("이미지 업로드 실패 - S3"));
                  }
                }
              );
            })
            .catch((error) => {
              reject(error);
            });
        });
      });

      const uploadedImageUrls = await Promise.all(promises);
      setImageUrl(uploadedImageUrls);

      const POSTImgLink = async () => {
        const data = await POST("upload", uploadedImageUrls, true);

        const endTime = performance.now();
        const executionTime = endTime - startTime;
        console.log("Execution time:", executionTime, "ms");

        if (data.status === 200) {
          setUploading(false);
          setImgUpLoad(!imgUpLoad);
        }
      };

      POSTImgLink();
    } catch (error) {
      console.error("이미지 업로드 실패", error);
    }
  };

  // const modalOutsideClicked = (e: React.MouseEvent<HTMLDivElement>) => {
  //   if (modalRef.current === e.target) {
  //     setShowImgModal(false);
  //   }
  // };

  return (
    <div
      className="fixed flex flex-col items-start p-3 bg-white border border-gray-300 shadow-md rounded-xl bottom-2 right-2"
      style={{ width: "22.5rem", height: "30rem" }}
    >
      <div
        className="flex items-center self-stretch justify-between flex-shrink-0"
        style={{
          height: "3.75rem",
          background: "#FFF",
        }}
      >
        <div className="flex items-center gap-2">
          <p
            className="text-lg font-semibold leading-6"
            style={{
              color: "#181818",
              fontFamily: "IBM Plex Sans",
              letterSpacing: "-0.0125rem",
            }}
          >
            스크린샷 업로드
          </p>
          <BiLoader
            className="text-base leading-none"
            style={{ fontFamily: "xeicon" }}
          />
          <p
            className="text-sm font-light leading-7"
            style={{
              color: "#181818",
              fontFamily: "IBM Plex Sans",
              letterSpacing: "-0.02625rem",
            }}
          >
            {imgNum} ...
          </p>
        </div>
        <div className="flex items-start gap-3">
          {/* <FiMinimize2
            className="text-lg leading-none"
            style={{
              color: "#A1A1A1",
              fontFamily: "xeicon",
            }}
          /> */}
          <AiOutlineClose
            className="text-lg leading-none cursor-pointer"
            style={{
              color: "#A1A1A1",
              fontFamily: "xeicon",
            }}
            onClick={() => setShowImgModal(false)}
          />
        </div>
      </div>
      <ImageList imgList={imgList} deleteImg={deleteImg} />
      <div
        className="flex items-center self-stretch justify-end flex-shrink-0 bg-white"
        style={{
          height: "3.75rem",
          borderTop: "1px solid #DADADA",
          background: "#FFF",
        }}
      >
        <div className="flex items-start gap-2">
          <div
            onClick={() => {
              setUploading(true);
              uploadImages();
            }}
            className="flex items-center justify-center h-10 gap-1 px-4 bg-white border-2 rounded cursor-pointer border-colorBlue"
          >
            <AiOutlineCheck
              style={{
                color: "var(--gray-900, #181818)",
                fontSize: "1rem",
                fontFamily: "xeicon",
                lineHeight: "100%",
              }}
            />
            <p
              className="text-xl font-semibold leading-none tracking-tight"
              style={{
                color: "var(--gray-900, #181818)",
                fontFamily: "Kanit",
                letterSpacing: "0.0225rem",
              }}
            >
              분석
            </p>
          </div>

          <input
            type="file"
            multiple
            accept=".jpg, .jpeg, .png"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImgChange}
          />
          <div
            onClick={handleInput}
            className="flex items-center justify-center h-10 gap-1 px-4 rounded cursor-pointer bg-colorBlue"
          >
            <AiOutlineUpload
              className="text-base leading-none text-white"
              style={{
                fontSize: "1rem",
                fontFamily: "xeicon",
                lineHeight: "100%",
              }}
            />
            <p
              className="text-xl font-semibold leading-none tracking-tight text-white"
              style={{
                fontSize: "1.125rem",
                fontFamily: "Kanit",
                fontWeight: 600,
                lineHeight: "100%",
                letterSpacing: "0.0225rem",
              }}
            >
              업로드
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
