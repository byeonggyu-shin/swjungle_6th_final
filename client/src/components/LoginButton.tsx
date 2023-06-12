import React, { useState } from 'react';
import GoogleLogin from 'react-google-login';
import axios from 'axios';
import 'typeface-roboto';
// import styles from '../styles/LoginButton.css';

// const clientId = process.env.GOOGLE_CLIENT_ID ?? '';
const clientId = '862985060268-bns768k2p01btrjkdk94f8hkrvqlt5d8.apps.googleusercontent.com';
const serverPath = "http://localhost:8000"

function LoginButton() {

  const [userInfo, setUserInfo] = useState({ givenName: '', imageUrl: '' });

  const onSuccess = async(res: any) => {
      console.log(res.profileObj); // 로그인한 사용자 정보 조회
      try {
        const response = await axios.post(`${serverPath}/api/login`, {
          email:res.profileObj.email,
          givenName:res.profileObj.givenName,
          imageUrl:res.profileObj.imageUrl,
        });

        console.log(response);

        if (response.data.success) {
          alert('로그인 성공!'); // Display success alert
          const token = response.data.token;
          // console.log(token);
  
          // Store the token in local storage
          localStorage.setItem('token', token);

          // Session management
          const sessionResponse = await axios.get(`${serverPath}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log(sessionResponse.data.user.name + "님 세션 서버 local에 저장완료!");

          // Set the user info
          setUserInfo({
            givenName: res.profileObj.givenName,
            imageUrl: res.profileObj.imageUrl,
          });
        } else {
          alert('로그인에 실패했습니다.ㅠㅠ'); // Display failure alert
          console.log(response.data);
        }
      } catch(error) {
        console.log(error);
    }
  }

  const onFailure = (error: any) => {
    console.log('Login failed!');
    console.log(error);
  };

  return (
    <div id="loginButton">
      <GoogleLogin
        clientId={clientId}
        buttonText="구글 로그인"
        onSuccess={onSuccess}
        onFailure={onFailure}
        cookiePolicy={"single_host_origin"}
        // className={styles.googleLoginButton}
      />

      {userInfo.imageUrl && (
              <div>
                <img src={userInfo.imageUrl} alt="Profile" />
                <p>{userInfo.givenName}</p>
              </div>
      )}
    </div>
  );
}

export default LoginButton;
