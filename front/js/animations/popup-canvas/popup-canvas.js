import { createPopupCanvasController } from './popup-canvas-utils.js';

export function initPopupCanvas(config) {
  if (!config) return null;

  const { selectors } = config;

  const canvasEl = document.querySelector(selectors.canvas);

  if (!canvasEl) return null;

  const controller = createPopupCanvasController(config, {
    canvas: canvasEl,
  });

  return {
    drawFullFrameLoop: controller.drawFullFrameLoop,
  };
}
  