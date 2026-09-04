// 패널 전체 영역을 선택
const panels = document.querySelector("#panels");


panels.addEventListener("click", (event) => {
    // 클릭한 구역이 나사인지 확인
    const screw = event.target.closest("[data-action='remove-screw']");
    if (screw) {
        removeScrew(screw);
        return;
    }

    // 클릭한 구역이 패널 내 카드영역인지 확인
    const panelCard = event.target.closest(".panel-card");
    if (!panelCard || !panels.contains(panelCard)) {
        return;
    }

    // 이미 열린 상태라면 무시
    if (panelCard.classList.contains("open")) {
        return;
    }

    // 콘텐츠 영역 표시화
    const panelContent = panelCard.querySelector(".panel-content");
    if (panelContent) {
        panelContent.hidden = false;
    }

    // 열기 CSS클래스 입히기
    panelCard.classList.add("open");
});

// 나사풀기
function removeScrew(screw) {
    const cover = screw.closest(".side-project-cover");

    if (!cover || screw.classList.contains("is-removed")) {
        return;
    }

    screw.classList.add("is-removed");
    screw.disabled = true;

    const screws = cover.querySelectorAll("[data-action='remove-screw']");
    const removedScrews = cover.querySelectorAll(
        "[data-action='remove-screw'].is-removed"
    );

    if (screws.length === removedScrews.length) {
        cover.classList.add("is-unfastened");
    }
}

