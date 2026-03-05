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
  /** Canvas size by breakpoint. Sorted by maxWidth ascending; first where viewportWidth <= maxWidth applies. isWrapperFill: true — розмір з wrapper (.land__canvas). */
  canvasBreakpoints: [
    { maxWidth: 1700, width: 1200, height: 1540 },
    { maxWidth: Infinity, width: 1360, height: 1540, isWrapperFill: false },
  ],
  /** Char — дефолт 225×322px, стани stay | jumping. Розміри змінюються тільки через sizeBreakpoints. */
  char: {
    width: 225,
    height: 322,
    /** viewportWidth <= maxWidth. Зміни розміру тільки через sizeBreakpoints. */
    // sizeBreakpoints: [{ maxWidth: 600, width: 200, height: 286 }, ...],
    /** Затримка між кадрами jumping (ms) */
    jumpFrameDelay: 80,
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
      { maxWidth: 1750, offsetX: 70 },
      { maxWidth: Infinity, offsetX: 100 },
    ],
  },
  /** Coins — 134×172px, стани static | fade-out. В ряд відносно char. */
  coins: {
    width: 134,
    height: 172,
    imagePath: './img/canvas/coin',
    frames: [
      './img/canvas/coin/frame-1.png',
      './img/canvas/coin/frame-2.png',
    ],
    /** Перший коін: offsetRight px вправо від char. offsetRightDefault — fallback коли breakpoints не підходять */
    offsetRightDefault: 70,
    offsetRightBreakpoints: [
      { maxWidth: 1700, offsetRight: 20 },
      { maxWidth: Infinity, offsetRight: 40 },
    ],
    /** Відстань між коінами (px). viewportWidth <= maxWidth. itemGaps: { index: { gapBetweenLeft, gapBetweenRight } } */
    gapBreakpoints: [
      { maxWidth: 1700, gapBetween: 30, itemGaps: { 2: { gapBetweenLeft: 40 } } },
      { maxWidth: Infinity, gapBetween: 70, itemGaps: { 2: { gapBetweenLeft: 50 } } },
    ],
    /** Затримка між кадрами fade-out (ms) */
    fadeFrameDelay: 120,
    /** items: { id } + опційно gapBetweenLeft (відступ зліва), gapBetweenRight (відступ справа) — fallback якщо нема в itemGaps */
    items: [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }],
  },
  /** Barrier — 171×112px, прив'язка до coin[i]. Стани hide | fade-in | static. */
  barrier: {
    width: 171,
    height: 112,
    imagePath: './img/canvas/barrier',
    frames: [
      './img/canvas/barrier/frame-1.png',
      './img/canvas/barrier/frame-2.png',
      './img/canvas/barrier/frame-3.png',
      './img/canvas/barrier/frame-4.png',
      './img/canvas/barrier/frame-5.png',
      './img/canvas/barrier/frame-6.png',
    ],
    staticFrameIndex: 5,
    offsetAboveDefault: 10,
    offsetAboveBreakpoints: [
      { maxWidth: 600, offsetAbove: 8 },
      { maxWidth: 950, offsetAbove: 10 },
      { maxWidth: Infinity, offsetAbove: 10 },
    ],
    fadeInFrameDelay: 60,
    items: [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }],
  },
  /** Cars — car-1 168×342, car-2 170×384. Випадковий візуал при кожному старті drive. Стани running | fade-in. */
  cars: {
    variants: [
      { width: 168, height: 342, src: './img/canvas/car-1.png' },
      { width: 170, height: 384, src: './img/canvas/car-2.png' },
    ],
    offsetAboveCanvas: 20,
    runningIntervalMin: 4,
    runningIntervalMax: 10,
    runningSpeed: 0.8,
    minStartGap: 1,
    maxConcurrent: 2,
    stopBeforeBarrier: 20,
    fadeInSpeed: 1.2,
    runningSpeedMultiplierDuringJump: 1.5,
  },
  /** Animation chain: char стрибає по дузі до коінів по черзі. */
  animationChain: {
    jumpArcHeight: 60,
    jumpDuration: 600,
    betweenJumpsDelay: 500,
  },
  /** Override for testing: pass custom breakpoints/root to force a specific background. */
  override: null,
};

export const textAnimationConfig = {
  wrapOrder: ['.land__text-item._first', '.land__text-item._second', '.land__text-item._third'],
  beforeShowBottomDelay: 500,
  showDuration: 200,
};
