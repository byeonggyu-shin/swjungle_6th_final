import axios from "axios";
import {
  Main_graph_Api_DTO,
  CardData_DTO,
  CardDetail_DTO,
} from "@/types/dashborad.types";

const api = "http://localhost:8800/api";
const testapi = "http://localhost:4000";

export const Main_graph_Api = async (
  userid?: string
): Promise<Main_graph_Api_DTO> => {
  console.log("api", userid);
  let url = `${api}/graph`;
  if (userid) {
    url += `?userId=${userid}`;
  }
  console.log("url check 1", url);

  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  const graph = response.data as Main_graph_Api_DTO;

  console.log("url check 2", url);

  return graph;
};

export const User_Info_Api = async () => {
  const response = await axios.get(`${api}/user`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  const userData = response.data;
  console.log("User_Info_Api 호출");
  return userData;
};

export const Card_Info_Api = async (
  params: string | null
): Promise<CardData_DTO> => {
  const response = await axios.get(`${api}/cards/tag?tagname=${params}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  const card = response.data as Promise<CardData_DTO>;
  console.log("Card_Info_Api 호출");
  return card;
};

export const Card_Detail_Api = async (
  params: number | null
): Promise<CardDetail_DTO> => {
  const response = await axios.get(`${api}/cards/info?cardId=${params}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  const card = response.data as Promise<CardDetail_DTO>;
  console.log("Card_Detail_Api 호출");
  return card;
};

// export const Search_api = async (params: string | undefined) => {
//   try {
//     const response = await axios.post();
//     return response;
//   } catch (error) {
//     console.log(error);
//   }
// }
