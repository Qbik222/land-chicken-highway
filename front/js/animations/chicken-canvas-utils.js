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

  function drawFullFrame() {
    const ctx = canvasEl.getContext('2d');
    if (!ctx || !bgImage || lastCanvasWidth <= 0 || lastCanvasHeight <= 0) return;
    drawBackground(ctx, bgImage, lastBp.rootWidth, lastBp.rootHeight, lastCanvasWidth, lastCanvasHeight);
    if (charFrameImages.length > 0 && charConfig) {
      const frameIdx = charState === 'stay' ? 0 : charFrameIndex % charFrameImages.length;
      drawChar(ctx, charFrameImages[frameIdx], charConfig, lastCanvasWidth, lastCanvasHeight, wrapperEl);
    }
  }

  function jumpingLoop() {
    if (charState !== 'jumping') return;
    charFrameIndex = (charFrameIndex + 1) % (charFrameImages.length || 1);
    drawFullFrame();
    animationFrameId = requestAnimationFrame(jumpingLoop);
  }

  function stopJumpingLoop() {
    if (animationFrameId != null) {
      cancelAnimationFrame(animationFrameId);
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
    const { width, height } = getCanvasDimensionsFromBreakpoints(canvasBreakpoints);
    if (width <= 0 || height <= 0) return;

    const bp = getBackgroundBreakpointForWidth(bgBreakpoints, width, switchThreshold);

    canvasEl.width = width;
    canvasEl.height = height;

    lastCanvasWidth = width;
    lastCanvasHeight = height;
    lastBp = bp;

    if (bp.src !== currentBgSrc) {
      loadImage(bp.src)
        .then((img) => {
          bgImage = img;
          currentBgSrc = bp.src;
          if (charConfig && charFrameImages.length === 0) {
            loadCharFrames().then(() => {
              drawFullFrame();
              if (charState === 'jumping') jumpingLoop();
            });
          } else {
            drawFullFrame();
            if (charState === 'jumping') jumpingLoop();
          }
        })
        .catch(() => {});
    } else if (bgImage) {
      drawFullFrame();
      if (charState === 'jumping') jumpingLoop();
    } else if (charConfig && charFrameImages.length === 0) {
      loadCharFrames().then(() => drawFullFrame());
    }
  }

  function handleInitClick() {
    wrapperEl.classList.add('_canvas-active');
    recalcAndRestart();
  }

  if (charConfig?.frames?.length) {
    loadCharFrames();
  }

  return { recalcAndRestart, handleInitClick, setCharState };
}
