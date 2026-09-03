// TODO: 개발 중 대시보드 확인을 위한 임시 기능입니다.
// 실제 화면 전환 기능이 완성되면 삭제합니다.

const params = new URLSearchParams(window.location.search);
const view = params.get("view");

if (view === "dashboard") {
  document.querySelector("#power-screen").classList.add("hidden");
  document.querySelector("#dashboard").classList.remove("hidden");
}