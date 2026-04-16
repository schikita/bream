const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isLowMotionMode = prefersReducedMotion || window.innerWidth <= 900;

if (!isLowMotionMode && window.gsap) {
  gsap.registerPlugin(ScrollTrigger);

  const reveals = gsap.utils.toArray(".reveal");
  reveals.forEach((item) => {
    gsap.fromTo(
      item,
      { y: 24, autoAlpha: 0, filter: "blur(6px)" },
      {
        y: 0,
        autoAlpha: 1,
        filter: "blur(0px)",
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: item,
          start: "top 88%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      }
    );
  });

  gsap.utils.toArray(".cards-grid .feature-card").forEach((card, index) => {
    gsap.fromTo(
      card,
      { y: 32, autoAlpha: 0, scale: 0.98 },
      {
        y: 0,
        autoAlpha: 1,
        scale: 1,
        duration: 1.05,
        delay: index * 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 92%",
        },
      }
    );
  });

  gsap.utils.toArray(".media-parallax").forEach((block) => {
    gsap.to(block, {
      yPercent: -7,
      ease: "none",
      scrollTrigger: {
        trigger: block,
        start: "top bottom",
        end: "bottom top",
        scrub: 1.2,
      },
    });
  });

  gsap.utils.toArray(".section-cinematic").forEach((section) => {
    const panel = section.querySelector(".glass-panel, .story-block, .showcase-copy, .game-copy");
    if (!panel) return;

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 84%",
        end: "bottom 20%",
        scrub: 1.1,
      },
    });

    timeline
      .fromTo(
        section,
        { opacity: 0.82 },
        { opacity: 1, duration: 1.1, ease: "power2.out" },
        0
      )
      .fromTo(
        panel,
        { y: 22, scale: 0.985 },
        { y: 0, scale: 1, duration: 1.1, ease: "power3.out" },
        0
      );
  });

  gsap.utils.toArray(".media-video").forEach((video) => {
    gsap.fromTo(
      video,
      { scale: 1.14 },
      {
        scale: 1.04,
        ease: "none",
        scrollTrigger: {
          trigger: video.closest(".media-video-wrap"),
          start: "top bottom",
          end: "bottom top",
          scrub: 1.4,
        },
      }
    );
  });
}

// Облегченный режим: без blur-фильтров и scrub-анимаций
if (isLowMotionMode && window.gsap) {
  gsap.registerPlugin(ScrollTrigger);
  gsap.utils.toArray(".reveal").forEach((item) => {
    gsap.fromTo(
      item,
      { y: 18, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: item,
          start: "top 92%",
          toggleActions: "play none none reverse",
        },
      }
    );
  });
}

document.querySelectorAll(".main-nav a").forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    const target = targetId ? document.querySelector(targetId) : null;
    if (!target) return;
    event.preventDefault();

    const headerOffset = 96;
    const rect = target.getBoundingClientRect();
    const offset = window.pageYOffset + rect.top - headerOffset;

    window.scrollTo({
      top: offset,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  });
});

const siteHeader = document.querySelector(".site-header");
const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");

if (siteHeader && navToggle && mainNav) {
  const closeMenu = () => {
    siteHeader.classList.remove("is-menu-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Открыть меню");
  };

  const openMenu = () => {
    siteHeader.classList.add("is-menu-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Закрыть меню");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = siteHeader.classList.contains("is-menu-open");
    if (isOpen) {
      closeMenu();
      return;
    }
    openMenu();
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 1100) {
        closeMenu();
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1100) {
      closeMenu();
    }
  });
}

const parallaxTarget = document.querySelector(".hero__media");
if (parallaxTarget && !prefersReducedMotion && window.gsap && window.innerWidth > 1100) {
  let rafId = null;
  let lastX = 0;
  let lastY = 0;

  const update = () => {
    rafId = null;
    gsap.to(parallaxTarget, {
      x: lastX,
      y: lastY,
      duration: 0.6,
      ease: "power3.out",
      overwrite: true,
    });
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      lastX = (event.clientX / window.innerWidth - 0.5) * 6;
      lastY = (event.clientY / window.innerHeight - 0.5) * 6;
      if (rafId) return;
      rafId = requestAnimationFrame(update);
    },
    { passive: true }
  );
}

