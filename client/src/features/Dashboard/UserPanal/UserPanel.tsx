import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
// recoil
import { useRecoilState, useRecoilValue } from "recoil";
import { FollowCntAtom, LoginStateAtom } from "@/recoil/atoms/LoginStateAtom";

// components
import UserInfo from "@/features/Dashboard/UserPanal/components/UserInfo";
import SearchBar from "@/features/Dashboard/UserPanal/components/SearchBar";
import GraphEditBtn from "@/features/Dashboard/UserPanal/components/GraphEditBtn";

import { User_Info_Api } from "@/axios/dashBoardApi";
// types
import { UserInfo_DTO } from "@/types/dashborad.types";

export default function UserPanel() {
  const [userInfo, setUserInfo] = useState<UserInfo_DTO>();
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const loginId = useRecoilValue(LoginStateAtom);
  const [followCnt, setFollowCnt] = useRecoilState(FollowCntAtom);
  const router = useRouter();

  useEffect(() => {
    const getUserInfoData = async () => {
      const userid = Array.isArray(router.query.userid)
        ? router.query.userid[0]
        : router.query.userid;

      const response = await User_Info_Api(userid);
      setUserInfo(response);
      setFollowCnt(response.followCnt);
      if (userid) {
        if (loginId == userid) {
          setIsLogin(true);
        } else {
          setIsLogin(false);
        }
      } else {
        setIsLogin(true);
      }
    };
    getUserInfoData();
  }, []);

  console.log("로그인", isLogin);
  return (
    <>
      <div className="flex justify-between w-full mb-[1rem] max-md:flex-col">
        <UserInfo userInfo={userInfo} isLogin={isLogin} />
        <div className="flex items-end justify-end w-full max-md:justify-center">
          <SearchBar userInfo={userInfo} isLogin={isLogin} />
        </div>
      </div>
      {isLogin ? (
        <div className="flex justify-start w-full mb-[1rem]">
          <GraphEditBtn />
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
