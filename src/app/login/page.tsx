"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const BASE_URL = "/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      router.replace("/");
    }
  }, [router]);

  const handleLogin = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("LOGIN_FAILED");
      const data = await res.json();

      localStorage.setItem("accessToken", data.accessToken);
      // 네브바 상태 업데이트를 위한 이벤트 발생
      window.dispatchEvent(new Event("loginChange"));
      router.replace("/");
    } catch {
      setErrorMsg("로그인 정보가 올바르지 않습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: "google" | "naver") => {
    window.location.href = `${BASE_URL}/oauth2/authorization/${provider}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6">
      <div className="w-full max-w-[360px] space-y-12">
        {/* 입력 폼 영역: 얇은 선과 여백 */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="group relative">
              <input
                type="email"
                placeholder="EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b border-gray-200 py-3 text-sm placeholder:text-gray-300 focus:border-black outline-none transition-all tracking-widest"
              />
            </div>
            <div className="group relative">
              <input
                type="password"
                placeholder="PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b border-gray-200 py-3 text-sm placeholder:text-gray-300 focus:border-black outline-none transition-all tracking-widest"
              />
            </div>
          </div>

          {errorMsg && (
            <p className="text-[11px] text-rose-500 text-center font-bold tracking-tight">
              {errorMsg}
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-4 text-black text-[11px] font-black tracking-[0.2em] rounded-full hover:bg-gray-300 disabled:bg-gray-200 transition-all shadow-xl shadow-black/5 uppercase active:scale-[0.98]"
          >
            {loading ? "Verifying..." : "Sign In"}
          </button>
        </div>

        {/* 소셜 로그인: 미니멀한 버튼 디자인 */}
        <div className="space-y-6">
          <div className="relative flex items-center justify-center">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="flex-shrink mx-6 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
              Or Social
            </span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleSocialLogin("google")}
              className="flex items-center justify-center py-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all font-bold text-[11px] uppercase tracking-widest text-gray-600"
            >
              Google
            </button>
            <button
              onClick={() => handleSocialLogin("naver")}
              className="flex items-center justify-center py-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all font-bold text-[11px] uppercase tracking-widest text-gray-600"
            >
              Naver
            </button>
          </div>
        </div>

        {/* 푸터: 하단 링크 */}
        <div className="text-center">
          <Link
            href="/join"
            className="text-[11px] font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest group"
          >
            No Account?{" "}
            <span className="text-black border-b border-black pb-0.5 ml-1">Join Now</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
