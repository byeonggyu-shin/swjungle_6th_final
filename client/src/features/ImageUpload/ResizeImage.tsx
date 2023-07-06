import AWS from "aws-sdk";

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

export default resizeImage;
