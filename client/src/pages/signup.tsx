import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import NavBar from "@/features/Dashboard/components/NavBar";
import { POST } from "@/axios/POST";
// Component

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

    const response = await POST(
      "signup",
      {
        email: userEmail,
        name: userName,
        password: password,
      },
      false
    );

    if (response.data.success) {
      alert(`Success! User ${userName} was successfully created!`);
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
      // User is already logged in, redirect to another page
      router.replace("/dashboard");
    }
  }, []);

  return (
    <div>
      <NavBar />
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="container mx-auto max-w-md flex flex-col items-end">
          <div className="mb-4 flex items-center justify-end">
            <label
              className="block text-gray-700 text-sm font-bold mr-2"
              htmlFor="email"
            >
              이메일:
            </label>
            <div className="input-box ml-auto">
              <input
                id="email"
                value={userEmail}
                onChange={(event) => setUserEmail(event.target.value)}
                placeholder="이메일"
                className="form_input inline-block border border-gray-300 rounded px-2 py-1"
              />
            </div>
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
          <div className="mb-4 flex items-center justify-end">
            <label
              className="block text-gray-700 text-sm font-bold mr-2"
              htmlFor="password"
            >
              비밀번호:
            </label>
            <div className="input-box ml-auto">
              <input
                id="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="비밀번호"
                type="password"
                className="form_input inline-block border border-gray-300 rounded px-2 py-1"
              />
            </div>
          </div>
          <div className="mb-4 flex items-center justify-end">
            <label
              className="block text-gray-700 text-sm font-bold mr-2"
              htmlFor="confirmPassword"
            >
              비밀번호 확인:
            </label>
            <div className="input-box ml-auto">
              <input
                id="confirmPassword"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="비밀번호 확인"
                type="password"
                className="form_input inline-block border border-gray-300 rounded px-2 py-1"
              />
            </div>
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
          <div className="mb-4 flex items-center justify-end">
            <label
              className="block text-gray-700 text-sm font-bold mr-2"
              htmlFor="userName"
            >
              이름:
            </label>
            <div className="input-box ml-auto">
              <input
                id="userName"
                value={userName}
                onChange={(event) => setUserName(event.target.value)}
                placeholder="이름"
                className="form_input inline-block border border-gray-300 rounded px-2 py-1"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={doUserRegistration}
            className="bg-black text-white font-bold py-2 px-4 rounded"
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}
