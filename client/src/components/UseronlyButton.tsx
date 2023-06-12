import React from 'react';
import axios from 'axios';

function UseronlyButton() {
  const sessionManage = async () => {
    try {
      // Get the session token from local storage
      const token = localStorage.getItem('token');

      if (!token) {
        console.log('User not logged in.');
        alert('User not logged in.');
        return;
      }

      // Set the session token in the request headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Make the request to the protected endpoint
      const response = await axios.get('http://localhost:8000/users/me');
      console.log(response.data);
      alert(`${response.data.user.name} 님이 버튼에 접근했습니다.`);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div id="loginButton">
      <button onClick={sessionManage}>User Only Access Button</button>
    </div>
  );
}

export default UseronlyButton;
