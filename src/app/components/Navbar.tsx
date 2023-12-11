"use client"

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from "next/navigation";
import Cookies from 'js-cookie';
import axios from 'axios'
import { useRecoilState } from 'recoil';
import { UserType, userLoginState, darkModeState, rightSidebarState, chatState } from '../recoil/dataRecoil';

interface UserInfo {
  name: string;
  email: string;
  provider: string;
}

///////////// Navbar /////////////
export const Navbar = () => {
  const [userInfo, setuserInfo] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [loginState, setLoginState] = useRecoilState<UserType>(userLoginState);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const settingButtonRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useRecoilState(darkModeState);
  const [rightSidebar, setRightSidebarState] = useRecoilState(rightSidebarState);
  const [chat, setChat] = useRecoilState(chatState);


  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = Cookies.get('access-token');
      if (token) {
        try {
          const response = await axios.get('https://worldisaster.com/api/auth/', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          setLoginState({ isLoggedIn: true, userInfo: response.data });
          console.log('Log: Please provide login information', response);
        } catch (error) {
          console.error('Log: Error fetching user info:', error);
        }
      }
    };

    fetchUserInfo();
  }, [setLoginState]);


  // const handleLogin = async () => {
  //   try {
  //     const currentUrl = window.location.href;
  //     const encodedUrl = encodeURIComponent(currentUrl);
  //     const response = await axios.get(`https://worldisaster.com/api/auth/google/url?preLoginUrl=${encodedUrl}`);
  //     const { url } = response.data;
  //     window.location.href = url; // 받아온 URL로 리다이렉트
  //   } catch (error) {
  //     console.error('Log: Error fetching auth URL:', error);
  //   }
  // };


  const handleLogout = async () => {
    const token = Cookies.get('access-token');
    try {
      await axios.get('https://worldisaster.com/api/auth/logout/', {
        headers: {
          'Authorization': `Bearer ${token}` // 헤더에 토큰 추가
        }
      });
      setLoginState({ isLoggedIn: false, userInfo: null });
      alert('Log-out successful. Hope to see you again soon!');
    } catch (error) {
      console.error('Log: Logout failed:', error);
    }
  };


  const handleWithdrawal = async () => {
    const isConfirmed = confirm("Are you sure you want to delete your account? We do more good with you on board.");
    if (!isConfirmed) {
      return;
    }
    const token = Cookies.get("access-token");
    try {
      setLoading(true);
      const response = await axios.post(
        "https://worldisaster.com/api/auth/delete",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Log: Successfully deleted your account:", response.data);
      if (response.data.redirectUrl) {
        window.location.href = response.data.redirectUrl;
      } else {
        alert('Your account was successfully deleted. We hope to win you back soon.');
      }
    } catch (error) {
      console.error("Log: Failed to delete your account:", error);
    } finally {
      setLoading(false);
    }
  };


  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node) && !settingButtonRef.current?.contains(event.target as Node)) {
        setIsModalOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modalRef, settingButtonRef]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    if (rightSidebar.isOpen) {
      setChat(false);
    }
  }, [rightSidebar.isOpen, setChat]);

  const toggleRightSidebar = () => {
    setRightSidebarState(prevState => ({
      ...prevState,
      isOpen: !prevState.isOpen
    }));
  };

  return (
    <div className="navbar">
      <input
        type="text"
        placeholder="Search for a country or region"
        className='navSearchbar'
      />
      <div className='navIcon' onClick={toggleDarkMode}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-brightness-low-fill" viewBox="0 0 16 16">
          <path d="M12 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0M8.5 2.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m0 11a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m5-5a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1m-11 0a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1m9.743-4.036a.5.5 0 1 1-.707-.707.5.5 0 0 1 .707.707m-7.779 7.779a.5.5 0 1 1-.707-.707.5.5 0 0 1 .707.707m7.072 0a.5.5 0 1 1 .707-.707.5.5 0 0 1-.707.707M3.757 4.464a.5.5 0 1 1 .707-.707.5.5 0 0 1-.707.707"/>
        </svg>
      </div>
      <div className='navIcon' onClick={toggleRightSidebar}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-filter-right" viewBox="0 0 16 16">
          <path d="M14 10.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 .5-.5m0-3a.5.5 0 0 0-.5-.5h-7a.5.5 0 0 0 0 1h7a.5.5 0 0 0 .5-.5m0-3a.5.5 0 0 0-.5-.5h-11a.5.5 0 0 0 0 1h11a.5.5 0 0 0 .5-.5"/>
        </svg>
      </div>
      <div className='flex items-center gap-10px'>
        {loginState.isLoggedIn ? (
          <>
            <div className='navIcon' ref={settingButtonRef} onClick={toggleModal}>
              <img src="/Nav/setting.svg" alt="Setting" />
            </div>
            {isModalOpen && (
              <div className="navSettingModal" ref={modalRef}>
                <div className='cardTitle'>👤 Account Details 👤</div>
                <div className="cardContent">
                  {userInfo.map((data, index) => (
                    <div key={index}>
                      <p>Name: {data.name}</p>
                      <p>Email: {data.email}</p>
                    </div>
                  ))}
                </div>
                <div className='cardTitle'>👋 Account Delete 👋</div>
                <div className="cardContent">
                  <p>Are you sure you want to</p>
                  <p>opt-out of WorlDisasters?</p>
                  <p> There is no going back.</p>
                  <div className='btnBox'>
                    <button className="btn" onClick={handleWithdrawal} disabled={loading}>
                      Yes, I'd like to delete anyways.
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div>
              <a onClick={handleLogout}>Logout</a>
            </div>
          </>
        ) : (
          <>
            <div>
              <a href="https://worldisaster.com/api/auth/google">Login</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
  
};

export default Navbar;
