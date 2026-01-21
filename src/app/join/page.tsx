"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const BASE_URL = "/api";

// --- API 로직 ---
async function checkEmailExistsFetch(email: string): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/user/exist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("EMAIL_CHECK_FAILED");
  return await res.json();
}

async function joinFetch(data: any) {
  const res = await fetch(`${BASE_URL}/user/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("JOIN_FAILED");
}

export default function JoinPage() {
  const router = useRouter();

  // 상태 관리
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null);
  const [emailFormatError, setEmailFormatError] = useState(false);

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState(false);

  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 정규표현식 정의
  const nameRegex = /^[a-zA-Z가-힣]+$/; // 오직 한글/영문 (숫자 불가)
  const nicknameRegex = /^(?=.*[a-zA-Z가-힣])[a-zA-Z0-9가-힣]+$/; // 문자 포함 필수 (숫자만 있는 경우 차단)

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) router.replace("/");
  }, [router]);

  // 1. 이메일 유효성 체크
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.length === 0) {
      setEmailFormatError(false);
      setIsEmailValid(null);
      return;
    }
    if (!emailRegex.test(email)) {
      setEmailFormatError(true);
      setIsEmailValid(null);
      return;
    } else {
      setEmailFormatError(false);
    }

    const delay = setTimeout(async () => {
      try {
        const exists = await checkEmailExistsFetch(email);
        setIsEmailValid(!exists);
      } catch {
        setIsEmailValid(null);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [email]);

  // 2. 비밀번호 유효성 체크
  useEffect(() => {
    setPasswordError(password.length > 0 && password.length < 4);
  }, [password]);

  // 3. 이름 유효성 체크 (공백/특수문자 제외 문자열만)
  useEffect(() => {
    if (username.length > 0 && !nameRegex.test(username)) {
      setUsernameError(true);
    } else {
      setUsernameError(false);
    }
  }, [username]);

  // 4. 닉네임 유효성 체크 (공백/특수문자 제외 문자열만)
  useEffect(() => {
    if (nickname.length > 0 && !nicknameRegex.test(nickname)) {
      setNicknameError(true);
    } else {
      setNicknameError(false);
    }
  }, [nickname]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // 최종 검증
    const isInvalid =
      emailFormatError ||
      isEmailValid !== true ||
      passwordError ||
      usernameError ||
      nicknameError ||
      !username ||
      !nickname;

    if (isInvalid) {
      setError("입력 양식을 다시 확인해주세요.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await joinFetch({ email, password, username, nickname });
      alert("회원가입 완료!");
      router.replace("/login");
    } catch {
      setError("회원가입 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6">
      <div className="w-full max-w-[360px] space-y-12">
        <div className="text-center space-y-2"></div>

        <form onSubmit={handleSignUp} className="space-y-8">
          <div className="space-y-6">
            {/* EMAIL */}
            <div className="space-y-1">
              <input
                type="email"
                placeholder="EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-transparent border-b py-3 text-sm placeholder:text-gray-300 focus:border-black outline-none transition-all tracking-widest ${
                  emailFormatError || isEmailValid === false ? "border-rose-500" : "border-gray-200"
                }`}
                required
              />
              <div className="h-4 mt-1 text-[10px] font-bold tracking-tight uppercase px-1">
                {emailFormatError && <p className="text-rose-500">Invalid email format</p>}
                {!emailFormatError && isEmailValid === false && (
                  <p className="text-rose-500">Email already in use</p>
                )}
                {!emailFormatError && isEmailValid === true && (
                  <p className="text-gray-600">Email is available</p>
                )}
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-1">
              <input
                type="password"
                placeholder="PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-transparent border-b py-3 text-sm placeholder:text-gray-300 focus:border-black outline-none transition-all tracking-widest ${
                  passwordError ? "border-rose-500" : "border-gray-200"
                }`}
                required
              />
              <div className="h-4 mt-1">
                {passwordError && (
                  <p className="text-[10px] text-rose-500 font-bold tracking-tight uppercase px-1">
                    Min. 4 characters required
                  </p>
                )}
              </div>
            </div>

            {/* NAME */}
            <div className="space-y-1">
              <input
                type="text"
                placeholder="NAME"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full bg-transparent border-b py-3 text-sm  placeholder:text-gray-300 focus:border-black outline-none transition-all tracking-widest ${
                  usernameError ? "border-rose-500" : "border-gray-200"
                }`}
                required
              />
              <div className="h-4 mt-1 text-[10px] font-bold tracking-tight uppercase px-1">
                {usernameError && (
                  <p className="text-rose-500">Letters and numbers only (No spaces)</p>
                )}
              </div>
            </div>

            {/* NICKNAME */}
            <div className="space-y-1">
              <input
                type="text"
                placeholder="NICKNAME"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className={`w-full bg-transparent border-b py-3 text-sm  placeholder:text-gray-300 focus:border-black outline-none transition-all tracking-widest ${
                  nicknameError ? "border-rose-500" : "border-gray-200"
                }`}
                required
              />
              <div className="h-4 mt-1 text-[10px] font-bold tracking-tight uppercase px-1">
                {nicknameError && (
                  <p className="text-rose-500">Letters and numbers only (No spaces)</p>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={
              loading ||
              isEmailValid !== true ||
              emailFormatError ||
              passwordError ||
              usernameError ||
              nicknameError ||
              !username ||
              !nickname
            }
            className="w-full py-4 bg-black text-white text-[11px] font-black tracking-[0.2em] rounded-full hover:bg-gray-400 disabled:bg-gray-200 transition-all shadow-xl shadow-black/5 uppercase active:scale-[0.98]"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <div className="text-center">
          <Link
            href="/login"
            className="text-[11px] font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest group"
          >
            Already have an account?{" "}
            <span className="text-black border-b border-black pb-0.5 ml-1 font-black">Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
