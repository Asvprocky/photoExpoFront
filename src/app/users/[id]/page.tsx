"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";

const BASE_URL = "http://3.34.179.129:8080";

interface ExhibitionInfo {
  exhibitionId: number;
  title: string;
  thumbnailUrl: string;
}

interface PhotoInfo {
  photoId: number;
  imageUrl: string;
  title: string;
  exhibition: ExhibitionInfo | null;
}

interface UserPageData {
  userId: number;
  username: string;
  nickname: string;
  photoCount: number;
  photos: PhotoInfo[];
}

export default function UserPublicArchivePage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();

  const [data, setData] = useState<UserPageData | null>(null);
  const [activeTab, setActiveTab] = useState("전시");
  const [loading, setLoading] = useState(true);

  // 본인 확인 상태
  const [isMe, setIsMe] = useState(false);

  useEffect(() => {
    const userIdFromPath = Array.isArray(params.id) ? params.id[0] : params.id;
    const accessToken = localStorage.getItem("accessToken");

    const rawId = Array.isArray(params.id) ? params.id[0] : params.id;

    // 📍 [강력한 방어막] 현재 브라우저 주소창의 경로 자체가 /users/숫자 인지 확인
    // /photo/99 같은 경로에서 이 useEffect가 실행되는 것을 원천 봉쇄합니다.
    if (!window.location.pathname.includes(`/users/${rawId}`)) {
      console.log("⚠️ 유효하지 않은 경로 접근: API 요청을 취소합니다.");
      return;
    }
    const fetchAllData = async () => {
      try {
        // 400 에러를 방지하기 위해 ID가 확실히 존재할 때만 호출
        if (!rawId || isNaN(Number(rawId))) return;

        const res = await fetch(`http://3.34.179.129:8080/users/${rawId}`);

        // SyntaxError 방지
        // 응답이 ok(200번대)가 아니면 .json()을 호출하지 않고 텍스트로 읽음.
        if (!res.ok) {
          const errorText = await res.text(); // "잘못된 요청입니다"를 텍스트로 받음
          console.warn(" 서버 에러 응답:", errorText);
          setData(null);
          return;
        }
        const result = await res.json();
        setData(result);

        // 2. 내 정보 가져오기 (Private)
        if (accessToken) {
          const myRes = await fetch(`${BASE_URL}/user/info`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (myRes.ok) {
            const myData = await myRes.json();

            // [DEBUG 1] 내 정보 전체 구조 확인
            console.log("My Info Response:", myData);

            // [DEBUG 2] 여기서 userId가 있는지, 아니면 id로 되어있는지 확인하세요!
            const myActualData = myData.data ?? myData;
            console.log("Actual Data Object:", myActualData);

            const urlId = Number(userIdFromPath);
            const myId = Number(myActualData.userId || myActualData.id); // userId가 없으면 id 시도

            console.log("Comparison Check -> URL ID:", urlId, "| My ID:", myId);

            if (urlId === myId) {
              setIsMe(true);
            } else {
              console.log("ID 불일치. 타인의 페이지로 인식됨.");
            }
          } else {
            console.log("/user/info 요청 실패 (상태 코드):", myRes.status);
          }
        } else {
          console.log("로컬 스토리지에 토큰이 없습니다.");
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userIdFromPath) fetchAllData();
  }, [params.id, pathname]);

  // 삭제 처리 함수 (본인일 때만 호출 가능)
  const handleDelete = async (id: number, type: "전시" | "사진") => {
    if (!confirm(`정말로 이 ${type}을(를) 삭제하시겠습니까?`)) return;

    const token = localStorage.getItem("accessToken");
    const endpoint = type === "전시" ? `exhibition/${id}` : `photo/${id}`;

    try {
      const res = await fetch(`${BASE_URL}/${endpoint}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        // 성공 시 데이터 리프레시
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>;
  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center font-bold">
        유저를 찾을 수 없습니다.
      </div>
    );

  const exhibitions = data.photos
    .map((p) => p.exhibition)
    .filter(
      (ex, index, self) =>
        ex !== null && self.findIndex((e) => e?.exhibitionId === ex.exhibitionId) === index
    ) as ExhibitionInfo[];

  return (
    <div className="min-h-screen bg-white">
      {/* 상단 배너 */}
      <div className="relative h-[280px] w-full bg-gray-200 -mt-14">
        <Image
          src="/photoExpoBanner.jpg"
          alt="Banner"
          fill
          className="object-cover"
          crossOrigin="anonymous"
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="max-w-[1400px] mx-auto px-10 relative">
        <div className="flex flex-col md:flex-row gap-12">
          {/* 좌측 프로필 영역 */}
          <div className="w-full md:w-[350px] -mt-16 z-10">
            <div className="w-25 h-25 rounded-full border-[6px] border-white overflow-hidden shadow-md mb-6 bg-white relative">
              <Image
                src="/photoExpo_Profile_Image.jpg"
                alt="Profile"
                fill
                className="object-cover"
                crossOrigin="anonymous"
              />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">{data.nickname}</h1>
            <div className="space-y-4 text-sm font-bold text-gray-600 mb-8">
              <div className="flex items-center gap-2">👤 {data.username}</div>
            </div>

            {/* 통계 지표 (Total Works & Exhibitions) */}
            <div className="pt-8 border-t border-gray-100 flex gap-10">
              <div>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block mb-1">
                  Total Works
                </span>
                <span className="text-2xl font-black text-gray-900">{data.photoCount}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block mb-1">
                  Exhibitions
                </span>
                <span className="text-2xl font-black text-gray-900">{exhibitions.length}</span>
              </div>
            </div>
          </div>

          {/* 우측 콘텐츠 영역 */}
          <div className="flex-1 py-10">
            <div className="flex gap-10 border-b border-gray-100 mb-8">
              {["전시", "사진"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-black transition-all ${
                    activeTab === tab
                      ? "border-b-2 border-black text-black"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "전시" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {exhibitions.map((ex) => (
                  <div
                    key={ex.exhibitionId}
                    onClick={() => router.push(`/exhibition/${ex.exhibitionId}`)}
                    className="group aspect-[4/3] relative rounded-xl overflow-hidden cursor-pointer shadow-sm bg-gray-100"
                  >
                    <Image
                      src={ex.thumbnailUrl}
                      alt={ex.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-all"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                      <div className="flex justify-end">
                        {/* 본인일 때만 삭제 버튼 활성화 */}
                        {isMe && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(ex.exhibitionId, "전시");
                            }}
                            className="bg-white/20 hover:bg-red-500 text-white text-xs px-3 py-1.5 rounded-full font-bold backdrop-blur-md"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                      <p className="text-white font-black text-xl tracking-tight">{ex.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.photos
                  .filter((photo) => photo.exhibition === null)
                  .map((photo) => (
                    <div
                      key={photo.photoId}
                      onClick={() => router.push(`/photo/${photo.photoId}`)}
                      className="group aspect-square relative rounded-lg overflow-hidden shadow-sm bg-gray-100 cursor-pointer"
                    >
                      <Image
                        src={photo.imageUrl}
                        alt="Photo"
                        fill
                        className="object-cover group-hover:scale-110 transition-all"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                        <div className="flex justify-end">
                          {/* 본인일 때만 삭제 버튼 활성화 */}
                          {isMe && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(photo.photoId, "사진");
                              }}
                              className="bg-white/20 hover:bg-red-500 text-white text-[10px] px-2 py-1 rounded backdrop-blur-md"
                            >
                              삭제
                            </button>
                          )}
                        </div>
                        <span className="text-white text-[11px] font-bold truncate">
                          {photo.title}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