function initCustomVideoPlayer(config) {
  const { playerSelector, videoId, centerPlayBtnId, fullscreenBtnId, volumeInputId } = config;
  const player = document.querySelector(playerSelector);
  const video = document.getElementById(videoId);
  const centerPlayBtn = document.getElementById(centerPlayBtnId);
  const fullscreenBtn = document.getElementById(fullscreenBtnId);
  const volumeInput = document.getElementById(volumeInputId);

  if (!player || !video || !centerPlayBtn || !fullscreenBtn || !volumeInput) return;

  const ensureVideoLoaded = () => {
    if (video.dataset.sourcesReady === "true") return;
    let changed = false;
    video.querySelectorAll("source[data-src]").forEach((sourceElement) => {
      const src = sourceElement.dataset.src;
      if (!src || sourceElement.src) return;
      sourceElement.src = src;
      changed = true;
    });
    if (changed) video.load();
    video.dataset.sourcesReady = "true";
  };

  const setFullscreenLabel = (isFullscreen) => {
    fullscreenBtn.setAttribute(
      "aria-label",
      isFullscreen ? "Выйти из полного экрана" : "Включить полный экран"
    );
    player.classList.toggle("is-fullscreen", isFullscreen);
  };

  video.volume = Number(volumeInput.value);
  video.muted = video.volume === 0;

  centerPlayBtn.addEventListener("click", () => {
    ensureVideoLoaded();
    video.play();
  });

  video.addEventListener("click", () => {
    if (video.paused) {
      ensureVideoLoaded();
      video.play();
      return;
    }
    video.pause();
  });

  volumeInput.addEventListener("input", () => {
    const nextVolume = Number(volumeInput.value);
    video.volume = nextVolume;
    video.muted = nextVolume === 0;
  });

  fullscreenBtn.addEventListener("click", async () => {
    const isFullscreen = document.fullscreenElement === player;
    if (isFullscreen) {
      await document.exitFullscreen();
      return;
    }
    await player.requestFullscreen();
  });

  video.addEventListener("play", () => {
    player.classList.add("is-playing");
  });
  video.addEventListener("pause", () => {
    player.classList.remove("is-playing");
  });
  video.addEventListener("ended", () => {
    player.classList.remove("is-playing");
  });

  document.addEventListener("fullscreenchange", () => {
    setFullscreenLabel(document.fullscreenElement === player);
  });

  player.classList.toggle("is-playing", !video.paused);
  setFullscreenLabel(false);
}

function initPhotoSlider() {
  const slider = document.querySelector('[data-slider="mid"]');
  if (!slider) return;

  const track = slider.querySelector(".photo-slider__track");
  const viewport = slider.querySelector(".photo-slider__viewport");
  const items = Array.from(slider.querySelectorAll(".photo-slider__item"));
  const prevBtn = slider.querySelector('[data-action="prev"]');
  const nextBtn = slider.querySelector('[data-action="next"]');
  if (!track || !viewport || items.length === 0 || !prevBtn || !nextBtn) return;

  let page = 0;
  let touchStartX = 0;
  let touchCurrentX = 0;
  let isSwiping = false;

  const getItemsPerView = () => {
    const raw = getComputedStyle(slider).getPropertyValue("--items-per-view");
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  };

  const update = () => {
    const perView = getItemsPerView();
    const totalPages = Math.max(1, Math.ceil(items.length / perView));
    page = Math.max(0, Math.min(page, totalPages - 1));

    const itemWidth = items[0].offsetWidth;
    const gap = Number.parseFloat(getComputedStyle(track).gap || "0");
    const offset = page * (itemWidth + gap) * perView;
    track.style.transform = `translateX(${-offset}px)`;

    prevBtn.disabled = page === 0;
    nextBtn.disabled = page >= totalPages - 1;
  };

  prevBtn.addEventListener("click", () => {
    page -= 1;
    update();
  });

  nextBtn.addEventListener("click", () => {
    page += 1;
    update();
  });

  viewport.addEventListener(
    "touchstart",
    (event) => {
      if (!event.touches.length) return;
      touchStartX = event.touches[0].clientX;
      touchCurrentX = touchStartX;
      isSwiping = true;
    },
    { passive: true }
  );

  viewport.addEventListener(
    "touchmove",
    (event) => {
      if (!isSwiping || !event.touches.length) return;
      touchCurrentX = event.touches[0].clientX;
    },
    { passive: true }
  );

  viewport.addEventListener(
    "touchend",
    () => {
      if (!isSwiping) return;
      const deltaX = touchCurrentX - touchStartX;
      const swipeThreshold = 40;
      if (deltaX <= -swipeThreshold) {
        page += 1;
        update();
      } else if (deltaX >= swipeThreshold) {
        page -= 1;
        update();
      }
      isSwiping = false;
    },
    { passive: true }
  );

  viewport.addEventListener(
    "touchcancel",
    () => {
      isSwiping = false;
    },
    { passive: true }
  );

  window.addEventListener("resize", update);
  update();
}

