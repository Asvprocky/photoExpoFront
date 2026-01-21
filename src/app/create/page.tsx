"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/services/auth";
import { TEMPLATE_CONFIG } from "../constants/templates";

const BASE_URL = "http://3.34.179.129:8080";

/* ==============================
 * 외부 컴포넌트: 개별 설명 블록
 * ============================== */
const DescriptionBlock = ({ index, subIndex, data, onUpdate, onRemove, currentStyle }: any) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [data.text]);

  return (
    <div
      className={`w-full py-6 px-10 group/desc relative ${data.align} animate-in slide-in-from-top-2 duration-500`}
    >
      <textarea
        ref={textareaRef}
        value={data.text}
        onChange={(e) => onUpdate(index, subIndex, { ...data, text: e.target.value })}
        placeholder="내용을 입력하세요..."
        className={`w-full bg-transparent resize-none outline-none border-none transition-all placeholder:text-gray-400/50 
          ${currentStyle.font} ${currentStyle.fontColor} ${data.align}
          text-lg md:text-xl leading-relaxed min-h-[40px] focus:ring-0`}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 flex gap-2 opacity-0 group-hover/desc:opacity-100 transition-all bg-black/80 p-1.5 rounded-full border border-white/20 z-20">
        <button
          type="button"
          onClick={() => onUpdate(index, subIndex, { ...data, align: "text-left" })}
          className={`px-2 text-[10px] ${
            data.align === "text-left" ? "text-blue-400" : "text-white"
          }`}
        >
          L
        </button>
        <button
          type="button"
          onClick={() => onUpdate(index, subIndex, { ...data, align: "text-center" })}
          className={`px-2 text-[10px] ${
            data.align === "text-center" ? "text-blue-400" : "text-white"
          }`}
        >
          C
        </button>
        <button
          type="button"
          onClick={() => onUpdate(index, subIndex, { ...data, align: "text-right" })}
          className={`px-2 text-[10px] ${
            data.align === "text-right" ? "text-blue-400" : "text-white"
          }`}
        >
          R
        </button>
        <div className="w-[1px] h-3 bg-white/20 self-center mx-1" />
        <button
          type="button"
          onClick={() => onRemove(index, subIndex)}
          className="px-2 text-[10px] text-red-400 font-bold"
        >
          삭제
        </button>
      </div>
    </div>
  );
};

const InsertZone = ({ index, onAddText, onAddPhoto }: any) => {
  return (
    <div className="w-full px-10 py-2">
      <div className="w-full h-10 border border-dashed border-gray-200 rounded-lg flex items-center justify-center transition-all group overflow-hidden">
        <button
          type="button"
          onClick={() => onAddText(index)}
          className="flex-1 h-full flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors group/btn"
        >
          <span className="text-[11px] font-black text-gray-400 group-hover/btn:text-blue-600 uppercase tracking-tighter">
            + Text
          </span>
        </button>
        <div className="w-[1px] h-4 bg-gray-100" />
        <button
          type="button"
          onClick={() => onAddPhoto(index)}
          className="flex-1 h-full flex items-center justify-center gap-2 hover:bg-green-50 transition-colors group/btn"
        >
          <span className="text-[11px] font-black text-gray-400 group-hover/btn:text-green-600 uppercase tracking-tighter">
            + Photo
          </span>
        </button>
      </div>
    </div>
  );
};

