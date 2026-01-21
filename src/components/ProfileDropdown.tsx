"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// 데이터 타입 정의
interface UserResponse {
  userId: number;
  email: string;
  username: string;
  nickname: string;
}

export default function ProfileDropdown() {
  const [userInfo, setUserInfo] = useState<UserResponse | null>(null);

  // 컴포넌트 마운트 시 유저 정보 가져오기
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    const fetchUserInfo = async () => {
      try {
        const res = await fetch("/api/user/info", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (res.ok) {
          const data = await res.json();
          // API 구조에 따라 data.data 혹은 data를 세팅
          setUserInfo(data.data ?? data);
        }
      } catch (err) {
        console.error("유저 정보 로드 실패:", err);
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    window.location.href = "/";
  };

  return (
    <div className="relative group flex items-center overflow-visible">
      {/* 프로필 아이콘 */}
      <div className="cursor-pointer p-1 z-[101] transition-transform active:scale-95">
        <div className="w-8 h-8 rounded-full overflow-hidden border border-black/5 shadow-sm">
          <Image
            src="/photoExpo_Profile_Image.jpg"
            alt="Profile"
            width={32}
            height={32}
            className="object-cover"
          />
        </div>
      </div>

      {/* 드롭다운 메뉴 */}
      <div className="absolute right-0 top-[48px] w-60 bg-white border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-2xl invisible group-hover:visible opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-[100] overflow-hidden">
        <div className="pt-6 pb-4 px-6 border-b border-gray-50">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
            Account
          </p>
          {/*  userInfo.nickname */}
          <h3 className="text-sm font-black text-gray-900 leading-tight">
            {userInfo ? userInfo.nickname : "Loading..."}
          </h3>
        </div>

        {/* 메뉴 리스트 */}
        <div className="py-2">
          <Link
            href={userInfo ? `/users/${userInfo.userId}` : "#"}
            className="group/item flex items-center justify-between px-6 py-3 text-xs font-bold text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
          >
            <span>프로필 관리</span>
            <span className="opacity-0 group-hover/item:opacity-100 transition-all -translate-x-2 group-hover/item:translate-x-0">
              →
            </span>
          </Link>

          <div className="h-[1px] bg-gray-50 my-1 mx-6"></div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-6 py-4 text-xs font-bold text-rose-600  hover:bg-gray-50 transition-colors"
          >
            <span>로그아웃</span>
          </button>
        </div>
      </div>
    </div>
  );
}
