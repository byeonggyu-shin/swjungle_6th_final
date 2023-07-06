import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

import { POST } from "@/axios/POST";
import { BiArrowBack } from "react-icons/bi";

export default function Home() {
  const router = useRouter();

  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [passwordMatchError, setPasswordMatchError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [emailFormatError, setEmailFormatError] = useState(false);
  const [checkUserEmail, setCheckUserEmail] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      router.push('/dashboard');
    }
  }, []);

  const doUserRegistration = async (res: any) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/;

    // Validate email format
    if (!emailRegex.test(userEmail)) {
      setEmailFormatError(true);
      setPasswordMatchError(false);
      setPasswordError(false);
      setCheckUserEmail(false); // Reset checkUserEmail state
      return;
    } else {
      setEmailFormatError(false);
    }

    // Validate password format
    // if (!passwordRegex.test(password)) {
    //   setPasswordError(true);
    //   setEmailFormatError(false);
    //   setPasswordMatchError(false);
    //   setCheckUserEmail(false); // Reset checkUserEmail state
    //   return;
    // } else {
    //   setPasswordError(false);
    // }

    // Validate password match
    if (password !== confirmPassword) {
      setPasswordMatchError(true);
      setEmailFormatError(false);
      setPasswordError(false);
      setCheckUserEmail(false); // Reset checkUserEmail state
      return;
    } else {
      setPasswordMatchError(false);
    }

    const response: any = await POST(
      "signup",
      {
        email: userEmail,
        name: userName,
        password: password,
      },
      false
    );

    if (response.data.success) {
      alert(`안녕하세요, ${userName}님! 인사이트를 발견하세요!`);
      setUserEmail("");
      setPassword("");
      setConfirmPassword("");
      setUserName("");
      router.push("/login");
    } else {
      setCheckUserEmail(true);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      router.replace("/dashboard");
    }
  }, []);

  const handleBackClick = () => {
    router.push("/");
  };

  const handleClick = () => {
    router.push("/login");
  };

  return (
    <div className="flex flex-col items-center h-screen w-screen bg-gray-50">
      <div className="flex h-24 px-20 justify-between items-center shrink-0 self-stretch bg-white">
        <div className="flex items-center gap-6 " onClick={handleBackClick}>
          <BiArrowBack className="text-gray-900 text-2xl font-xeicon font-normal leading-100" />
          <p>insightLINK</p>
        </div>
      </div>
      <div className="flex w-[36.25rem] py-12 flex-col justify-center items-center gap-10 bg-white mt-24 rounded-lg border border-gray-100 shadow-md">
        <p className="flex flex-col self-stretch text-black text-center text-2xl font-ibm-plex-sans font-bold leading-150 tracking-tighter">
          회원 가입
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
          {emailFormatError && (
            <div className="text-red-500 text-right">
              이메일 형식이 아닙니다.
            </div>
          )}
          {checkUserEmail && (
            <div className="text-red-500 text-right">
              이미 회원가입한 이메일입니다.
            </div>
          )}
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
          <div className="flex w-25 h-3.75 p-0.25 justify-between items-center border-b-[1px] border-gray-900">
            <input
              id="confirmPassword"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="비밀번호 확인"
              type="password"
              className=" text-gray-400 text-1.75xl font-ibm-plex-sans font-normal font-medium leading-normal"
            />
          </div>
          {passwordMatchError && (
            <div className="text-red-500 text-right">
              비밀번호가 일치하지 않습니다.
            </div>
          )}
          {passwordError && (
            <div className="text-red-500 text-right">
              비밀번호는 문자(대문자 또는 소문자)와 숫자의 조합을 최소 5자
              이상이여야 합니다.
            </div>
          )}
          <div className="flex w-25 h-3.75 p-0.25 justify-between items-center border-b-[1px] border-gray-900">
            <input
              id="userName"
              value={userName}
              onChange={(event) => setUserName(event.target.value)}
              placeholder="닉네임 입력"
              className=" text-gray-400 text-1.75xl font-ibm-plex-sans font-normal font-medium leading-normal"
            />
          </div>
          <div className="flex flex-col justify-center items-center gap-6">
            <div
              onClick={doUserRegistration}
              className="flex h-[3.375rem] px-7 justify-center items-center gap-2 rounded bg-gray-900 cursor-pointer"
            >
              <p className="text-white text-1.5xl font-ibm-plex-sans font-normal font-semibold leading-normal tracking-wide cursor-pointer">
                가입하기
              </p>
            </div>
            <p
              className="text-gray-700 text-1.5xl font-ibm-plex-sans font-normal font-medium leading-normal cursor-pointer"
              onClick={handleClick}
            >
              로그인
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
