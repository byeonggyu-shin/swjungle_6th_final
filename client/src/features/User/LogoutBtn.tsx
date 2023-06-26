import React from 'react';
import { useRouter } from 'next/router';
// import { signOut } from "next-auth/react";

function LogoutBtn() {
  const router = useRouter();
  
  const logouthandler = () => {
    localStorage.removeItem('token');

    // Redirect to the main page(index.js)
    router.push("/");

    // signOut({ callbackUrl: "/" });
  }

  return (
    <div id="loginButton">
      <button
        className="bg-black text-white font-bold py-2 px-4 rounded mb-2 mt-2"
        onClick={logouthandler}>로그아웃</button>
    </div>
  );
}

export default LogoutBtn;