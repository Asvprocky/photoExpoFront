import { TEMPLATE_CONFIG } from "@/app/constants/templates";
import React from "react";

interface Photo {
  photoId: number;
  imageUrl: string;
}

interface DescriptionItem {
  text: string;
  align: string;
}

interface ExhibitionDetailData {
  exhibitionId: number;
  title: string;
  contents: string;
  userEmail: string;
  userId: number;
  exhibitionViewCount: number;
  template: string;
  photos?: Photo[];
}

/* ==============================
 * 텍스트 블록 (미리보기와 동일)
 * ============================== */
const DescriptionDisplay = ({
  items,
  currentStyle,
}: {
  items?: DescriptionItem[];
  currentStyle: any;
}) => {
  if (!items || items.length === 0) return null;

  return (
    <>
      {items.map((item, idx) => (
        <div
          key={idx}
          className={`w-full py-6 px-10 ${item.align}
          ${currentStyle.font} ${currentStyle.fontColor}
          text-lg md:text-xl leading-relaxed whitespace-pre-wrap font-bold`}
        >
          {item.text}
        </div>
      ))}
    </>
  );
};

export default async function ExhibitionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let data: ExhibitionDetailData | null = null;
  let errorMsg: string | null = null;
  const BASE_URL = "http://15.165.161.240:8080";

  try {
    const res = await fetch(`${BASE_URL}/exhibition/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      errorMsg = `데이터를 불러올 수 없습니다. (${res.status})`;
    } else {
      const json = await res.json();
      data = json.data || json;
    }
  } catch (e) {
    console.error(e);
    errorMsg = "서버와 연결할 수 없습니다.";
  }

  if (errorMsg || !data) {
    return (
      <div className="py-20 text-center font-bold text-red-500">
        <h2>{errorMsg || "데이터가 없습니다."}</h2>
      </div>
    );
  }

  /* ==============================
   * 데이터 파싱
   * ============================== */
  let descMap: Record<number, DescriptionItem[]> = {};
  try {
    descMap = JSON.parse(data.contents);
  } catch {
    descMap = { 0: [{ text: data.contents, align: "text-center" }] };
  }

  const photoList = data.photos ?? [];
  const templateKey = data.template || "default";
  const currentStyle = TEMPLATE_CONFIG[templateKey] || TEMPLATE_CONFIG.default;
  console.log("raw template from server:", data.template);
  console.log("available keys:", Object.keys(TEMPLATE_CONFIG));

  /* ==============================
   * 미리보기와 동일한 렌더링
   * ============================== */
  return (
    <div className={`w-full transition-all duration-500 ${currentStyle.container}`}>
      <div
        className={`w-full h-full overflow-y-auto transition-all duration-500 ${currentStyle.padding}`}
      >
        {/* 0번 텍스트 */}
        <DescriptionDisplay items={descMap[0]} currentStyle={currentStyle} />

        {/* 이미지 + 텍스트 반복 */}
        {photoList.map((photo, idx) => (
          <div key={photo.photoId} className="flex flex-col items-center">
            <div className="w-full flex justify-center items-center px-10">
              <img
                src={photo.imageUrl}
                alt={`photo-${idx}`}
                className={`transition-all duration-700 shadow-md ${currentStyle.imageLayout}`}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
              />
            </div>

            <DescriptionDisplay items={descMap[idx + 1]} currentStyle={currentStyle} />
          </div>
        ))}

        <div className="h-5" />
      </div>
    </div>
  );
}
