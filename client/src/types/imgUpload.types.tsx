type ImageListProps = {
  imgList: Array<{ name: string; type: string; size: number }>;
  deleteImg: (index: number) => void;
};

type ImgInfo = {
  blob: Blob;
  name: string;
  size: number;
  type: string;
};
