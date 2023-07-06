export interface UserInfo_DTO {
  tagCnt: number;
  cardCnt: number;
  followCnt: number;
  userName: string;
  isFollow: boolean;
}

export interface GraphNode {
  id: number;
  name: string;
  symbolSize: number;
  category: number;
  label: any;
}

interface GraphLink {
  source: string;
  target: string;
}

export interface Main_graph_Api_DTO {
  nodes: GraphNode[];
  links: GraphLink[];
  cnt: number;
}

export interface FeedCardData {
  cardId: number;
  cardTag: string[];
  cardContent: string;
  cardImg: string;
  userId: number;
  userName: string;
  img: string;
  tag: string;
  content: string;
  isFriend: boolean;
}

export interface CardData {
  data: [FeedCardData];
  totalResults: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface CardDataDetail {
  userId: number;
  cardId: number;
  cardTag: string[];
  content: string;
  cardImage: string;
}

export interface CardDetail_DTO {
  cardId: number;
  cardTag: string[];
  cardContent: string;
  cardImage: string;
}
