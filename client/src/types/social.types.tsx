export interface Friends {
  cardId: number;
  userId: number;
  userName: string;
  profile_img: string;
}

export interface Cards {
  cardId: number;
  content: string;
  img: string;
  tag: string;
  userId: number;
  userName: string;
}

export interface CardDetail {
  cardId: number;
  userId: number;
}

export interface User {
  userId: number;
  img: string;
  userName: string;
  tags: string[];
}
