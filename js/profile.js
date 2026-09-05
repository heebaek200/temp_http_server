// ============================================================
// CONTACT ME 버튼 기능
//
// 이슈 제약: 콘텐츠 패널의 html/css는 건드리지 않는다. 그래서 사선 배경(원래 ::before로
// 만들었던 것), 팝업 표시/숨김, 버튼 트랙 스타일, 누르는 동안의 색/크기 깜박임까지
// 전부 이 파일 안에서 inline style + Web Animations API로 만든다.
//
// 동작 순서 요약
// 1. 버튼을 누르면(pointerdown) -> "SLIDE IT!" 팝업이 위로 올라와서 보이고,
//    화살표 아이콘 색 깜박임 + 스크린 캐릭터 이미지 확대 깜박임 + 사선 흐르는 효과가 시작됨
// 2. 누르고 있는 동안(pointermove) -> 버튼이 손가락(마우스)을 따라 좌우로 움직임
// 3. 손을 떼면(pointerup)
//    - 화살표 박스(profile-contact-img-box)까지 충분히 밀었으면 -> 네이버로 이동
//    - 아니면 -> 버튼이 원래 자리로 다시 돌아가고, 팝업/깜박임/사선 효과도 모두 멈춤
// ============================================================

// 1) 필요한 요소들을 미리 찾아둔다
const contactButton = document.querySelector(".profile-contact-button button"); // 드래그할 버튼(손잡이)
const contactContainer = document.querySelector(".profile-contact-button"); // 버튼 + 화살표 영역을 감싸는 트랙
const contactTarget = document.querySelector(".profile-contact-img-box"); // 버튼이 도착해야 하는 화살표 영역
const contactArrowIcon = document.querySelector(".profile-contact-img"); // 화살표 박스 안의 화살표 아이콘
const screenPopup = document.querySelector(".profile-screen-popup"); // "SLIDE IT!" 문구
const screenImg = document.querySelector(".profile-screen-img"); // 스크린 안 캐릭터 이미지
const profileScreen = document.querySelector(".profile-screen"); // 캐릭터/팝업을 담는 스크린 박스

// 버튼을 끝까지 밀었을 때 이동할 링크
const CONTACT_LINK = "https://www.naver.com";

// 화살표 영역의 몇 %까지 밀었을 때 "도착"으로 인정할지 (0.8 = 80%)
const REACH_THRESHOLD = 0.8;

// --- 정적인 스타일(누를 때마다 바뀌지 않는 것들)은 여기서 한 번만 inline style로 세팅한다 ---

// 팝업을 화면 밖(아래)으로 숨기려면 스크린 박스가 넘치는 부분을 잘라내야 함
profileScreen.style.overflow = "hidden";

// 버튼의 border-bottom이 화살표 박스보다 두꺼워져도 바닥끼리 맞춰지도록 flex-end 정렬
Object.assign(contactContainer.style, {
  alignItems: "flex-end",
  overflow: "hidden",
  position: "relative",
});

// 버튼: 아래쪽 색 영역을 더 두껍게(0.3125em -> 0.46875em) + 그만큼 height도 늘림.
// 드래그로 화살표 박스 위까지 밀리므로 z-index로 위에 오게 하고, 모바일 드래그 중
// 화면이 같이 스크롤/선택되지 않도록 touch-action/user-select도 막는다
Object.assign(contactButton.style, {
  borderBottom: "0.46875em solid #167062",
  height: "2.65625em",
  position: "relative",
  zIndex: "1",
  touchAction: "none",
  userSelect: "none",
});

// 화살표 박스: 단색 배경 + 사선 무늬(고정) + 사선 오버레이와 만나는 왼쪽 끝을 부드럽게 페이드
Object.assign(contactTarget.style, {
  backgroundColor: "#213E9A",
  backgroundImage:
    "repeating-linear-gradient(45deg, rgba(0,0,0,0.15) 0, rgba(0,0,0,0.15) 0.5625em, transparent 0.3125em, transparent 0.9375em)",
  maskImage: "linear-gradient(to left, transparent, #000 1em)",
  WebkitMaskImage: "linear-gradient(to left, transparent, #000 1em)",
});

