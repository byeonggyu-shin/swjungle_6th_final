import { useState } from "react";
import { GET } from "@/axios/GET";
// Components
import User from "./User";
// Assets
import { AiOutlineReload } from "react-icons/ai";

const Onboarding = () => {
  const [users, setUsers] = useState<any[]>([]);

  const getUsers = async () => {
    const data = await GET("social/user", true);
    if (data.status === 200) {
      setUsers(data.data);
    }
  };
  return (
    <div className="flex py-[3.75rem] flex-col items-start gap-8 flex-1">
      <div
        className="flex flex-col self-stretch text-gray-900 text-xl font-kanit font-semibold leading-1.5 tracking-tighter"
        style={{ whiteSpace: "pre-line" }}
      >
        <p>More friends, more insights.</p>
        <p>Find someone to share your interests</p>
      </div>
      <div className="flex justify-end items-center gap-1">
        <div className="flex w-7 h-7 flex-col justify-center items-center">
          <AiOutlineReload
            className="text-gray-800 text-base font-xeicon leading-normal cursor-pointer"
            onClick={getUsers}
          />
        </div>
        <p className="flex flex-col self-stretch text-gray-900 text-lg font-kanit font-light leading-6">
          Refresh
        </p>
      </div>
      <ul className="flex items-start content-start gap-3 self-stretch flex-wrap">
        <User />
      </ul>
    </div>
  );
};

export default Onboarding;
