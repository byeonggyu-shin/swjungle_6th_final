import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
// recoil
import { useSetRecoilState } from "recoil";
import { LoginStateAtom, IsLoginAtom } from "@/recoil/atoms/LoginStateAtom";
// Component
import { Wrapper } from "@/styles/wrapper";

export default function Home() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  const setLoginId = useSetRecoilState(LoginStateAtom);
  const setIsLogin = useSetRecoilState(IsLoginAtom);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      router.push("/");
    }
    setToken(storedToken);
  }, []);

  const handleLogout = () => {
    alert("Logout successful!");
    localStorage.removeItem("token");
    setLoginId(0);
    setIsLogin(false);
  };

  return (
    <Wrapper>
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="container flex flex-col items-end max-w-md mx-auto">
          {/* Updated class */}
        </div>
        <Link className="flex justify-end mt-4" href={"/"}>
          {token ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 mr-4 font-bold text-white bg-black rounded cursor-pointer"
            >
              로그아웃
            </button>
          ) : null}
        </Link>
      </div>
    </Wrapper>
  );
}
