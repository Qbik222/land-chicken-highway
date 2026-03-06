/**
 * Chicken canvas — бізнес-логіка.
 * Умови: front/canvas-flow.md
 */

/**
 * Розміри canvas з брейкпоінтів. Якщо bp.isWrapperFill === true — width/height з wrapperEl.
 * Орієнтація застосовується разом із діапазоном maxWidth (CSS-like: (max-width: X) and (orientation: portrait)).
 */
export function getCanvasDimensionsFromBreakpoints(sizeBreakpoints, wrapperEl) {
  const points = sizeBreakpoints || [];
  const sorted = [...points].sort(
    (a, b) => (a.maxWidth ?? Infinity) - (b.maxWidth ?? Infinity)
  );
  const viewportWidth = window.innerWidth;
  const orientation = getCurrentOrientation();

  const matches = (bp) =>
    viewportWidth <= (bp.maxWidth ?? Infinity) && (!bp.orientation || bp.orientation === orientation);
  const matchesWidthOnly = (bp) => viewportWidth <= (bp.maxWidth ?? Infinity);

  let bp = sorted.find(matches) ?? sorted.find(matchesWidthOnly);
  if (bp) {
    if (bp.isWrapperFill && wrapperEl) {
      return { width: wrapperEl.offsetWidth || bp.width, height: wrapperEl.offsetHeight || bp.height };
    }
    return { width: bp.width, height: bp.height };
  }

  const last = sorted[sorted.length - 1];
  if (last?.isWrapperFill && wrapperEl) {
    return { width: wrapperEl.offsetWidth || last.width, height: wrapperEl.offsetHeight || last.height };
  }
  return last ? { width: last.width, height: last.height } : { width: 536, height: 455 };
}

export function getBackgroundBreakpointForWidth(bgBreakpoints, canvasWidth, switchThreshold = 50) {
  const orientation = getCurrentOrientation();
  const matches = (bp) => {

    return canvasWidth >= bp.rootWidth + switchThreshold && (!bp.orientation || bp.orientation === orientation)
  }
  const matchesWidthOnly = (bp) => canvasWidth >= bp.rootWidth + switchThreshold;

  console.log(matches)

  
  // console.log(bgBreakpoints.find(matches), orientation);

  const bp = bgBreakpoints.find(matches) ?? bgBreakpoints.find(matchesWidthOnly);


  return bp ?? bgBreakpoints[bgBreakpoints.length - 1];
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
  const orientation = getCurrentOrientation();
  // console.log(breakpoints, orientation);
  const sorted = [...breakpoints].sort((a, b) => b.rootWidth - a.rootWidth);
  const filtered = sorted.filter((bp) => bp.orientation === orientation) ?? sorted;
  // console.log(filtered);
  return filtered.length > 0 ? filtered : sorted;
}

/**
 * Поточна орієнтація екрану. Використовується при виборі брейкпоінтів разом із діапазоном (CSS-like).
 * @returns {'portrait'|'landscape'}
 */
export function getCurrentOrientation() {
  if (typeof window === 'undefined') return 'landscape';
  if (typeof window.matchMedia === 'function') {
    const mq = window.matchMedia('(orientation: portrait)');
    return mq.matches ? 'portrait' : 'landscape';
  }
  if (window.innerWidth && window.innerHeight) {
    return window.innerWidth < window.innerHeight ? 'portrait' : 'landscape';
  }
  return 'landscape';
}

/**
 * Returns breakpoints that match current orientation.
 * bp.orientation: 'portrait' | 'landscape' | undefined (any).
 * @deprecated Вибір брейкпоінтів тепер робиться через умову "діапазон + орієнтація" у getMatchedBreakpoint / getCanvasDimensionsFromBreakpoints / getBackgroundBreakpointForWidth.
 */
export function filterBreakpointsByOrientation(breakpoints) {
  if (!breakpoints?.length) return breakpoints || [];
  const orientation = getCurrentOrientation();
  const filtered = breakpoints.filter((bp) => !bp.orientation || bp.orientation === orientation);
  return filtered.length > 0 ? filtered : breakpoints;
}

