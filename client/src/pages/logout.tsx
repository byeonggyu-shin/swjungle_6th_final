import React, { useEffect } from "react";
// Component
import NavBar from "../components/NavBar";
import LogoutButton from "../components/LogoutButton";

export default function Home() {
  useEffect(() => {
    async function loadGapi() {
      const { gapi } = await import('gapi-script');

      const clientId = process.env.GOOGLE_CLIENT_ID;
      // const clientId = '862985060268-bns768k2p01btrjkdk94f8hkrvqlt5d8.apps.googleusercontent.com';

      if (gapi && gapi.client) {
        await gapi.client.init({
          clientId,
          scope: ""
        });
      }
    }

    loadGapi();
  }, []);

  return (
    <div>
      <NavBar />
      <LogoutButton />
    </div>
  );
}
