import "./styles.css";

const revealElements = document.querySelectorAll<HTMLElement>("[data-reveal]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if ("IntersectionObserver" in window && !reduceMotion) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
  );

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const parallaxRoot = document.querySelector<HTMLElement>("[data-parallax-root]");

if (parallaxRoot && !reduceMotion) {
  let mouseX = 0;
  let mouseY = 0;
  let scrollY = 0;
  let ticking = false;

  const renderParallax = () => {
    parallaxRoot.style.setProperty("--parallax-x", `${mouseX.toFixed(2)}px`);
    parallaxRoot.style.setProperty("--parallax-y", `${mouseY.toFixed(2)}px`);
    parallaxRoot.style.setProperty("--scroll-parallax", `${scrollY.toFixed(2)}px`);
    ticking = false;
  };

  const requestParallaxFrame = () => {
    if (!ticking) {
      window.requestAnimationFrame(renderParallax);
      ticking = true;
    }
  };

  parallaxRoot.addEventListener(
    "pointermove",
    (event) => {
      const rect = parallaxRoot.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      mouseX = x * 28;
      mouseY = y * 22;
      requestParallaxFrame();
    },
    { passive: true }
  );

  parallaxRoot.addEventListener(
    "pointerleave",
    () => {
      mouseX = 0;
      mouseY = 0;
      requestParallaxFrame();
    },
    { passive: true }
  );

  window.addEventListener(
    "scroll",
    () => {
      const rect = parallaxRoot.getBoundingClientRect();
      const viewportProgress = Math.min(1, Math.max(-1, rect.top / window.innerHeight));
      scrollY = viewportProgress * -34;
      requestParallaxFrame();
    },
    { passive: true }
  );
}

document.querySelectorAll<HTMLElement>(".card-premium, .tech-card, .mission-card").forEach((card) => {
  card.addEventListener(
    "pointermove",
    (event) => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--mx", `${x.toFixed(1)}%`);
      card.style.setProperty("--my", `${y.toFixed(1)}%`);
    },
    { passive: true }
  );
});

const missionsScroll = document.querySelector<HTMLElement>(".missions-scroll");
const missionCards = document.querySelectorAll<HTMLElement>(".mission-card");
const missionPrevButton = document.querySelector<HTMLButtonElement>('[data-mission-nav="prev"]');
const missionNextButton = document.querySelector<HTMLButtonElement>('[data-mission-nav="next"]');
const missionFloatingDetail = document.querySelector<HTMLElement>(".mission-floating-detail");

const updateMissionNav = () => {
  if (!missionsScroll || !missionPrevButton || !missionNextButton) return;

  const maxScroll = missionsScroll.scrollWidth - missionsScroll.clientWidth;
  missionPrevButton.disabled = missionsScroll.scrollLeft <= 4;
  missionNextButton.disabled = missionsScroll.scrollLeft >= maxScroll - 4;
};

