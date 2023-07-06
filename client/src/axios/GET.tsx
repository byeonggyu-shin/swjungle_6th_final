import axios, { AxiosResponse } from "axios";
import getToken from "./getToken";

export const GET = async (
  uri: string,
  headers: boolean
): Promise<any | null> => {
  try {
    let res: AxiosResponse;
    if (headers) {
      const token = getToken();
      res = await axios.get(`/api/${uri}`, token);
    } else {
      res = await axios.get(`/api/${uri}`);
    }
    console.log(`${uri} - GET 성공`);
    return res;
  } catch (err) {
    console.log(`${uri} - GET 실패`, err);
    return err;
  }
};
