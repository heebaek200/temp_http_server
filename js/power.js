
const powerScreen = document.querySelector("#power-screen");
const powerButton = document.querySelector(".power-button");
const dashboard = document.querySelector("#dashboard");

if(powerScreen && powerButton && dashboard){
// 상태 변수(중복 클릭 방지용)
    let isPowerOn = false;

powerButton.addEventListener("click", () => {
    if(isPowerOn){
        return;
    }

    isPowerOn = true;
    powerButton.disabled = true;

    // [선택] 전원 화면에 퇴장 애니메이션 클래스 추가 (CSS 연동용)
        powerScreen.classList.add("fade-out");
});


powerScreen.addEventListener("animationend", (event) => {
    if(event.target !== powerScreen){
        return;
    }
    // 1. 전원 화면 숨김
    powerScreen.classList.add("hidden");
    
    // 2. 대시 보드 표시(hidden 제거)
    dashboard.classList.remove(hidden);

    // 3. 대시 보드에 등장 클래스 추가(애니메이션 유도)
    requestAnimationFrame(() => {
        // 등장 애니메이션 클래스
        dashboard.classList.add("animate-slide-in");
    });
});
}