const positionMissionDetail = (card: HTMLElement) => {
  if (!missionsScroll || !missionFloatingDetail || window.matchMedia("(max-width: 640px)").matches) return;

  const detail = card.querySelector<HTMLElement>(".mission-detail");
  if (!detail) return;

  missionFloatingDetail.innerHTML = detail.innerHTML;
  missionFloatingDetail.style.setProperty("--brand", getComputedStyle(card).getPropertyValue("--brand"));
  card.classList.add("is-tooltip-active");
  missionFloatingDetail.classList.add("is-visible");

  const gap = 14;
  const gutter = 14;
  const containerRect = missionsScroll.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  const detailRect = missionFloatingDetail.getBoundingClientRect();
  const visibleLeft = missionsScroll.scrollLeft + gutter;
  const visibleRight = missionsScroll.scrollLeft + missionsScroll.clientWidth - detailRect.width - gutter;
  const visibleTop = gutter;
  const visibleBottom = missionsScroll.clientHeight - detailRect.height - gutter;
  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

  let left = cardRect.right - containerRect.left + missionsScroll.scrollLeft + gap;
  let top = clamp(cardRect.top - containerRect.top, visibleTop, visibleBottom);
  let origin = "left top";

  if (left <= visibleRight) {
    origin = "left top";
  } else if (cardRect.left - containerRect.left + missionsScroll.scrollLeft - gap - detailRect.width >= visibleLeft) {
    left = cardRect.left - containerRect.left + missionsScroll.scrollLeft - gap - detailRect.width;
    origin = "right top";
  } else if (cardRect.top - containerRect.top - gap - detailRect.height >= visibleTop) {
    left = clamp(cardRect.left - containerRect.left + missionsScroll.scrollLeft, visibleLeft, visibleRight);
    top = cardRect.top - containerRect.top - gap - detailRect.height;
    origin = "bottom left";
  } else if (cardRect.bottom - containerRect.top + gap + detailRect.height <= missionsScroll.clientHeight - gutter) {
    left = clamp(cardRect.left - containerRect.left + missionsScroll.scrollLeft, visibleLeft, visibleRight);
    top = cardRect.bottom - containerRect.top + gap;
    origin = "top left";
  } else {
    left = clamp(cardRect.left - containerRect.left + missionsScroll.scrollLeft, visibleLeft, visibleRight);
    top = clamp(cardRect.top - containerRect.top, visibleTop, visibleBottom);
    origin = "top left";
  }

  missionFloatingDetail.style.left = `${Math.round(left)}px`;
  missionFloatingDetail.style.top = `${Math.round(top)}px`;
  missionFloatingDetail.style.setProperty("--tooltip-origin", origin);
};

if (missionsScroll && missionCards.length > 0) {
  let activeMissionCard: HTMLElement | null = null;

  missionCards.forEach((card) => {
    const period = card.querySelector("small")?.textContent?.toLowerCase() ?? "";
    if (period.includes("aujourd")) {
      card.classList.add("is-current");
    }
  });

  const scrollToRecentMissions = () => {
    missionsScroll.scrollLeft = missionsScroll.scrollWidth - missionsScroll.clientWidth;
    updateMissionNav();
  };

  window.requestAnimationFrame(scrollToRecentMissions);

  const hideMissionDetail = () => {
    activeMissionCard?.classList.remove("is-tooltip-active");
    activeMissionCard = null;
    missionFloatingDetail?.classList.remove("is-visible");
  };

  missionsScroll.addEventListener(
    "pointermove",
    (event) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>(".mission-card") : null;
      if (!target) {
        hideMissionDetail();
        return;
      }

      if (activeMissionCard && activeMissionCard !== target) {
        activeMissionCard.classList.remove("is-tooltip-active");
      }

      activeMissionCard = target;
      positionMissionDetail(target);
    },
    { passive: true }
  );

  missionsScroll.addEventListener("pointerleave", hideMissionDetail, { passive: true });
  missionsScroll.addEventListener(
    "scroll",
    () => {
      updateMissionNav();
      hideMissionDetail();
    },
    { passive: true }
  );
  window.addEventListener("resize", updateMissionNav, { passive: true });

  missionPrevButton?.addEventListener("click", () => {
    missionsScroll.scrollBy({ left: -Math.round(missionsScroll.clientWidth * 0.72), behavior: reduceMotion ? "auto" : "smooth" });
  });

  missionNextButton?.addEventListener("click", () => {
    missionsScroll.scrollBy({ left: Math.round(missionsScroll.clientWidth * 0.72), behavior: reduceMotion ? "auto" : "smooth" });
  });

  missionCards.forEach((card) => {
    card.addEventListener("focus", () => {
      activeMissionCard = card;
      positionMissionDetail(card);
    });

    const hideDetail = () => {
      if (activeMissionCard === card) {
        activeMissionCard = null;
        missionFloatingDetail?.classList.remove("is-visible");
      }

      card.classList.remove("is-tooltip-active");
    };
    card.addEventListener("blur", hideDetail);
  });
}
