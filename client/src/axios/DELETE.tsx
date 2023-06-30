import axios, { AxiosResponse } from "axios";
import getToken from "./getToken";

export const DELETE = async (
  uri: string,
  headers: boolean
): Promise<any | null> => {
  try {
    let res: AxiosResponse;
    if (headers) {
      const token = getToken();
      res = await axios.delete(`/api/${uri}`, token);
    } else {
      res = await axios.delete(`/api/${uri}`);
    }
    console.log("DELETE 성공");
    return res.data;
  } catch (err) {
    console.log("DELETE 실패", err);
    return err;
  }
};
