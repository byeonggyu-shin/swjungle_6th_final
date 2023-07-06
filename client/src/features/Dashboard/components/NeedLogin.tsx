import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

import axios from "axios";

import LoginBtn from "@/features/User/LoginBtn";
import SignupButton from "@/features/User/SignupButton";

export default function NeedLogin() {
  const [userName, setUserName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const { userid } = router.query;

    if (userid) {
      // Axios request to fetch user name
      axios
        .get(`/api/share/info?userId=${userid}`)
        .then((response) => {
          // Assuming the response contains the user name in the 'userName' property
          setUserName(response.data.userName);
        })
        .catch((error) => {
          console.error("Error fetching user name:", error);
        });
    }
  }, [router.query]);

  const handleHomeClick = () => {
    router.push("/");
  };

  return (
    <div className="flex items-center justify-center">
      <div className="text-center">
        <div className="flex w-[36.25rem] py-12 flex-col justify-center items-center bg-white mt-2 mb-12 rounded-lg border border-gray-100 shadow-md">
          <div className="flex flex-col items-center justify-center gap-6">
            <p className="flex flex-col self-stretch text-2xl font-bold tracking-tighter text-center font-ibm-plex-sans leading-150">
              <span>
                <span style={{ color: "#9A60B4" }}>{userName}</span> 님의 상세
                정보를 보고 싶으시면,{" "}
              </span>
              <br />
              회원가입이나 로그인을 진행해주세요!{" "}
            </p>
            <LoginBtn />
            <SignupButton />
          </div>
        </div>
      </div>
    </div>
  );
}
