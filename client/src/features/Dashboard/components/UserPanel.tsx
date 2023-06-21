import React, { useState } from "react";
import UserInfo from "./UseInfo";
import SearchBar from "./SearchBar";
// Assets
import { BsCamera } from "react-icons/bs";

export default function UserPanel({
  setShowImgModal,
  editMode,
  setEditMode,
}: any) {
  return (
    <>
      <div className="flex justify-between w-full">
        <UserInfo />
        <div className="flex">
          {editMode ? (
            <p onClick={() => setEditMode(false)}>수정 완료</p>
          ) : (
            <p onClick={() => setEditMode(true)}>그래프 수정</p>
          )}
          <BsCamera size={30} onClick={() => setShowImgModal(true)} />
          <SearchBar />
        </div>
      </div>
    </>
  );
}
