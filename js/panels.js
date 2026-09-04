// 패널 전체 영역을 선택
const panels = document.querySelector("#panels");

// 모달 오픈 버튼들 선택
const linkModal = document.querySelector("#link-modal");
const linkModalIcon = document.querySelector("#link-modal-icon");
const linkModalTitle = document.querySelector("#link-modal-title");
const linkModalDescription = document.querySelector("#link-modal-description");
const linkModalGo = document.querySelector("#link-modal-go");

const linkData = {
    x: {
        icon: "X",
        title: "TWITTER / X PROFILE",
        description: "",
        url: "https://x.com/"
    },

    linkedin: {
        icon: "in",
        title: "LINKEDIN PROFILE",
        description: "",
        url: "https://www.linkedin.com/"
    },

    webflow: {
        icon: "W",
        title: "WEBFLOW PROFILE",
        description: "",
        url: "https://webflow.com/"
    },

    "pocket-island": {
        icon: "PI",
        title: "POCKET ISLAND",
        description: "A interactive 3D island designed on Webflow.",
        url: "#"
    },

    "invoice-maker": {
        icon: "IM",
        title: "INVOICE MAKER",
        description: "A simple invoice-making side project.",
        url: "#"
    },

    "tiny-adventure": {
        icon: "TA",
        title: "A TINY ADVENTURE",
        description: "A tiny interactive web experience.",
        url: "#"
    },

    "pizza-vs-burger": {
        icon: "VS",
        title: "PIZZA VS BURGER",
        description: "A small interactive comparison project.",
        url: "#"
    },

    "coo-concept": {
        icon: "COO",
        title: "COO CONCEPT",
        description: "A concept web project.",
        url: "#"
    }
};

panels.addEventListener("click", (event) => {
    // 클릭한 구역이 나사인지 확인
    const screw = event.target.closest("[data-action='remove-screw']");
    if (screw) {
        removeScrew(screw);
        return;
    }

    // 소셜 버튼 확인
    const socialButton = event.target.closest("[data-action='social']");

    if (socialButton) {
        const panelCard = socialButton.closest(".panel-card");

        openLinkModal(
            linkData[socialButton.dataset.social],
            panelCard
        );

        return;
    }

    // 프로젝트 버튼 확인
    const projectButton = event.target.closest("[data-action='open-project']");

    if (projectButton) {
        const panelCard = projectButton.closest(".panel-card");

        openLinkModal(
            linkData[projectButton.dataset.project],
            panelCard
        );

        return;
    }

    // 모달 종료 버튼 확인
    const modalCloseButton = event.target.closest(".link-modal-close");
    if (modalCloseButton) {
        closeLinkModal();
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

// 모달 열기
function openLinkModal(data, panelCard) {
    if (!data || !panelCard) {
        return;
    }

    linkModalIcon.textContent = data.icon;
    linkModalTitle.textContent = data.title;
    linkModalGo.href = data.url;

    if (data.description) {
        linkModalDescription.textContent = data.description;
        linkModalDescription.hidden = false;
    } else {
        linkModalDescription.textContent = "";
        linkModalDescription.hidden = true;
    }

    panelCard.append(linkModal);

    linkModal.hidden = false;

    requestAnimationFrame(() => {
        linkModal.classList.add("is-open");
    });
}

// 모달 닫기
function closeLinkModal() {
    linkModal.classList.remove("is-open");

    setTimeout(() => {
        linkModal.hidden = true;
    }, 200);
}