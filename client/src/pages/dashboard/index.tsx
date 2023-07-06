import React, { useEffect } from "react";
import { useRouter } from "next/router";

import { useRecoilState } from "recoil";
import { UploadingAtom } from "@/recoil/atoms/ImageUploadAtom";

// Component
import MainGraph from "@/features/Dashboard/MainGraph/components/MainGraph/MainGraph";
import UploadLoading from "@/features/Dashboard/MainGraph/components/Loading/UploadLoading";
import DashboardLayout from "@/features/Dashboard/components/Dashboardlayout";
import GraphLoading from "@/features/Dashboard/MainGraph/components/Loading/GraphLoading";
// Custom hook
import useGraph from "@/features/Dashboard/MainGraph/hooks/useGraph";

export default function Dashboard() {
  const router = useRouter();

  const [uploading, setUploading] = useRecoilState(UploadingAtom);
  const graphData = useGraph();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userid = router.query.userid;

    if (!token && !userid) {
      router.push("/");
    }
  }, []);

  return (
    <>
      {graphData ? (
        uploading ? (
          <UploadLoading />
        ) : (
          <DashboardLayout {...(<MainGraph data={graphData} />)}>
            <MainGraph data={graphData} />
          </DashboardLayout>
        )
      ) : (
        <GraphLoading />
      )}
    </>
  );
}
