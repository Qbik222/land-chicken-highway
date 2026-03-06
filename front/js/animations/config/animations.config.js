/**
 * Конфіги анімацій.
 */

export const chickenCanvasConfig = {
  selectors: {
    wrapper: '.land__canvas',
    landLeft: '.land__left',
    canvas: '[data-canvas="chicken"]',
    initBtn: '[data-canvas-init="chicken"]',
    initBtnDisabledClass: '_disabled',
    counterNumber: '.land__counter-number',
  },
  /** Root sizes sorted by width descending. Switch when canvasWidth >= rootWidth + switchThreshold. Optional orientation: 'portrait' | 'landscape' — applies only in that orientation. */
  backgroundBreakpoints: [
    { rootWidth: 1470, rootHeight: 1220, src: './img/canvas/bg.jpg' },
    { rootWidth: 1080, rootHeight: 850, src: './img/canvas/bg-desc-small.jpg' },
    { rootWidth: 868, rootHeight: 736, src: './img/canvas/bg-tab.jpg' },

    //portrait
    { rootWidth: 1300, rootHeight: 1000, orientation: 'portrait', src: './img/canvas/bg-tab.jpg' },
    { rootWidth: 700, rootHeight: 1300, orientation: 'portrait', src: './img/canvas/bg-tab.jpg' },
    { rootWidth: 670, rootHeight: 1000, orientation: 'portrait', src: './img/canvas/bg-mob.jpg' },

  ],
  switchThreshold: 50,
  /**
   * Canvas size by breakpoint. Sorted by maxWidth ascending; first where viewportWidth <= maxWidth applies.
   * isWrapperFill: true — розмір з wrapper (.land__canvas).
   * orientation?: 'portrait' | 'landscape' — опційно, breakpoint тільки для відповідної орієнтації.
   */
  canvasBreakpoints: [
    { maxWidth: 1300, width: 1350, height: 2000, orientation: 'portrait' },
    { maxWidth: 1150, width: 1150, height: 1500, orientation: 'portrait', src: './img/canvas/bg-tab.jpg'},
    { maxWidth: 950, width: 950, height: 1300, orientation: 'portrait' },
    { maxWidth: 850, width: 860, height: 900, orientation: 'portrait' },
    { maxWidth: 670, width: 670, height: 800, orientation: 'portrait' },
    { maxWidth: 500, width: 536, height: 910, orientation: 'portrait' },
    { maxWidth: 374, width: 410, height: 820, orientation: 'portrait' },
    { maxWidth: 1500, width: 950, height: 1155 },
    { maxWidth: 1800, width: 1200, height: 1540 },
    { maxWidth: Infinity, width: 1360, height: 1540, isWrapperFill: false },
  ],
  /** Char — дефолт 225×322px, стани stay | jumping. Розміри змінюються тільки через sizeBreakpoints. */
  char: {
    defaultState: 'stay',
    width: 225,
    height: 322,
    /** viewportWidth <= maxWidth. Зміни розміру тільки через sizeBreakpoints. */
    sizeBreakpoints: [
      { maxWidth: 1500, width: 225, height: 322, orientation: 'portrait' },
      { maxWidth: 1500, width: 169, height: 242, orientation: 'landscape' },
      { maxWidth: 950, width: 140, height: 201, orientation: 'portrait' },
      { maxWidth: 670, width: 100, height: 143, orientation: 'portrait' },
      { maxWidth: Infinity, width: 225, height: 322 },
    ],
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
      { maxWidth: 374, offsetX: 20 },
      { maxWidth: 500, offsetX: 50 },
      { maxWidth: 1750, offsetX: 70 },
      { maxWidth: Infinity, offsetX: 100 },
    ],
  },
  /** Coins — 134×172px, стани static | fade-out. В ряд відносно char. static — static.png з папки. */
  coins: {
    defaultState: 'static',
    width: 134,
    height: 172,
    /** Усі параметри коінів за діапазоном: width, height, offsetRight, gapBetween, itemGaps. orientation опційно. */
    breakpoints: [
      { 
        maxWidth: 1500, 
        width: 101, 
        height: 129, 
        orientation: 'landscape', 
        offsetRight: 0, 
        gapBetween: 35, 
        itemGaps: { 2: { gapBetweenLeft: 40 } } 
      },

      { 
        maxWidth: 1300, 
        width: 134, 
        height: 172,
         orientation: 'portrait', 
         offsetRight: 50, 
         gapBetween: 55, 
         itemGaps: { 2: { gapBetweenLeft: 70 } } 
      },
      { 
        maxWidth: 1150, 
        width: 134, 
        height: 172,
        orientation: 'portrait', 
        offsetRight: 10, 
        gapBetween: 30, 
        itemGaps: { 2: { gapBetweenLeft: 20 } } 
      },
      { 
        maxWidth: 950, 
        width: 80, 
        height: 100,
        orientation: 'portrait', 
        offsetRight: 40, 
        gapBetween: 60, 
        itemGaps: { 2: { gapBetweenLeft: 50 } } 
      },

      { 
        maxWidth: 850, 
        width: 80, 
        height: 100,
        orientation: 'portrait', 
        offsetRight: 10, 
        gapBetween: 40, 
        itemGaps: { 2: { gapBetweenLeft: 50 } } 
      },

      { 
        maxWidth: 670, 
        width: 70, 
        height: 85,
        orientation: 'portrait', 
        offsetRight: -10, 
        gapBetween: 30, 
        itemGaps: { 2: { gapBetweenLeft: 24 } } 
      },
      { 
        maxWidth: 500, 
        width: 54, 
        height: 69,
        orientation: 'portrait', 
        offsetRight: -10, 
        gapBetween: 20, 
        itemGaps: { 2: { gapBetweenLeft: 24 } } 
      },
      { 
        maxWidth: 374, 
        width: 40, 
        height: 50,
        orientation: 'portrait', 
        offsetRight: -15, 
        gapBetween: 20, 
        itemGaps: { 2: { gapBetweenLeft: 20 } } 
      },

      { maxWidth: 1800, offsetRight: 20, gapBetween: 30, itemGaps: { 2: { gapBetweenLeft: 40 } } },
      { maxWidth: Infinity, offsetRight: 30, gapBetween: 70, itemGaps: { 2: { gapBetweenLeft: 60 } } },
    ],
    imagePath: './img/canvas/coin',
    staticFrame: './img/canvas/coin/static.png',
    frames: [
      './img/canvas/coin/frame-1.png',
      './img/canvas/coin/frame-2.png',
    ],
    /** Затримка між кадрами fade-out (ms) */
    fadeFrameDelay: 120,
    /** items: { id } + опційно gapBetweenLeft (відступ зліва), gapBetweenRight (відступ справа) — fallback якщо нема в itemGaps */
    items: [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }],
  },
  /** Barrier — 171×112px, прив'язка до coin[i]. Стани hide | fade-in | static. */
  barrier: {
    defaultState: 'hide',
    width: 171,
    height: 112,
    breakpoints: [
      { maxWidth: 1500, width: 128, height: 84, offsetAbove: 8 },
      { maxWidth: 950, width: 112, height: 74, offsetAbove: 8 },
      { maxWidth: 670, width: 96, height: 64, offsetAbove: 8 },
      { maxWidth: 500, width: 80, height: 56, offsetAbove: 8 },
      { maxWidth: 374, width: 64, height: 48, offsetAbove: 8 },
      { maxWidth: Infinity },
    ],
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
    breakpoints: [
      { maxWidth: 1500, sizeScale: 0.75, offsetAboveCanvas: 15, stopBeforeBarrier: 15 },
      { maxWidth: 950, sizeScale: 0.65, offsetAboveCanvas: 15, stopBeforeBarrier: 0 },
      { maxWidth: 670, sizeScale: 0.55, offsetAboveCanvas: 15, stopBeforeBarrier: 0 },
      { maxWidth: 500, sizeScale: 0.45, offsetAboveCanvas: 15, stopBeforeBarrier: 0 },
      { maxWidth: 374, sizeScale: 0.35, offsetAboveCanvas: 15, stopBeforeBarrier: 0 },
      { maxWidth: Infinity, sizeScale: 1 },
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
    popupOpenDelayAfterLastJump: 800,
  },
  /** Override for testing: pass custom breakpoints/root to force a specific background. */
  override: null,
};

export const textAnimationConfig = {
  wrapOrder: ['.land__text-item._first', '.land__text-item._second', '.land__text-item._third'],
  beforeShowBottomDelay: 500,
  showDuration: 200,
};