/** Thin wrapper for backwards compatibility with background breakpoints. */
export function filterBackgroundBreakpointsByOrientation(breakpoints) {
  return filterBreakpointsByOrientation(breakpoints);
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
  const bp = getMatchedBreakpoint(breakpoints);
  const offsetX = bp?.offsetX ?? 50;
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
  const bp = getMatchedBreakpoint(breakpoints);
  return bp?.[key] ?? fallback;
}

/**
 * Повертає breakpoint, що відповідає поточному viewportWidth.
 * Підтримує опційний orientation — перевірка разом із діапазоном (CSS-like).
 */
export function getMatchedBreakpoint(breakpoints) {
  if (!breakpoints?.length) return null;
  const sorted = [...breakpoints].sort(
    (a, b) => (a.maxWidth ?? Infinity) - (b.maxWidth ?? Infinity)
  );
  const viewportWidth = window.innerWidth;
  const orientation = getCurrentOrientation();
  const matches = (p) =>
    viewportWidth <= (p.maxWidth ?? Infinity) && (!p.orientation || p.orientation === orientation);
  const matchesWidthOnly = (p) => viewportWidth <= (p.maxWidth ?? Infinity);

  return sorted.find(matches) ?? sorted.find(matchesWidthOnly) ?? sorted[sorted.length - 1];
}

/**
 * Позиція коіна відносно char. Перший коін — offsetRight px вправо від char, далі в ряд з gapBetween.
 * По вертикалі — центр land__canvas.
 * Кожен item може мати gapBetweenLeft (відступ зліва) або gapBetweenRight (відступ справа) для кастомного інтервалу.
 * Усі параметри (width, height, offsetRight, gapBetween, itemGaps) беруться з єдиного coins.breakpoints.
 */
