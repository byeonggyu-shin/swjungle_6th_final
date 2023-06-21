export interface UserInfo {
  id: number;
  userName: string;
  tagCnt: number;
  cardCnt: number;
  followCnt: number;
}

interface GraphNode {
  id: number;
  name: string;
  symbolSize: number;
  category: number;
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

export interface CardData {
  cardId: number;
  cardTag: string[];
  cardContent: string;
}
export interface CardData_DTO {
  cardData: CardData[];
}

interface CardDetail {
  cardId?: number;
  cardTag?: string[];
  cardImage?: string;
}
export interface CardDetail_DTO {
  data: CardDetail[];
}