// 사선 오버레이: 원래 ::before로 만들었던 레이어를 실제 요소로 대체 (js에서 css를 못 건드리므로
// 가상요소 대신 진짜 div를 만들어 붙인다). 트랙 padding만큼 안쪽에 위치, 오른쪽은 화살표 박스와
// 만나는 지점에서 부드럽게 페이드
const stripeOverlay = document.createElement("div");
Object.assign(stripeOverlay.style, {
  position: "absolute",
  top: "0.625em",
  right: "0.9375em",
  bottom: "0.625em",
  left: "0.9375em",
  backgroundImage:
    "repeating-linear-gradient(45deg, rgba(0,0,0,0.15) 0, rgba(0,0,0,0.15) 0.5625em, transparent 0.3125em, transparent 0.9375em)",
  maskImage: "linear-gradient(to right, transparent, #000 1em)",
  WebkitMaskImage: "linear-gradient(to right, transparent, #000 1em)",
  pointerEvents: "none",
});
contactContainer.insertBefore(stripeOverlay, contactContainer.firstChild);

// 팝업: 기본은 화면 밖(아래)에 완전히 숨겨두고, 누르고 있을 때만 보여준다
Object.assign(screenPopup.style, {
  transform: "translateY(100%)",
  opacity: "0",
  visibility: "hidden",
  pointerEvents: "none",
});

// 2) 드래그 도중에 계속 값이 바뀌는 변수들을 미리 선언해 둔다
let isDragging = false; // 지금 버튼을 누르고 있는 중인지 여부
let startX = 0; // 드래그를 시작한 순간의 마우스 x좌표
let currentDx = 0; // 버튼이 원래 자리에서 현재 얼마나 이동했는지 (px)
let maxDx = 0; // 버튼이 이동할 수 있는 최대 거리 (px) = 화살표 박스의 너비
let contactPressAnimations = []; // 누르고 있는 동안 재생 중인 애니메이션들 (뗄 때 전부 cancel)

// "SLIDE IT!" 팝업을 보여주는 함수
function showPopup() {
  screenPopup.style.transition = "transform 0.25s ease, opacity 0.25s ease";
  screenPopup.style.transform = "translateY(0)";
  screenPopup.style.opacity = "1";
  screenPopup.style.visibility = "visible";
}

// "SLIDE IT!" 팝업을 숨기는 함수
function hidePopup() {
  screenPopup.style.transition = "transform 0.25s ease, opacity 0.25s ease, visibility 0s linear 0.25s";
  screenPopup.style.transform = "translateY(100%)";
  screenPopup.style.opacity = "0";
  screenPopup.style.visibility = "hidden";
}

// 버튼을 x축으로 dx(px)만큼 이동시켜서 실제 화면에 반영하는 함수
function moveButtonTo(dx) {
  contactButton.style.transform = `translateX(${dx}px)`;
}

// 버튼을 원래 자리(0)로 부드럽게 되돌리는 함수
function resetButtonPosition() {
  // 되돌아갈 때만 애니메이션이 보이도록 transition을 켜준다
  // (드래그하는 동안은 손가락을 그대로 따라가야 하므로 transition이 꺼져 있어야 함)
  contactButton.style.transition = "transform 0.25s ease";
  moveButtonTo(0);
}

// 누르고 있는 동안의 사선 흐름 + 화살표 색 깜박임 + 스크린 이미지 확대 깜박임을
// Web Animations API로 재생한다 (css 애니메이션/키프레임 없이 전부 js에서 처리)
function startPressEffects() {
  contactPressAnimations = [
    stripeOverlay.animate(
      [{ backgroundPosition: "0 0" }, { backgroundPosition: "0.6629em -0.6629em" }],
      { duration: 600, easing: "linear", iterations: Infinity }
    ),
    contactTarget.animate(
      [{ backgroundPosition: "0 0" }, { backgroundPosition: "0.6629em -0.6629em" }],
      { duration: 600, easing: "linear", iterations: Infinity }
    ),
    screenImg.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.1)" }, { transform: "scale(1)" }],
      { duration: 600, easing: "ease-in-out", iterations: Infinity }
    ),
    contactArrowIcon.animate(
      [{ backgroundColor: "#2b4fc5" }, { backgroundColor: "#C4C4C4" }, { backgroundColor: "#2b4fc5" }],
      { duration: 600, easing: "ease-in-out", iterations: Infinity }
    ),
  ];
}

