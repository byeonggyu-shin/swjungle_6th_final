import React, { useEffect, useState } from "react";

import axios from "axios";
import { GET } from "@/axios/GET";
// Components
import LogoutBtn from "./LogoutBtn";

import SwitchToggle from "./SwithToggle";
import WithdrawalBtn from "./WithdrawalBtn";
// Assets
import { AiFillEdit, AiOutlineCheck, AiOutlineClose } from "react-icons/ai";
import getToken from "@/axios/getToken";
import { PATCH } from "@/axios/PATCH";

type UserModalProps = {
  closeModal: () => void;
};

const UserModal: React.FC<UserModalProps> = ({ closeModal }) => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [editedNickname, setEditedNickname] = useState<string>("");
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const token = getToken();

  const fetchUserInfo = async () => {
    try {
      const response = await GET("myinfo", true);
      console.log(response);
      if (response.data.success) {
        console.log(response.data.userInfo);
        setUserInfo(response.data.userInfo);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  useEffect(() => {
    fetchUserInfo();
  }, [isEditingNickname]);

  const handleNicknameEdit = (name: string) => {
    setIsEditingNickname(true);
    setEditedNickname(name);
  };

  const handleNicknameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditedNickname(event.target.value);
  };

  const handleNicknameSave = async () => {
    try {
      const response = await PATCH(
        "myinfo",
        {
          editedNickname: editedNickname,
        },
        true
      );

      if (response.data.success) {
        setIsEditingNickname(false);
        console.log(isEditingNickname);
      }
      console.log("Save edited nickname:", editedNickname);
    } catch (error) {
      console.error("Error saving the edited nickname:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed flex w-[37.5rem] pt-3 pr-6 pb-5 pl-6 flex-col items-start rounded-lg border border-gray-200 bg-white shadow-md z-50">
        <div className="flex h-[3.75rem] justify-between items-center self-stretch">
          <h2 className="text-3xl font-semibold leading-6 tracking-tighter text-gray-900 font-kanit">
            Account
          </h2>
          <AiOutlineClose
            onClick={closeModal}
            className="text-base leading-normal text-gray-400 font-xeicon"
          />
        </div>
        <div className="flex py-[2rem] items-start self-stretch border-b-2 border-gray-900">
          <p className="flex flex-col w-40 text-xl font-semibold leading-6 tracking-tighter text-gray-900 font-kanit">
            My Profile
          </p>
          <div className="flex items-center gap-3">
            <img
              src={userInfo?.image as string}
              alt="Profile"
              className="rounded-full w-[4rem] h-[4rem]"
            />
            {isEditingNickname ? (
              <div className="flex w-[12.5rem] h-11 px-1 justify-between items-center border-b border-blue-500 bg-gray-200">
                <input
                  type="text"
                  value={editedNickname}
                  onChange={handleNicknameChange}
                  className="flex items-center flex-1 gap-2 text-lg font-light leading-6 text-gray-900 bg-gray-200 font-kanit"
                />
              </div>
            ) : (
              <div className="flex w-[12.5rem] h-11 px-1 justify-between items-center">
                <p className="text-lg font-light leading-6 text-gray-900 font-kanit">
                  {userInfo?.name}
                </p>
              </div>
            )}
            {isEditingNickname ? (
              <button
                onClick={handleNicknameSave}
                className="flex items-center gap-[0.375rem]"
              >
                <AiOutlineCheck className="flex items-center gap-[0.375rem] text-colorBlue" />
                <p className="text-xl leading-normal tracking-tight text-colorBlue font-kanit">
                  Done
                </p>
              </button>
            ) : (
              <button
                onClick={() => handleNicknameEdit(userInfo?.name)}
                className="flex items-center gap-[0.375rem]"
              >
                <AiFillEdit
                  className="flex items-center gap-[0.375rem] text-colorBlue"
                  onClick={() => handleNicknameEdit(userInfo?.name)}
                />
                <p className="text-xl leading-normal tracking-tight text-colorBlue font-kanit">
                  Edit
                </p>
              </button>
            )}
          </div>
        </div>
        <div className="flex items-start self-stretch border-b-2 border-gray-900 py-7">
          <p className="flex flex-col w-40 text-xl font-semibold leading-6 tracking-tighter text-gray-900 font-kanit">
            Notification
          </p>
          <div className="flex flex-col items-start gap-3">
            <SwitchToggle text="Desktop notification" />
            <SwitchToggle text="Connect to Slack" />
          </div>
        </div>
        <div className="flex items-start self-stretch py-7">
          <p className="flex flex-col w-40 text-xl font-semibold leading-6 tracking-tighter text-gray-900 font-kanit">
            Setting
          </p>
          <div className="flex flex-col items-start gap-4">
            <LogoutBtn />
            <WithdrawalBtn userInfo={userInfo} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