export function getCoinPositionForViewport(coinsConfig, charX, charWidth, index, canvasWidth, canvasHeight, wrapperEl) {
  const coinsBp = getMatchedBreakpoint(coinsConfig?.breakpoints);
  const w = coinsBp?.width ?? coinsConfig.width ?? 134;
  const h = coinsBp?.height ?? coinsConfig.height ?? 172;
  const offsetRight = coinsBp?.offsetRight ?? coinsConfig.offsetRightDefault ?? 50;
  const gapBetween = coinsBp?.gapBetween ?? 70;
  const items = coinsConfig?.items ?? [];
  const wrapperHeight = wrapperEl?.offsetHeight ?? canvasHeight;
  const y = Math.max(0, Math.min((wrapperHeight - h) / 2, canvasHeight - h));

  let leftEdge = charX + (charWidth ?? 225);
  for (let i = 0; i <= index; i++) {
    const itemGap = coinsBp?.itemGaps?.[i];
    const prevItemGap = i > 0 ? coinsBp?.itemGaps?.[i - 1] : null;
    const gap =
      i === 0
        ? (itemGap?.gapBetweenLeft ?? items[i]?.gapBetweenLeft ?? offsetRight)
        : (itemGap?.gapBetweenLeft ?? items[i]?.gapBetweenLeft ?? prevItemGap?.gapBetweenRight ?? items[i - 1]?.gapBetweenRight ?? gapBetween);
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
  const bp = getMatchedBreakpoint(barrierConfig?.breakpoints);
  const barrierWidth = bp?.width ?? barrierConfig.width ?? 171;
  const barrierHeight = bp?.height ?? barrierConfig.height ?? 112;
  const offsetAbove =
    bp?.offsetAbove ??
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

/** Дозволені комбінації fade-in при jumping: 2–3 машини, max 2 підряд. */
export function getValidFadeInCombos() {
  return [
    [0, 1], [1, 2], [2, 3], [0, 2], [0, 3], [1, 3],
    [0, 1, 3], [0, 2, 3],
  ];
}

export function loadCarVariants(carsConfig) {
  if (!carsConfig?.variants?.length) return Promise.resolve([]);

  console.log(carsConfig.variants);
  return Promise.all(
    carsConfig.variants.map((v) =>
      loadImage(v.src)
        .then((img) => ({ img, width: v.width ?? 168, height: v.height ?? 342 }))
        .catch(() => null)
    )
  ).then((arr) => arr.filter(Boolean));
}

function pickRandomCarVariant(loadedVariants) {
  if (!loadedVariants?.length) return null;
  return loadedVariants[Math.floor(Math.random() * loadedVariants.length)];
}

function drawBarrier(ctx, img, barrierConfig, x, y) {
  const bp = getMatchedBreakpoint(barrierConfig?.breakpoints);
  const width = bp?.width ?? barrierConfig.width ?? 171;
  const height = bp?.height ?? barrierConfig.height ?? 112;
  ctx.drawImage(img, x, y, width, height);
}

function drawCoin(ctx, img, coinsConfig, x, y) {
  const coinsBp = getMatchedBreakpoint(coinsConfig?.breakpoints);
  const width = coinsBp?.width ?? coinsConfig.width ?? 134;
  const height = coinsBp?.height ?? coinsConfig.height ?? 172;
  ctx.drawImage(img, x, y, width, height);
}

function drawCar(ctx, carImg, x, y, width, height) {
  if (carImg) ctx.drawImage(carImg, x, y, width, height);
}

function getCarsBreakpoint(carsConfig) {
  return getMatchedBreakpoint(carsConfig?.breakpoints);
}

function getCarsConfigValue(carsConfig, key, fallback) {
  const bp = getCarsBreakpoint(carsConfig);
  return bp?.[key] ?? carsConfig?.[key] ?? fallback;
}

function getCarsSizeScale(carsConfig) {
  return getCarsConfigValue(carsConfig, 'sizeScale', 1);
}

function drawChar(ctx, charImg, charConfig, canvasWidth, canvasHeight, wrapperEl, overridePosition) {
  const { width, height } = getCharSize(charConfig);
  const pos = overridePosition ?? getCharPositionForViewport(charConfig, canvasWidth, canvasHeight, wrapperEl);
  ctx.drawImage(charImg, pos.x, pos.y, width, height);
}

export function createChickenCanvasController(config, elements) {
  const { wrapperEl, canvasEl, initBtnEl } = elements;
  const counterEl = config.selectors?.counterNumber
    ? document.querySelector(config.selectors.counterNumber)
    : null;
  const initBtnDisabledClass = config.selectors?.initBtnDisabledClass ?? '_disabled';
  const {
    backgroundBreakpoints,
    switchThreshold = 50,
    canvasBreakpoints,
    char: charConfig,
    coins: coinsConfig,
    barrier: barrierConfig,
    cars: carsConfig,
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
  let chainCompleteTimerId = null;
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
  let coinStaticImage = null;
  let coinFadeTimerId = null;

  const barrierStates = (barrierConfig?.items || []).map(() => ({
    state: 'hide',
    frameIndex: 0,
    visible: false,
  }));
  let barrierFrameImages = [];
  let barrierFadeInTimerId = null;

  let carVariantImages = [];
  let runningCars = [];
  let fadeInCars = [];
  const carSlotStates = (coinsConfig?.items || []).map(() => ({ lastDriveEndTime: 0 }));
  let pendingJumpStart = false;
  let pendingJumpForCoinIndex = null;
  let chainFadeInCombo = null;
  let carRunningRafId = null;
  const carDriveScheduleTimers = [];

  function updateCounter(collected) {
    if (!counterEl) return;
    const total = coinStates.length;
    counterEl.textContent = `${collected} / ${total}`;
  }

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
    const promises = [];
    if (coinsConfig?.frames?.length) {
      promises.push(loadCoinFrames(coinsConfig).then((imgs) => { coinFrameImages = imgs; }));
    }
    const staticSrc = coinsConfig?.staticFrame ?? (coinsConfig?.imagePath ? `${coinsConfig.imagePath}/static.png` : null);
    if (staticSrc) {
      promises.push(loadImage(staticSrc).then((img) => { coinStaticImage = img; }).catch(() => {}));
    }
    return promises.length ? Promise.all(promises) : Promise.resolve();
  }

  function getCoinCenterX(coinIndex) {
    const charSize = getCharSize(charConfig);
    const pos = getCoinPositionForViewport(
      coinsConfig, baseCharXForCoins(), charSize.width, coinIndex,
      lastCanvasWidth, lastCanvasHeight, wrapperEl
    );
    const coinsBp = getMatchedBreakpoint(coinsConfig?.breakpoints);
    const coinWidth = coinsBp?.width ?? coinsConfig?.width ?? 134;
    return pos.x + coinWidth / 2;
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

    if (carsConfig && runningCars.some((c) => c.coinIndex === targetIndex)) {
      pendingJumpForCoinIndex = targetIndex;
      return;
    }
    pendingJumpForCoinIndex = null;

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
        const popupDelay = animationChainConfig?.popupOpenDelayAfterLastJump ?? 0;
        const onChainComplete = animationChainConfig?.onChainComplete;
        if (typeof onChainComplete === 'function') {
          if (popupDelay > 0) {
            chainCompleteTimerId = window.setTimeout(() => {
              chainCompleteTimerId = null;
              onChainComplete();
            }, popupDelay);
          } else {
            onChainComplete();
          }
        }
      }
    };
    if (betweenDelay > 0 && nextIndex < coinStates.length) {
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
    if (chainCompleteTimerId != null) {
      clearTimeout(chainCompleteTimerId);
      chainCompleteTimerId = null;
    }
  }

  function loadBarrierFramesTask() {
    if (!barrierConfig?.frames?.length) return Promise.resolve();
    return loadBarrierFrames(barrierConfig).then((imgs) => {
      barrierFrameImages = imgs;
    });
  }

  function loadCarVariantsTask() {
    if (!carsConfig?.variants?.length) return Promise.resolve();
    return loadCarVariants(carsConfig).then((arr) => {
      carVariantImages = arr;
    });
  }

  function getCarPositionX(coinIndex) {
    const charSize = getCharSize(charConfig);
    const pos = getCoinPositionForViewport(
      coinsConfig, baseCharXForCoins(), charSize.width, coinIndex,
      lastCanvasWidth, lastCanvasHeight, wrapperEl
    );
    const coinsBp = getMatchedBreakpoint(coinsConfig?.breakpoints);
    const coinWidth = coinsBp?.width ?? coinsConfig?.width ?? 134;
    return pos.x + coinWidth / 2;
  }

  function getCarStartY(carHeight) {
    const offset = getCarsConfigValue(carsConfig, 'offsetAboveCanvas', 20);
    return -carHeight - offset;
  }

  function getCarFadeInTargetY(coinIndex, carHeight) {
    const coinPos = getCoinPositionForViewport(
      coinsConfig, baseCharXForCoins(), getCharSize(charConfig).width, coinIndex,
      lastCanvasWidth, lastCanvasHeight, wrapperEl
    );
    const coinsBp = getMatchedBreakpoint(coinsConfig?.breakpoints);
    const coinWidth = coinsBp?.width ?? coinsConfig?.width ?? 134;
    const { y: barrierY } = getBarrierPositionForViewport(
      barrierConfig, coinPos.x, coinPos.y, coinWidth
    );
    const stopBefore = getCarsConfigValue(carsConfig, 'stopBeforeBarrier', 20);
    return barrierY - carHeight - stopBefore;
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function startCarRunning(coinIndex) {
    if (!carsConfig || carVariantImages.length === 0) return;
    if (pendingJumpStart) return;
    if (coinIndex === pendingJumpForCoinIndex) return;
    if (chainActive && chainTargetCoinIndex === coinIndex) {
      scheduleNextCarDrive(coinIndex);
      return;
    }
    const coin = coinStates[coinIndex];
    if (!coin || coin.state === 'fade-out' || !coin.visible) return;
    if (runningCars.some((c) => c.coinIndex === coinIndex)) {
      scheduleNextCarDrive(coinIndex);
      return;
    }
    if (fadeInCars.some((c) => c.coinIndex === coinIndex)) {
      scheduleNextCarDrive(coinIndex);
      return;
    }
    const maxConcurrent = carsConfig.maxConcurrent ?? 2;
    const minStartGap = (carsConfig.minStartGap ?? 1) * 1000;
    const now = Date.now();
    const lastEnd = carSlotStates[coinIndex]?.lastDriveEndTime ?? 0;
    if (runningCars.length >= maxConcurrent || now - lastEnd < minStartGap) {
      scheduleNextCarDrive(coinIndex);
      return;
    }

    const baseVariant = pickRandomCarVariant(carVariantImages);
    const scale = getCarsSizeScale(carsConfig);
    const variant = baseVariant
      ? { ...baseVariant, width: Math.round(baseVariant.width * scale), height: Math.round(baseVariant.height * scale) }
      : null;
    if (!variant) return;

    const centerX = getCarPositionX(coinIndex);
    const x = centerX - variant.width / 2;
    const y = getCarStartY(variant.height);

    runningCars.push({
      coinIndex,
      x,
      y,
      img: variant.img,
      width: variant.width,
      height: variant.height,
      startTime: now,
    });

    scheduleNextCarDrive(coinIndex);

    if (!carRunningRafId) runCarRunningLoop();
  }

  function scheduleNextCarDrive(coinIndex) {
    const intervalMin = (carsConfig?.runningIntervalMin ?? 4) * 1000;
    const intervalMax = (carsConfig?.runningIntervalMax ?? 10) * 1000;
    const delay = randomBetween(intervalMin, intervalMax);
    const id = window.setTimeout(() => {
      for (let i = 0; i < carDriveScheduleTimers.length; i++) {
        if (carDriveScheduleTimers[i]?.id === id) {
          carDriveScheduleTimers.splice(i, 1);
          break;
        }
      }
      startCarRunning(coinIndex);
    }, delay);
    carDriveScheduleTimers.push({ id, coinIndex });
  }

  function scheduleFirstCarDrives() {
    if (!carsConfig || carVariantImages.length === 0) return;
    const intervalMax = (carsConfig?.runningIntervalMax ?? 10) * 1000;
    (coinsConfig?.items ?? []).forEach((_, i) => {
      const coin = coinStates[i];
      if (!coin || coin.state === 'fade-out' || !coin.visible) return;
      const delay = randomBetween(0, intervalMax);
      const id = window.setTimeout(() => {
        for (let j = 0; j < carDriveScheduleTimers.length; j++) {
          if (carDriveScheduleTimers[j]?.id === id) {
            carDriveScheduleTimers.splice(j, 1);
            break;
          }
        }
        startCarRunning(i);
      }, delay);
      carDriveScheduleTimers.push({ id, coinIndex: i });
    });
  }

  function runCarRunningLoop() {
    const speed = (carsConfig?.runningSpeed ?? 0.8) * (chainActive ? (carsConfig?.runningSpeedMultiplierDuringJump ?? 1.5) : 1);
    const dt = 16;
    const dy = speed * dt;

    for (let i = runningCars.length - 1; i >= 0; i--) {
      const car = runningCars[i];
      car.y += dy;
      if (car.y >= lastCanvasHeight + car.height) {
        carSlotStates[car.coinIndex].lastDriveEndTime = Date.now();
        const wasWaitingForThisSlot = car.coinIndex === pendingJumpForCoinIndex;
        runningCars.splice(i, 1);
        if (wasWaitingForThisSlot) {
          const targetIndex = pendingJumpForCoinIndex;
          pendingJumpForCoinIndex = null;
          startJumpToCoin(targetIndex);
        }
      }
    }

    if (runningCars.length === 0) {
      carRunningRafId = null;
      if (pendingJumpStart) {
        pendingJumpStart = false;
        startJumpToCoin(0);
      }
      return;
    }

    drawFullFrame();
    carRunningRafId = requestAnimationFrame(runCarRunningLoop);
  }

  function triggerCarFadeIn(coinIndex) {
    if (!carsConfig || !barrierConfig || carVariantImages.length === 0) return;
    if (chainActive && chainFadeInCombo && !chainFadeInCombo.has(coinIndex)) return;
    if (fadeInCars.some((c) => c.coinIndex === coinIndex)) return;

    const baseVariant = pickRandomCarVariant(carVariantImages);
    const scale = getCarsSizeScale(carsConfig);
    const variant = baseVariant
      ? { ...baseVariant, width: Math.round(baseVariant.width * scale), height: Math.round(baseVariant.height * scale) }
      : null;
    if (!variant) return;

    const centerX = getCarPositionX(coinIndex);
    const x = centerX - variant.width / 2;
    const startY = getCarStartY(variant.height);
    const targetY = getCarFadeInTargetY(coinIndex, variant.height);

    fadeInCars.push({
      coinIndex,
      x,
      y: startY,
      targetY,
      img: variant.img,
      width: variant.width,
      height: variant.height,
      moving: true,
    });

    if (!carFadeInRafId) runCarFadeInLoop();
  }

  let carFadeInRafId = null;

  function runCarFadeInLoop() {
    const speed = (carsConfig?.fadeInSpeed ?? 1.2);
    const dt = 16;
    const dy = speed * dt;

    let hasMoving = false;
    fadeInCars.forEach((car) => {
      if (!car.moving) return;
      car.y += dy;
      if (car.y >= car.targetY) {
        car.y = car.targetY;
        car.moving = false;
      } else {
        hasMoving = true;
      }
    });

    drawFullFrame();

    if (hasMoving) {
      carFadeInRafId = requestAnimationFrame(runCarFadeInLoop);
    } else {
      carFadeInRafId = null;
    }
  }

  function stopCarTimers() {
    carDriveScheduleTimers.forEach((t) => {
      if (t?.id != null) clearTimeout(t.id);
    });
    carDriveScheduleTimers.length = 0;
    if (carRunningRafId != null) {
      cancelAnimationFrame(carRunningRafId);
      carRunningRafId = null;
    }
  }

  function drawFullFrame() {
    const ctx = canvasEl.getContext('2d');
    if (!ctx || !bgImage || lastCanvasWidth <= 0 || lastCanvasHeight <= 0) return;
    drawBackground(ctx, bgImage, lastBp.rootWidth, lastBp.rootHeight, lastCanvasWidth, lastCanvasHeight);

    const charSize = charConfig ? getCharSize(charConfig) : { width: 225, height: 322 };
    const charPos = charConfig ? getCharPositionForViewport(charConfig, lastCanvasWidth, lastCanvasHeight, wrapperEl) : null;
    const baseCharX = (initialCharPosition ?? charPos)?.x ?? 50;

    if (coinsConfig && (coinStaticImage || coinFrameImages.length > 0)) {
      coinStates.forEach((coin, index) => {
        if (!coin.visible) return;
        const { x, y } = getCoinPositionForViewport(
          coinsConfig, baseCharX, charSize.width, index, lastCanvasWidth, lastCanvasHeight, wrapperEl
        );
        const img = coin.state === 'static'
          ? (coinStaticImage ?? coinFrameImages[0])
          : coinFrameImages[coin.frameIndex % coinFrameImages.length];
        if (img) drawCoin(ctx, img, coinsConfig, x, y);
      });
    }

    if (carsConfig && carVariantImages.length > 0) {
      fadeInCars.forEach((car) => {
        drawCar(ctx, car.img, car.x, car.y, car.width, car.height);
      });
      runningCars.forEach((car) => {
        if (car.y + car.height >= 0 && car.y <= lastCanvasHeight) {
          drawCar(ctx, car.img, car.x, car.y, car.width, car.height);
        }
      });
    }

    if (barrierConfig && coinsConfig && barrierFrameImages.length > 0) {
      barrierStates.forEach((barrier, index) => {
        if (!barrier.visible) return;
        const coinPos = getCoinPositionForViewport(
          coinsConfig, baseCharX, charSize.width, index, lastCanvasWidth, lastCanvasHeight, wrapperEl
        );
        const coinsBp = getMatchedBreakpoint(coinsConfig?.breakpoints);
        const coinWidth = coinsBp?.width ?? coinsConfig?.width ?? 134;
        const { x, y } = getBarrierPositionForViewport(
          barrierConfig, coinPos.x, coinPos.y, coinWidth
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
          triggerCarFadeIn(coinIndex);
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
    updateCounter(coinIndex + 1);
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
    stopCarTimers();
    if (carFadeInRafId != null) {
      cancelAnimationFrame(carFadeInRafId);
      carFadeInRafId = null;
    }
    runningCars = [];
    fadeInCars = [];
    carSlotStates.forEach((s) => { s.lastDriveEndTime = 0; });
    pendingJumpStart = false;
    pendingJumpForCoinIndex = null;
    chainFadeInCombo = null;
    chainActive = false;
    charOverridePosition = null;
    initialCharPosition = null;
    updateCounter(0);
    const coinDefaultState = coinsConfig?.defaultState ?? 'static';
    const barrierDefaultState = barrierConfig?.defaultState ?? 'hide';
    charState = charConfig?.defaultState ?? 'stay';
    coinStates.forEach((c) => {
      c.state = coinDefaultState;
      c.frameIndex = 0;
      c.visible = true;
    });
    barrierStates.forEach((b) => {
      b.state = barrierDefaultState;
      b.frameIndex = 0;
      b.visible = false;
    });
    initBtnEl?.classList.remove(initBtnDisabledClass);
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
      if (carsConfig && carVariantImages.length > 0) {
        scheduleFirstCarDrives();
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
          if (carsConfig && carVariantImages.length === 0) promises.push(loadCarVariantsTask());
          Promise.all(promises).then(onReady);
          if (promises.length === 0) onReady();
        })
        .catch(() => {});
    } else if (bgImage) {
      const promises = [];
      if (charConfig && charFrameImages.length === 0) promises.push(loadCharFrames());
      if (coinsConfig && coinFrameImages.length === 0) promises.push(loadCoinFramesTask());
      if (barrierConfig && barrierFrameImages.length === 0) promises.push(loadBarrierFramesTask());
      if (carsConfig && carVariantImages.length === 0) promises.push(loadCarVariantsTask());
      Promise.all(promises).then(onReady);
      if (promises.length === 0) onReady();
    } else if ((charConfig && charFrameImages.length === 0) || (coinsConfig && coinFrameImages.length === 0) || (barrierConfig && barrierFrameImages.length === 0) || (carsConfig && carVariantImages.length === 0)) {
      const promises = [];
      if (charConfig && charFrameImages.length === 0) promises.push(loadCharFrames());
      if (coinsConfig && coinFrameImages.length === 0) promises.push(loadCoinFramesTask());
      if (barrierConfig && barrierFrameImages.length === 0) promises.push(loadBarrierFramesTask());
      if (carsConfig && carVariantImages.length === 0) promises.push(loadCarVariantsTask());
      Promise.all(promises).then(() => drawFullFrame());
    }
  }

  function handleInitClick() {
    startAnimationChain();
    this.classList.add(initBtnDisabledClass);
  }

  function startAnimationChain() {
    if (!charConfig || !coinsConfig || lastCanvasWidth <= 0 || lastCanvasHeight <= 0) return;
    if (coinStates.length === 0) return;

    const combos = getValidFadeInCombos();
    chainFadeInCombo = new Set(combos[Math.floor(Math.random() * combos.length)]);

    initialCharPosition = getCharPositionForViewport(charConfig, lastCanvasWidth, lastCanvasHeight, wrapperEl);
    charOverridePosition = { ...initialCharPosition };
    chainActive = true;
    updateCounter(0);

    if (carsConfig && runningCars.length > 0) {
      pendingJumpStart = true;
    } else {
      startJumpToCoin(0);
    }
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
  if (carsConfig?.variants?.length) {
    loadCarVariantsTask();
  }

  return { recalcAndRestart, handleInitClick, setCharState, setCoinFadeOut, startAnimationChain };
}
