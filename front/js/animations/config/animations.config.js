/**
 * Конфіги анімацій.
 */

export const chickenCanvasConfig = {
  selectors: {
    wrapper: '.land__canvas',
    landLeft: '.land__left',
    canvas: '[data-canvas="chicken"]',
    initBtn: '[data-canvas-init="chicken"]',
  },
  /** Root sizes sorted by width descending. Switch when canvasWidth >= rootWidth + switchThreshold. */
  backgroundBreakpoints: [
    { rootWidth: 1470, rootHeight: 1220, src: './img/canvas/bg.jpg' },
    { rootWidth: 1046, rootHeight: 666, src: './img/canvas/bg-desc-small.jpg' },
    { rootWidth: 868, rootHeight: 736, src: './img/canvas/bg-tab.jpg' },
    { rootWidth: 536, rootHeight: 455, src: './img/canvas/bg-mob.jpg' },
  ],
  switchThreshold: 50,
  /** Canvas size by breakpoint. Sorted by maxWidth ascending; first where viewportWidth <= maxWidth applies. */
  canvasBreakpoints: [
    { maxWidth: 600, width: 536, height: 455 },
    { maxWidth: 950, width: 868, height: 736 },
    { maxWidth: 1368, width: 1046, height: 666 },
    { maxWidth: Infinity, width: 1370, height: 1120 },
  ],
  /** Char — розміри 160×228px, стани stay | jumping. Позиції по брейкпоінтах. */
  char: {
    width: 160,
    height: 228,
    frames: [
      './img/canvas/char/frame-1.png',
      './img/canvas/char/frame-2.png',
      './img/canvas/char/frame-3.png',
      './img/canvas/char/frame-4.png',
      './img/canvas/char/frame-5.png',
      './img/canvas/char/frame-6.png',
      './img/canvas/char/frame-7.png',
      './img/canvas/char/frame-8.png',
      './img/canvas/char/frame-9.png',
      './img/canvas/char/frame-10.png',
    ],
    /** viewportWidth <= maxWidth. default: offsetX 50, centerY true */
    breakpoints: [
      { maxWidth: 600, offsetX: 30 },
      { maxWidth: 950, offsetX: 50 },
      { maxWidth: Infinity, offsetX: 50 },
    ],
  },
  /** Override for testing: pass custom breakpoints/root to force a specific background. */
  override: null,
};

export const textAnimationConfig = {
  wrapOrder: ['.land__text-item._first', '.land__text-item._second', '.land__text-item._third'],
  beforeShowBottomDelay: 500,
  showDuration: 200,
};
