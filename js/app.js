// TODO: 개발 중 대시보드 확인을 위한 임시 기능입니다.
// 실제 화면 전환 기능이 완성되면 삭제합니다.

// 아래 주소로 대시보드가 표시된 상태의 페이지로 입장할 수 있습니다.
// http://127.0.0.1:5500/index.html?view=dashboard

const params = new URLSearchParams(window.location.search);
const view = params.get("view");

if (view === "dashboard") {
  document.querySelector("#power-screen").classList.add("hidden");
  document.querySelector("#dashboard").classList.remove("hidden");
}