function createGameModule() {
  const canvas = document.getElementById("gameCanvas");
  const button = document.getElementById("startGameBtn");
  const moveUpBtn = document.getElementById("gameMoveUpBtn");
  const moveDownBtn = document.getElementById("gameMoveDownBtn");
  if (!canvas || !button) return;

  const ctx = canvas.getContext("2d");
  const hud = {
    distance: document.querySelector('[data-hud="distance"]'),
    time: document.querySelector('[data-hud="time"]'),
    energy: document.querySelector('[data-hud="energy"]'),
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const rand = (min, max) => min + Math.random() * (max - min);
  const loadImage = (src) =>
    new Promise((resolve) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = src;
    });

  const state = {
    running: false,
    finished: false,
    failed: false,
    startedAt: 0,
    lastFrameAt: 0,
    animationId: null,
    distance: 0,
    energy: 100,
    score: 0,
    speed: 220,
    targetDistance: 3000,
    player: {
      x: 250,
      y: 220,
      width: 108,
      height: 34,
      velocityY: 0,
      tilt: 0,
      wake: 0,
    },
    obstacles: [],
    collectibles: [],
    particles: [],
    controls: {
      up: false,
      down: false,
      pointerActive: false,
      pointerY: 0,
    },
    spawn: {
      obstacle: 0,
      collectible: 0,
    },
    renderScale: 1,
    sprites: {
      boat: null,
      boatAlt: null,
      coin: null,
      dust: null,
      rock: null,
      poster: null,
      useAltBoat: false,
    },
  };

  const resize = () => {
    const ratio = window.devicePixelRatio || 1;
    const cssWidth = canvas.clientWidth;
    const isMobileViewport = window.innerWidth <= 760;
    const cssHeight = Math.max(1, Math.round(canvas.getBoundingClientRect().height));
    state.renderScale = isMobileViewport ? 0.88 : 1;
    state.player.width = 108 * state.renderScale;
    state.player.height = 34 * state.renderScale;
    canvas.width = Math.floor(cssWidth * ratio);
    canvas.height = Math.floor(cssHeight * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    state.player.x = cssWidth * 0.26;
    state.player.y = clamp(state.player.y, 96, cssHeight - 70);
  };

  const reset = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    state.running = true;
    state.finished = false;
    state.failed = false;
    state.startedAt = performance.now();
    state.lastFrameAt = performance.now();
    state.distance = 0;
    state.energy = 100;
    state.score = 0;
    state.speed = 220;
    state.player.y = height * 0.58;
    state.player.velocityY = 0;
    state.player.tilt = 0;
    state.obstacles = [];
    state.collectibles = [];
    state.particles = [];
    state.spawn.obstacle = width * 0.7;
    state.spawn.collectible = width * 0.5;
    button.textContent = "Сплав идет...";
    button.disabled = true;
  };

  const drawBackground = (elapsedMs) => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const t = elapsedMs * 0.001;

    const sky = ctx.createLinearGradient(0, 0, 0, height * 0.45);
    sky.addColorStop(0, "rgba(156, 201, 255, 0.56)");
    sky.addColorStop(1, "rgba(60, 114, 176, 0.18)");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(27, 56, 47, 0.5)";
    ctx.beginPath();
    ctx.moveTo(0, height * 0.4);
    for (let x = 0; x <= width; x += 16) {
      const y = height * 0.4 - (Math.sin(x * 0.018 + t * 0.42) * 13 + Math.cos(x * 0.03) * 7);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height * 0.56);
    ctx.lineTo(0, height * 0.56);
    ctx.closePath();
    ctx.fill();

    const river = ctx.createLinearGradient(0, height * 0.32, 0, height);
    river.addColorStop(0, "rgba(59, 122, 180, 0.34)");
    river.addColorStop(0.46, "rgba(31, 88, 145, 0.62)");
    river.addColorStop(1, "rgba(12, 37, 66, 0.88)");
    ctx.fillStyle = river;
    ctx.fillRect(0, height * 0.32, width, height);

    for (let i = 0; i < 10; i += 1) {
      const move = (t * (28 + i * 7)) % (width + 260);
      const y = height * (0.45 + i * 0.046);
      ctx.strokeStyle = `rgba(188, 224, 255, ${0.05 + i * 0.006})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = -220; x <= width + 220; x += 12) {
        const px = x - move;
        const py = y + Math.sin((x + i * 26) * 0.04 + t * 1.8) * (2.2 + i * 0.18);
        if (x === -220) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  };

  const drawBoat = (elapsedMs) => {
    const { x, y, width, height } = state.player;
    const paddle = Math.sin(elapsedMs * 0.01) * (state.running ? 1 : 0.2);
    state.player.wake += 0.15;

    const activeBoatSprite = state.sprites.useAltBoat ? state.sprites.boatAlt : state.sprites.boat;
    if (activeBoatSprite) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(state.player.tilt);
      ctx.drawImage(
        activeBoatSprite,
        -width * 0.56,
        -height * 1.02,
        width * 1.12,
        height * 2.04
      );
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(state.player.tilt);

    ctx.fillStyle = "rgba(225, 239, 255, 0.2)";
    ctx.beginPath();
    ctx.ellipse(-width * 0.35, height * 0.8, width * 0.34, height * 0.46, 0, 0, Math.PI * 2);
    ctx.fill();

    const hull = ctx.createLinearGradient(-width * 0.5, 0, width * 0.6, 0);
    hull.addColorStop(0, "rgba(106, 74, 42, 0.96)");
    hull.addColorStop(0.55, "rgba(141, 102, 58, 0.97)");
    hull.addColorStop(1, "rgba(88, 63, 36, 0.95)");
    ctx.fillStyle = hull;
    ctx.beginPath();
    ctx.moveTo(-width * 0.56, 0);
    ctx.quadraticCurveTo(-width * 0.27, -height * 0.6, width * 0.2, -height * 0.46);
    ctx.quadraticCurveTo(width * 0.58, -height * 0.15, width * 0.6, 0);
    ctx.quadraticCurveTo(width * 0.18, height * 0.42, -width * 0.44, height * 0.3);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(241, 248, 255, 0.93)";
    ctx.beginPath();
    ctx.arc(-width * 0.09, -height * 0.14, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(243, 248, 255, 0.88)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(width * 0.04, -height * 0.42);
    ctx.lineTo(width * 0.18, height * 0.17);
    ctx.stroke();

    ctx.fillStyle = "rgba(228, 238, 250, 0.95)";
    ctx.beginPath();
    ctx.ellipse(
      width * (0.22 + paddle * 0.012),
      height * (0.24 + Math.abs(paddle) * 0.08),
      16,
      6,
      0.25 + paddle * 0.04,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  };

  const updateHUD = () => {
    const elapsedMs = (state.running ? performance.now() : state.lastFrameAt) - state.startedAt;
    const totalSec = Math.max(0, Math.floor(elapsedMs / 1000));
    const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
    const ss = String(totalSec % 60).padStart(2, "0");
    hud.distance.textContent = `Дистанция: ${Math.floor(state.distance)} м`;
    hud.time.textContent = `⏱ ${mm}:${ss}`;
    hud.energy.textContent = `⚡ ${Math.max(0, Math.floor(state.energy))}%`;
  };

  const intersects = (a, b) =>
    a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;

  const spawnObstacle = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const type = Math.random() > 0.5 ? "log" : "reed";
    const size = (type === "log" ? rand(56, 96) : rand(38, 60)) * state.renderScale;
    state.obstacles.push({
      type,
      x: width + size + rand(20, 140),
      y: rand(height * 0.42, height * 0.87),
      width: type === "log" ? size : size * 0.6,
      height: type === "log" ? size * 0.3 : size * 0.92,
      hit: false,
    });
  };

  const spawnCollectible = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    state.collectibles.push({
      x: width + rand(70, 220),
      y: rand(height * 0.43, height * 0.84),
      r: rand(10, 14) * state.renderScale,
      phase: rand(0, Math.PI * 2),
    });
  };

  const drawObstacle = (item) => {
    const obstacleSprite = item.type === "log" ? state.sprites.rock : state.sprites.dust;
    if (obstacleSprite) {
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.drawImage(
        obstacleSprite,
        -item.width * 0.65,
        -item.height * 0.72,
        item.width * 1.3,
        item.height * 1.44
      );
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(item.x, item.y);
    if (item.type === "log") {
      const grad = ctx.createLinearGradient(-item.width / 2, 0, item.width / 2, 0);
      grad.addColorStop(0, "rgba(93, 64, 37, 0.95)");
      grad.addColorStop(1, "rgba(126, 86, 49, 0.98)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 0, item.width / 2, item.height / 2, 0.04, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = "rgba(123, 175, 121, 0.95)";
      for (let i = 0; i < 4; i += 1) {
        ctx.beginPath();
        ctx.ellipse((i - 1.5) * (item.width * 0.24), 0, item.width * 0.3, item.height * (0.24 + i * 0.06), 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  };

  const drawCollectible = (item, elapsedMs) => {
    const pulse = 0.86 + Math.sin(elapsedMs * 0.004 + item.phase) * 0.12;
    if (state.sprites.coin) {
      const size = item.r * 2.4 * pulse;
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.drawImage(state.sprites.coin, -size / 2, -size / 2, size, size);
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = "rgba(255, 227, 125, 0.94)";
    ctx.beginPath();
    ctx.arc(0, 0, item.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 246, 198, 0.86)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, item.r + 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  };

  const drawOverlayText = (title, subtitle) => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    ctx.fillStyle = "rgba(5, 11, 20, 0.52)";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "rgba(239, 246, 255, 0.96)";
    ctx.textAlign = "center";
    ctx.font = "700 36px Manrope, sans-serif";
    ctx.fillText(title, width / 2, height / 2 - 8);
    ctx.font = "500 18px Manrope, sans-serif";
    ctx.fillStyle = "rgba(235, 244, 255, 0.9)";
    ctx.fillText(subtitle, width / 2, height / 2 + 30);
    ctx.textAlign = "start";
  };

  const drawIdleScene = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const showPoster =
      !state.running &&
      !state.finished &&
      !state.failed &&
      state.distance === 0 &&
      Boolean(state.sprites.poster);

    if (showPoster) {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(state.sprites.poster, 0, 0, width, height);
      return;
    }

    drawBackground(0);
    drawBoat(0);
  };

  const update = (dt, now) => {
    const height = canvas.clientHeight;
    state.sprites.useAltBoat = Math.floor(now / 180) % 2 === 0;

    if (state.controls.up) state.player.velocityY -= 520 * dt;
    if (state.controls.down) state.player.velocityY += 520 * dt;
    if (state.controls.pointerActive) {
      const delta = state.controls.pointerY - state.player.y;
      state.player.velocityY += clamp(delta * 0.06, -240, 240) * dt * 5.5;
    }

    state.player.velocityY *= 0.9;
    state.player.y += state.player.velocityY * dt;
    state.player.y = clamp(state.player.y, 98, height - 70);
    state.player.tilt = clamp(state.player.velocityY * 0.0018, -0.28, 0.28);

    state.distance += (state.speed * dt) / 3.1;
    state.speed = clamp(220 + state.distance * 0.04, 220, 340);
    state.energy = clamp(state.energy - dt * 4.8, 0, 100);

    state.spawn.obstacle -= state.speed * dt;
    if (state.spawn.obstacle <= 0) {
      spawnObstacle();
      state.spawn.obstacle = rand(170, 300);
    }

    state.spawn.collectible -= state.speed * dt;
    if (state.spawn.collectible <= 0) {
      spawnCollectible();
      state.spawn.collectible = rand(220, 360);
    }

    const playerBox = {
      x: state.player.x - state.player.width * 0.48,
      y: state.player.y - state.player.height * 0.56,
      width: state.player.width * 0.9,
      height: state.player.height * 1.12,
    };

    state.obstacles = state.obstacles.filter((item) => {
      item.x -= state.speed * dt;
      if (item.x + item.width < -20) return false;
      if (!item.hit) {
        const box = {
          x: item.x - item.width * 0.5,
          y: item.y - item.height * 0.5,
          width: item.width,
          height: item.height,
        };
        if (intersects(playerBox, box)) {
          item.hit = true;
          state.energy = clamp(state.energy - rand(12, 18), 0, 100);
          state.player.velocityY += rand(-120, 120);
        }
      }
      return true;
    });

    state.collectibles = state.collectibles.filter((item) => {
      item.x -= state.speed * dt;
      if (item.x + item.r < -20) return false;
      const d = Math.hypot(item.x - state.player.x, item.y - state.player.y);
      if (d < item.r + 24) {
        state.energy = clamp(state.energy + 11, 0, 100);
        state.score += 1;
        for (let i = 0; i < 8; i += 1) {
          state.particles.push({
            x: item.x,
            y: item.y,
            vx: rand(-80, 80),
            vy: rand(-80, 30),
            life: rand(0.35, 0.62),
          });
        }
        return false;
      }
      return true;
    });

    state.particles = state.particles.filter((p) => {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 120 * dt;
      return p.life > 0;
    });

    if (state.energy <= 0) {
      state.running = false;
      state.failed = true;
      state.lastFrameAt = now;
      button.textContent = "Попробовать снова";
      button.disabled = false;
    } else if (state.distance >= state.targetDistance) {
      state.running = false;
      state.finished = true;
      state.lastFrameAt = now;
      button.textContent = "Новый заплыв";
      button.disabled = false;
    }
  };

  const render = (elapsedMs) => {
    drawBackground(elapsedMs);
    state.obstacles.forEach(drawObstacle);
    state.collectibles.forEach((item) => drawCollectible(item, elapsedMs));

    state.particles.forEach((p) => {
      ctx.fillStyle = `rgba(242, 248, 255, ${clamp(p.life * 2, 0, 0.8)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.3, 0, Math.PI * 2);
      ctx.fill();
    });

    drawBoat(elapsedMs);

    ctx.fillStyle = "rgba(232, 243, 255, 0.92)";
    ctx.font = "600 13px Manrope, sans-serif";
    ctx.fillText(`Собрано бонусов: ${state.score}`, 16, 24);
    ctx.fillText(`До финиша: ${Math.max(0, Math.floor(state.targetDistance - state.distance))} м`, 16, 44);

    if (state.failed) {
      drawOverlayText("Энергия на нуле", "Попробуйте снова и держитесь течения.");
    } else if (state.finished) {
      drawOverlayText("Финиш!", "Маршрут пройден. Отличный сплав!");
    }
  };

  const frame = (timestamp) => {
    if (!state.running) return;
    const dt = clamp((timestamp - state.lastFrameAt) / 1000, 0, 0.04);
    state.lastFrameAt = timestamp;
    update(dt, timestamp);
    render(timestamp);
    updateHUD();
    state.animationId = requestAnimationFrame(frame);
  };

  const start = () => {
    if (state.animationId) cancelAnimationFrame(state.animationId);
    reset();
    state.animationId = requestAnimationFrame(frame);
  };

  button.addEventListener("click", async () => {
    if (state.running) return;
    // Перед стартом грузим постер/спрайты (если не успели при попадании в viewport)
    await ensureGameSpritesLoaded();
    start();
  });

  const onKeyDown = (event) => {
    const key = event.key.toLowerCase();
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
    }
    if (event.key === "ArrowUp" || key === "w") state.controls.up = true;
    if (event.key === "ArrowDown" || key === "s") state.controls.down = true;
  };

  const onKeyUp = (event) => {
    const key = event.key.toLowerCase();
    if (event.key === "ArrowUp" || key === "w") state.controls.up = false;
    if (event.key === "ArrowDown" || key === "s") state.controls.down = false;
  };

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  const updatePointerY = (clientY) => {
    const rect = canvas.getBoundingClientRect();
    state.controls.pointerY = clamp(clientY - rect.top, 0, rect.height);
  };

  canvas.addEventListener("pointerdown", (event) => {
    state.controls.pointerActive = true;
    updatePointerY(event.clientY);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!state.controls.pointerActive) return;
    updatePointerY(event.clientY);
  });
  canvas.addEventListener("pointerup", () => {
    state.controls.pointerActive = false;
  });
  canvas.addEventListener("pointerleave", () => {
    state.controls.pointerActive = false;
  });

  const bindHoldButton = (controlButton, direction) => {
    if (!controlButton) return;
    const setPressed = (isPressed) => {
      state.controls[direction] = isPressed;
    };

    controlButton.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      setPressed(true);
    });
    controlButton.addEventListener("pointerup", () => setPressed(false));
    controlButton.addEventListener("pointerleave", () => setPressed(false));
    controlButton.addEventListener("pointercancel", () => setPressed(false));
  };

  bindHoldButton(moveUpBtn, "up");
  bindHoldButton(moveDownBtn, "down");

  window.addEventListener("resize", () => {
    resize();
    if (!state.running) {
      drawIdleScene();
      updateHUD();
    }
  });
  resize();
  drawIdleScene();
  updateHUD();
  button.textContent = "НАЧАТЬ ИГРУ";

  let spritesLoaded = false;
  let spritesLoadingPromise = null;

  const ensureGameSpritesLoaded = () => {
    if (spritesLoaded) return Promise.resolve();
    if (spritesLoadingPromise) return spritesLoadingPromise;

    spritesLoadingPromise = Promise.all([
      loadImage("./img/sprites/boat-man.png"),
      loadImage("./img/sprites/boat-man-1.png"),
      loadImage("./img/sprites/coin.png"),
      loadImage("./img/sprites/dust.png"),
      loadImage("./img/sprites/rock.png"),
      loadImage("./img/sprites/game-poster.jpg"),
    ]).then(([boat, boatAlt, coin, dust, rock, poster]) => {
      state.sprites.boat = boat;
      state.sprites.boatAlt = boatAlt;
      state.sprites.coin = coin;
      state.sprites.dust = dust;
      state.sprites.rock = rock;
      state.sprites.poster = poster;
      spritesLoaded = true;

      if (!state.running) {
        drawIdleScene();
        updateHUD();
      }
    });

    return spritesLoadingPromise;
  };

  const gameSection = document.getElementById("game-zone");
  if (gameSection) {
    const spriteObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          ensureGameSpritesLoaded();
          spriteObserver.disconnect();
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.15 }
    );
    spriteObserver.observe(gameSection);
  }

  window.GameModule = {
    setSprites(nextSprites) {
      state.sprites = { ...state.sprites, ...nextSprites };
    },
    setMechanics(mechanics) {
      state.mechanics = { ...(state.mechanics || {}), ...mechanics };
    },
    start,
    state,
  };
}

