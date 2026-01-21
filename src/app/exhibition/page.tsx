export const dynamic = "force-dynamic"; // 페이지 SSR 강제 처리

import React from "react";
import Link from "next/link";

// 백엔드 데이터 구조에 맞춘 타입 정의
interface Photo {
  photoId: number;
  imageUrl: string;
}

interface ExhibitionData {
  exhibitionId: number;
  title: string;
  userEmail: string;
  userId: number;
  photos?: Photo[];
}

export default async function Exhibition() {
  let exhibitions: ExhibitionData[] = [];
  let errorMsg = null;

  try {
    const res = await fetch("/api/exhibition/all", {
      cache: "no-store",
    });

    if (res.ok) {
      exhibitions = await res.json();
    } else {
      console.error("Failed to fetch data:", res.status);
      errorMsg = `데이터 로딩 실패 (${res.status})`;
    }
  } catch (error) {
    console.error("Fetch error:", error);
    errorMsg = "서버에 연결할 수 없습니다.";
  }

  return (
    // pt-20: 네비게이션 바(h-14) 높이를 고려한 상단 여백
    // px-10: 네비게이션 바와 동일한 좌우 간격
    <div className="pt-20 px-10 pb-10">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">모든 전시 ({exhibitions.length}개)</h1>

      {errorMsg && <p className="text-red-500 mb-4">{errorMsg}</p>}

      <div className="flex flex-col">
        {exhibitions.map((item) => {
          const photoList = item.photos || [];
          const hasPhoto = photoList.length > 0;
          const imageUrl = hasPhoto ? photoList[0].imageUrl : null;

          return (
            <Link
              href={`/exhibition/${item.exhibitionId}`}
              key={item.exhibitionId}
              className="group border-b border-gray-200 py-8 transition-all hover:bg-gray-50 no-underline text-inherit block"
            >
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h2>

                <div className="text-sm text-gray-500 flex flex-col gap-1">
                  <p>작성자: {item.userEmail || "알 수 없음"}</p>
                  <p>전시회 번호: {item.exhibitionId}</p>
                  <p>유저 아이디: {item.userId}</p>
                </div>

                {imageUrl ? (
                  <div className="mt-4 max-w-[300px] overflow-hidden rounded-lg shadow-sm">
                    <img
                      src={imageUrl}
                      alt={item.title}
                      className="w-full h-auto object-cover transform transition-transform group-hover:scale-105"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                    />
                  </div>
                ) : (
                  <div className="mt-4 w-[300px] h-[200px] bg-gray-100 flex items-center justify-center text-gray-400 rounded-lg border border-dashed border-gray-300">
                    이미지 없음
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
