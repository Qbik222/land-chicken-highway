/**
 * Chicken canvas — ініціалізація на основі конфігу з main.js.
 * Умови: front/canvas-flow.md
 */

import { createChickenCanvasController } from './chicken-canvas-utils.js';

export function initChickenCanvas(config) {
  if (!config) return null;

  const effectiveConfig = config.override
    ? { ...config, ...config.override }
    : config;

  const { selectors } = effectiveConfig;

  const wrapperEl = document.querySelector(selectors.wrapper);
  const landLeftEl = document.querySelector(selectors.landLeft);
  const canvasEl = document.querySelector(selectors.canvas);
  const initBtnEl = document.querySelector(selectors.initBtn);

  if (!wrapperEl || !landLeftEl || !canvasEl) return null;

  const controller = createChickenCanvasController(effectiveConfig, {
    wrapperEl,
    canvasEl,
    initBtnEl,
  });

  controller.recalcAndRestart();

  return {
    recalcAndRestart: controller.recalcAndRestart,
    handleInitClick: controller.handleInitClick,
    setCharState: controller.setCharState,
    setCoinFadeOut: controller.setCoinFadeOut,
    startAnimationChain: controller.startAnimationChain,
  };
}
