import axios, { AxiosResponse } from "axios";
import getToken from "./getToken";

export const POST = async (uri: string, data: any, headers: boolean) => {
  try {
    let res: AxiosResponse;
    if (headers) {
      const token = getToken();
      res = await axios.post(`http://localhost:8800/api/${uri}`, data, token);
    } else {
      res = await axios.post(`http://localhost:8800/api/${uri}`, data);
    }
    console.log(`${uri} - POST 성공`);
    return res;
  } catch (err) {
    console.log(`${uri} - POST 실패`, err);
    return err;
  }
};
