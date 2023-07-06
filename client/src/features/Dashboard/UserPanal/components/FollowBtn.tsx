import React, { useState } from "react";
import { useRouter } from "next/router";
import { Add_Follow_API, Cancel_Follow_API } from "@/axios/dashBoardApi";

import { BiPlus, BiMinus } from "react-icons/bi";

interface FollowBtnProps {
  follow: boolean | undefined;
}

export default function FollowBtn({ follow }: FollowBtnProps) {
  const [isFollow, setIsFollow] = useState(follow);
  const router = useRouter();

  const handleAddFollow = async () => {
    const userid = Array.isArray(router.query.userid)
      ? router.query.userid[0]
      : router.query.userid;

    const addFriend = await Add_Follow_API(userid);
    setIsFollow(true);
    return;
  };

  const handleCancelFollow = async () => {
    const userid = Array.isArray(router.query.userid)
      ? router.query.userid[0]
      : router.query.userid;

    const CancelFriend = await Cancel_Follow_API(userid);
    setIsFollow(false);
    return;
  };

  return (
    <>
      {isFollow ? (
        <button
          onClick={handleCancelFollow}
          className="cursor-pointer follow-btn"
        >
          <BiMinus className="mr-1" />
          팔로우 취소
        </button>
      ) : (
        <button onClick={handleAddFollow} className="cursor-pointer follow-btn">
          <BiPlus className="mr-1" /> 팔로우
        </button>
      )}
    </>
  );
}
