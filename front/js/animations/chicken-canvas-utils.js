/**
 * Chicken canvas — бізнес-логіка.
 * Умови: front/canvas-flow.md
 */

/**
 * Розміри canvas з брейкпоінтів. Якщо bp.isWrapperFill === true — width/height з wrapperEl.
 */
export function getCanvasDimensionsFromBreakpoints(sizeBreakpoints, wrapperEl) {
  const sorted = [...(sizeBreakpoints || [])].sort(
    (a, b) => (a.maxWidth ?? Infinity) - (b.maxWidth ?? Infinity)
  );
  const viewportWidth = window.innerWidth;
  for (let i = 0; i < sorted.length; i++) {
    const bp = sorted[i];
    if (viewportWidth <= (bp.maxWidth ?? Infinity)) {
      if (bp.isWrapperFill && wrapperEl) {
        return { width: wrapperEl.offsetWidth || bp.width, height: wrapperEl.offsetHeight || bp.height };
      }
      return { width: bp.width, height: bp.height };
    }
  }
  const last = sorted[sorted.length - 1];
  if (last?.isWrapperFill && wrapperEl) {
    return { width: wrapperEl.offsetWidth || last.width, height: wrapperEl.offsetHeight || last.height };
  }
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
  const drawWidth = canvasWidth;
  const drawHeight = canvasHeight;
  const x = 0;
  const y = 0;
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
  const { height: charHeight } = getCharSize(charConfig);
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
 * Розмір char. Дефолт 225×322. Зміни тільки через charConfig.sizeBreakpoints.
 */
export function getCharSize(charConfig) {
  if (!charConfig) return { width: 225, height: 322 };
  if (charConfig.sizeBreakpoints?.length) {
    return {
      width: getValueFromBreakpoints(charConfig.sizeBreakpoints, 'width', 225),
      height: getValueFromBreakpoints(charConfig.sizeBreakpoints, 'height', 322),
    };
  }
  return {
    width: charConfig.width ?? 225,
    height: charConfig.height ?? 322,
  };
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

  let leftEdge = charX + (charWidth ?? 225);
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

/**
 * Позиція barrier над coin. barrier[i] центрується над coin[i].
 */
export function getBarrierPositionForViewport(barrierConfig, coinX, coinY, coinWidth) {
  const barrierWidth = barrierConfig.width ?? 171;
  const barrierHeight = barrierConfig.height ?? 112;
  const offsetAbove =
    getValueFromBreakpoints(barrierConfig.offsetAboveBreakpoints, 'offsetAbove', null) ??
    (barrierConfig.offsetAboveDefault ?? 10);
  const x = coinX + (coinWidth - barrierWidth) / 2;
  const y = coinY - barrierHeight - offsetAbove;
  return { x, y };
}

export function loadBarrierFrames(barrierConfig) {
  if (!barrierConfig?.frames?.length) return Promise.resolve([]);
  return Promise.all(
    barrierConfig.frames.map((src) => loadImage(src).catch(() => null))
  ).then((imgs) => imgs.filter(Boolean));
}

function drawBarrier(ctx, img, barrierConfig, x, y) {
  ctx.drawImage(img, x, y, barrierConfig.width, barrierConfig.height);
}

function drawCoin(ctx, img, coinsConfig, x, y) {
  ctx.drawImage(img, x, y, coinsConfig.width, coinsConfig.height);
}

function drawChar(ctx, charImg, charConfig, canvasWidth, canvasHeight, wrapperEl, overridePosition) {
  const { width, height } = getCharSize(charConfig);
  const pos = overridePosition ?? getCharPositionForViewport(charConfig, canvasWidth, canvasHeight, wrapperEl);
  ctx.drawImage(charImg, pos.x, pos.y, width, height);
}

export function createChickenCanvasController(config, elements) {
  const { wrapperEl, canvasEl, initBtnEl } = elements;
  const {
    backgroundBreakpoints,
    switchThreshold = 50,
    canvasBreakpoints,
    char: charConfig,
    coins: coinsConfig,
    barrier: barrierConfig,
    animationChain: animationChainConfig,
  } = config;

  const bgBreakpoints = sortBackgroundBreakpoints(backgroundBreakpoints);

  let charOverridePosition = null;
  let initialCharPosition = null;
  let chainActive = false;
  let chainTargetCoinIndex = 0;
  let chainStartX = 0;
  let chainStartY = 0;
  let chainTargetX = 0;
  let chainStartTime = 0;
  let chainJumpTimerId = null;
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

  const barrierStates = (barrierConfig?.items || []).map(() => ({
    state: 'hide',
    frameIndex: 0,
    visible: false,
  }));
  let barrierFrameImages = [];
  let barrierFadeInTimerId = null;

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

  function getCoinCenterX(coinIndex) {
    const charSize = getCharSize(charConfig);
    const pos = getCoinPositionForViewport(
      coinsConfig, baseCharXForCoins(), charSize.width, coinIndex,
      lastCanvasWidth, lastCanvasHeight, wrapperEl
    );
    return pos.x + (coinsConfig?.width ?? 134) / 2;
  }

  function getCoinCenterAsCharLeft(coinIndex) {
    const charSize = getCharSize(charConfig);
    const centerX = getCoinCenterX(coinIndex);
    return centerX - charSize.width / 2;
  }

  function baseCharXForCoins() {
    return (initialCharPosition ?? (charConfig ? getCharPositionForViewport(charConfig, lastCanvasWidth, lastCanvasHeight, wrapperEl) : null))?.x ?? 50;
  }

  function startJumpToCoin(targetIndex) {
    if (targetIndex < 0 || targetIndex >= coinStates.length) return;
    chainTargetCoinIndex = targetIndex;
    const currentPos = charOverridePosition ?? initialCharPosition;
    chainStartX = currentPos?.x ?? 50;
    chainStartY = currentPos?.y ?? 0;
    chainTargetX = getCoinCenterAsCharLeft(targetIndex);
    chainStartTime = performance.now();
    setCharState('jumping');
  }

  function updateChainJumpPosition() {
    const jumpDuration = animationChainConfig?.jumpDuration ?? 600;
    const arcHeight = animationChainConfig?.jumpArcHeight ?? 20;
    const progress = Math.min(1, (performance.now() - chainStartTime) / jumpDuration);
    if (progress >= 1) {
      charOverridePosition = { x: chainTargetX, y: chainStartY };
      setCoinFadeOut(chainTargetCoinIndex);
      setCharState('stay');
      return false;
    }
    const t = progress;
    const x = chainStartX + t * (chainTargetX - chainStartX);
    const y = chainStartY - 4 * arcHeight * t * (1 - t);
    charOverridePosition = { x, y };
    return true;
  }

  function scheduleNextChainJump(completedCoinIndex) {
    const nextIndex = completedCoinIndex + 1;
    const betweenDelay = animationChainConfig?.betweenJumpsDelay ?? 0;
    const schedule = () => {
      chainJumpTimerId = null;
      if (nextIndex < coinStates.length) {
        startJumpToCoin(nextIndex);
      } else {
        chainActive = false;
      }
    };
    if (betweenDelay > 0) {
      chainJumpTimerId = window.setTimeout(schedule, betweenDelay);
    } else {
      schedule();
    }
  }

  function stopChainJumpTimer() {
    if (chainJumpTimerId != null) {
      clearTimeout(chainJumpTimerId);
      chainJumpTimerId = null;
    }
  }

  function loadBarrierFramesTask() {
    if (!barrierConfig?.frames?.length) return Promise.resolve();
    return loadBarrierFrames(barrierConfig).then((imgs) => {
      barrierFrameImages = imgs;
    });
  }

  function drawFullFrame() {
    const ctx = canvasEl.getContext('2d');
    if (!ctx || !bgImage || lastCanvasWidth <= 0 || lastCanvasHeight <= 0) return;
    drawBackground(ctx, bgImage, lastBp.rootWidth, lastBp.rootHeight, lastCanvasWidth, lastCanvasHeight);

    const charSize = charConfig ? getCharSize(charConfig) : { width: 225, height: 322 };
    const charPos = charConfig ? getCharPositionForViewport(charConfig, lastCanvasWidth, lastCanvasHeight, wrapperEl) : null;
    const baseCharX = (initialCharPosition ?? charPos)?.x ?? 50;

    if (coinsConfig && coinFrameImages.length > 0) {
      coinStates.forEach((coin, index) => {
        if (!coin.visible) return;
        const { x, y } = getCoinPositionForViewport(
          coinsConfig, baseCharX, charSize.width, index, lastCanvasWidth, lastCanvasHeight, wrapperEl
        );
        const frameIdx = coin.state === 'static' ? 0 : coin.frameIndex % coinFrameImages.length;
        const img = coinFrameImages[frameIdx];
        if (img) drawCoin(ctx, img, coinsConfig, x, y);
      });
    }

    if (barrierConfig && coinsConfig && barrierFrameImages.length > 0) {
      barrierStates.forEach((barrier, index) => {
        if (!barrier.visible) return;
        const coinPos = getCoinPositionForViewport(
          coinsConfig, baseCharX, charSize.width, index, lastCanvasWidth, lastCanvasHeight, wrapperEl
        );
        const { x, y } = getBarrierPositionForViewport(
          barrierConfig, coinPos.x, coinPos.y, coinsConfig?.width ?? 134
        );
        const frameIdx = barrier.state === 'static'
          ? (barrierConfig.staticFrameIndex ?? 5)
          : barrier.frameIndex % barrierFrameImages.length;
        const img = barrierFrameImages[frameIdx];
        if (img) drawBarrier(ctx, img, barrierConfig, x, y);
      });
    }

    if (charFrameImages.length > 0 && charConfig) {
      const frameIdx = charState === 'stay' ? 0 : charFrameIndex % charFrameImages.length;
      const charDrawPos = charOverridePosition ?? charPos;
      drawChar(ctx, charFrameImages[frameIdx], charConfig, lastCanvasWidth, lastCanvasHeight, wrapperEl, charDrawPos);
    }
  }

  function coinFadeLoop() {
    drawFullFrame();
    let hasFadeOut = false;
    coinStates.forEach((coin, coinIndex) => {
      if (coin.state !== 'fade-out' || !coin.visible) return;
      hasFadeOut = true;
      coin.frameIndex += 1;
      if (coin.frameIndex >= (coinsConfig?.frames?.length ?? 0)) {
        coin.visible = false;
        coin.state = 'static';
        coin.frameIndex = 0;
        const barrier = barrierStates[coinIndex];
        if (barrier && barrier.state === 'hide') {
          barrier.state = 'fade-in';
          barrier.visible = true;
          barrier.frameIndex = 0;
          if (barrierFadeInTimerId == null) {
            const delay = barrierConfig?.fadeInFrameDelay ?? 60;
            barrierFadeInTimerId = window.setTimeout(barrierFadeInLoop, delay);
          }
          if (chainActive) {
            scheduleNextChainJump(coinIndex);
          }
        }
      }
    });
    if (hasFadeOut && coinStates.some((c) => c.state === 'fade-out')) {
      const delay = coinsConfig?.fadeFrameDelay ?? 60;
      coinFadeTimerId = window.setTimeout(coinFadeLoop, delay);
    } else {
      coinFadeTimerId = null;
    }
  }

  function barrierFadeInLoop() {
    drawFullFrame();
    let hasFadeIn = false;
    barrierStates.forEach((barrier) => {
      if (barrier.state !== 'fade-in' || !barrier.visible) return;
      hasFadeIn = true;
      barrier.frameIndex += 1;
      if (barrier.frameIndex >= (barrierConfig?.frames?.length ?? 0)) {
        barrier.state = 'static';
        barrier.frameIndex = barrierConfig?.staticFrameIndex ?? 5;
      }
    });
    if (hasFadeIn && barrierStates.some((b) => b.state === 'fade-in')) {
      const delay = barrierConfig?.fadeInFrameDelay ?? 60;
      barrierFadeInTimerId = window.setTimeout(barrierFadeInLoop, delay);
    } else {
      barrierFadeInTimerId = null;
    }
  }

  function stopBarrierFadeInLoop() {
    if (barrierFadeInTimerId != null) {
      clearTimeout(barrierFadeInTimerId);
      barrierFadeInTimerId = null;
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
    if (chainActive) {
      const continuing = updateChainJumpPosition();
      if (!continuing) return;
    }
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
    stopBarrierFadeInLoop();
    stopChainJumpTimer();
    chainActive = false;
    charOverridePosition = null;
    initialCharPosition = null;
    const { width, height } = getCanvasDimensionsFromBreakpoints(canvasBreakpoints, wrapperEl);
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
      if (barrierStates.some((b) => b.state === 'fade-in')) {
        const delay = barrierConfig?.fadeInFrameDelay ?? 60;
        barrierFadeInTimerId = window.setTimeout(barrierFadeInLoop, delay);
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
          if (barrierConfig && barrierFrameImages.length === 0) promises.push(loadBarrierFramesTask());
          Promise.all(promises).then(onReady);
          if (promises.length === 0) onReady();
        })
        .catch(() => {});
    } else if (bgImage) {
      const promises = [];
      if (charConfig && charFrameImages.length === 0) promises.push(loadCharFrames());
      if (coinsConfig && coinFrameImages.length === 0) promises.push(loadCoinFramesTask());
      if (barrierConfig && barrierFrameImages.length === 0) promises.push(loadBarrierFramesTask());
      Promise.all(promises).then(onReady);
      if (promises.length === 0) onReady();
    } else if ((charConfig && charFrameImages.length === 0) || (coinsConfig && coinFrameImages.length === 0) || (barrierConfig && barrierFrameImages.length === 0)) {
      const promises = [];
      if (charConfig && charFrameImages.length === 0) promises.push(loadCharFrames());
      if (coinsConfig && coinFrameImages.length === 0) promises.push(loadCoinFramesTask());
      if (barrierConfig && barrierFrameImages.length === 0) promises.push(loadBarrierFramesTask());
      Promise.all(promises).then(() => drawFullFrame());
    }
  }

  function handleInitClick() {
    wrapperEl.classList.add('_canvas-active');
    recalcAndRestart();
  }

  function startAnimationChain() {
    if (!charConfig || !coinsConfig || lastCanvasWidth <= 0 || lastCanvasHeight <= 0) return;
    if (coinStates.length === 0) return;
    initialCharPosition = getCharPositionForViewport(charConfig, lastCanvasWidth, lastCanvasHeight, wrapperEl);
    charOverridePosition = { ...initialCharPosition };
    chainActive = true;
    startJumpToCoin(0);
  }

  if (charConfig?.frames?.length) {
    loadCharFrames();
  }
  if (coinsConfig?.frames?.length) {
    loadCoinFramesTask();
  }
  if (barrierConfig?.frames?.length) {
    loadBarrierFramesTask();
  }

  return { recalcAndRestart, handleInitClick, setCharState, setCoinFadeOut, startAnimationChain };
}
