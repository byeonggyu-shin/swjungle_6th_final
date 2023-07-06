import React from "react";
// Recoil
import { useRecoilValue } from "recoil";
import { DashBoardCardAtom, EditModeAtom } from "@/recoil/atoms/MainGraphAtom";
// Componenets
import Graph from "@/features/Dashboard/MainGraph/components/Graph/Graph";

function MainGraph({ data }: any) {
  const openCard = useRecoilValue(DashBoardCardAtom);
  const editMode = useRecoilValue(EditModeAtom);

  return (
    <div className={openCard ? "w-[42rem]" : "w-full relative"}>
      <Graph data={data} editMode={editMode} />
    </div>
  );
}

export default MainGraph;
