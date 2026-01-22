import ExhibitionDetail from "@/app/exhibition/[id]/page"; // 기존 페이지 컴포넌트 재사용
import Modal from "@/components/modal";

export default async function ExhibitionModalPage({ params }: { params: Promise<{ id: string }> }) {
  const BASE_URL = "/api";

  const { id } = await params;
  const res = await fetch(`${BASE_URL}/exhibition/${id}`);
  const json = await res.json();
  const data = json.data || json;
  /* [핵심 수정] 
     전시회 데이터 구조(data.userEmail)를 
     Modal이 기대하는 구조(user.nickname)로 수동 매핑. 
  */
  const exhibitionUser = {
    // Modal 컴포넌트는 user.nickname을 보여주므로, 여기에 이메일을 넣어줌.
    nickname: data.userNickname || data.userEmail?.split("@")[0] || "Curator",
    email: data.userEmail || "",
  };

  console.log("전시회 유저 상세 정보:", JSON.stringify(data.userSimpleDTO, null, 2));
  return (
    <Modal exhibitionId={Number(id)} title={data.title} user={data.userSimpleDTO}>
      <ExhibitionDetail params={params} />
    </Modal>
  );
}
