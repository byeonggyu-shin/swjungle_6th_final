import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
// recoil
import { useSetRecoilState } from "recoil";
import { LoginStateAtom, IsLoginAtom } from "@/recoil/atoms/LoginStateAtom";

import { POST } from "@/axios/POST";
import { BiArrowBack } from "react-icons/bi";

export default function Home() {
  const router = useRouter();

  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");

  const setLoginId = useSetRecoilState(LoginStateAtom);
  const setIsLogin = useSetRecoilState(IsLoginAtom);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      router.push("/dashboard");
    }
  }, []);

  const handleLogin = async () => {
    const response: any = await POST(
      "login/generic",
      {
        email: userEmail,
        password: password,
      },
      false
    );

    if (response.data.success) {
      alert(`다시 만나서 반가워요 : )`);
      const token = response.data.token;
      const userId = response.data.userId;

      setLoginId(userId);
      setIsLogin(true);

      localStorage.setItem("token", token);

      router.push("/dashboard");
    } else {
      alert("로그인 실패");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    }
  }, []);

  const handleBackClick = () => {
    router.push("/");
  };

  const handleClick = () => {
    router.push("/signup");
  };

  return (
    <div className="flex flex-col items-center w-screen h-screen">
      <div className="flex items-center self-stretch justify-between h-24 px-20 shrink-0">
        <div className="flex items-center gap-6">
          <BiArrowBack
            className="text-2xl font-normal text-gray-900 font-xeicon leading-100"
            onClick={handleBackClick}
          />
          <p>insightLINK</p>
        </div>
      </div>
      <div className="flex w-[36.25rem] py-12 flex-col justify-center items-center gap-10 bg-white mt-24 rounded-lg border border-gray-100 shadow-md">
        <p className="flex flex-col self-stretch text-2xl font-bold tracking-tighter text-center text-black font-ibm-plex-sans leading-150">
          로그인
        </p>

        <div className="flex flex-col items-center gap-8">
          <div className="flex w-25 h-3.75 p-0.25 justify-between items-center border-b-[1px] border-gray-900">
            <input
              id="email"
              value={userEmail}
              onChange={(event) => setUserEmail(event.target.value)}
              placeholder="이메일 입력"
              className=" text-gray-400 text-1.75xl font-ibm-plex-sans font-normal font-medium leading-normal"
            />
          </div>
          <div className="flex w-25 h-3.75 p-0.25 justify-between items-center border-b-[1px] border-gray-900">
            <input
              id="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="비밀번호 입력"
              type="password"
              className=" text-gray-400 text-1.75xl font-ibm-plex-sans font-normal font-medium leading-normal"
            />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-6">
          <div
            onClick={handleLogin}
            className="flex h-[3.375rem] px-7 justify-center items-center gap-2 rounded bg-gray-900 cursor-pointer"
          >
            <p className="text-white text-1.5xl font-ibm-plex-sans font-normal font-semibold leading-normal tracking-wide cursor-pointer">
              로그인하기
            </p>
          </div>
          <p
            className="text-gray-700 text-1.5xl font-ibm-plex-sans font-normal font-medium leading-normal cursor-pointer"
            onClick={handleClick}
          >
            회원 가입
          </p>
        </div>
      </div>
    </div>
  );
}
