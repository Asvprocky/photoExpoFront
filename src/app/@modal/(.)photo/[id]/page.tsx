import PhotoDetailPage from "@/app/photo/[id]/page"; // 기존 페이지 컴포넌트 재사용
import Modal from "@/components/modal";

export default async function PhotoModalPage({ params }: { params: Promise<{ id: string }> }) {
  const BASE_URL = "/api";

  const { id } = await params;
  const res = await fetch(`${BASE_URL}/photo/${id}`);
  const json = await res.json();
  const data = json.data || json;
  // json 전체를 찍어서 user 객체가 들어있는지 확인
  // console.log("Full JSON Response:", JSON.stringify(json, null, 2));
  //console.log(data);

  return (
    <Modal photoId={Number(id)} title={data.title} user={data.userSimpleDTO}>
      <PhotoDetailPage params={params} />
    </Modal>
  );
}
