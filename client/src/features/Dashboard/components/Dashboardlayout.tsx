import React, { ReactNode } from "react";
import Link from "next/link";
// recoil
import { useRecoilValue } from "recoil";
import { DashBoardCardAtom, ImgModalAtom } from "@/recoil/atoms/MainGraphAtom";
import { IsLoginAtom } from "@/recoil/atoms/LoginStateAtom";
// Component
import NavBar from "@/features/Header/NavBar";
import UserPanel from "@/features/Dashboard/UserPanal/UserPanel";
import CardPanel from "@/features/Dashboard/MainCard/components/CardPanel";
import ImageUpload from "@/features/ImageUpload/ImageUpload";
import NeedLogin from "@/features/Dashboard/components/NeedLogin";

import MainGraph from "@/features/Dashboard/MainGraph/components/MainGraph/MainGraph";
import useGraph from "@/features/Dashboard/MainGraph/hooks/useGraph";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const openCard = useRecoilValue(DashBoardCardAtom);
  const showImgModal = useRecoilValue(ImgModalAtom);
  const isLogin = useRecoilValue(IsLoginAtom);

  let token: any;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token");
  }

  const graphData = useGraph();

  return (
    <>
      {token ? (
        <div className="h-screen max-w-[75rem] mx-auto max-md:px-4">
          <NavBar />
          <div className="max-w-[75rem] flex flex-col items-center justify-between m-auto">
            <UserPanel />
            <div className="flex flex-row justify-between w-full">
              <>
                {children}
                {openCard && token ? (
                  <CardPanel />
                ) : isLogin ? (
                  <></>
                ) : (
                  <>
                    <Link
                      href={{
                        pathname: "/",
                      }}
                      className="flex flex-col self-stretch text-2xl font-bold tracking-tighter text-center font-ibm-plex-sans leading-150"
                    >
                      insightLINK
                    </Link>
                  </>
                )}
              </>
            </div>
          </div>
          {showImgModal && <ImageUpload />}
        </div>
      ) : (
        <>
        <MainGraph data={graphData} />
        <NeedLogin />
        </>
      )}
    </>
  );
}