function initBackToTop() {
  const backToTopBtn = document.getElementById("backToTop");
  if (!backToTopBtn) return;

  const toggleVisibility = () => {
    const shouldShow = window.scrollY > 420;
    backToTopBtn.classList.toggle("is-visible", shouldShow);
  };

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  window.addEventListener("scroll", toggleVisibility, { passive: true });
  toggleVisibility();
}

function initLazyMediaLoading() {
  const tryAutoplay = (videoElement) => {
    if (!videoElement.autoplay) return;
    const playPromise = videoElement.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        videoElement.setAttribute("controls", "controls");
      });
    }
  };

  const hydrateImage = (imgElement) => {
    const deferredSrc = imgElement.dataset.deferSrc;
    if (!deferredSrc || imgElement.dataset.lazyReady === "true") return;
    imgElement.src = deferredSrc;
    imgElement.dataset.lazyReady = "true";
  };

  const hydrateVideo = (videoElement) => {
    if (videoElement.dataset.loadOn === "play") return;
    if (videoElement.dataset.lazyReady === "true") {
      tryAutoplay(videoElement);
      return;
    }

    let changed = false;
    videoElement.querySelectorAll("source[data-src]").forEach((sourceElement) => {
      const sourceSrc = sourceElement.dataset.src;
      if (!sourceSrc || sourceElement.src) return;
      sourceElement.src = sourceSrc;
      changed = true;
    });

    if (changed) {
      videoElement.load();
    }
    videoElement.dataset.lazyReady = "true";
    tryAutoplay(videoElement);
  };

  const sectionTargets = Array.from(
    document.querySelectorAll("section, header.site-header, footer.site-footer")
  );
  if (sectionTargets.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const section = entry.target;

        // Фоны секций
        if (section instanceof HTMLElement && section.dataset && section.dataset.lazyBg) {
          const isMobileViewport = window.innerWidth <= 760;
          const mobileBg = section.dataset.lazyBgMobile;
          const bgSrc = isMobileViewport && mobileBg ? mobileBg : section.dataset.lazyBg;
          section.style.setProperty("--lazy-bg", `url('${bgSrc}')`);
        }
        section.querySelectorAll("[data-lazy-bg]").forEach((node) => {
          if (!(node instanceof HTMLElement) || !node.dataset || !node.dataset.lazyBg) return;
          const isMobileViewport = window.innerWidth <= 760;
          const mobileBg = node.dataset.lazyBgMobile;
          const bgSrc = isMobileViewport && mobileBg ? mobileBg : node.dataset.lazyBg;
          node.style.setProperty("--lazy-bg", `url('${bgSrc}')`);
        });

        // Картинки внутри секции
        section.querySelectorAll('img[data-defer-src]').forEach((img) => hydrateImage(img));

        // Видео внутри секции
        section.querySelectorAll('video[data-lazy-media="true"]').forEach((video) => hydrateVideo(video));

        observer.unobserve(section);
      });
    },
    {
      root: null,
      // Подгружать максимально близко к видимой области
      rootMargin: "0px 0px 0px 0px",
      threshold: 0.01,
    }
  );

  sectionTargets.forEach((section) => observer.observe(section));
}

