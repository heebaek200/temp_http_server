// 패널 전체 영역을 선택
const panels = document.querySelector("#panels");

// 포트폴리오 영역을 선택
const portfolioTrack = document.querySelector("#portfolio-track");
const portfolioSlides = document.querySelectorAll(".portfolio-slide");
const portfolioLightbox = document.querySelector("#portfolio-lightbox");
const portfolioLightboxImage = document.querySelector("#portfolio-lightbox-image");
const portfolioPlaceholder = document.querySelector("#portfolio-placeholder");
const portfolioSlider = document.querySelector("#portfolio-slider");

let portfolioIndex = 0;

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


portfolioLightbox.addEventListener("click", (event) => {
    // 포트폴리오 영역 확인
    const lightboxPrev = event.target.closest(
        "[data-action='lightbox-prev']"
    );

    if (lightboxPrev) {
        moveLightbox(-1);
        return;
    }

    const lightboxNext = event.target.closest(
        "[data-action='lightbox-next']"
    );

    if (lightboxNext) {
        moveLightbox(1);
        return;
    }

    const closeLightbox = event.target.closest(
        "[data-action='close-lightbox']"
    );

    if (closeLightbox) {
        closePortfolioLightbox();
    }
});

panels.addEventListener("click", (event) => {

    
    // 포트폴리오 이미지 슬라이드 확대
    const expandSlide = event.target.closest(
        "[data-action='expand-slide']"
    );

    if (expandSlide) {
        let slideIndex =
            Array.from(portfolioSlides).indexOf(expandSlide);

        // 0번 플레이스홀더를 클릭하면 첫 번째 실제 이미지(1번)를 확대
        if (slideIndex === 0) {
            slideIndex = 1;
        }

        openPortfolioLightbox(slideIndex);
        return;
    }

    // 포트폴리오 이전 버튼
    const portfolioPrev = event.target.closest(
        "[data-action='portfolio-prev']"
    );

    if (portfolioPrev) {
        movePortfolio(-1);
        return;
    }


    // 포트폴리오 다음 버튼
    const portfolioNext = event.target.closest(
        "[data-action='portfolio-next']"
    );

    if (portfolioNext) {
        movePortfolio(1);
        return;
    }


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


/**
 * 포트폴리오 슬라이드를 이전 또는 다음 페이지로 이동합니다.
 * 0번 페이지는 기존 BROWSE MY PORTFOLIO 화면이며,
 * 마지막 페이지 다음에는 다시 첫 페이지로 순환합니다.
 */
function movePortfolio(direction) {
    portfolioIndex += direction;

    // 마지막 페이지 다음은 첫 페이지
    if (portfolioIndex >= portfolioSlides.length) {
        portfolioIndex = 0;
    }

    // 첫 페이지 이전은 마지막 페이지
    if (portfolioIndex < 0) {
        portfolioIndex = portfolioSlides.length - 1;
    }

    updatePortfolioPosition();
}


/**
 * 현재 슬라이드 번호에 맞춰 트랙을 좌우로 이동합니다.
 * 모든 슬라이드는 부모 영역의 100% 폭을 차지하므로
 * 인덱스마다 100%씩 왼쪽으로 이동합니다.
 */
function updatePortfolioPosition() {
    portfolioTrack.style.transform =
        `translateX(-${portfolioIndex * 100}%)`;
}

/**
 * 선택한 포트폴리오 이미지를 확대 슬라이드 쇼로 표시합니다.
 * 메인 슬라이드의 현재 번호도 선택된 이미지와 동일하게 맞춥니다.
 * 이미지의 src와 alt를 원본 슬라이드에서 그대로 가져옵니다.
 */
function openPortfolioLightbox(index) {
    portfolioIndex = index;

    updateLightboxImage();

    // 확대 화면을 표시
    portfolioLightbox.hidden = false;

    requestAnimationFrame(() => {
        portfolioLightbox.classList.add("is-open");
    });
}


/**
 * 확대 화면에서 이전 또는 다음 이미지로 이동합니다.
 * 메인 슬라이드와 동일한 인덱스를 사용하여 두 화면의 상태를 동기화합니다.
 * 범위를 넘어가면 반대쪽 끝 이미지로 순환합니다.
 */
function moveLightbox(direction) {
    portfolioIndex += direction;

    // 마지막 다음은 첫 번째
    if (portfolioIndex >= portfolioSlides.length) {
        portfolioIndex = 0;
    }

    // 첫 번째 이전은 마지막
    if (portfolioIndex < 0) {
        portfolioIndex = portfolioSlides.length - 1;
    }

    updateLightboxImage();

    // 뒤쪽 원래 슬라이드도 같은 위치로 맞춤
    portfolioTrack.style.transform =
        `translateX(-${portfolioIndex * 100}%)`;
}


/**
 * 현재 portfolioIndex에 해당하는 이미지 정보를 확대 화면에 반영합니다.
 * 원본 슬라이드의 img 요소에서 src와 alt를 읽어오기 때문에
 * 별도의 이미지 데이터 배열을 중복 관리하지 않아도 됩니다.
 */
function updateLightboxImage() {
    const image = portfolioSlides[portfolioIndex].querySelector("img");

    if (!image) {
        return;
    }

    // 현재 원본 이미지의 정보를 확대 이미지에 복사
    portfolioLightboxImage.src = image.src;
    portfolioLightboxImage.alt = image.alt;
}


/**
 * 현재 열려 있는 포트폴리오 확대 화면을 닫습니다.
 * CSS 종료 애니메이션이 먼저 실행된 뒤 hidden 상태로 변경합니다.
 * 화면이 닫힌 뒤에도 현재 슬라이드 번호는 그대로 유지합니다.
 */
function closePortfolioLightbox() {
    portfolioLightbox.classList.remove("is-open");

    setTimeout(() => {
        portfolioLightbox.hidden = true;
    }, 200);
}