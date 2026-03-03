function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

/**
 * Chicken canvas — бізнес-логіка.
 * Умови: front/canvas-flow.md
 */

function getCanvasDimensionsFromBreakpoints(sizeBreakpoints) {
  var sorted = _toConsumableArray(sizeBreakpoints || []).sort(function (a, b) {
    var _a$maxWidth, _b$maxWidth;
    return ((_a$maxWidth = a.maxWidth) !== null && _a$maxWidth !== void 0 ? _a$maxWidth : Infinity) - ((_b$maxWidth = b.maxWidth) !== null && _b$maxWidth !== void 0 ? _b$maxWidth : Infinity);
  });
  var viewportWidth = window.innerWidth;
  for (var i = 0; i < sorted.length; i++) {
    var _bp$maxWidth;
    var bp = sorted[i];
    if (viewportWidth <= ((_bp$maxWidth = bp.maxWidth) !== null && _bp$maxWidth !== void 0 ? _bp$maxWidth : Infinity)) {
      return {
        width: bp.width,
        height: bp.height
      };
    }
  }
  var last = sorted[sorted.length - 1];
  return last ? {
    width: last.width,
    height: last.height
  } : {
    width: 536,
    height: 455
  };
}
function getBackgroundBreakpointForWidth(bgBreakpoints, canvasWidth) {
  var switchThreshold = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 50;
  for (var i = 0; i < bgBreakpoints.length; i++) {
    var bp = bgBreakpoints[i];
    if (canvasWidth >= bp.rootWidth + switchThreshold) {
      return bp;
    }
  }
  return bgBreakpoints[bgBreakpoints.length - 1];
}
function loadImage(src) {
  return new Promise(function (resolve, reject) {
    var img = new Image();
    img.onload = function () {
      return resolve(img);
    };
    img.onerror = function () {
      return reject(new Error('Failed to load: ' + src));
    };
    try {
      img.src = new URL(src, window.location.href).href;
    } catch (e) {
      img.src = src;
    }
  });
}
function drawBackground(ctx, img, rootWidth, rootHeight, canvasWidth, canvasHeight) {
  var scale = Math.max(canvasWidth / rootWidth, canvasHeight / rootHeight);
  var drawWidth = rootWidth * scale;
  var drawHeight = rootHeight * scale;
  var x = (canvasWidth - drawWidth) / 2;
  var y = (canvasHeight - drawHeight) / 2;
  ctx.drawImage(img, x, y, drawWidth, drawHeight);
}
function sortBackgroundBreakpoints(breakpoints) {
  return _toConsumableArray(breakpoints).sort(function (a, b) {
    return b.rootWidth - a.rootWidth;
  });
}

/**
 * Позиція char відносно land__canvas. Breakpoints sorted by maxWidth ascending;
 * first where viewportWidth <= maxWidth applies. default: offsetX 50, centerY true.
 * По вертикалі — центр land__canvas (wrapperHeight).
 */
