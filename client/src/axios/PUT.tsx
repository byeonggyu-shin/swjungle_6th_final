import axios, { AxiosResponse } from "axios";
import getToken from "./getToken";

export const PUT = async (uri: string, data: any, headers: boolean) => {
  try {
    let res: AxiosResponse;
    if (headers) {
      const token = getToken();
      res = await axios.put(`/api/${uri}`, data, token);
    } else {
      res = await axios.put(`/api/${uri}`, data);
    }
    console.log(`${uri} - PUT 성공`);
    return res;
  } catch (err) {
    console.log(`${uri} - PUT 실패`, err);
    return err;
  }
};