// 손을 떼면 위 애니메이션들을 전부 멈춘다 (cancel하면 원래 스타일로 즉시 돌아감)
function stopPressEffects() {
  contactPressAnimations.forEach((animation) => animation.cancel());
  contactPressAnimations = [];
}

// 3) 마우스(또는 손가락)를 눌렀을 때 실행됨 -> 드래그 시작
function handlePointerDown(event) {
  isDragging = true;
  startX = event.clientX;

  // 화살표 박스의 실제 너비를 구해서, 버튼이 밀려갈 수 있는 최대 거리로 사용
  maxDx = contactTarget.getBoundingClientRect().width;

  // 드래그하는 동안은 애니메이션 없이 즉시 손가락을 따라가야 하므로 transition을 끈다
  contactButton.style.transition = "none";

  // 누르고 있는 동안은 계속 팝업이 보여야 하므로 여기서 바로 보여준다
  showPopup();

  // 누르고 있는 동안 사선 흐름 + 화살표 색 깜박임 + 스크린 이미지 확대 깜박임 시작
  startPressEffects();
}

// 4) 누른 채로 움직일 때마다 계속 실행됨 -> 드래그 중
function handlePointerMove(event) {
  if (!isDragging) return; // 버튼을 누르고 있는 상태가 아니면 아무것도 하지 않음

  const dx = event.clientX - startX; // 시작 지점에서 지금까지 움직인 거리

  // 0보다 작아지면(왼쪽으로 원래 자리보다 더 못 감) 0으로,
  // maxDx보다 커지면(화살표 박스를 넘어가면) maxDx로 값을 제한한다
  currentDx = Math.min(Math.max(dx, 0), maxDx);

  moveButtonTo(currentDx);
}

// 5) 마우스(또는 손가락)를 뗐을 때 실행됨 -> 드래그 종료
function handlePointerUp() {
  if (!isDragging) return; // 드래그 중이 아니었다면 무시
  isDragging = false;

  // 화살표 박스의 80% 이상 밀었으면 "도착"으로 인정
  const reachedTarget = currentDx >= maxDx * REACH_THRESHOLD;

  if (reachedTarget) {
    window.open(CONTACT_LINK, "_blank"); // 새 탭으로 링크 열기
  }

  // 도착했든 안 했든, 버튼은 항상 원래 자리로 되돌아간다
  resetButtonPosition();
  currentDx = 0;

  // 손을 뗐으니 사선 흐름/깜박임 애니메이션을 전부 멈춘다
  stopPressEffects();

  // 팝업은 살짝 있다가 사라지도록 약간의 시간(0.3초)을 두고 숨긴다
  setTimeout(hidePopup, 300);
}

// 6) 이벤트 등록
// pointerdown/pointermove/pointerup 을 쓰면 마우스와 터치(모바일)를 한 번에 처리할 수 있다
contactButton.addEventListener("pointerdown", handlePointerDown);
// move/up은 버튼이 아니라 document 전체에 등록해야, 드래그 중 손가락이
// 버튼 밖으로 나가도(빠르게 움직여도) 계속 따라가고 손을 뗀 걸 놓치지 않는다
document.addEventListener("pointermove", handlePointerMove);
document.addEventListener("pointerup", handlePointerUp);

// ============================================================
// 스위치 버튼(1,2,3) on/off 토글 기능 (라디오 버튼처럼 동작)
//
// 이슈 제약: "콘텐츠 패널의 HTML 및 CSS 수정"은 이번 이슈 범위가 아니라서,
// index.html / css/profile.css는 전혀 건드리지 않고 여기(js)에서만 전부 처리한다.
// - data-profile 속성: 여기서 버튼에 setAttribute로 직접 붙임
// - 아이콘(연필/톱니바퀴/안경)·노이즈 배경: 여기서 createElement로 만들어서 붙이고,
//   스타일은 inline style로, 애니메이션은 Web Animations API(element.animate)로 재생
// - 스위치 thumb 슬라이드/색 변경: css의 :hover 등 순수 상태 표시만 css에 맡기고,
//   on/off에 따른 이동 거리·색은 여기서 계산해서 inline style로 적용
//
// 동작 요약
// 1. 버튼을 클릭하면 -> thumb가 왼쪽<->오른쪽으로 슬라이드하고 색이 원래색<->흰색으로 바뀜
// 2. 1,2,3번 중 마지막에 누른 버튼 하나만 켜지고, 나머지는 자동으로 꺼짐
//    (이미 켜져 있는 버튼을 다시 누르면 그 버튼만 꺼짐)
// 3. 1번(graphic)이 켜지면 연필 아이콘 + 노이즈1, 2번(motion)이 켜지면 톱니바퀴 아이콘 + 노이즈2,
//    3번(webflow)이 켜지면 안경 아이콘 + 노이즈3이 스크린에 나타나고,
//    꺼지면(다른 버튼이 켜지거나 자기 자신이 꺼지면) 같이 사라짐
// ============================================================
const switchButtons = document.querySelectorAll(".profile-switch-button");

