
const powerScreen = document.querySelector("#power-screen");
const powerButton = document.querySelector(".power-button");
const dashboard = document.querySelector("#dashboard");

// 요소들이 페이지에 존재하는지 확인 후 실행 (에러 방지)
if (powerScreen && powerButton && dashboard) {
  let isPowerOn = false;

  // 1. 노란색 전원 버튼 클릭 이벤트
  powerButton.addEventListener("click", () => {
    // 중복 클릭 방지
    if (isPowerOn) return; 
    isPowerOn = true;
    powerButton.disabled = true;
    
    // 버튼을 살짝 눌린 상태로 유지하려면 추가 (선택사항)
    powerButton.style.transform = "translateX(-50%) translateY(4px)";
    powerButton.style.boxShadow = "0 0 0 #d99a00, 0 2px 5px rgba(0, 0, 0, 0.3)";

    // A구역 페이드 아웃 시작 (power.css의 .fade-out 클래스)
    powerScreen.classList.add("fade-out");
  });

  // 2. 페이드 아웃 애니메이션이 완전히 끝난 후 화면 교체
  powerScreen.addEventListener("transitionend", (event) => {
    // 투명도(opacity) 애니메이션이 끝났을 때만 실행
    if (event.propertyName !== "opacity") return;
    if (event.target !== powerScreen) return;

    // A구역 숨기기 (base.css의 .hidden 클래스)
    // powerScreen.classList.add("hidden");
    powerScreen.remove();
    
    // B, C구역 대시보드 구조 나타내기
    dashboard.classList.remove("hidden");

    // 3. B, C구역이 스르륵 올라오는 등장 애니메이션 실행
    // 화면에 display: flex가 적용될 시간을 0.01초 벌어준 뒤 애니메이션 클래스를 붙입니다.
    requestAnimationFrame(() => {
      dashboard.classList.add("animate-slide-in");
    });
  });
}