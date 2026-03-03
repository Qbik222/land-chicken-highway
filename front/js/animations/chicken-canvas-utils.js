/**
 * Chicken canvas — бізнес-логіка.
 * Умови: front/canvas-flow.md
 */

export function getCanvasDimensionsFromBreakpoints(sizeBreakpoints) {
  const sorted = [...(sizeBreakpoints || [])].sort(
    (a, b) => (a.maxWidth ?? Infinity) - (b.maxWidth ?? Infinity)
  );
  const viewportWidth = window.innerWidth;
  for (let i = 0; i < sorted.length; i++) {
    const bp = sorted[i];
    if (viewportWidth <= (bp.maxWidth ?? Infinity)) {
      return { width: bp.width, height: bp.height };
    }
  }
  const last = sorted[sorted.length - 1];
  return last ? { width: last.width, height: last.height } : { width: 536, height: 455 };
}

export function getBackgroundBreakpointForWidth(bgBreakpoints, canvasWidth, switchThreshold = 50) {
  for (let i = 0; i < bgBreakpoints.length; i++) {
    const bp = bgBreakpoints[i];
    if (canvasWidth >= bp.rootWidth + switchThreshold) {
      return bp;
    }
  }
  return bgBreakpoints[bgBreakpoints.length - 1];
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load: ' + src));
    try {
      img.src = new URL(src, window.location.href).href;
    } catch (e) {
      img.src = src;
    }
  });
}

export function drawBackground(ctx, img, rootWidth, rootHeight, canvasWidth, canvasHeight) {
  const scale = Math.max(
    canvasWidth / rootWidth,
    canvasHeight / rootHeight
  );
  const drawWidth = rootWidth * scale;
  const drawHeight = rootHeight * scale;
  const x = (canvasWidth - drawWidth) / 2;
  const y = (canvasHeight - drawHeight) / 2;
  ctx.drawImage(img, x, y, drawWidth, drawHeight);
}

export function sortBackgroundBreakpoints(breakpoints) {
  return [...breakpoints].sort((a, b) => b.rootWidth - a.rootWidth);
}

/**
 * Позиція char відносно land__canvas. Breakpoints sorted by maxWidth ascending;
 * first where viewportWidth <= maxWidth applies. default: offsetX 50, centerY true.
 * По вертикалі — центр land__canvas (wrapperHeight).
 */
export function getCharPositionForViewport(charConfig, canvasWidth, canvasHeight, wrapperEl) {
  const charHeight = charConfig.height ?? 228;
  const breakpoints = charConfig.breakpoints;
  const wrapperHeight = wrapperEl?.offsetHeight ?? canvasHeight;
  if (!breakpoints?.length) {
    const y = Math.max(0, Math.min((wrapperHeight - charHeight) / 2, canvasHeight - charHeight));
    return { x: 50, y };
  }
  const sorted = [...breakpoints].sort(
    (a, b) => (a.maxWidth ?? Infinity) - (b.maxWidth ?? Infinity)
  );
  const viewportWidth = window.innerWidth;
  const bp = sorted.find((p) => viewportWidth <= (p.maxWidth ?? Infinity)) ?? sorted[sorted.length - 1];
  const offsetX = bp.offsetX ?? 50;
  const centerY = bp.centerY !== false;
  const x = offsetX;
  const y = centerY
    ? Math.max(0, Math.min((wrapperHeight - charHeight) / 2, canvasHeight - charHeight))
    : canvasHeight - charHeight - (bp.offsetY ?? 0);
  return { x, y };
}

/**
 * Отримати значення з breakpoints за viewportWidth. Sorted by maxWidth ascending;
 * first where viewportWidth <= maxWidth.
 */
export function getValueFromBreakpoints(breakpoints, key, fallback) {
  if (!breakpoints?.length) return fallback;
  const sorted = [...breakpoints].sort(
    (a, b) => (a.maxWidth ?? Infinity) - (b.maxWidth ?? Infinity)
  );
  const viewportWidth = window.innerWidth;
  const bp = sorted.find((p) => viewportWidth <= (p.maxWidth ?? Infinity)) ?? sorted[sorted.length - 1];
  return bp[key] ?? fallback;
}

/**
 * Позиція коіна відносно char. Перший коін — offsetRight px вправо від char, далі в ряд з gapBetween.
 * По вертикалі — центр land__canvas.
 * Кожен item може мати gapBetweenLeft (відступ зліва) або gapBetweenRight (відступ справа) для кастомного інтервалу.
 */
