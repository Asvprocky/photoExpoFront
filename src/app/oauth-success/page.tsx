"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OAuthSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    fetch("http://3.34.179.129:8080/jwt/refresh", {
      method: "POST",
      credentials: "include", // refreshToken 쿠키 전송
    })
      .then((res) => {
        if (!res.ok) throw new Error("ACCESS_TOKEN_FAILED");
        return res.json();
      })
      .then((data) => {
        localStorage.setItem("accessToken", data.accessToken);
        router.replace("/");
        router.refresh();
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [router]);

  return <p>소셜 로그인 처리 중...</p>;
}
