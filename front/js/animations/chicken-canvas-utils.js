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

export function createChickenCanvasController(config, elements) {
  const { wrapperEl, canvasEl, initBtnEl } = elements;
  const {
    backgroundBreakpoints,
    switchThreshold = 50,
    canvasBreakpoints,
  } = config;

  const bgBreakpoints = sortBackgroundBreakpoints(backgroundBreakpoints);
  let bgImage = null;
  let currentBgSrc = null;

  function recalcAndRestart() {
    const { width, height } = getCanvasDimensionsFromBreakpoints(canvasBreakpoints);
    if (width <= 0 || height <= 0) return;

    const bp = getBackgroundBreakpointForWidth(bgBreakpoints, width, switchThreshold);

    canvasEl.width = width;
    canvasEl.height = height;
    wrapperEl.style.width = width + 'px';
    wrapperEl.style.height = height + 'px';

    if (bp.src !== currentBgSrc) {
      loadImage(bp.src)
        .then((img) => {
          bgImage = img;
          currentBgSrc = bp.src;
          const ctx = canvasEl.getContext('2d');
          if (ctx) {
            const w = canvasEl.width;
            const h = canvasEl.height;
            if (w > 0 && h > 0) {
              drawBackground(ctx, img, bp.rootWidth, bp.rootHeight, w, h);
            }
          }
        })
        .catch(() => {});
    } else if (bgImage) {
      const ctx = canvasEl.getContext('2d');
      if (ctx) {
        drawBackground(ctx, bgImage, bp.rootWidth, bp.rootHeight, width, height);
      }
    }
  }

  function handleInitClick() {
    wrapperEl.classList.add('_canvas-active');
    recalcAndRestart();
  }

  return { recalcAndRestart, handleInitClick };
}