export function getCoinPositionForViewport(coinsConfig, charX, charWidth, index, canvasWidth, canvasHeight, wrapperEl) {
  const w = coinsConfig.width ?? 134;
  const h = coinsConfig.height ?? 172;
  const offsetRight =
    getValueFromBreakpoints(coinsConfig.offsetRightBreakpoints, 'offsetRight', null) ??
    (coinsConfig.offsetRightDefault ?? 50);
  const gapBetween = getValueFromBreakpoints(coinsConfig.gapBreakpoints, 'gapBetween', 70);
  const items = coinsConfig?.items ?? [];
  const wrapperHeight = wrapperEl?.offsetHeight ?? canvasHeight;
  const y = Math.max(0, Math.min((wrapperHeight - h) / 2, canvasHeight - h));

  let leftEdge = charX + (charWidth ?? 160);
  for (let i = 0; i <= index; i++) {
    const gap =
      i === 0
        ? (items[i]?.gapBetweenLeft ?? offsetRight)
        : (items[i]?.gapBetweenLeft ?? items[i - 1]?.gapBetweenRight ?? gapBetween);
    if (i === index) {
      return { x: leftEdge + gap, y };
    }
    leftEdge += gap + w;
  }
  return { x: leftEdge, y };
}

export function loadCoinFrames(coinsConfig) {
  if (!coinsConfig?.frames?.length) return Promise.resolve([]);
  return Promise.all(
    coinsConfig.frames.map((src) => loadImage(src).catch(() => null))
  ).then((imgs) => imgs.filter(Boolean));
}

function drawCoin(ctx, img, coinsConfig, x, y) {
  ctx.drawImage(img, x, y, coinsConfig.width, coinsConfig.height);
}

function drawChar(ctx, charImg, charConfig, canvasWidth, canvasHeight, wrapperEl) {
  const { x, y } = getCharPositionForViewport(charConfig, canvasWidth, canvasHeight, wrapperEl);
  ctx.drawImage(charImg, x, y, charConfig.width, charConfig.height);
}

