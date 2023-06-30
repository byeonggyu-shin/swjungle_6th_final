import axios, { AxiosResponse } from "axios";
import getToken from "./getToken";

export const PATCH = async (uri: string, data: any, headers: boolean) => {
  try {
    let res: AxiosResponse;
    if (headers) {
      const token = getToken();
      res = await axios.patch(`http://localhost:8800/api/${uri}`, data, token);
    } else {
      res = await axios.patch(`http://localhost:8800/api/${uri}`, data);
    }
    console.log(`${uri} - PATCH 성공`);
    return res;
  } catch (err) {
    console.log(`${uri} - PATCH 실패`, err);
    return err;
  }
};
