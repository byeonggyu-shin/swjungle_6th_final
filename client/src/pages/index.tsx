import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import { POST } from "@/axios/POST";

// recoil
import { useSetRecoilState } from "recoil";
import { LoginStateAtom } from "@/recoil/atoms/LoginStateAtom";

import SignupButton from "@/features/User/SignupButton";
import LoginBtn from "@/features/User/LoginBtn";

export default function Home() {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);

  const setLoginId = useSetRecoilState(LoginStateAtom);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
    localStorage.theme = "light";
  }, [token]);

  return (
    <div className="max-w-[75rem] mx-auto">
      <div className="flex justify-center mt-20">
        <div className="text-center">
          <p className="mt-20 text-2xl">
            갤러리 속 숨겨진 인사이트를 이어주는 아카이브
          </p>
          <p className="mt-10 mb-32 font-bold text-8xl">insightLINK</p>
          <div className="flex justify-between h-11">
            {!token ? <SignupButton /> : null}
            {!token ? <LoginBtn /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
