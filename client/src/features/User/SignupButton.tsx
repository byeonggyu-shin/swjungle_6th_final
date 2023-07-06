import React from "react";
import { useRouter } from "next/router";

const SignupButton: React.FC = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push("/signup");
  };

  return (
    <p
      className="text-gray-700 text-1.5xl font-ibm-plex-sans font-normal font-medium leading-normal cursor-pointer"
      onClick={handleClick}
    >
      회원 가입
    </p>
  );
};

export default SignupButton;
