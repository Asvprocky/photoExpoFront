// src/constants/templates.ts

export interface TemplateStyle {
  container: string;
  font: string;
  fontColor: string;
  imageLayout: string;
  contentAlign: string;
  padding: string;
  titleSize: string;
}

export const TEMPLATE_CONFIG: Record<string, TemplateStyle> = {
  default: {
    container: "bg-white",
    font: "font-sans",
    fontColor: "text-gray-900",
    imageLayout: "w-full aspect-auto object-contain mb-5 border-none",
    contentAlign: "text-left",
    padding: "p-0",
    titleSize: "text-3xl",
  },
  classic: {
    container: "bg-[#f4f1ea]",
    font: "font-serif",
    fontColor: "text-[#2c2c2c]",
    imageLayout: "w-[85%] mx-auto my-12 shadow-2xl border-[15px] border-white ring-1 ring-black/5",
    contentAlign: "text-center",
    padding: "p-12",
    titleSize: "text-4xl",
  },
  grey: {
    container: "bg-[#0f0f0f]", // 블랙 배경
    font: "font-sans",
    fontColor: "text-white", // 화이트 텍스트로 대비 극대화
    imageLayout:
      "w-[90%] mx-auto my-24 shadow-[0_0_50px_rgba(255,255,255,0.1)] grayscale hover:grayscale-0 transition-all duration-1000",
    // 위 설정: 사진에 약간의 빛무리가 생기고, 기본적으로 흑백이다가 마우스를 올리면 컬러가 되는 효과
    contentAlign: "text-center",
    padding: "py-24 px-6",
    titleSize: "text-6xl font-black tracking-tighter", // 웅장한 제목
  },
  art: {
    container: "bg-white", // 순백색 배경
    font: "font-sans",
    fontColor: "text-black",
    // 💡 포인트: 얇은 블랙 프레임 + 넓은 여백 + 그림자 제거 (미니멀리즘)
    imageLayout:
      "w-[75%] mx-auto my-32 border-[1px] border-black p-2 bg-white transition-transform duration-500 hover:scale-[1.02]",
    contentAlign: "text-center",
    padding: "py-32 px-10",
    titleSize: "text-2xl font-light tracking-[0.5em] mb-20", // 제목을 작고 넓게 배치해서 고급스럽게
  },

  // 나중에 여기에 'modern', 'art' 등을 추가하기만 하면 끝!
};
