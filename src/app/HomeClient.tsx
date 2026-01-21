"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const BASE_URL = "/api";

export default function HomeClient() {
  const [exhibitions, setExhibitions] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`${BASE_URL}/exhibition/all`).then((res) => res.json()),
      fetch(`${BASE_URL}/photo/all`).then((res) => res.json()),
    ])
      .then(([ex, ph]) => {
        setExhibitions(ex);
        setPhotos(ph);
      })
      .catch(() => {
        setExhibitions([]);
        setPhotos([]);
      });
  }, []);

  return (
    <main className="min-h-screen bg-[#fafafa] text-[#1a1a1a] selection:bg-black selection:text-white">
      <section className="relative h-[60vh] min-h-[500px] w-full flex flex-col justify-center items-center overflow-hidden">
        {/* 1. 배경 */}
        {/* mix-blend-overlay를 사용하여 회색 배경과 자연스럽게 합성 */}
        <div
          className="absolute inset-0 pointer-events-none z-0 opacity-80 mix-blend-multiply"
          style={{
            backgroundImage: "url('/hero.JPG')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* 배경 어두운 오버레이 */}
        <div className="absolute inset-0 bg-black/30 z-0" />

        {/* 2. 메인 콘텐츠 */}
        <div className="relative z-10 flex flex-col items-center text-center px-6">
          {/* 하단 설명 및 링크 */}
          <div className="mt-12 flex flex-col items-center gap-6">
            <Link href="/photos" className="group flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white border-b border-white/30 pb-1 transition-all duration-300 group-hover:border-white"></span>
            </Link>
          </div>
        </div>

        {/* 3. 하단 장식: 얇은 라인 하나*/}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-16 bg-white/30 z-10"></div>
      </section>

      {/* --- EXHIBITIONS --- */}
      <section className="max-w-[1600px] mx-auto px-6 py-40">
        <div className="flex items-baseline justify-between mb-24 border-b border-black/10 pb-6">
          <h2 className="text-xl font-medium uppercase tracking-[0.3em] ">Exhibitions</h2>
          <span className="font-mono text-[9px] tracking-widest text-neutral-400 uppercase">
            Catalog No. 01 — {exhibitions.length.toString().padStart(2, "0")}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-24">
          {exhibitions.map((ex: any, idx: number) => (
            <div key={ex.exhibitionId} className="group relative">
              <Link href={`/exhibition/${ex.exhibitionId}`}>
                <div className="relative aspect-[16/11] overflow-hidden bg-neutral-100 shadow-sm transition-all duration-700 group-hover:shadow-xl">
                  {ex.photos?.[0] && (
                    <Image
                      src={ex.photos[0].imageUrl}
                      alt={ex.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.02] grayscale-[0.2] group-hover:grayscale-0"
                      priority={idx < 3}
                      crossOrigin="anonymous"
                    />
                  )}
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-center justify-center">
                    <span className="text-black bg-white/90 px-6 py-3 text-[9px] uppercase tracking-[0.4em] backdrop-blur-sm">
                      VIEW
                    </span>
                    {/* 2. 우측 하단 조회수 정보 */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-white/90  px-3 py-1.5 rounded-full ">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      <span className="text-[9px] font-mono font-bold tracking-tighter">
                        {ex.exhibitionViewCount?.toLocaleString() ?? "0"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between items-start">
                  <div className="space-y-2">
                    <span className="text-[8px] text-neutral-400 block uppercase tracking-[0.4em]">
                      Series 0{idx + 1}
                    </span>
                    <h3 className="text-lg font-normal uppercase tracking-tight text-neutral-800">
                      {ex.title}
                    </h3>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* --- LATEST STREAM  --- */}
      <section className="bg-white py-20 px-6 border-t border-neutral-100">
        <div className="max-w-[1400px] mx-auto">
          {/* 섹션 헤더 (생략 가능) */}
          <div className="flex flex-col items-center mb-24 text-center">
            <span className="text-[10px] tracking-[0.8em] text-neutral-700 uppercase mb-4">
              Archive Index
            </span>
            <div className="w-px h-12 bg-black opacity-20" />
          </div>

          {/* Masonry Layout */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-12 space-y-20">
            {photos.map((photo: any, idx: number) => (
              <Link
                key={photo.photoId}
                href={`/photo/${photo.photoId}`}
                className="group block relative break-inside-avoid mb-12"
              >
                {/* 이미지 컨테이너 */}
                <div className="relative overflow-hidden bg-[#efefef] border border-neutral-100 transition-all duration-700 group-hover:shadow-2xl">
                  <img
                    src={`${photo.imageUrl}?v=1`}
                    alt={photo.title}
                    crossOrigin="anonymous"
                    className="w-full h-auto opacity-100 transition-transform duration-[1.5s] ease-out block"
                  />

                  {/* ---  호버 시 나타나는 통합 정보창 --- */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                    {/* 상단: 타이틀 */}
                    <div className="mb-2  group-hover:translate-y-0 transition-transform ">
                      <h3 className="text-[12px] font-bold uppercase tracking-[0.1em] text-white">
                        {photo.title}
                      </h3>
                    </div>

                    {/* 하단: 프로필 + 닉네임 + 조회수 (한 줄 배치) */}
                    <div className="flex items-center justify-between w-full group-hover:translate-y-0 transition-transform ">
                      {/* 왼쪽: 작가 정보 */}
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full overflow-hidden border border-white/20 bg-neutral-800">
                          <img
                            src={
                              photo.userProfileUrl ||
                              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                            }
                            alt={photo.nickname}
                            className="w-full h-full object-cover grayscale brightness-110"
                          />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/90">
                          {photo.userSimpleDTO.nickname || "Anonymous"}
                        </span>
                      </div>
                      {/* 오른쪽: 좋아요 + 조회수 */}
                      <div className="flex items-center gap-4 text-white/70">
                        {/* 좋아요 db likeCount 추가 후 구현 예정
                        <div className="flex items-center gap-1.5">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="text-white/80"
                          >
                            <path d="M12 21s-6.716-4.35-9.428-7.063C.857 12.222 0 10.53 0 8.75 0 5.574 2.574 3 5.75 3c1.74 0 3.41.81 4.5 2.09C11.34 3.81 13.01 3 14.75 3 17.926 3 20.5 5.574 20.5 8.75c0 1.78-.857 3.472-2.572 5.187C18.716 16.65 12 21 12 21z" />
                          </svg>
                          <span className="text-[10px] font-mono font-bold tracking-tighter">
                            {photo.likeCount?.toLocaleString() ?? 0}
                          </span>
                        </div>
                        */}

                        {/* 오른쪽: 조회수 */}
                        <div className="flex items-center gap-1.5 text-white/70">
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                          <span className="text-[10px] font-mono font-bold tracking-tighter">
                            {photo.photoViewCount?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 이미지 안쪽 미세 테두리 */}
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/[0.03] pointer-events-none" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      {/* --- FOOTER --- */}
      <footer className="py-24 text-center flex flex-col items-center gap-8 border-t border-black/[0.03]">
        <div className="text-xl tracking-tighter opacity-60">PhotoExpo.</div>
        <div className="flex gap-8 text-[8px] tracking-[0.5em] uppercase text-neutral-400">
          <span>Privacy</span>
          <span>Archive</span>
          <span>Contact</span>
        </div>
        <p className="text-[8px] tracking-[0.3em] uppercase opacity-20 mt-4">
          © 2026 PHOTOEXPO ARCHIVE.
        </p>
      </footer>
    </main>
  );
}
