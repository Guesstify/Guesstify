"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import style from "../../../styles/profile.module.scss";
import Cookies from 'js-cookie';
import HeaderComponent from '../header';
import '../../../styles/header.module.scss';

const Profile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const spotifyToken = Cookies.get('spotify_token') // => 'value'

  useEffect(() => {
    if (!spotifyToken) {

        router.push("/")
    }
  }, [spotifyToken]);

  useEffect(() => {
    
    
  }, []);


  return (
    <div className={style.container}>
      <HeaderComponent />
    </div>
  );
};

export default Profile;