function getCharPositionForViewport(charConfig, canvasWidth, canvasHeight, wrapperEl) {
  var _charConfig$height, _wrapperEl$offsetHeig, _sorted$find, _bp$offsetX, _bp$offsetY;
  var charHeight = (_charConfig$height = charConfig.height) !== null && _charConfig$height !== void 0 ? _charConfig$height : 228;
  var breakpoints = charConfig.breakpoints;
  var wrapperHeight = (_wrapperEl$offsetHeig = wrapperEl === null || wrapperEl === void 0 ? void 0 : wrapperEl.offsetHeight) !== null && _wrapperEl$offsetHeig !== void 0 ? _wrapperEl$offsetHeig : canvasHeight;
  if (!(breakpoints !== null && breakpoints !== void 0 && breakpoints.length)) {
    var _y = Math.max(0, Math.min((wrapperHeight - charHeight) / 2, canvasHeight - charHeight));
    return {
      x: 50,
      y: _y
    };
  }
  var sorted = _toConsumableArray(breakpoints).sort(function (a, b) {
    var _a$maxWidth2, _b$maxWidth2;
    return ((_a$maxWidth2 = a.maxWidth) !== null && _a$maxWidth2 !== void 0 ? _a$maxWidth2 : Infinity) - ((_b$maxWidth2 = b.maxWidth) !== null && _b$maxWidth2 !== void 0 ? _b$maxWidth2 : Infinity);
  });
  var viewportWidth = window.innerWidth;
  var bp = (_sorted$find = sorted.find(function (p) {
    var _p$maxWidth;
    return viewportWidth <= ((_p$maxWidth = p.maxWidth) !== null && _p$maxWidth !== void 0 ? _p$maxWidth : Infinity);
  })) !== null && _sorted$find !== void 0 ? _sorted$find : sorted[sorted.length - 1];
  var offsetX = (_bp$offsetX = bp.offsetX) !== null && _bp$offsetX !== void 0 ? _bp$offsetX : 50;
  var centerY = bp.centerY !== false;
  var x = offsetX;
  var y = centerY ? Math.max(0, Math.min((wrapperHeight - charHeight) / 2, canvasHeight - charHeight)) : canvasHeight - charHeight - ((_bp$offsetY = bp.offsetY) !== null && _bp$offsetY !== void 0 ? _bp$offsetY : 0);
  return {
    x: x,
    y: y
  };
}
function drawChar(ctx, charImg, charConfig, canvasWidth, canvasHeight, wrapperEl) {
  var _getCharPositionForVi = getCharPositionForViewport(charConfig, canvasWidth, canvasHeight, wrapperEl),
    x = _getCharPositionForVi.x,
    y = _getCharPositionForVi.y;
  ctx.drawImage(charImg, x, y, charConfig.width, charConfig.height);
}
function createChickenCanvasController(config, elements) {
  var _charConfig$frames2;
  var wrapperEl = elements.wrapperEl,
    canvasEl = elements.canvasEl;
  var backgroundBreakpoints = config.backgroundBreakpoints,
    _config$switchThresho = config.switchThreshold,
    switchThreshold = _config$switchThresho === void 0 ? 50 : _config$switchThresho,
    canvasBreakpoints = config.canvasBreakpoints,
    charConfig = config.char;
  var bgBreakpoints = sortBackgroundBreakpoints(backgroundBreakpoints);
  var bgImage = null;
  var currentBgSrc = null;
  var charState = 'stay';
  var charFrameImages = [];
  var charFrameIndex = 0;
  var animationFrameId = null;
  var lastCanvasWidth = 0;
  var lastCanvasHeight = 0;
  var lastBp = null;
  function loadCharFrames() {
    var _charConfig$frames;
    if (!(charConfig !== null && charConfig !== void 0 && (_charConfig$frames = charConfig.frames) !== null && _charConfig$frames !== void 0 && _charConfig$frames.length)) return Promise.resolve();
    return Promise.all(charConfig.frames.map(function (src) {
      return loadImage(src).catch(function () {
        return null;
      });
    })).then(function (imgs) {
      charFrameImages = imgs.filter(Boolean);
    });
  }
  function drawFullFrame() {
    var ctx = canvasEl.getContext('2d');
    if (!ctx || !bgImage || lastCanvasWidth <= 0 || lastCanvasHeight <= 0) return;
    drawBackground(ctx, bgImage, lastBp.rootWidth, lastBp.rootHeight, lastCanvasWidth, lastCanvasHeight);
    if (charFrameImages.length > 0 && charConfig) {
      var frameIdx = charState === 'stay' ? 0 : charFrameIndex % charFrameImages.length;
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
    var _getCanvasDimensionsF = getCanvasDimensionsFromBreakpoints(canvasBreakpoints),
      width = _getCanvasDimensionsF.width,
      height = _getCanvasDimensionsF.height;
    if (width <= 0 || height <= 0) return;
    var bp = getBackgroundBreakpointForWidth(bgBreakpoints, width, switchThreshold);
    canvasEl.width = width;
    canvasEl.height = height;
    lastCanvasWidth = width;
    lastCanvasHeight = height;
    lastBp = bp;
    if (bp.src !== currentBgSrc) {
      loadImage(bp.src).then(function (img) {
        bgImage = img;
        currentBgSrc = bp.src;
        if (charConfig && charFrameImages.length === 0) {
          loadCharFrames().then(function () {
            drawFullFrame();
            if (charState === 'jumping') jumpingLoop();
          });
        } else {
          drawFullFrame();
          if (charState === 'jumping') jumpingLoop();
        }
      }).catch(function () {});
    } else if (bgImage) {
      drawFullFrame();
      if (charState === 'jumping') jumpingLoop();
    } else if (charConfig && charFrameImages.length === 0) {
      loadCharFrames().then(function () {
        return drawFullFrame();
      });
    }
  }
  function handleInitClick() {
    wrapperEl.classList.add('_canvas-active');
    recalcAndRestart();
  }
  if (charConfig !== null && charConfig !== void 0 && (_charConfig$frames2 = charConfig.frames) !== null && _charConfig$frames2 !== void 0 && _charConfig$frames2.length) {
    loadCharFrames();
  }
  return {
    recalcAndRestart: recalcAndRestart,
    handleInitClick: handleInitClick,
    setCharState: setCharState
  };
}

function initChickenCanvas(config) {
  if (!config) return null;
  var effectiveConfig = config;
  var selectors = effectiveConfig.selectors;
  var wrapperEl = document.querySelector(selectors.wrapper);
  var landLeftEl = document.querySelector(selectors.landLeft);
  var canvasEl = document.querySelector(selectors.canvas);
  var initBtnEl = document.querySelector(selectors.initBtn);
  if (!wrapperEl || !landLeftEl || !canvasEl) return null;
  var controller = createChickenCanvasController(effectiveConfig, {
    wrapperEl: wrapperEl,
    canvasEl: canvasEl});
  if (initBtnEl) {
    initBtnEl.addEventListener('click', controller.handleInitClick);
  }
  controller.recalcAndRestart();
  return {
    recalcAndRestart: controller.recalcAndRestart,
    setCharState: controller.setCharState
  };
}

/**
 * Конфіги анімацій.
 */

var chickenCanvasConfig = {
  selectors: {
    wrapper: '.land__canvas',
    landLeft: '.land__left',
    canvas: '[data-canvas="chicken"]',
    initBtn: '[data-canvas-init="chicken"]'
  },
  /** Root sizes sorted by width descending. Switch when canvasWidth >= rootWidth + switchThreshold. */
  backgroundBreakpoints: [{
    rootWidth: 1470,
    rootHeight: 1220,
    src: './img/canvas/bg.jpg'
  }, {
    rootWidth: 1046,
    rootHeight: 666,
    src: './img/canvas/bg-desc-small.jpg'
  }, {
    rootWidth: 868,
    rootHeight: 736,
    src: './img/canvas/bg-tab.jpg'
  }, {
    rootWidth: 536,
    rootHeight: 455,
    src: './img/canvas/bg-mob.jpg'
  }],
  switchThreshold: 50,
  /** Canvas size by breakpoint. Sorted by maxWidth ascending; first where viewportWidth <= maxWidth applies. */
  canvasBreakpoints: [{
    maxWidth: 600,
    width: 536,
    height: 455
  }, {
    maxWidth: 950,
    width: 868,
    height: 736
  }, {
    maxWidth: 1368,
    width: 1046,
    height: 666
  }, {
    maxWidth: Infinity,
    width: 1370,
    height: 1120
  }],
  /** Char — розміри 160×228px, стани stay | jumping. Позиції по брейкпоінтах. */
  char: {
    width: 160,
    height: 228,
    frames: ['./img/canvas/char/frame-1.png', './img/canvas/char/frame-2.png', './img/canvas/char/frame-3.png', './img/canvas/char/frame-4.png', './img/canvas/char/frame-5.png', './img/canvas/char/frame-6.png', './img/canvas/char/frame-7.png', './img/canvas/char/frame-8.png', './img/canvas/char/frame-9.png', './img/canvas/char/frame-10.png'],
    /** viewportWidth <= maxWidth. default: offsetX 50, centerY true */
    breakpoints: [{
      maxWidth: 600,
      offsetX: 30
    }, {
      maxWidth: 950,
      offsetX: 50
    }, {
      maxWidth: Infinity,
      offsetX: 50
    }]
  }};

/**
 * Утиліти та бізнес-логіка сторінки.
 */

function setPopupAnimationToggler() {
  var popupBtn = document.querySelector('.land__btn[data-popup="popup"]');
  if (popupBtn) popupBtn.style.pointerEvents = 'initial';
  var animLayerEl = document.querySelector('.land__anim-layer');
  if (animLayerEl) animLayerEl.classList.add('_fade-in-btn');
}
function getFadeInPageConfig() {
  var yourEl = document.querySelector('.land__title-your');
  var airplaneBtnEl = document.querySelector('.land__anim-layer');
  var firstEl = document.querySelector('.land__title-animated-item._first');
  var secondEl = document.querySelector('.land__title-animated-item._second');
  var thirdEl = document.querySelector('.land__title-animated-item._third');
  var fadeInClass = '_fade-in';
  var fadeOutClass = '_fade-out';
  var animationName = 'toggleAnimation';
  var steps = [{
    animation: animationName,
    el: yourEl,
    addClass: fadeInClass,
    removeClass: fadeOutClass,
    delay: 200
  }, {
    animation: animationName,
    el: firstEl,
    addClass: fadeInClass,
    removeClass: fadeOutClass,
    delay: 200
  }, {
    animation: animationName,
    el: airplaneBtnEl,
    addClass: fadeInClass,
    removeClass: fadeOutClass,
    delay: 200
  }, {
    animation: animationName,
    el: firstEl,
    addClass: fadeOutClass,
    removeClass: fadeInClass,
    delay: 1000
  }, {
    animation: animationName,
    el: secondEl,
    addClass: fadeInClass,
    removeClass: fadeOutClass,
    delay: 1000
  }, {
    animation: animationName,
    el: secondEl,
    addClass: fadeOutClass,
    removeClass: fadeInClass,
    delay: 1000
  }, {
    animation: animationName,
    el: thirdEl,
    addClass: fadeInClass,
    removeClass: fadeOutClass,
    delay: 1000,
    callback: setPopupAnimationToggler
  }];
  return {
    beforeStartDelay: 500,
    steps: steps,
    delays: steps.map(function (s) {
      return s.delay;
    })
  };
}

// ——— Init & entry point —————————————————————————————————————————————————————
getFadeInPageConfig();
function initPage() {
  var chickenCanvas = initChickenCanvas(chickenCanvasConfig);
  if (chickenCanvas && typeof chickenCanvas.recalcAndRestart === 'function') {
    window.addEventListener('resize', chickenCanvas.recalcAndRestart);
    window.addEventListener('orientationchange', chickenCanvas.recalcAndRestart);
  }
  document.querySelector('.land__btn[data-popup="popup"]');
  // if (popupBtn) popupBtn.style.pointerEvents = 'none';
  // initAnimationChaining(fadeInPageConfig);

  // const landEl = document.querySelector('.land');
  // if (landEl) {
  //   landEl.addEventListener('click', function (e) {
  //     const btn = e.target.closest('.land__btn');
  //     if (!btn) return;
  //     const popupId = btn.dataset.popup;
  //     if (!popupId) return;

  //     if (popupId === 'popup') {
  //       const fadeOutPopupConfig = getFadeOutPopupConfig(btn);
  //       if (getIsPagePopupAnimation()) {
  //         initAnimationChaining(fadeOutPopupConfig);
  //       }
  //       return;
  //     }

  //     const container = document.querySelector('[data-popup-container="' + popupId + '"]');
  //     if (container) {
  //       const animLayer = btn.parentElement;
  //     }
  //   });

  //   // const popupEl = document.querySelector('.popup');
  //   // if (popupEl) {
  //   //   popupEl.addEventListener('click', function (e) {
  //   //     if (e.target === popupEl) {
  //   //       initAnimationChaining(getPopupCloseConfig());
  //   //     }
  //   //   });
  //   // }

  //   document.querySelectorAll('.land__btn[data-popup]').forEach(function (btn) {
  //     const animLayer = btn.parentElement;
  //     btn.addEventListener('mouseenter', function () {
  //       if (animLayer) animLayer.classList.add('_btn-popup-init');
  //     });
  //     btn.addEventListener('mouseleave', function () {
  //       if (animLayer) animLayer.classList.remove('_btn-popup-init');
  //     });
  //   });
  // }

  // if (debug) {
  //   const landEl = document.querySelector('.land');
  //   initTest(landEl, getFadeOutPopupConfig, getPopupCloseConfig, getPopupOpenChunkConfig);
  // }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}

// (function () {
//   // Отримуємо поточний URL сторінки
//   var url = new URL(window.location.href);

//   // Список параметрів для трекінгу, які потрібно зберігати та передавати
//   var params = ['l', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'param1', 'param2', 'param3', 'param4', 'creative_type', 'creative_id'];

//   // Параметри для формування шляху (affid, cpaid)
//   var linkParams = ['affid', 'cpaid'];

//   // Перевіряємо, чи є в URL параметр redirectUrl
//   // Якщо є, зберігаємо його значення для використання при кліку на кнопки
//   if (url.searchParams.has('redirectUrl')) {
//       try {
//           var redirectUrl = new URL(url.searchParams.get('redirectUrl'));
//           // Зберігаємо redirectUrl в localStorage для подальшого використання
//           // Це дозволяє використовувати redirectUrl замість стандартного посилання кнопки
//           localStorage.setItem('redirectUrl', redirectUrl.href);
//       } catch (e) {
//           console.error('Invalid redirectUrl:', e);
//       }
//   }

//   // Зберігаємо параметри трекінгу з URL в localStorage
//   // Ці параметри будуть додані до фінального URL при редиректі
//   params.forEach(function (param) {
//       if (url.searchParams.has(param)) localStorage.setItem(param, url.searchParams.get(param));
//   });

//   // Зберігаємо параметри для формування шляху (affid, cpaid)
//   linkParams.forEach(function (linkParam) {
//       if (url.searchParams.has(linkParam)) localStorage.setItem(linkParam, url.searchParams.get(linkParam));
//   });

//   // Обробник кліків на посилання
//   window.addEventListener('click', function (e) {
//       var link,
//           parent = e.target.closest('a');

//       // Якщо клік не по посиланню, виходимо
//       if (!parent) return;

//       // Обробляємо тільки посилання з href="https://tinyurl.com/3utxmdjt"
//       if (parent.getAttribute('href') !== 'https://tinyurl.com/3utxmdjt') {
//           return;
//       }

//       // Запобігаємо стандартній поведінці посилання
//       e.preventDefault();

//       // Отримуємо збережені значення affid та cpaid
//       var affid = localStorage.getItem('affid');
//       var cpaid = localStorage.getItem('cpaid');

//       // Якщо в localStorage є redirectUrl, використовуємо його
//       // Інакше використовуємо стандартне посилання з href кнопки
//       if (localStorage.getItem("redirectUrl")) {
//           // Використовуємо збережений redirectUrl для редиректу
//           link = new URL(localStorage.getItem("redirectUrl"));
//       } else {
//           // Використовуємо стандартне посилання кнопки
//           link = new URL(parent.href);
//           // Якщо є affid та cpaid, формуємо шлях /affid/cpaid
//           if (affid && cpaid) {
//               link.pathname = '/' + affid + '/' + cpaid;
//           }
//       }

//       // Додаємо параметри трекінгу з localStorage до фінального URL
//       params.forEach(function (param) {
//           var value = localStorage.getItem(param);
//           if (value) {
//               link.searchParams.set(param, value);
//           }
//       });

//       // Виконуємо редирект на сформований URL
//       document.location.href = link.href;
//   });
// })();
