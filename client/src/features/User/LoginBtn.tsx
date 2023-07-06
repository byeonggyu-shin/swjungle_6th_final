import React from "react";
import { useRouter } from "next/router";

const LoginBtn: React.FC = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push("/login");
  };

  return (
    <div className="flex flex-col justify-center items-center gap-6">
      <div
        onClick={handleClick}
        className="flex h-[3.375rem] px-7 justify-center items-center gap-2 rounded bg-gray-900 cursor-pointer"
      >
        <p className="text-white text-1.5xl font-ibm-plex-sans font-normal font-semibold leading-normal tracking-wide cursor-pointer">
          로그인하기
        </p>
      </div>
    </div>
  );
};

export default LoginBtn;
