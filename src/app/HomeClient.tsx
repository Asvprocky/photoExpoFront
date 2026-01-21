"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useTransform, useScroll, useSpring } from "framer-motion";

export default function HomeClient({ exhibitions = [] }: any) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. 전체 스크롤 진행도 감지
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });

  // 2. Lenis를 대신할 부드러운 가속도(Spring) 설정
  // prowess.art 특유의 묵직한 움직임을 위해 damping을 높였습니다.
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 20,
    restDelta: 0.001,
  });

  // 3. 스크롤 진행도(0~1)를 가로 이동 거리로 변환
  // -85%는 아이템 개수에 따라 조절하세요.
  const x = useTransform(smoothProgress, [0, 1], ["0%", "-85%"]);

  return (
    <main className="bg-[#0a0a0a] text-white selection:bg-white selection:text-black">
      {/* 고정된 네비게이션 레이아웃 */}
      <nav className="fixed top-0 w-full z-50 p-10 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
          <span className="text-[10px] tracking-[0.5em] font-black uppercase">PhotoExpo®</span>
        </div>
        <div className="text-right pointer-events-auto">
          <span className="text-[10px] tracking-[0.5em] uppercase opacity-50">Edition / 2026</span>
        </div>
      </nav>

      {/* --- 가로 스크롤 섹션 --- */}
      {/* h-[500vh]로 설정하여 스크롤할 수 있는 충분한 '길이'를 확보합니다. */}
      <section ref={containerRef} className="relative h-[500vh]">
        <div className="sticky top-0 h-screen flex items-center overflow-hidden">
          {/* 가로로 움직이는 컨텐츠 뭉치 */}
          <motion.div style={{ x }} className="flex gap-[15vw] px-[10vw] items-end">
            {/* INTRO TITLE */}
            <div className="flex-shrink-0 w-[60vw]">
              <h1 className="text-[15vw] font-black italic leading-[0.8] tracking-tighter uppercase">
                Prowess
                <br />
                <span className="ml-[5vw]">Archive</span>
              </h1>
              <p className="mt-20 max-w-sm text-xs leading-loose opacity-40 uppercase tracking-widest font-medium">
                Exploring the intersection of digital light and physical emotion through a curated
                lens.
              </p>
            </div>

            {/* EXHIBITION ITEMS */}
            {exhibitions.map((ex: any, idx: number) => (
              <div key={ex.exhibitionId} className="flex-shrink-0 group">
                <Link href={`/exhibition/${ex.exhibitionId}`}>
                  <div className="relative">
                    {/* 이미지 컨테이너: prowess처럼 세로로 긴 비율 */}
                    <div className="relative h-[70vh] w-[45vw] overflow-hidden bg-neutral-900 border border-white/5">
                      {ex.photos?.[0] && (
                        <Image
                          src={ex.photos[0].imageUrl}
                          alt={ex.title}
                          fill
                          className="object-cover transition-transform duration-[2s] group-hover:scale-110 grayscale group-hover:grayscale-0"
                        />
                      )}

                      {/* 이미지 위를 지나가는 텍스트 효과 (Parallax 느낌) */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-[12vw] font-black text-white/5 uppercase italic group-hover:text-white/10 transition-colors">
                          0{idx + 1}
                        </span>
                      </div>
                    </div>

                    {/* 하단 텍스트 레이아웃 */}
                    <div className="mt-10 flex justify-between items-end border-b border-white/10 pb-4">
                      <div className="overflow-hidden">
                        <motion.h3 className="text-5xl font-black uppercase tracking-tighter italic">
                          {ex.title}
                        </motion.h3>
                      </div>
                      <span className="text-[10px] opacity-40 font-mono tracking-widest">
                        VIEW_SERIES
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}

            {/* ENDING TEXT */}
            <div className="flex-shrink-0 w-[50vw] pr-[10vw]">
              <h2 className="text-[10vw] font-black uppercase opacity-10">End.</h2>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="h-screen flex flex-col justify-center items-center border-t border-white/5">
        <div className="text-center">
          <p className="text-[10px] tracking-[1em] uppercase opacity-30 mb-10">Stay Focused</p>
          <h2 className="text-4xl font-serif italic">PhotoExpo Archive</h2>
        </div>
      </footer>
    </main>
  );
}
