"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import ProfileDropdown from "./ProfileDropdown";

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 스크롤 방향 및 가시성 상태 관리
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  const checkLogin = () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setIsLoggedIn(false);
      return;
    }
    try {
      const base64Payload = token.split(".")[1];
      const payload = JSON.parse(atob(base64Payload));
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        localStorage.removeItem("accessToken");
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(true);
      }
    } catch (e) {
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    checkLogin();

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // 핵심 로직: 내릴 때 숨기고, 올릴 때 보여줌
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false); // 아래로 스크롤 중
      } else {
        setIsVisible(true); // 위로 스크롤 중이거나 최상단
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("focus", checkLogin);
    window.addEventListener("loginChange", checkLogin);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("loginChange", checkLogin);
      window.removeEventListener("focus", checkLogin);
    };
  }, []);

  if (!mounted) return null;

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-[50] bg-transparent transition-all duration-500 ease-in-out
        /* 가시성에 따른 위치 및 투명도 변화 */
        ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}
      `}
    >
      <div className="max-w-[1440px] mx-auto px-10 h-24 flex items-center justify-between">
        {/* 1. 로고 영역 */}
        <div className="flex-shrink-0">
          <Link href="/">
            <Image
              src="/PhotoExpoLogo2.png"
              alt="Logo"
              width={110}
              height={28}
              priority
              className="brightness-0"
            />
          </Link>
        </div>

        {/* 2. 메뉴 및 액션 영역 */}
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-6 ml-4">
            {isLoggedIn ? (
              <>
                <Link
                  href="/create"
                  className="text-[10px] font-black text-black tracking-[0.2em] uppercase px-4 py-2 hover:bg-gray-200 transition-all duration-300 rounded-full"
                >
                  Project +
                </Link>
                <ProfileDropdown />
              </>
            ) : (
              <Link
                href="/login"
                className="text-[10px] font-black text-black tracking-[0.3em] uppercase px-4 py-2 bg-gray-200 transition-all duration-300 rounded-full"
              >
                Access
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
