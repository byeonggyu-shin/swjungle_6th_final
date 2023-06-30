import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

import getToken from "@/axios/getToken";
import { GET } from "@/axios/GET";
import { POST } from "@/axios/POST";
import { DELETE } from "@/axios/DELETE";
// Assets
import { AiOutlinePlus, AiOutlineReload } from "react-icons/ai";

const randomColors = [
  "#EE6565",
  "#FB8351",
  "#FAC858",
  "#91CB75",
  "#3AA272",
  "#73C0DE",
  "#5470C6",
  "#9A60B4",
  "#FFC0CB",
];

const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
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

  // 팔로잉 등록
  const handleAddFollow = async (userId: number) => {
    await POST(`social/follow?followId=${userId}`, null, true);
    getUsers();
  };

  // 팔로잉 취소
  const handleDeleteFollow = async (userId: number) => {
    await DELETE(`social/follow?followId=${userId}`, true);
    getUsers();
  };

  const handleClick = (userid: number) => {
    router.push(`/dashboard/${userid}`);
  };

  return (
    <div className="w-[20rem] py-[3.75rem] flex-col items-start space-y-6 self-stretch">
      <div className="flex justify-between items-center self-stretch">
        <p className="text-gray-900 text-2xl font-kanit font-semibold leading-6 tracking-tight">
          Connect more...
        </p>
        <div className="flex w-7 h-7 flex-col justify-center items-center">
          <AiOutlineReload
            className="text-gray-800 text-base font-xeicon leading-normal"
            onClick={() => getUsers()}
          />
        </div>
      </div>
      <ul className="flex flex-col items-start gap-3 self-stretch">
        {users &&
          users.map((u) => (
            <li
              key={u.userId}
              className="flex p-4 justify-between items-center self-stretch rounded border border-gray-100 bg-white"
            >
              <div className="flex flex-col justify-center items-start gap-2 flex-1">
                <div className="flex justify-between items-center self-stretch">
                  <div className="flex justify-center items-center gap-6">
                    <img
                      src={u.img}
                      className="w-[2rem] h-[2rem] rounded-full cursor-pointer"
                      alt="profile"
                      onClick={() => {
                        handleClick(u.userId);
                      }}
                    />
                    <p
                      className="text-gray-900 text-lg font-kanit leading-normal tracking-wide"
                      onClick={() => {
                        handleClick(u.userId);
                      }}
                    >
                      {u.userName}
                    </p>
                  </div>
                  <div className="flex w-7 h-7 flex-col justify-center items-center cursor-pointer">
                    <AiOutlinePlus
                      className="text-gray-800 text-base font-xeicon leading-normal"
                      onClick={() => handleAddFollow(u.userId)}
                    />
                  </div>
                </div>
                <ul className="flex items-start content-start gap-2 self-stretch flex-wrap">
                  {u.tags.map((t: string, index: number) => (
                    <li
                      key={index}
                      className="flex h-[2.25rem] px-4 justify-center items-center rounded"
                      style={{
                        backgroundColor:
                          randomColors[
                            Math.floor(Math.random() * randomColors.length)
                          ],
                      }}
                    >
                      <p className="text-white text-xl font-kanit font-semibold leading-6 tracking-wider">
                        #{t}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Users;