// 버튼의 라벨 문구(.profile-button-label, 기존 html 그대로)로 어떤 스위치인지 구분한다
const PROFILE_CONFIG = {
  "GRAPHIC & WEBDESIGNER": { profile: "graphic", emoji: "✏️", rotate: "rotate(90deg)", top: "0.125em", right: "1.9em", fontSize: "2.5em" },
  "MOTION DESIGNER": { profile: "motion", emoji: "⚙️", rotate: "", top: "0.03em", right: "1.9em", fontSize: "2.5em" },
  "WEBFLOW EXPERT": { profile: "webflow", emoji: "👓", rotate: "rotate(-15deg)", top: "0.08em", right: "1.4em", fontSize: "4.5em" },
};

// 노이즈 3종: 무늬(backgroundImage)는 고정, 움직임/밝기만 Web Animations API로 반복 재생
const NOISE_STYLES = {
  graphic: {
    backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.18) 0, rgba(255,255,255,0.18) 0.0625em, transparent 0.0625em, transparent 0.125em)",
    keyframes: [
      { transform: "translate(0, 0)" },
      { transform: "translate(-0.02em, 0.02em)" },
      { transform: "translate(0, 0)" },
    ],
    duration: 1200,
  },
  motion: {
    backgroundImage: "repeating-linear-gradient(45deg, rgba(120,255,220,0.18) 0, rgba(120,255,220,0.18) 0.0625em, transparent 0.0625em, transparent 0.1875em)",
    keyframes: [
      { transform: "scale(1) translate(0, 0)" },
      { transform: "scale(1.008) translate(0.015em, -0.015em)" },
      { transform: "scale(1) translate(0, 0)" },
    ],
    duration: 1400,
  },
  webflow: {
    backgroundImage: "radial-gradient(rgba(255,255,255,0.7) 0.04em, transparent 0.04em)",
    backgroundSize: "0.2em 0.2em",
    keyframes: [{ opacity: 0.25 }, { opacity: 0.4 }, { opacity: 0.25 }],
    duration: 1600,
  },
};

// 스크린 박스 안에서 노이즈가 캐릭터 이미지보다 뒤에 깔리게 하려면 스크린 박스가
// 자기만의 stacking context를 가져야 해서 z-index를 붙여준다 (css 파일은 안 건드림)
profileScreen.style.zIndex = "0";

// 아이콘/노이즈 요소를 js에서 만들어서 스크린 안에 붙인다 (html에는 존재하지 않음)
const dynamicIcon = document.createElement("span");
Object.assign(dynamicIcon.style, {
  position: "absolute",
  opacity: "0",
  pointerEvents: "none",
  transition: "opacity 0.2s ease, transform 0.2s ease",
});
profileScreen.appendChild(dynamicIcon);

const dynamicNoise = document.createElement("div");
Object.assign(dynamicNoise.style, {
  position: "absolute",
  inset: "0",
  zIndex: "-1",
  opacity: "0",
  pointerEvents: "none",
});
profileScreen.insertBefore(dynamicNoise, profileScreen.firstChild);

let activeNoiseAnimation = null; // 현재 재생 중인 노이즈 애니메이션 (꺼질 때 cancel용)
let currentProfileConfig = null; // 지금 켜져 있는 스위치의 설정 (hover 확대 계산용)

