"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface ModalProps {
  children: React.ReactNode;
  title?: string;
  photoId?: number; // optional
  exhibitionId?: number;
  user?: {
    userId: number;
    nickname: string;
    email: string;
  };
}

interface Comment {
  id: number;
  userId: number;
  nickname: string;
  content: string;
  createdAt: string;
  mine: boolean; // 작성자 확인 필드
}

export default function Modal({ children, title, user, photoId, exhibitionId }: ModalProps) {
  const isPhoto = !!photoId;
  const isExhibition = !!exhibitionId && !photoId;

  if (!photoId && !exhibitionId) {
    console.error(" Modal에 photoId 또는 exhibitionId가 필요합니다");
    return null;
  }

  const API_BASE_URL = "http://3.34.179.129:8080";

  // --- 추가: 토큰 가져오기 함수 ---
  const getAuthHeader = (): Record<string, string> => {
    // 클라이언트 사이드인지 확인 (Next.js SSR 에러 방지)
    if (typeof window === "undefined") return {};

    const token = localStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  const isLoggedIn = () => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("accessToken");
  };

  const router = useRouter();
  const overlay = useRef<HTMLDivElement>(null);

  // --- [확대 관련 상태 추가] ---
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomedImgSrc, setZoomedImgSrc] = useState("");

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [comment, setComment] = useState("");

  const onDismiss = () => router.back();

  // 유저 정보 요청시 모달 닫기
  const handleUserClick = (targetUserId: number) => {
    if (!targetUserId) return;

    // 1. 스크롤 잠금 강제 해제
    document.body.style.overflow = "auto";

    // 2. [변경] router.push 대신 window.location.href 사용
    // 이렇게 하면 Next.js의 라우팅 꼬임 현상을 무시하고 강제로 유저 페이지를 깨끗하게 띄웁니다.
    window.open(`/users/${targetUserId}`, "_blank", "noopener,noreferrer");
  };

  // ESC 키로 확대창 또는 모달 닫기
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isZoomed) setIsZoomed(false);
        else onDismiss();
      }
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "auto";
    };
  }, [isZoomed]);

  // --- [사진 클릭 감지 핸들러] ---
  // children 내부의 이미지가 클릭되면 이 함수가 실행됩니다.
  const handleContentClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "IMG") {
      const imgSrc = (target as HTMLImageElement).src;
      setZoomedImgSrc(imgSrc);
      setIsZoomed(true);
    }
  };

  /* ---------------- API 로직 (주소 직접 사용) ---------------- */

  // 1. 댓글 조회 (사진일 때만 동작하도록 가드 추가)
  const fetchComments = async () => {
    // [추가] 사진이 아니거나 photoId가 없으면 호출 안함
    if (!isPhoto || !photoId) return;

    try {
      const res = await fetch(`${API_BASE_URL}/comment/photo/${photoId}`, {
        method: "GET",
        headers: { ...getAuthHeader() },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (error) {
      console.error("댓글 조회 에러:", error);
    }
  };
  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/comment/${commentId}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeader(),
        },
        credentials: "include",
      });

      if (!res.ok) {
        alert("삭제 권한이 없거나 오류가 발생했습니다.");
        return;
      }

      // 삭제 성공 → 댓글 다시 불러오기
      fetchComments();
    } catch (e) {
      console.error("댓글 삭제 에러", e);
    }
  };

  // 좋아요 상태 조회
  const fetchLikeStatus = async () => {
    try {
      let url = "";
      if (isPhoto && photoId) {
        url = `${API_BASE_URL}/photo/${photoId}/like`;
      } else if (isExhibition && exhibitionId) {
        url = `${API_BASE_URL}/exhibition/${exhibitionId}/like`;
      }

      if (!url) return;

      // [체크] 현재 로컬스토리지에 토큰이 있는지 확인하는 로그
      const authHeader = getAuthHeader();
      console.log("GET 요청 헤더 확인:", authHeader);

      const res = await fetch(url, {
        method: "GET",
        headers: {
          ...authHeader,
        },
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        console.log("서버 응답 데이터:", data);
        setLiked(data.liked);
        setLikeCount(data.likeCount);
      }
    } catch (e) {
      console.error("좋아요 상태 조회 에러:", e);
    }
  };

  // 2. 좋아요 토글
  const toggleLike = async () => {
    if (!isLoggedIn()) {
      alert("로그인이 필요한 기능입니다");
      return;
    }

    try {
      const url = isPhoto
        ? `${API_BASE_URL}/photo/${photoId}/like/toggle`
        : `${API_BASE_URL}/exhibition/${exhibitionId}/like/toggle`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          ...getAuthHeader(),
        },
        credentials: "include",
      });

      if (res.status === 401) {
        alert("로그인이 필요합니다");
        return;
      }

      if (!res.ok) {
        console.error("LIKE API ERROR:", res.status);
        return;
      }

      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch (error) {
      console.error("LIKE ERROR:", error);
    }
  };

  // 3. 댓글 작성
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn()) {
      alert("로그인이 필요한 기능입니다");
      return;
    }
    if (!comment.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/comment/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(), // 토큰 추가
        },
        credentials: "include",
        body: JSON.stringify({
          photoId,
          content: comment,
        }),
      });
      // 401 처리
      if (res.status === 401) {
        alert("로그인이 필요합니다");
        return;
      }

      if (res.ok) {
        setComment("");
        fetchComments();
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // 1. 좋아요 정보는 사진/전시 공통으로 가져옴
    fetchLikeStatus();

    // 2. 댓글은 사진일 때만 가져옴
    if (isPhoto) {
      fetchComments();
    } else {
      setComments([]); // 전시일 때는 댓글 리스트 초기화
    }
  }, [photoId, exhibitionId]); // 의존성 배열 유지
  return (
    <div
      ref={overlay}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95"
      onClick={(e) => e.target === overlay.current && onDismiss()}
    >
      {/* --- 전체 화면 확대 오버레이 --- */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center cursor-zoom-out animate-in fade-in duration-300"
          onClick={() => setIsZoomed(false)}
        >
          <img src={zoomedImgSrc} alt="Zoomed" className="max-w-[95%] max-h-[95%] object-contain" />
        </div>
      )}

      <button
        onClick={onDismiss}
        className="fixed top-8 right-10 z-[70] text-white/50 hover:text-white text-2xl"
      >
        ✕
      </button>

      <div className="w-full h-full overflow-y-auto flex justify-center no-scrollbar">
        <div className="w-full max-w-7xl relative px-4">
          {(title || user?.nickname) && (
            <div className="absolute top-6 left-2 z-[70] text-white">
              <p className="text-m font-black tracking-tight">{title}</p>
              {user?.userId ? (
                <button
                  onClick={() => handleUserClick(user.userId)} // Link 대신 button 사용
                  className="hover:text-gray-300 transition-colors text-left"
                >
                  <p
                    className="text-sm cursor-pointer px-3 py-1 rounded-full transition-all duration-500 
              hover:bg-white/40 hover:text-white hover:backdrop-blur-sm"
                  >
                    @{user?.nickname}
                  </p>
                </button>
              ) : (
                // 유저 ID가 없을 경우 (비로그인 또는 데이터 부재 시)
                <>
                  <p className="text-sm font-black tracking-tight">{title}</p>
                  <p className="text-xs text-gray-500">{user?.nickname}</p>
                </>
              )}
            </div>
          )}

          {/* --- handleContentClick 연결 --- */}
          <div className="pt-24 pb-20" onClick={handleContentClick}>
            {children}

            {/* 좋아요 버튼 섹션: 중앙 배치 및 스타일 리팩토링 */}
            <div className="mt-24 mb-16 flex flex-col items-center justify-center gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike();
                }}
                /* - liked 상태일 때: Gray 300 배경에 검정 아이콘/글자 (댓글 네임택과 통일)- 평상시: 투명 배경에 얇은 테두리 */
                className={`group flex items-center gap-3 px-6 py-3 rounded-full border transition-all duration-500 ease-in-out
                  ${
                    liked
                      ? "bg-gray-300 border-gray-300 text-black shadow-[0_0_30px_rgba(209,213,219,0.2)]"
                      : "bg-transparent border-white/30 text-white/30 hover:border-white/30 hover:text-white"
                  }
                      `}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill={liked ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className={`w-5 h-5 transition-transform duration-500 ${
                    liked ? "scale-110" : "group-hover:scale-110"
                  }`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                </svg>

                <span className="text-[11px] font-black uppercase tracking-[0.2em]">{liked}</span>

                {/* 구분선 */}
                <div className={`w-px h-3 ${liked ? "bg-black/20" : "bg-white/20"}`} />

                {/* 카운트 숫자 */}
                <span className="text-[11px] font-bold tracking-tighter">
                  {likeCount.toString().padStart(2, "0")}
                </span>
              </button>
            </div>

            {/* 댓글 섹션 */}
            {isPhoto && (
              <div className="mt-20  border-white/10 pt-4 max-w-3xl mx-auto">
                {/* 1. 헤더 영역 */}
                <div className="flex items-center gap-3 mb-10 px-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" />
                  <h3 className="text-white text-[12px] uppercase tracking-[0.3em]">Comment</h3>
                </div>

                {/* 2. 댓글 작성 폼 (Gray 300 강조 스타일) */}
                <form onSubmit={handleCommentSubmit} className="mb-16 px-2">
                  <div className="flex gap-2">
                    <input
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 bg-white/7  border-white/20 px-5 py-3 text-sm text-white  focus:outline-none focus:border-gray-300 transition-all"
                    />
                    <button className=" text-white px-6 py-3 rounded-lg text-[11px] uppercase tracking-widest hover:text-gray-300 transition-colors">
                      Send
                    </button>
                  </div>
                </form>

                {/* 3. 댓글 리스트*/}
                <div className="space-y-4 px-2">
                  {comments.length > 0 ? (
                    comments.map((c) => (
                      <div
                        key={c.id}
                        className="group relative bg-gray-300 p-5 transition-all shadow-xl"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {/* 아바타 대용 원형 */}
                            <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center">
                              <span className="text-[10px] font-bold text-black/40">
                                {c.nickname.charAt(0)}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                console.log("댓글 유저 클릭 ID:", c.userId);
                                handleUserClick(c.userId);
                              }}
                              className="flex items-center gap-3 group/user text-left"
                            >
                              <span className="text-[13px] font-bold text-black uppercase group-hover/user:underline">
                                {c.nickname}
                              </span>
                            </button>
                            <span className="text-[10px]  text-black/40">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {/* 삭제 버튼 */}
                          {c.mine && (
                            <button
                              onClick={() => handleDeleteComment(c.id)}
                              className="opacity-0 group-hover:opacity-100 transition-all p-1 text-black/20 hover:text-white"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                              >
                                <path d="M18 6L6 18M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>

                        {/* 본문 텍스트*/}
                        <p className="text-[14px] text-neutral-800 leading-relaxed font-medium pl-1">
                          {c.content}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center border border-white/10 rounded-xl">
                      <p className="text-[11px] text-white/30 uppercase tracking-[0.4em]">
                        No messages
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
