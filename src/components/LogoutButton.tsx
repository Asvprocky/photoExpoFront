"use client";
import { useRouter } from "next/navigation";

const BASE_URL = "/api";

async function logoutFetch() {
  await fetch(`${BASE_URL}/logout`, {
    method: "POST",
    credentials: "include", // refreshToken 쿠키 삭제를 위해 포함
  });

  localStorage.removeItem("accessToken"); // 토큰 삭제
}

// --- 컴포넌트 ---
const LogoutButton = () => {
  const router = useRouter();

  const handleLogOut = async () => {
    // 위에서 정의한 로그아웃 로직 실행
    try {
      await logoutFetch();

      alert("로그아웃 되었습니다.");

      // 로그인 페이지로 이동 후 상단바 상태 갱신을 위해 페이지 새로고침
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  return (
    <button onClick={handleLogOut} style={{ cursor: "pointer" }}>
      로그아웃
    </button>
  );
};

export default LogoutButton;