function initPhotoGalleryLightbox() {
  const galleryItems = Array.from(document.querySelectorAll(".photo-gallery-item img"));
  const lightbox = document.getElementById("galleryLightbox");
  const lightboxImage = document.getElementById("galleryLightboxImage");
  const prevBtn = document.getElementById("galleryLightboxPrev");
  const nextBtn = document.getElementById("galleryLightboxNext");
  const closeBtn = document.getElementById("galleryLightboxClose");
  if (
    galleryItems.length === 0 ||
    !lightbox ||
    !lightboxImage ||
    !prevBtn ||
    !nextBtn ||
    !closeBtn
  ) {
    return;
  }

  let currentIndex = 0;

  const render = () => {
    const currentImage = galleryItems[currentIndex];
    if (!currentImage) return;
    lightboxImage.src =
      currentImage.dataset.deferSrc || currentImage.currentSrc || currentImage.src;
    lightboxImage.alt = currentImage.alt || "Фото галереи";
  };

  const open = (index) => {
    currentIndex = index;
    render();
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const close = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  const showPrev = () => {
    currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    render();
  };

  const showNext = () => {
    currentIndex = (currentIndex + 1) % galleryItems.length;
    render();
  };

  galleryItems.forEach((img, index) => {
    img.addEventListener("click", () => open(index));
  });

  prevBtn.addEventListener("click", showPrev);
  nextBtn.addEventListener("click", showNext);
  closeBtn.addEventListener("click", close);

  lightbox.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.dataset.action === "close") {
      close();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (event.key === "Escape") close();
    if (event.key === "ArrowLeft") showPrev();
    if (event.key === "ArrowRight") showNext();
  });
}

initCustomVideoPlayer({
  playerSelector: '[data-player="start-river"]',
  videoId: "startRiverVideo",
  centerPlayBtnId: "startRiverCenterPlayBtn",
  fullscreenBtnId: "startRiverFullscreenBtn",
  volumeInputId: "startRiverVolume",
});
initCustomVideoPlayer({
  playerSelector: '[data-player="boats"]',
  videoId: "boatsVideo",
  centerPlayBtnId: "boatsCenterPlayBtn",
  fullscreenBtnId: "boatsFullscreenBtn",
  volumeInputId: "boatsVolume",
});
initCustomVideoPlayer({
  playerSelector: '[data-player="master"]',
  videoId: "masterVideo",
  centerPlayBtnId: "masterCenterPlayBtn",
  fullscreenBtnId: "masterFullscreenBtn",
  volumeInputId: "masterVolume",
});
initPhotoSlider();
createGameModule();
initBackToTop();
initLazyMediaLoading();
initPhotoGalleryLightbox();
