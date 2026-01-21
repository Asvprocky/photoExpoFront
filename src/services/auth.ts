// 1. 공통 서버 주소 설정
const BASE_URL = "http://3.34.179.129:8080";

// 2. 타입 정의 (나중에 src/types/auth.ts로 분리하게 좋음)
export interface JoinRequest {
  email: string;
  password: string;
  username: string;
  nickname: string;
}

/**
 * [인증이 필요한 요청용]
 * 모든 요청에 accessToken을 붙이고, 만료 시 자동으로 갱신.
 */

export async function authFetch(url: string, options: RequestInit = {}) {
  const accessToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  // 1. 헤더 구성
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
    Authorization: `Bearer ${accessToken}`,
  };

  // 중요: body가 FormData가 아닐 때만 Content-Type을 application/json으로 설정
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });

  // 2. accessToken 만료 처리 (401 Unauthorized)
  if (res.status === 401) {
    console.log("토큰 만료 혹은 인증 실패, 갱신 시도 중...");

    const refreshRes = await fetch(`${BASE_URL}/jwt/refresh`, {
      method: "POST",
      credentials: "include", // refreshToken 쿠키 전송
    });

    if (!refreshRes.ok) {
      if (typeof window !== "undefined") {
        console.error("리프레시 토큰 만료. 로그아웃 처리합니다.");
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
      throw new Error("인증 만료");
    }

    // 새 토큰 저장
    const { accessToken: newAccessToken } = await refreshRes.json();
    localStorage.setItem("accessToken", newAccessToken);

    // 3. 원래 요청 재시도 (헤더 최신화)
    console.log("새 토큰으로 요청을 재시도합니다.");

    const retryHeaders: Record<string, string> = {
      ...(options.headers as Record<string, string>),
      Authorization: `Bearer ${newAccessToken}`,
    };

    // 재시도 시에도 FormData 여부 체크
    if (!(options.body instanceof FormData)) {
      retryHeaders["Content-Type"] = "application/json";
    }

    return fetch(url, {
      ...options,
      credentials: "include",
      headers: retryHeaders,
    });
  }

  return res;
}

/**
 * [로그인]
 */
export async function loginFetch(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error("LOGIN_FAILED");
  }

  const data = await res.json();
  localStorage.setItem("accessToken", data.accessToken); // 토큰 저장
  return data;
}

/**
 * [회원가입]
 */
export async function joinFetch(data: JoinRequest) {
  const res = await fetch(`${BASE_URL}/user/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("JOIN_FAILED");
  }
}

/**
 * [이메일 중복 체크]
 */
export async function checkEmailExistsFetch(email: string): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/user/exist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    throw new Error("EMAIL_CHECK_FAILED");
  }

  return await res.json(); // true | false
}

/**
 * [로그아웃]
 */
export async function logoutFetch() {
  await fetch(`${BASE_URL}/logout`, {
    method: "POST",
    credentials: "include",
  });

  localStorage.removeItem("accessToken"); // 토큰 삭제
}