// 선택된 스위치에 맞는 아이콘/노이즈를 켠다
function showProfile(config) {
  currentProfileConfig = config;

  dynamicIcon.textContent = config.emoji;
  dynamicIcon.style.top = config.top;
  dynamicIcon.style.right = config.right;
  dynamicIcon.style.fontSize = config.fontSize;
  dynamicIcon.style.transform = config.rotate;
  dynamicIcon.style.opacity = "1";
  // 이슈 요구사항: "프로필 내용이 변경될 때 간단한 CSS 애니메이션 실행"
  // -> css 파일 없이 Web Animations API로 페이드인만 재생 (opacity만 다뤄서 위 회전값과 안 겹침)
  dynamicIcon.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, easing: "ease-out" });

  const noise = NOISE_STYLES[config.profile];
  dynamicNoise.style.backgroundImage = noise.backgroundImage;
  dynamicNoise.style.backgroundSize = noise.backgroundSize || "";
  dynamicNoise.style.opacity = "1";
  if (activeNoiseAnimation) activeNoiseAnimation.cancel();
  activeNoiseAnimation = dynamicNoise.animate(noise.keyframes, {
    duration: noise.duration,
    easing: "ease-in-out",
    iterations: Infinity,
  });
}

// 아이콘/노이즈를 끈다
function hideProfile() {
  currentProfileConfig = null;
  dynamicIcon.style.opacity = "0";
  dynamicNoise.style.opacity = "0";
  if (activeNoiseAnimation) {
    activeNoiseAnimation.cancel();
    activeNoiseAnimation = null;
  }
}

// 스크린 박스에 마우스를 올리면(hover) 캐릭터 이미지(기존 css :hover로 이미 커짐)와
// 같이 아이콘도 1.1배 커지게 함 (아이콘은 새로 만든 요소라 css :hover 대상이 아니라 js로 처리)
profileScreen.addEventListener("mouseenter", () => {
  if (currentProfileConfig) {
    dynamicIcon.style.transform = `${currentProfileConfig.rotate} scale(1.1)`.trim();
  }
});
profileScreen.addEventListener("mouseleave", () => {
  if (currentProfileConfig) {
    dynamicIcon.style.transform = currentProfileConfig.rotate;
  }
});

// 스위치 thumb를 켜짐/꺼짐 상태에 맞게 이동시키고 색을 바꾼다 (이동 거리는 실제 렌더된
// 크기를 재서 계산 - css의 고정 em값에 의존하지 않음)
function setThumbOn(button, isOn) {
  const track = button.querySelector(".profile-switch");
  const thumb = button.querySelector(".profile-switch-thumb");
  thumb.style.transition = "transform 0.2s ease, background-color 0.2s ease";

  if (isOn) {
    const trackStyle = getComputedStyle(track);
    const innerWidth =
      track.clientWidth - parseFloat(trackStyle.paddingLeft) - parseFloat(trackStyle.paddingRight);
    const travel = innerWidth - thumb.offsetWidth;
    thumb.style.transform = `translateX(${travel}px)`;
    thumb.style.backgroundColor = "#fff";
  } else {
    thumb.style.transform = "translateX(0)";
    thumb.style.backgroundColor = "";
  }
}

switchButtons.forEach((button) => {
  const labelText = button.querySelector(".profile-button-label").textContent.trim();
  const config = PROFILE_CONFIG[labelText];
  if (!config) return;

  // 이슈 요구사항: "스위치마다 data-profile 속성 추가" - html은 그대로 두고 js로 붙인다
  button.setAttribute("data-profile", config.profile);

  button.addEventListener("click", () => {
    const wasOn = button.classList.contains("active");

    // 라디오 버튼처럼: 일단 모든 버튼/효과를 끄고 시작한다
    switchButtons.forEach((btn) => {
      btn.classList.remove("active");
      setThumbOn(btn, false);
    });
    hideProfile();
    // 선택 해제해도 body의 data-profile은 마지막으로 선택했던 값 그대로 남겨둔다 (지우지 않음)

    // 원래 꺼져 있던 버튼을 눌렀을 때만 다시 켜준다 (켜진 버튼을 또 누르면 끈 채로 둠)
    if (!wasOn) {
      button.classList.add("active");
      setThumbOn(button, true);

      // 이슈 요구사항: "선택한 값을 body의 data-profile에 저장"
      document.body.dataset.profile = config.profile;

      showProfile(config);
    }
  });
});