export default function UnifiedUploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const insertTargetRef = useRef<number | null>(null);

  const [isExhibitionMode, setIsExhibitionMode] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [template, setTemplate] = useState<string>("default");
  const [loading, setLoading] = useState(false);
  const [descMap, setDescMap] = useState<Record<number, { text: string; align: string }[]>>({});

  // 📍 에러 상태 통합 관리
  const [errors, setErrors] = useState({
    title: false,
    file: false,
  });

  const currentStyle = TEMPLATE_CONFIG[template] || TEMPLATE_CONFIG.default;

  useEffect(() => {
    if (!isExhibitionMode) {
      setTemplate("default");
    }
  }, [isExhibitionMode]);

  const handlePhotoAddClick = (index: number) => {
    insertTargetRef.current = index;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // 사진이 추가되면 에러 상태 해제
    setErrors((prev) => ({ ...prev, file: false }));

    const fileArray = Array.from(files);
    const newPreviewUrls = fileArray.map((f) => URL.createObjectURL(f));

    if (!isExhibitionMode) {
      if (fileArray.length > 1) {
        alert("일반 사진 모드에서는 1장의 사진만 올릴 수 있습니다.");
        e.target.value = "";
        return;
      }
      if (selectedFiles.length >= 1) {
        alert("일반 모드에서는 사진을 더 추가할 수 없습니다.");
        e.target.value = "";
        insertTargetRef.current = null;
        return;
      }
    }

    const targetIdx = insertTargetRef.current;
    if (targetIdx !== null) {
      setSelectedFiles((prev) => {
        const next = [...prev];
        next.splice(targetIdx, 0, ...fileArray);
        return next;
      });
      setPreviews((prev) => {
        const next = [...prev];
        next.splice(targetIdx, 0, ...newPreviewUrls);
        return next;
      });
      setDescMap((prev) => {
        const newMap: any = {};
        const moveCount = fileArray.length;
        Object.entries(prev).forEach(([key, val]) => {
          const k = parseInt(key);
          if (k > targetIdx) newMap[k + moveCount] = val;
          else newMap[k] = val;
        });
        return newMap;
      });
    } else {
      setSelectedFiles((prev) => [...prev, ...fileArray]);
      setPreviews((prev) => [...prev, ...newPreviewUrls]);
    }
    insertTargetRef.current = null;
    e.target.value = "";
  };

  const handleToggleExhibitionMode = (checked: boolean) => {
    if (!checked && selectedFiles.length > 1) {
      const ok = confirm(
        "일반 사진 모드에서는 사진을 1장만 사용할 수 있습니다.\n계속하시겠습니까?"
      );
      if (!ok) return;
      setSelectedFiles((prev) => prev.slice(0, 1));
      setPreviews((prev) => prev.slice(0, 1));
      setDescMap((prev) => {
        const next: Record<number, any[]> = {};
        if (prev[0]) next[0] = prev[0];
        if (prev[1]) next[1] = prev[1];
        return next;
      });
    }
    setIsExhibitionMode(checked);
  };

  const handleRemoveFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setDescMap((prev) => {
      const newMap: Record<number, any[]> = {};
      const upperTexts = prev[index] || [];
      const lowerTexts = prev[index + 1] || [];
      if (upperTexts.length || lowerTexts.length) {
        newMap[index] = [...upperTexts, ...lowerTexts];
      }
      Object.entries(prev).forEach(([key, val]) => {
        const k = Number(key);
        if (k < index) newMap[k] = val;
        else if (k > index + 1) newMap[k - 1] = val;
      });
      return newMap;
    });
  };

  const addDescription = (index: number) => {
    setDescMap((prev) => {
      const currentList = Array.isArray(prev[index]) ? prev[index] : [];
      return { ...prev, [index]: [{ text: "", align: "text-center" }, ...currentList] };
    });
  };

  const updateDescription = (index: number, subIndex: number, newData: any) => {
    setDescMap((prev) => {
      const newList = [...(prev[index] || [])];
      newList[subIndex] = newData;
      return { ...prev, [index]: newList };
    });
  };

  const removeDescription = (index: number, subIndex: number) => {
    setDescMap((prev) => {
      const newList = (prev[index] || []).filter((_, i) => i !== subIndex);
      const nextMap = { ...prev };
      if (newList.length === 0) delete nextMap[index];
      else nextMap[index] = newList;
      return nextMap;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 📍 통합 유효성 검사
    const newErrors = {
      title: !title.trim(),
      file: selectedFiles.length === 0,
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some((err) => err)) {
      if (newErrors.file) window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);
    try {
      let exhibitionId = null;
      const allContents = JSON.stringify(descMap);

      if (isExhibitionMode) {
        const exhibitionRes = await authFetch(`${BASE_URL}/exhibition/create`, {
          method: "POST",
          body: JSON.stringify({ title, contents: allContents, template }),
        });
        if (!exhibitionRes.ok) throw new Error("전시회 생성 실패");
        const data = await exhibitionRes.json();
        exhibitionId = data.exhibitionId;
      }

      const formData = new FormData();
      const photoDto = JSON.stringify({
        exhibitionId,
        title,
        description: allContents,
      });

      formData.append("dto", new Blob([photoDto], { type: "application/json" }));
      selectedFiles.forEach((file) => formData.append("image", file));

      const photoRes = await authFetch(`${BASE_URL}/photo/upload`, {
        method: "POST",
        body: formData,
      });

      if (!photoRes.ok) throw new Error("사진 업로드 실패");
      const photoResult = await photoRes.json();
      const uploadedPhotoId = photoResult[0]?.photoId;

      if (exhibitionId) {
        router.push("/");
        setTimeout(() => router.push(`/exhibition/${exhibitionId}`), 300);
      } else {
        router.push("/");
        setTimeout(() => router.push(`/photo/${uploadedPhotoId}`), 300);
      }
    } catch (error) {
      console.error(error);
      alert("등록 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-100 font-bold">
      <div className="max-w-[1400px] mx-auto px-6 flex md:flex-col lg:flex-row gap-8">
        {/* --- 왼쪽 영역: 편집 캔버스 --- */}
        <div
          className={`flex-1 rounded-none border border-gray-200 shadow-sm min-h-[700px] flex flex-col relative transition-all duration-500 overflow-hidden ${currentStyle.container}`}
        >
          <div
            className={`w-full h-full overflow-y-auto custom-scrollbar transition-all duration-500 ${currentStyle.padding}`}
          >
            <InsertZone index={0} onAddText={addDescription} onAddPhoto={handlePhotoAddClick} />
            {Array.isArray(descMap[0]) &&
              descMap[0].map((data, subIdx) => (
                <DescriptionBlock
                  key={`0-${subIdx}`}
                  index={0}
                  subIndex={subIdx}
                  data={data}
                  onUpdate={updateDescription}
                  onRemove={removeDescription}
                  currentStyle={currentStyle}
                />
              ))}

            {previews.map((url, idx) => (
              <div key={`${url}-${idx}`} className="flex flex-col items-center">
                <div className="relative group w-full flex justify-center items-center px-10">
                  <img
                    src={url}
                    alt="p"
                    className={`transition-all duration-700 shadow-md ${currentStyle.imageLayout}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    className="absolute top-4 right-14 bg-black/70 hover:bg-red-600 text-white w-10 h-10 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-all"
                  >
                    ✕
                  </button>
                </div>
                <InsertZone
                  index={idx + 1}
                  onAddText={addDescription}
                  onAddPhoto={handlePhotoAddClick}
                />
                {Array.isArray(descMap[idx + 1]) &&
                  descMap[idx + 1].map((data, subIdx) => (
                    <DescriptionBlock
                      key={`${idx + 1}-${subIdx}`}
                      index={idx + 1}
                      subIndex={subIdx}
                      data={data}
                      onUpdate={updateDescription}
                      onRemove={removeDescription}
                      currentStyle={currentStyle}
                    />
                  ))}
              </div>
            ))}
            <div className="h-40" />
          </div>
        </div>

        {/* --- 오른쪽 사이드바: 큐레이션 도구 --- */}
        <div className="w-full lg:w-[320px] h-fit sticky top-24 bg-white border border-gray-200 p-7 shadow-sm">
          <div className="mb-8 pb-4 border-b border-gray-50">
            <h2 className="text-sm text-gray-900 uppercase tracking-widest">Curation</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            {/* 1. 업로드 섹션 */}
            <div className="space-y-3 relative mb-10">
              <button
                type="button"
                onClick={() => {
                  insertTargetRef.current = null;
                  fileInputRef.current?.click();
                }}
                className={`w-full h-28 border-1 rounded-2xl bg-gray-50 hover:bg-white transition-all flex flex-col items-center justify-center gap-2 group ${
                  errors.file ? "border-gray-400" : "border-gray-100"
                }`}
              >
                <span
                  className={`text-2xl transition-colors ${
                    errors.file ? "text-rose-400" : "text-gray-300 group-hover:text-black"
                  }`}
                >
                  +
                </span>
                <span
                  className={`text-[10px] font-black uppercase tracking-widest ${
                    errors.file ? "text-gray-700" : "text-gray-700 group-hover:text-black"
                  }`}
                >
                  Add Photos
                </span>
              </button>
              {/* 📍 사진 에러 메시지 */}
              <div
                className={`absolute -bottom-8 left-2 transition-all duration-300 ${
                  errors.file
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-1 pointer-events-none"
                }`}
              >
                <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">
                  * At least one photo is required
                </p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
              />
            </div>

            {/* 2. 전시회 설정 */}
            <div className="p-5 bg-gray-50 rounded-2xl space-y-4 overflow-hidden transition-all duration-500">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">
                  Exhibition
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isExhibitionMode}
                    onChange={(e) => handleToggleExhibitionMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-gray-400 transition-all after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>
              <div
                className={`grid transition-all duration-500 overflow-hidden ${
                  isExhibitionMode
                    ? "grid-rows-[1fr] opacity-100 pt-4 border-t border-gray-100"
                    : "grid-rows-[0fr] opacity-0 pt-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="grid grid-cols-2 gap-2 pb-1">
                    {["default", "classic", "grey", "art"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTemplate(t)}
                        className={`py-2 rounded-lg text-[10px] font-bold border-2 transition-all uppercase ${
                          template === t
                            ? "bg-white border-gray-700 text-gray-700 shadow-sm"
                            : "bg-transparent border-transparent text-gray-700 hover:text-gray-400"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. 제목 입력 */}
            <div className="space-y-3 relative mb-10">
              <label className="block text-[11px] font-black text-gray-700 uppercase tracking-widest ml-2 mb-2">
                Title
              </label>
              <div className="relative">
                <input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (e.target.value.trim()) setErrors((prev) => ({ ...prev, title: false }));
                  }}
                  className={`w-full bg-white border p-4 rounded-xl outline-none text-xs font-bold transition-all shadow-sm placeholder:text-gray-200 uppercase ${
                    errors.title ? "border-gray-400" : "border-gray-100 focus:border-black"
                  }`}
                  placeholder="Title"
                />
                {/* 📍 제목 에러 메시지 */}
                <div
                  className={`absolute -bottom-6 left-2 transition-all duration-300 ${
                    errors.title
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 -translate-y-1 pointer-events-none"
                  }`}
                >
                  <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">
                    * Title is required to publish
                  </p>
                </div>
              </div>
            </div>

            {/* 4. 발행 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-black text-[11px] font-black rounded-xl hover:bg-gray-300 transition-all uppercase tracking-[0.2em] shadow-lg shadow-gray-200 active:scale-[0.98] disabled:bg-gray-100"
            >
              {loading ? "Publishing..." : "Publish"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