export function createChickenCanvasController(config, elements) {
  const { wrapperEl, canvasEl, initBtnEl } = elements;
  const {
    backgroundBreakpoints,
    switchThreshold = 50,
    canvasBreakpoints,
    char: charConfig,
    coins: coinsConfig,
  } = config;

  const bgBreakpoints = sortBackgroundBreakpoints(backgroundBreakpoints);
  let bgImage = null;
  let currentBgSrc = null;

  let charState = 'stay';
  let charFrameImages = [];
  let charFrameIndex = 0;
  let animationFrameId = null;
  let lastCanvasWidth = 0;
  let lastCanvasHeight = 0;
  let lastBp = null;

  const coinStates = (coinsConfig?.items || []).map(() => ({
    state: 'static',
    frameIndex: 0,
    visible: true,
  }));
  let coinFrameImages = [];
  let coinFadeTimerId = null;

  function loadCharFrames() {
    if (!charConfig?.frames?.length) return Promise.resolve();
    return Promise.all(
      charConfig.frames.map((src) =>
        loadImage(src).catch(() => null)
      )
    ).then((imgs) => {
      charFrameImages = imgs.filter(Boolean);
    });
  }

  function loadCoinFramesTask() {
    if (!coinsConfig?.frames?.length) return Promise.resolve();
    return loadCoinFrames(coinsConfig).then((imgs) => {
      coinFrameImages = imgs;
    });
  }

  function drawFullFrame() {
    const ctx = canvasEl.getContext('2d');
    if (!ctx || !bgImage || lastCanvasWidth <= 0 || lastCanvasHeight <= 0) return;
    drawBackground(ctx, bgImage, lastBp.rootWidth, lastBp.rootHeight, lastCanvasWidth, lastCanvasHeight);

    const charPos = charConfig ? getCharPositionForViewport(charConfig, lastCanvasWidth, lastCanvasHeight, wrapperEl) : null;

    if (coinsConfig && coinFrameImages.length > 0) {
      coinStates.forEach((coin, index) => {
        if (!coin.visible) return;
        const { x, y } = getCoinPositionForViewport(
          coinsConfig, charPos?.x ?? 50, charConfig?.width ?? 160, index, lastCanvasWidth, lastCanvasHeight, wrapperEl
        );
        const frameIdx = coin.state === 'static' ? 0 : coin.frameIndex % coinFrameImages.length;
        const img = coinFrameImages[frameIdx];
        if (img) drawCoin(ctx, img, coinsConfig, x, y);
      });
    }

    if (charFrameImages.length > 0 && charConfig) {
      const frameIdx = charState === 'stay' ? 0 : charFrameIndex % charFrameImages.length;
      drawChar(ctx, charFrameImages[frameIdx], charConfig, lastCanvasWidth, lastCanvasHeight, wrapperEl);
    }
  }

  function coinFadeLoop() {
    drawFullFrame();
    let hasFadeOut = false;
    coinStates.forEach((coin) => {
      if (coin.state !== 'fade-out' || !coin.visible) return;
      hasFadeOut = true;
      coin.frameIndex += 1;
      if (coin.frameIndex >= (coinsConfig?.frames?.length ?? 0)) {
        coin.visible = false;
        coin.state = 'static';
        coin.frameIndex = 0;
      }
    });
    if (hasFadeOut && coinStates.some((c) => c.state === 'fade-out')) {
      const delay = coinsConfig?.fadeFrameDelay ?? 60;
      coinFadeTimerId = window.setTimeout(coinFadeLoop, delay);
    } else {
      coinFadeTimerId = null;
    }
  }

  function stopCoinFadeLoop() {
    if (coinFadeTimerId != null) {
      clearTimeout(coinFadeTimerId);
      coinFadeTimerId = null;
    }
  }

  function setCoinFadeOut(coinIndex) {
    if (coinIndex < 0 || coinIndex >= coinStates.length) return;
    const coin = coinStates[coinIndex];
    if (!coin.visible || coin.state === 'fade-out') return;
    coin.state = 'fade-out';
    coin.frameIndex = 0;
    if (coinFadeTimerId == null) {
      const delay = coinsConfig?.fadeFrameDelay ?? 60;
      coinFadeTimerId = window.setTimeout(coinFadeLoop, delay);
    }
  }

  function jumpingLoop() {
    if (charState !== 'jumping') return;
    charFrameIndex = (charFrameIndex + 1) % (charFrameImages.length || 1);
    drawFullFrame();
    const delay = charConfig?.jumpFrameDelay ?? 80;
    animationFrameId = window.setTimeout(jumpingLoop, delay);
  }

  function stopJumpingLoop() {
    if (animationFrameId != null) {
      clearTimeout(animationFrameId);
      animationFrameId = null;
    }
  }

  function setCharState(state) {
    if (state === charState) return;
    charState = state;
    if (state === 'jumping' && charFrameImages.length > 0) {
      charFrameIndex = 0;
      jumpingLoop();
    } else {
      stopJumpingLoop();
      drawFullFrame();
    }
  }

  function recalcAndRestart() {
    stopJumpingLoop();
    stopCoinFadeLoop();
    const { width, height } = getCanvasDimensionsFromBreakpoints(canvasBreakpoints);
    if (width <= 0 || height <= 0) return;

    const bp = getBackgroundBreakpointForWidth(bgBreakpoints, width, switchThreshold);

    canvasEl.width = width;
    canvasEl.height = height;

    lastCanvasWidth = width;
    lastCanvasHeight = height;
    lastBp = bp;

    const onReady = () => {
      drawFullFrame();
      if (charState === 'jumping') jumpingLoop();
      if (coinStates.some((c) => c.state === 'fade-out')) {
        const delay = coinsConfig?.fadeFrameDelay ?? 60;
        coinFadeTimerId = window.setTimeout(coinFadeLoop, delay);
      }
    };

    if (bp.src !== currentBgSrc) {
      loadImage(bp.src)
        .then((img) => {
          bgImage = img;
          currentBgSrc = bp.src;
          const promises = [];
          if (charConfig && charFrameImages.length === 0) promises.push(loadCharFrames());
          if (coinsConfig && coinFrameImages.length === 0) promises.push(loadCoinFramesTask());
          Promise.all(promises).then(onReady);
          if (promises.length === 0) onReady();
        })
        .catch(() => {});
    } else if (bgImage) {
      const promises = [];
      if (charConfig && charFrameImages.length === 0) promises.push(loadCharFrames());
      if (coinsConfig && coinFrameImages.length === 0) promises.push(loadCoinFramesTask());
      Promise.all(promises).then(onReady);
      if (promises.length === 0) onReady();
    } else if ((charConfig && charFrameImages.length === 0) || (coinsConfig && coinFrameImages.length === 0)) {
      const promises = [];
      if (charConfig && charFrameImages.length === 0) promises.push(loadCharFrames());
      if (coinsConfig && coinFrameImages.length === 0) promises.push(loadCoinFramesTask());
      Promise.all(promises).then(() => drawFullFrame());
    }
  }

  function handleInitClick() {
    wrapperEl.classList.add('_canvas-active');
    recalcAndRestart();
  }

  if (charConfig?.frames?.length) {
    loadCharFrames();
  }
  if (coinsConfig?.frames?.length) {
    loadCoinFramesTask();
  }

  return { recalcAndRestart, handleInitClick, setCharState, setCoinFadeOut };
}
