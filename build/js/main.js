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
function createChickenCanvasController(config, elements) {
  var wrapperEl = elements.wrapperEl,
    canvasEl = elements.canvasEl;
  var backgroundBreakpoints = config.backgroundBreakpoints,
    _config$switchThresho = config.switchThreshold,
    switchThreshold = _config$switchThresho === void 0 ? 50 : _config$switchThresho,
    canvasBreakpoints = config.canvasBreakpoints;
  var bgBreakpoints = sortBackgroundBreakpoints(backgroundBreakpoints);
  var bgImage = null;
  var currentBgSrc = null;
  function recalcAndRestart() {
    var _getCanvasDimensionsF = getCanvasDimensionsFromBreakpoints(canvasBreakpoints),
      width = _getCanvasDimensionsF.width,
      height = _getCanvasDimensionsF.height;
    if (width <= 0 || height <= 0) return;
    var bp = getBackgroundBreakpointForWidth(bgBreakpoints, width, switchThreshold);
    canvasEl.width = width;
    canvasEl.height = height;
    wrapperEl.style.width = width + 'px';
    wrapperEl.style.height = height + 'px';
    if (bp.src !== currentBgSrc) {
      loadImage(bp.src).then(function (img) {
        bgImage = img;
        currentBgSrc = bp.src;
        var ctx = canvasEl.getContext('2d');
        if (ctx) {
          var w = canvasEl.width;
          var h = canvasEl.height;
          if (w > 0 && h > 0) {
            drawBackground(ctx, img, bp.rootWidth, bp.rootHeight, w, h);
          }
        }
      }).catch(function () {});
    } else if (bgImage) {
      var ctx = canvasEl.getContext('2d');
      if (ctx) {
        drawBackground(ctx, bgImage, bp.rootWidth, bp.rootHeight, width, height);
      }
    }
  }
  function handleInitClick() {
    wrapperEl.classList.add('_canvas-active');
    recalcAndRestart();
  }
  return {
    recalcAndRestart: recalcAndRestart,
    handleInitClick: handleInitClick
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
    recalcAndRestart: controller.recalcAndRestart
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
    width: 1470,
    height: 1220
  }]};

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
