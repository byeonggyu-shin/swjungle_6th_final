import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { GET } from "@/axios/GET";
import { DELETE } from "@/axios/DELETE";
// Recoil
import { useRecoilState } from "recoil";
import { SocialUserAtom } from "@/recoil/atoms/SocialAtom";

import User from "./User";
// Assets
import { AiOutlineReload } from "react-icons/ai";

const Users = () => {
  const [users, setUsers] = useRecoilState(SocialUserAtom);
  const router = useRouter();

  // 추천 친구 조회
  const getUsers = async () => {
    const data = await GET("social/user", true);
    if (data.status === 200) {
      setUsers(data.data);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  // 팔로잉 취소
  const handleDeleteFollow = async (userId: number) => {
    await DELETE(`social/follow?followId=${userId}`, true);
    getUsers();
  };

  const handleRedirectToDashboard = (userid: number) => {
    router.push(`/dashboard/${userid}`);
  };

  const handleRedirectToSearch = (tag: string) => {
    router.push(`/search?search=${tag}`);
  };

  return (
    <div className="w-[20rem] py-[3.75rem] flex-col items-start space-y-6 self-stretch">
      <div className="flex items-center self-stretch justify-between">
        <p className="text-2xl font-semibold leading-6 tracking-tight text-gray-900">
          Connect more...
        </p>
        <div className="flex flex-col items-center justify-center w-7 h-7">
          <AiOutlineReload
            className="text-base leading-normal text-gray-800 cursor-pointer font-xeicon"
            onClick={() => getUsers()}
          />
        </div>
      </div>
      <ul className="flex flex-col items-start self-stretch gap-3">
        <User />
      </ul>
    </div>
  );
};

export default Users;
