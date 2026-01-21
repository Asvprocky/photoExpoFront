import React from "react";

interface PhotoDetailData {
  photoId: number;
  imageUrl: string;
  title: string;
  description: string;
  userEmail: string;
  nickname: string;
}

interface DescriptionItem {
  text: string;
  align: string;
}

export default async function PhotoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let data: PhotoDetailData | null = null;
  let errorMsg = null;

  try {
    const res = await fetch(`http://3.34.179.129:8080/photo/${id}`, { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      data = json.data || json;
    } else {
      errorMsg = "사진을 불러올 수 없습니다.";
    }
  } catch (error) {
    errorMsg = "서버 연결 실패";
  }

  if (errorMsg || !data) return <div className="py-20 text-center text-red-500">{errorMsg}</div>;

  let descMap: Record<number, DescriptionItem[]> = {};
  try {
    descMap = JSON.parse(data.description);
  } catch {
    descMap = { 1: [{ text: data.description, align: "text-center" }] };
  }

  const hasTopDesc = descMap[0]?.some((i) => i.text.trim());
  const hasBottomDesc = descMap[1]?.some((i) => i.text.trim());

  const getJustifyClass = (align: string) => {
    if (align === "text-center") return "justify-center";
    if (align === "text-right") return "justify-end";
    return "justify-start";
  };

  return (
    // bg-white 제거 -> 모달의 검은 배경을 그대로 사용
    <div className="w-full">
      {/* 1. 이미지 위 설명: 흰색 여백 없이 텍스트만 띄움 */}
      {hasTopDesc && (
        <div className="max-w-3xl mx-auto px-4">
          {descMap[0].map((item, idx) => (
            <div
              key={`top-${idx}`}
              className={`flex w-full mb-4 border-white/10 ${getJustifyClass(item.align)}`}
            >
              <div
                className={`text-lg leading-relaxed text-white/80 font-medium whitespace-pre-wrap ${item.align}`}
              >
                {item.text}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. 이미지 영역: 여백 차단 */}
      <div className="w-full flex justify-center">
        <img
          src={`${data.imageUrl}?v=1`}
          alt={data.title}
          className="max-w-full h-auto shadow-2xl block"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
        />
      </div>

      {/* 3. 이미지 아래 설명: 간격만 유지 */}
      {hasBottomDesc && (
        <div className="mt-10 max-w-3xl mx-auto">
          {descMap[1].map((item, idx) => (
            <div
              key={`bottom-${idx}`}
              className={`flex w-full  border-white/10 ${getJustifyClass(item.align)}`}
            >
              <div
                className={`text-lg leading-relaxed text-white/80 font-medium whitespace-pre-wrap ${item.align}`}
              >
                {item.text}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
