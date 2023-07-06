import AWS from "aws-sdk";

import resizeImage from "./ResizeImage";

const UploadImagesToS3 = async (imgList: ImgInfo[]) => {
  const promises = imgList.map((file: ImgInfo) => {
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
  return uploadedImageUrls;
};

export default UploadImagesToS3;
