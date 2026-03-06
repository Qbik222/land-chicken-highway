function toggleAnimation(el, addClass, removeClass) {
  if (!el) return;
  if (removeClass && el.classList.contains(removeClass)) {
    el.classList.remove(removeClass);
  }
  if (addClass) {
    el.classList.add(addClass);
  }
}
function getElementsFromStep(step) {
  if (step.elements && Array.isArray(step.elements)) {
    return step.elements;
  }
  if (step.el) {
    return [step.el];
  }
  return [];
}
function runAnimation(name, step) {
  var elements = getElementsFromStep(step);
  switch (name) {
    case 'toggleAnimation':
      elements.forEach(function (el) {
        toggleAnimation(el, step.addClass, step.removeClass);
      });
      break;
  }
}
function initAnimationChaining(config) {
  if (!config) return;
  var _config$beforeStartDe = config.beforeStartDelay,
    beforeStartDelay = _config$beforeStartDe === void 0 ? 0 : _config$beforeStartDe,
    _config$steps = config.steps,
    steps = _config$steps === void 0 ? [] : _config$steps,
    _config$delays = config.delays,
    delays = _config$delays === void 0 ? [] : _config$delays;
  if (steps.length === 0) return;
  var timeoutId;
  function runStep(index) {
    if (index >= steps.length) return;
    var step = steps[index];
    var name = step.animation;
    runAnimation(name, step);
    if (typeof step.callback === 'function') {
      var args = [step, index];
      if (Array.isArray(step.callbackArgs)) {
        args.push.apply(args, step.callbackArgs);
      }
      step.callback.apply(null, args);
    }
    if (step.stopAnimationChaining) return;
    var delay = delays.length > 0 ? delays[index % delays.length] : undefined;
    if (typeof delay === 'number' && delay > 0 && index + 1 < steps.length) {
      timeoutId = setTimeout(function () {
        runStep(index + 1);
      }, delay);
    } else if (index + 1 < steps.length) {
      runStep(index + 1);
    }
  }
  if (beforeStartDelay > 0) {
    timeoutId = setTimeout(function () {
      runStep(0);
    }, beforeStartDelay);
  } else {
    runStep(0);
  }
  return function cancel() {
    if (timeoutId) clearTimeout(timeoutId);
  };
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys(Object(source), true).forEach(function (key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
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
function _toPrimitive(input, hint) {
  if (typeof input !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== undefined) {
    var res = prim.call(input, hint);
    if (typeof res !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return typeof key === "symbol" ? key : String(key);
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
  var drawWidth = canvasWidth;
  var drawHeight = canvasHeight;
  var x = 0;
  var y = 0;
  ctx.drawImage(img, x, y, drawWidth, drawHeight);
}

/**
 * Chicken canvas — бізнес-логіка.
 * Умови: front/canvas-flow.md
 */

/**
 * Розміри canvas з брейкпоінтів. Якщо bp.isWrapperFill === true — width/height з wrapperEl.
 * Орієнтація застосовується разом із діапазоном maxWidth (CSS-like: (max-width: X) and (orientation: portrait)).
 */
function getCanvasDimensionsFromBreakpoints(sizeBreakpoints, wrapperEl) {
  var _sorted$find;
  var points = sizeBreakpoints || [];
  var sorted = _toConsumableArray(points).sort(function (a, b) {
    var _a$maxWidth, _b$maxWidth;
    return ((_a$maxWidth = a.maxWidth) !== null && _a$maxWidth !== void 0 ? _a$maxWidth : Infinity) - ((_b$maxWidth = b.maxWidth) !== null && _b$maxWidth !== void 0 ? _b$maxWidth : Infinity);
  });
  var viewportWidth = window.innerWidth;
  var orientation = getCurrentOrientation();
  var matches = function matches(bp) {
    var _bp$maxWidth;
    return viewportWidth <= ((_bp$maxWidth = bp.maxWidth) !== null && _bp$maxWidth !== void 0 ? _bp$maxWidth : Infinity) && (!bp.orientation || bp.orientation === orientation);
  };
  var matchesWidthOnly = function matchesWidthOnly(bp) {
    var _bp$maxWidth2;
    return viewportWidth <= ((_bp$maxWidth2 = bp.maxWidth) !== null && _bp$maxWidth2 !== void 0 ? _bp$maxWidth2 : Infinity);
  };
  var bp = (_sorted$find = sorted.find(matches)) !== null && _sorted$find !== void 0 ? _sorted$find : sorted.find(matchesWidthOnly);
  if (bp) {
    if (bp.isWrapperFill && wrapperEl) {
      return {
        width: wrapperEl.offsetWidth || bp.width,
        height: wrapperEl.offsetHeight || bp.height
      };
    }
    return {
      width: bp.width,
      height: bp.height
    };
  }
  var last = sorted[sorted.length - 1];
  if (last !== null && last !== void 0 && last.isWrapperFill && wrapperEl) {
    return {
      width: wrapperEl.offsetWidth || last.width,
      height: wrapperEl.offsetHeight || last.height
    };
  }
  return last ? {
    width: last.width,
    height: last.height
  } : {
    width: 536,
    height: 455
  };
}
function getBackgroundBreakpointForWidth(bgBreakpoints, canvasWidth) {
  var _bgBreakpoints$find;
  var switchThreshold = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 50;
  var orientation = getCurrentOrientation();
  var matches = function matches(bp) {
    return canvasWidth >= bp.rootWidth + switchThreshold && (!bp.orientation || bp.orientation === orientation);
  };
  var matchesWidthOnly = function matchesWidthOnly(bp) {
    return canvasWidth >= bp.rootWidth + switchThreshold;
  };
  console.log(matches);

  // console.log(bgBreakpoints.find(matches), orientation);

  var bp = (_bgBreakpoints$find = bgBreakpoints.find(matches)) !== null && _bgBreakpoints$find !== void 0 ? _bgBreakpoints$find : bgBreakpoints.find(matchesWidthOnly);
  return bp !== null && bp !== void 0 ? bp : bgBreakpoints[bgBreakpoints.length - 1];
}
function sortBackgroundBreakpoints(breakpoints) {
  var _sorted$filter;
  var orientation = getCurrentOrientation();
  // console.log(breakpoints, orientation);
  var sorted = _toConsumableArray(breakpoints).sort(function (a, b) {
    return b.rootWidth - a.rootWidth;
  });
  var filtered = (_sorted$filter = sorted.filter(function (bp) {
    return bp.orientation === orientation;
  })) !== null && _sorted$filter !== void 0 ? _sorted$filter : sorted;
  // console.log(filtered);
  return filtered.length > 0 ? filtered : sorted;
}

/**
 * Поточна орієнтація екрану. Використовується при виборі брейкпоінтів разом із діапазоном (CSS-like).
 * @returns {'portrait'|'landscape'}
 */
function getCurrentOrientation() {
  if (typeof window === 'undefined') return 'landscape';
  if (typeof window.matchMedia === 'function') {
    var mq = window.matchMedia('(orientation: portrait)');
    return mq.matches ? 'portrait' : 'landscape';
  }
  if (window.innerWidth && window.innerHeight) {
    return window.innerWidth < window.innerHeight ? 'portrait' : 'landscape';
  }
  return 'landscape';
}

/**
 * Позиція char відносно land__canvas. Breakpoints sorted by maxWidth ascending;
 * first where viewportWidth <= maxWidth applies. default: offsetX 50, centerY true.
 * По вертикалі — центр land__canvas (wrapperHeight).
 */
function getCharPositionForViewport(charConfig, canvasWidth, canvasHeight, wrapperEl) {
  var _wrapperEl$offsetHeig, _bp$offsetX, _bp$offsetY;
  var _getCharSize = getCharSize(charConfig),
    charHeight = _getCharSize.height;
  var breakpoints = charConfig.breakpoints;
  var wrapperHeight = (_wrapperEl$offsetHeig = wrapperEl === null || wrapperEl === void 0 ? void 0 : wrapperEl.offsetHeight) !== null && _wrapperEl$offsetHeig !== void 0 ? _wrapperEl$offsetHeig : canvasHeight;
  if (!(breakpoints !== null && breakpoints !== void 0 && breakpoints.length)) {
    var _y = Math.max(0, Math.min((wrapperHeight - charHeight) / 2, canvasHeight - charHeight));
    return {
      x: 50,
      y: _y
    };
  }
  var bp = getMatchedBreakpoint(breakpoints);
  var offsetX = (_bp$offsetX = bp === null || bp === void 0 ? void 0 : bp.offsetX) !== null && _bp$offsetX !== void 0 ? _bp$offsetX : 50;
  var centerY = bp.centerY !== false;
  var x = offsetX;
  var y = centerY ? Math.max(0, Math.min((wrapperHeight - charHeight) / 2, canvasHeight - charHeight)) : canvasHeight - charHeight - ((_bp$offsetY = bp.offsetY) !== null && _bp$offsetY !== void 0 ? _bp$offsetY : 0);
  return {
    x: x,
    y: y
  };
}

/**
 * Розмір char. Дефолт 225×322. Зміни тільки через charConfig.sizeBreakpoints.
 */
function getCharSize(charConfig) {
  var _charConfig$sizeBreak, _charConfig$width, _charConfig$height;
  if (!charConfig) return {
    width: 225,
    height: 322
  };
  if ((_charConfig$sizeBreak = charConfig.sizeBreakpoints) !== null && _charConfig$sizeBreak !== void 0 && _charConfig$sizeBreak.length) {
    return {
      width: getValueFromBreakpoints(charConfig.sizeBreakpoints, 'width', 225),
      height: getValueFromBreakpoints(charConfig.sizeBreakpoints, 'height', 322)
    };
  }
  return {
    width: (_charConfig$width = charConfig.width) !== null && _charConfig$width !== void 0 ? _charConfig$width : 225,
    height: (_charConfig$height = charConfig.height) !== null && _charConfig$height !== void 0 ? _charConfig$height : 322
  };
}

/**
 * Отримати значення з breakpoints за viewportWidth. Sorted by maxWidth ascending;
 * first where viewportWidth <= maxWidth.
 */
function getValueFromBreakpoints(breakpoints, key, fallback) {
  var _bp$key;
  if (!(breakpoints !== null && breakpoints !== void 0 && breakpoints.length)) return fallback;
  var bp = getMatchedBreakpoint(breakpoints);
  return (_bp$key = bp === null || bp === void 0 ? void 0 : bp[key]) !== null && _bp$key !== void 0 ? _bp$key : fallback;
}

/**
 * Повертає breakpoint, що відповідає поточному viewportWidth.
 * Підтримує опційний orientation — перевірка разом із діапазоном (CSS-like).
 */
function getMatchedBreakpoint(breakpoints) {
  var _ref, _sorted$find2;
  if (!(breakpoints !== null && breakpoints !== void 0 && breakpoints.length)) return null;
  var sorted = _toConsumableArray(breakpoints).sort(function (a, b) {
    var _a$maxWidth2, _b$maxWidth2;
    return ((_a$maxWidth2 = a.maxWidth) !== null && _a$maxWidth2 !== void 0 ? _a$maxWidth2 : Infinity) - ((_b$maxWidth2 = b.maxWidth) !== null && _b$maxWidth2 !== void 0 ? _b$maxWidth2 : Infinity);
  });
  var viewportWidth = window.innerWidth;
  var orientation = getCurrentOrientation();
  var matches = function matches(p) {
    var _p$maxWidth;
    return viewportWidth <= ((_p$maxWidth = p.maxWidth) !== null && _p$maxWidth !== void 0 ? _p$maxWidth : Infinity) && (!p.orientation || p.orientation === orientation);
  };
  var matchesWidthOnly = function matchesWidthOnly(p) {
    var _p$maxWidth2;
    return viewportWidth <= ((_p$maxWidth2 = p.maxWidth) !== null && _p$maxWidth2 !== void 0 ? _p$maxWidth2 : Infinity);
  };
  return (_ref = (_sorted$find2 = sorted.find(matches)) !== null && _sorted$find2 !== void 0 ? _sorted$find2 : sorted.find(matchesWidthOnly)) !== null && _ref !== void 0 ? _ref : sorted[sorted.length - 1];
}

/**
 * Позиція коіна відносно char. Перший коін — offsetRight px вправо від char, далі в ряд з gapBetween.
 * По вертикалі — центр land__canvas.
 * Кожен item може мати gapBetweenLeft (відступ зліва) або gapBetweenRight (відступ справа) для кастомного інтервалу.
 * Усі параметри (width, height, offsetRight, gapBetween, itemGaps) беруться з єдиного coins.breakpoints.
 */
function getCoinPositionForViewport(coinsConfig, charX, charWidth, index, canvasWidth, canvasHeight, wrapperEl) {
  var _ref2, _coinsBp$width, _ref3, _coinsBp$height, _ref4, _coinsBp$offsetRight, _coinsBp$gapBetween, _coinsConfig$items, _wrapperEl$offsetHeig2;
  var coinsBp = getMatchedBreakpoint(coinsConfig === null || coinsConfig === void 0 ? void 0 : coinsConfig.breakpoints);
  var w = (_ref2 = (_coinsBp$width = coinsBp === null || coinsBp === void 0 ? void 0 : coinsBp.width) !== null && _coinsBp$width !== void 0 ? _coinsBp$width : coinsConfig.width) !== null && _ref2 !== void 0 ? _ref2 : 134;
  var h = (_ref3 = (_coinsBp$height = coinsBp === null || coinsBp === void 0 ? void 0 : coinsBp.height) !== null && _coinsBp$height !== void 0 ? _coinsBp$height : coinsConfig.height) !== null && _ref3 !== void 0 ? _ref3 : 172;
  var offsetRight = (_ref4 = (_coinsBp$offsetRight = coinsBp === null || coinsBp === void 0 ? void 0 : coinsBp.offsetRight) !== null && _coinsBp$offsetRight !== void 0 ? _coinsBp$offsetRight : coinsConfig.offsetRightDefault) !== null && _ref4 !== void 0 ? _ref4 : 50;
  var gapBetween = (_coinsBp$gapBetween = coinsBp === null || coinsBp === void 0 ? void 0 : coinsBp.gapBetween) !== null && _coinsBp$gapBetween !== void 0 ? _coinsBp$gapBetween : 70;
  var items = (_coinsConfig$items = coinsConfig === null || coinsConfig === void 0 ? void 0 : coinsConfig.items) !== null && _coinsConfig$items !== void 0 ? _coinsConfig$items : [];
  var wrapperHeight = (_wrapperEl$offsetHeig2 = wrapperEl === null || wrapperEl === void 0 ? void 0 : wrapperEl.offsetHeight) !== null && _wrapperEl$offsetHeig2 !== void 0 ? _wrapperEl$offsetHeig2 : canvasHeight;
  var y = Math.max(0, Math.min((wrapperHeight - h) / 2, canvasHeight - h));
  var leftEdge = charX + (charWidth !== null && charWidth !== void 0 ? charWidth : 225);
  for (var i = 0; i <= index; i++) {
    var _coinsBp$itemGaps, _coinsBp$itemGaps2, _ref5, _itemGap$gapBetweenLe, _items$i, _ref6, _ref7, _ref8, _itemGap$gapBetweenLe2, _items$i2, _items;
    var itemGap = coinsBp === null || coinsBp === void 0 ? void 0 : (_coinsBp$itemGaps = coinsBp.itemGaps) === null || _coinsBp$itemGaps === void 0 ? void 0 : _coinsBp$itemGaps[i];
    var prevItemGap = i > 0 ? coinsBp === null || coinsBp === void 0 ? void 0 : (_coinsBp$itemGaps2 = coinsBp.itemGaps) === null || _coinsBp$itemGaps2 === void 0 ? void 0 : _coinsBp$itemGaps2[i - 1] : null;
    var gap = i === 0 ? (_ref5 = (_itemGap$gapBetweenLe = itemGap === null || itemGap === void 0 ? void 0 : itemGap.gapBetweenLeft) !== null && _itemGap$gapBetweenLe !== void 0 ? _itemGap$gapBetweenLe : (_items$i = items[i]) === null || _items$i === void 0 ? void 0 : _items$i.gapBetweenLeft) !== null && _ref5 !== void 0 ? _ref5 : offsetRight : (_ref6 = (_ref7 = (_ref8 = (_itemGap$gapBetweenLe2 = itemGap === null || itemGap === void 0 ? void 0 : itemGap.gapBetweenLeft) !== null && _itemGap$gapBetweenLe2 !== void 0 ? _itemGap$gapBetweenLe2 : (_items$i2 = items[i]) === null || _items$i2 === void 0 ? void 0 : _items$i2.gapBetweenLeft) !== null && _ref8 !== void 0 ? _ref8 : prevItemGap === null || prevItemGap === void 0 ? void 0 : prevItemGap.gapBetweenRight) !== null && _ref7 !== void 0 ? _ref7 : (_items = items[i - 1]) === null || _items === void 0 ? void 0 : _items.gapBetweenRight) !== null && _ref6 !== void 0 ? _ref6 : gapBetween;
    if (i === index) {
      return {
        x: leftEdge + gap,
        y: y
      };
    }
    leftEdge += gap + w;
  }
  return {
    x: leftEdge,
    y: y
  };
}
function loadCoinFrames(coinsConfig) {
  var _coinsConfig$frames;
  if (!(coinsConfig !== null && coinsConfig !== void 0 && (_coinsConfig$frames = coinsConfig.frames) !== null && _coinsConfig$frames !== void 0 && _coinsConfig$frames.length)) return Promise.resolve([]);
  return Promise.all(coinsConfig.frames.map(function (src) {
    return loadImage(src).catch(function () {
      return null;
    });
  })).then(function (imgs) {
    return imgs.filter(Boolean);
  });
}

/**
 * Позиція barrier над coin. barrier[i] центрується над coin[i].
 */
function getBarrierPositionForViewport(barrierConfig, coinX, coinY, coinWidth) {
  var _ref9, _bp$width, _ref10, _bp$height, _ref11, _bp$offsetAbove, _barrierConfig$offset;
  var bp = getMatchedBreakpoint(barrierConfig === null || barrierConfig === void 0 ? void 0 : barrierConfig.breakpoints);
  var barrierWidth = (_ref9 = (_bp$width = bp === null || bp === void 0 ? void 0 : bp.width) !== null && _bp$width !== void 0 ? _bp$width : barrierConfig.width) !== null && _ref9 !== void 0 ? _ref9 : 171;
  var barrierHeight = (_ref10 = (_bp$height = bp === null || bp === void 0 ? void 0 : bp.height) !== null && _bp$height !== void 0 ? _bp$height : barrierConfig.height) !== null && _ref10 !== void 0 ? _ref10 : 112;
  var offsetAbove = (_ref11 = (_bp$offsetAbove = bp === null || bp === void 0 ? void 0 : bp.offsetAbove) !== null && _bp$offsetAbove !== void 0 ? _bp$offsetAbove : getValueFromBreakpoints(barrierConfig.offsetAboveBreakpoints, 'offsetAbove', null)) !== null && _ref11 !== void 0 ? _ref11 : (_barrierConfig$offset = barrierConfig.offsetAboveDefault) !== null && _barrierConfig$offset !== void 0 ? _barrierConfig$offset : 10;
  var x = coinX + (coinWidth - barrierWidth) / 2;
  var y = coinY - barrierHeight - offsetAbove;
  return {
    x: x,
    y: y
  };
}
function loadBarrierFrames(barrierConfig) {
  var _barrierConfig$frames;
  if (!(barrierConfig !== null && barrierConfig !== void 0 && (_barrierConfig$frames = barrierConfig.frames) !== null && _barrierConfig$frames !== void 0 && _barrierConfig$frames.length)) return Promise.resolve([]);
  return Promise.all(barrierConfig.frames.map(function (src) {
    return loadImage(src).catch(function () {
      return null;
    });
  })).then(function (imgs) {
    return imgs.filter(Boolean);
  });
}

/** Дозволені комбінації fade-in при jumping: 2–3 машини, max 2 підряд. */
function getValidFadeInCombos() {
  return [[0, 1], [1, 2], [2, 3], [0, 2], [0, 3], [1, 3], [0, 1, 3], [0, 2, 3]];
}
function loadCarVariants(carsConfig) {
  var _carsConfig$variants;
  if (!(carsConfig !== null && carsConfig !== void 0 && (_carsConfig$variants = carsConfig.variants) !== null && _carsConfig$variants !== void 0 && _carsConfig$variants.length)) return Promise.resolve([]);
  console.log(carsConfig.variants);
  return Promise.all(carsConfig.variants.map(function (v) {
    return loadImage(v.src).then(function (img) {
      var _v$width, _v$height;
      return {
        img: img,
        width: (_v$width = v.width) !== null && _v$width !== void 0 ? _v$width : 168,
        height: (_v$height = v.height) !== null && _v$height !== void 0 ? _v$height : 342
      };
    }).catch(function () {
      return null;
    });
  })).then(function (arr) {
    return arr.filter(Boolean);
  });
}
function pickRandomCarVariant(loadedVariants) {
  if (!(loadedVariants !== null && loadedVariants !== void 0 && loadedVariants.length)) return null;
  return loadedVariants[Math.floor(Math.random() * loadedVariants.length)];
}
function drawBarrier(ctx, img, barrierConfig, x, y) {
  var _ref12, _bp$width2, _ref13, _bp$height2;
  var bp = getMatchedBreakpoint(barrierConfig === null || barrierConfig === void 0 ? void 0 : barrierConfig.breakpoints);
  var width = (_ref12 = (_bp$width2 = bp === null || bp === void 0 ? void 0 : bp.width) !== null && _bp$width2 !== void 0 ? _bp$width2 : barrierConfig.width) !== null && _ref12 !== void 0 ? _ref12 : 171;
  var height = (_ref13 = (_bp$height2 = bp === null || bp === void 0 ? void 0 : bp.height) !== null && _bp$height2 !== void 0 ? _bp$height2 : barrierConfig.height) !== null && _ref13 !== void 0 ? _ref13 : 112;
  ctx.drawImage(img, x, y, width, height);
}
function drawCoin(ctx, img, coinsConfig, x, y) {
  var _ref14, _coinsBp$width2, _ref15, _coinsBp$height2;
  var coinsBp = getMatchedBreakpoint(coinsConfig === null || coinsConfig === void 0 ? void 0 : coinsConfig.breakpoints);
  var width = (_ref14 = (_coinsBp$width2 = coinsBp === null || coinsBp === void 0 ? void 0 : coinsBp.width) !== null && _coinsBp$width2 !== void 0 ? _coinsBp$width2 : coinsConfig.width) !== null && _ref14 !== void 0 ? _ref14 : 134;
  var height = (_ref15 = (_coinsBp$height2 = coinsBp === null || coinsBp === void 0 ? void 0 : coinsBp.height) !== null && _coinsBp$height2 !== void 0 ? _coinsBp$height2 : coinsConfig.height) !== null && _ref15 !== void 0 ? _ref15 : 172;
  ctx.drawImage(img, x, y, width, height);
}
function drawCar(ctx, carImg, x, y, width, height) {
  if (carImg) ctx.drawImage(carImg, x, y, width, height);
}
function getCarsBreakpoint(carsConfig) {
  return getMatchedBreakpoint(carsConfig === null || carsConfig === void 0 ? void 0 : carsConfig.breakpoints);
}
function getCarsConfigValue(carsConfig, key, fallback) {
  var _ref16, _bp$key2;
  var bp = getCarsBreakpoint(carsConfig);
  return (_ref16 = (_bp$key2 = bp === null || bp === void 0 ? void 0 : bp[key]) !== null && _bp$key2 !== void 0 ? _bp$key2 : carsConfig === null || carsConfig === void 0 ? void 0 : carsConfig[key]) !== null && _ref16 !== void 0 ? _ref16 : fallback;
}
function getCarsSizeScale(carsConfig) {
  return getCarsConfigValue(carsConfig, 'sizeScale', 1);
}
function drawChar(ctx, charImg, charConfig, canvasWidth, canvasHeight, wrapperEl, overridePosition) {
  var _getCharSize2 = getCharSize(charConfig),
    width = _getCharSize2.width,
    height = _getCharSize2.height;
  var pos = overridePosition !== null && overridePosition !== void 0 ? overridePosition : getCharPositionForViewport(charConfig, canvasWidth, canvasHeight, wrapperEl);
  ctx.drawImage(charImg, pos.x, pos.y, width, height);
}
function createChickenCanvasController(config, elements) {
  var _config$selectors, _config$selectors$ini, _config$selectors2, _charConfig$frames2, _coinsConfig$frames4, _barrierConfig$frames5, _carsConfig$variants3;
  var wrapperEl = elements.wrapperEl,
    canvasEl = elements.canvasEl,
    initBtnEl = elements.initBtnEl;
  var counterEl = (_config$selectors = config.selectors) !== null && _config$selectors !== void 0 && _config$selectors.counterNumber ? document.querySelector(config.selectors.counterNumber) : null;
  var initBtnDisabledClass = (_config$selectors$ini = (_config$selectors2 = config.selectors) === null || _config$selectors2 === void 0 ? void 0 : _config$selectors2.initBtnDisabledClass) !== null && _config$selectors$ini !== void 0 ? _config$selectors$ini : '_disabled';
  var backgroundBreakpoints = config.backgroundBreakpoints,
    _config$switchThresho = config.switchThreshold,
    switchThreshold = _config$switchThresho === void 0 ? 50 : _config$switchThresho,
    canvasBreakpoints = config.canvasBreakpoints,
    charConfig = config.char,
    coinsConfig = config.coins,
    barrierConfig = config.barrier,
    carsConfig = config.cars,
    animationChainConfig = config.animationChain;
  var bgBreakpoints = sortBackgroundBreakpoints(backgroundBreakpoints);
  var charOverridePosition = null;
  var initialCharPosition = null;
  var chainActive = false;
  var chainTargetCoinIndex = 0;
  var chainStartX = 0;
  var chainStartY = 0;
  var chainTargetX = 0;
  var chainStartTime = 0;
  var chainJumpTimerId = null;
  var chainCompleteTimerId = null;
  var bgImage = null;
  var currentBgSrc = null;
  var charState = 'stay';
  var charFrameImages = [];
  var charFrameIndex = 0;
  var animationFrameId = null;
  var lastCanvasWidth = 0;
  var lastCanvasHeight = 0;
  var lastBp = null;
  var coinStates = ((coinsConfig === null || coinsConfig === void 0 ? void 0 : coinsConfig.items) || []).map(function () {
    return {
      state: 'static',
      frameIndex: 0,
      visible: true
    };
  });
  var coinFrameImages = [];
  var coinStaticImage = null;
  var coinFadeTimerId = null;
  var barrierStates = ((barrierConfig === null || barrierConfig === void 0 ? void 0 : barrierConfig.items) || []).map(function () {
    return {
      state: 'hide',
      frameIndex: 0,
      visible: false
    };
  });
  var barrierFrameImages = [];
  var barrierFadeInTimerId = null;
  var carVariantImages = [];
  var runningCars = [];
  var fadeInCars = [];
  var carSlotStates = ((coinsConfig === null || coinsConfig === void 0 ? void 0 : coinsConfig.items) || []).map(function () {
    return {
      lastDriveEndTime: 0
    };
  });
  var pendingJumpStart = false;
  var pendingJumpForCoinIndex = null;
  var chainFadeInCombo = null;
  var carRunningRafId = null;
  var carDriveScheduleTimers = [];
  function updateCounter(collected) {
    if (!counterEl) return;
    var total = coinStates.length;
    counterEl.textContent = "".concat(collected, " / ").concat(total);
  }
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
  function loadCoinFramesTask() {
    var _coinsConfig$frames2, _coinsConfig$staticFr;
    var promises = [];
    if (coinsConfig !== null && coinsConfig !== void 0 && (_coinsConfig$frames2 = coinsConfig.frames) !== null && _coinsConfig$frames2 !== void 0 && _coinsConfig$frames2.length) {
      promises.push(loadCoinFrames(coinsConfig).then(function (imgs) {
        coinFrameImages = imgs;
      }));
    }
    var staticSrc = (_coinsConfig$staticFr = coinsConfig === null || coinsConfig === void 0 ? void 0 : coinsConfig.staticFrame) !== null && _coinsConfig$staticFr !== void 0 ? _coinsConfig$staticFr : coinsConfig !== null && coinsConfig !== void 0 && coinsConfig.imagePath ? "".concat(coinsConfig.imagePath, "/static.png") : null;
    if (staticSrc) {
      promises.push(loadImage(staticSrc).then(function (img) {
        coinStaticImage = img;
      }).catch(function () {}));
    }
    return promises.length ? Promise.all(promises) : Promise.resolve();
  }
  function getCoinCenterX(coinIndex) {
    var _ref17, _coinsBp$width3;
    var charSize = getCharSize(charConfig);
    var pos = getCoinPositionForViewport(coinsConfig, baseCharXForCoins(), charSize.width, coinIndex, lastCanvasWidth, lastCanvasHeight, wrapperEl);
    var coinsBp = getMatchedBreakpoint(coinsConfig === null || coinsConfig === void 0 ? void 0 : coinsConfig.breakpoints);
    var coinWidth = (_ref17 = (_coinsBp$width3 = coinsBp === null || coinsBp === void 0 ? void 0 : coinsBp.width) !== null && _coinsBp$width3 !== void 0 ? _coinsBp$width3 : coinsConfig === null || coinsConfig === void 0 ? void 0 : coinsConfig.width) !== null && _ref17 !== void 0 ? _ref17 : 134;
    return pos.x + coinWidth / 2;
  }
  function getCoinCenterAsCharLeft(coinIndex) {
    var charSize = getCharSize(charConfig);
    var centerX = getCoinCenterX(coinIndex);
    return centerX - charSize.width / 2;
  }
  function baseCharXForCoins() {
    var _x, _ref18, _initialCharPosition;
    return (_x = (_ref18 = (_initialCharPosition = initialCharPosition) !== null && _initialCharPosition !== void 0 ? _initialCharPosition : charConfig ? getCharPositionForViewport(charConfig, lastCanvasWidth, lastCanvasHeight, wrapperEl) : null) === null || _ref18 === void 0 ? void 0 : _ref18.x) !== null && _x !== void 0 ? _x : 50;
  }
  function startJumpToCoin(targetIndex) {
    var _charOverridePosition, _currentPos$x, _currentPos$y;
    if (targetIndex < 0 || targetIndex >= coinStates.length) return;
    if (carsConfig && runningCars.some(function (c) {
      return c.coinIndex === targetIndex;
    })) {
      pendingJumpForCoinIndex = targetIndex;
      return;
    }
    pendingJumpForCoinIndex = null;
    chainTargetCoinIndex = targetIndex;
    var currentPos = (_charOverridePosition = charOverridePosition) !== null && _charOverridePosition !== void 0 ? _charOverridePosition : initialCharPosition;
    chainStartX = (_currentPos$x = currentPos === null || currentPos === void 0 ? void 0 : currentPos.x) !== null && _currentPos$x !== void 0 ? _currentPos$x : 50;
    chainStartY = (_currentPos$y = currentPos === null || currentPos === void 0 ? void 0 : currentPos.y) !== null && _currentPos$y !== void 0 ? _currentPos$y : 0;
    chainTargetX = getCoinCenterAsCharLeft(targetIndex);
    chainStartTime = performance.now();
    setCharState('jumping');
  }
  function updateChainJumpPosition() {
    var _animationChainConfig, _animationChainConfig2;
    var jumpDuration = (_animationChainConfig = animationChainConfig === null || animationChainConfig === void 0 ? void 0 : animationChainConfig.jumpDuration) !== null && _animationChainConfig !== void 0 ? _animationChainConfig : 600;
    var arcHeight = (_animationChainConfig2 = animationChainConfig === null || animationChainConfig === void 0 ? void 0 : animationChainConfig.jumpArcHeight) !== null && _animationChainConfig2 !== void 0 ? _animationChainConfig2 : 20;
    var progress = Math.min(1, (performance.now() - chainStartTime) / jumpDuration);
    if (progress >= 1) {
      charOverridePosition = {
        x: chainTargetX,
        y: chainStartY
      };
      setCoinFadeOut(chainTargetCoinIndex);
      setCharState('stay');
      return false;
    }
    var t = progress;
    var x = chainStartX + t * (chainTargetX - chainStartX);
    var y = chainStartY - 4 * arcHeight * t * (1 - t);
    charOverridePosition = {
      x: x,
      y: y
    };
    return true;
  }
  function scheduleNextChainJump(completedCoinIndex) {
    var _animationChainConfig3;
    var nextIndex = completedCoinIndex + 1;
    var betweenDelay = (_animationChainConfig3 = animationChainConfig === null || animationChainConfig === void 0 ? void 0 : animationChainConfig.betweenJumpsDelay) !== null && _animationChainConfig3 !== void 0 ? _animationChainConfig3 : 0;
    var schedule = function schedule() {
      chainJumpTimerId = null;
      if (nextIndex < coinStates.length) {
        startJumpToCoin(nextIndex);
      } else {
        var _animationChainConfig4;
        chainActive = false;
        var popupDelay = (_animationChainConfig4 = animationChainConfig === null || animationChainConfig === void 0 ? void 0 : animationChainConfig.popupOpenDelayAfterLastJump) !== null && _animationChainConfig4 !== void 0 ? _animationChainConfig4 : 0;
        var onChainComplete = animationChainConfig === null || animationChainConfig === void 0 ? void 0 : animationChainConfig.onChainComplete;
        if (typeof onChainComplete === 'function') {
          if (popupDelay > 0) {
            chainCompleteTimerId = window.setTimeout(function () {
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
    var _barrierConfig$frames2;
    if (!(barrierConfig !== null && barrierConfig !== void 0 && (_barrierConfig$frames2 = barrierConfig.frames) !== null && _barrierConfig$frames2 !== void 0 && _barrierConfig$frames2.length)) return Promise.resolve();
    return loadBarrierFrames(barrierConfig).then(function (imgs) {
      barrierFrameImages = imgs;
    });
  }
  function loadCarVariantsTask() {
    var _carsConfig$variants2;
    if (!(carsConfig !== null && carsConfig !== void 0 && (_carsConfig$variants2 = carsConfig.variants) !== null && _carsConfig$variants2 !== void 0 && _carsConfig$variants2.length)) return Promise.resolve();
    return loadCarVariants(carsConfig).then(function (arr) {
      carVariantImages = arr;
    });
  }
  function getCarPositionX(coinIndex) {
    var _ref19, _coinsBp$width4;
    var charSize = getCharSize(charConfig);
    var pos = getCoinPositionForViewport(coinsConfig, baseCharXForCoins(), charSize.width, coinIndex, lastCanvasWidth, lastCanvasHeight, wrapperEl);
    var coinsBp = getMatchedBreakpoint(coinsConfig === null || coinsConfig === void 0 ? void 0 : coinsConfig.breakpoints);
    var coinWidth = (_ref19 = (_coinsBp$width4 = coinsBp === null || coinsBp === void 0 ? void 0 : coinsBp.width) !== null && _coinsBp$width4 !== void 0 ? _coinsBp$width4 : coinsConfig === null || coinsConfig === void 0 ? void 0 : coinsConfig.width) !== null && _ref19 !== void 0 ? _ref19 : 134;
    return pos.x + coinWidth / 2;
  }
  function getCarStartY(carHeight) {
    var offset = getCarsConfigValue(carsConfig, 'offsetAboveCanvas', 20);
    return -carHeight - offset;
  }
  function getCarFadeInTargetY(coinIndex, carHeight) {
    var _ref20, _coinsBp$width5;
    var coinPos = getCoinPositionForViewport(coinsConfig, baseCharXForCoins(), getCharSize(charConfig).width, coinIndex, lastCanvasWidth, lastCanvasHeight, wrapperEl);
    var coinsBp = getMatchedBreakpoint(coinsConfig === null || coinsConfig === void 0 ? void 0 : coinsConfig.breakpoints);
    var coinWidth = (_ref20 = (_coinsBp$width5 = coinsBp === null || coinsBp === void 0 ? void 0 : coinsBp.width) !== null && _coinsBp$width5 !== void 0 ? _coinsBp$width5 : coinsConfig === null || coinsConfig === void 0 ? void 0 : coinsConfig.width) !== null && _ref20 !== void 0 ? _ref20 : 134;
    var _getBarrierPositionFo = getBarrierPositionForViewport(barrierConfig, coinPos.x, coinPos.y, coinWidth),
      barrierY = _getBarrierPositionFo.y;
    var stopBefore = getCarsConfigValue(carsConfig, 'stopBeforeBarrier', 20);
    return barrierY - carHeight - stopBefore;
  }
  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }
  function startCarRunning(coinIndex) {
    var _carsConfig$maxConcur, _carsConfig$minStartG, _carSlotStates$coinIn, _carSlotStates$coinIn2;
    if (!carsConfig || carVariantImages.length === 0) return;
    if (pendingJumpStart) return;
    if (coinIndex === pendingJumpForCoinIndex) return;
    if (chainActive && chainTargetCoinIndex === coinIndex) {
      scheduleNextCarDrive(coinIndex);
      return;
    }
    var coin = coinStates[coinIndex];
    if (!coin || coin.state === 'fade-out' || !coin.visible) return;
    if (runningCars.some(function (c) {
      return c.coinIndex === coinIndex;
    })) {
      scheduleNextCarDrive(coinIndex);
      return;
    }
    if (fadeInCars.some(function (c) {
      return c.coinIndex === coinIndex;
    })) {
      scheduleNextCarDrive(coinIndex);
      return;
    }
    var maxConcurrent = (_carsConfig$maxConcur = carsConfig.maxConcurrent) !== null && _carsConfig$maxConcur !== void 0 ? _carsConfig$maxConcur : 2;
    var minStartGap = ((_carsConfig$minStartG = carsConfig.minStartGap) !== null && _carsConfig$minStartG !== void 0 ? _carsConfig$minStartG : 1) * 1000;
    var now = Date.now();
    var lastEnd = (_carSlotStates$coinIn = (_carSlotStates$coinIn2 = carSlotStates[coinIndex]) === null || _carSlotStates$coinIn2 === void 0 ? void 0 : _carSlotStates$coinIn2.lastDriveEndTime) !== null && _carSlotStates$coinIn !== void 0 ? _carSlotStates$coinIn : 0;
    if (runningCars.length >= maxConcurrent || now - lastEnd < minStartGap) {
      scheduleNextCarDrive(coinIndex);
      return;
    }
    var baseVariant = pickRandomCarVariant(carVariantImages);
    var scale = getCarsSizeScale(carsConfig);
    var variant = baseVariant ? _objectSpread2(_objectSpread2({}, baseVariant), {}, {
      width: Math.round(baseVariant.width * scale),
      height: Math.round(baseVariant.height * scale)
    }) : null;
    if (!variant) return;
    var centerX = getCarPositionX(coinIndex);
    var x = centerX - variant.width / 2;
    var y = getCarStartY(variant.height);
    runningCars.push({
      coinIndex: coinIndex,
      x: x,
      y: y,
      img: variant.img,
      width: variant.width,
      height: variant.height,
      startTime: now
    });
    scheduleNextCarDrive(coinIndex);
    if (!carRunningRafId) runCarRunningLoop();
  }
  function scheduleNextCarDrive(coinIndex) {
    var _carsConfig$runningIn, _carsConfig$runningIn2;
    var intervalMin = ((_carsConfig$runningIn = carsConfig === null || carsConfig === void 0 ? void 0 : carsConfig.runningIntervalMin) !== null && _carsConfig$runningIn !== void 0 ? _carsConfig$runningIn : 4) * 1000;
    var intervalMax = ((_carsConfig$runningIn2 = carsConfig === null || carsConfig === void 0 ? void 0 : carsConfig.runningIntervalMax) !== null && _carsConfig$runningIn2 !== void 0 ? _carsConfig$runningIn2 : 10) * 1000;
    var delay = randomBetween(intervalMin, intervalMax);
    var id = window.setTimeout(function () {
      for (var i = 0; i < carDriveScheduleTimers.length; i++) {
        var _carDriveScheduleTime;
        if (((_carDriveScheduleTime = carDriveScheduleTimers[i]) === null || _carDriveScheduleTime === void 0 ? void 0 : _carDriveScheduleTime.id) === id) {
          carDriveScheduleTimers.splice(i, 1);
          break;
        }
      }
      startCarRunning(coinIndex);
    }, delay);
    carDriveScheduleTimers.push({
      id: id,
      coinIndex: coinIndex
    });
  }
  function scheduleFirstCarDrives() {
    var _carsConfig$runningIn3, _coinsConfig$items2;
    if (!carsConfig || carVariantImages.length === 0) return;
    var intervalMax = ((_carsConfig$runningIn3 = carsConfig === null || carsConfig === void 0 ? void 0 : carsConfig.runningIntervalMax) !== null && _carsConfig$runningIn3 !== void 0 ? _carsConfig$runningIn3 : 10) * 1000;
    ((_coinsConfig$items2 = coinsConfig === null || coinsConfig === void 0 ? void 0 : coinsConfig.items) !== null && _coinsConfig$items2 !== void 0 ? _coinsConfig$items2 : []).forEach(function (_, i) {
      var coin = coinStates[i];
      if (!coin || coin.state === 'fade-out' || !coin.visible) return;
      var delay = randomBetween(0, intervalMax);
      var id = window.setTimeout(function () {
        for (var j = 0; j < carDriveScheduleTimers.length; j++) {
          var _carDriveScheduleTime2;
          if (((_carDriveScheduleTime2 = carDriveScheduleTimers[j]) === null || _carDriveScheduleTime2 === void 0 ? void 0 : _carDriveScheduleTime2.id) === id) {
            carDriveScheduleTimers.splice(j, 1);
            break;
          }
        }
        startCarRunning(i);
      }, delay);
      carDriveScheduleTimers.push({
        id: id,
        coinIndex: i
      });
    });
  }
  function runCarRunningLoop() {
    var _carsConfig$runningSp, _carsConfig$runningSp2;
    var speed = ((_carsConfig$runningSp = carsConfig === null || carsConfig === void 0 ? void 0 : carsConfig.runningSpeed) !== null && _carsConfig$runningSp !== void 0 ? _carsConfig$runningSp : 0.8) * (chainActive ? (_carsConfig$runningSp2 = carsConfig === null || carsConfig === void 0 ? void 0 : carsConfig.runningSpeedMultiplierDuringJump) !== null && _carsConfig$runningSp2 !== void 0 ? _carsConfig$runningSp2 : 1.5 : 1);
    var dt = 16;
    var dy = speed * dt;
    for (var i = runningCars.length - 1; i >= 0; i--) {
      var car = runningCars[i];
      car.y += dy;
      if (car.y >= lastCanvasHeight + car.height) {
        carSlotStates[car.coinIndex].lastDriveEndTime = Date.now();
        var wasWaitingForThisSlot = car.coinIndex === pendingJumpForCoinIndex;
        runningCars.splice(i, 1);
        if (wasWaitingForThisSlot) {
          var targetIndex = pendingJumpForCoinIndex;
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
    if (fadeInCars.some(function (c) {
      return c.coinIndex === coinIndex;
    })) return;
    var baseVariant = pickRandomCarVariant(carVariantImages);
    var scale = getCarsSizeScale(carsConfig);
    var variant = baseVariant ? _objectSpread2(_objectSpread2({}, baseVariant), {}, {
      width: Math.round(baseVariant.width * scale),
      height: Math.round(baseVariant.height * scale)
    }) : null;
    if (!variant) return;
    var centerX = getCarPositionX(coinIndex);
    var x = centerX - variant.width / 2;
    var startY = getCarStartY(variant.height);
    var targetY = getCarFadeInTargetY(coinIndex, variant.height);
    fadeInCars.push({
      coinIndex: coinIndex,
      x: x,
      y: startY,
      targetY: targetY,
      img: variant.img,
      width: variant.width,
      height: variant.height,
      moving: true
    });
    if (!carFadeInRafId) runCarFadeInLoop();
  }
  var carFadeInRafId = null;
  function runCarFadeInLoop() {
    var _carsConfig$fadeInSpe;
    var speed = (_carsConfig$fadeInSpe = carsConfig === null || carsConfig === void 0 ? void 0 : carsConfig.fadeInSpeed) !== null && _carsConfig$fadeInSpe !== void 0 ? _carsConfig$fadeInSpe : 1.2;
    var dt = 16;
    var dy = speed * dt;
    var hasMoving = false;
    fadeInCars.forEach(function (car) {
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
    carDriveScheduleTimers.forEach(function (t) {
      if ((t === null || t === void 0 ? void 0 : t.id) != null) clearTimeout(t.id);
    });
    carDriveScheduleTimers.length = 0;
    if (carRunningRafId != null) {
      cancelAnimationFrame(carRunningRafId);
      carRunningRafId = null;
    }
  }
  function drawFullFrame() {
    var _x2, _ref21, _initialCharPosition2;
    var ctx = canvasEl.getContext('2d');
    if (!ctx || !bgImage || lastCanvasWidth <= 0 || lastCanvasHeight <= 0) return;
    drawBackground(ctx, bgImage, lastBp.rootWidth, lastBp.rootHeight, lastCanvasWidth, lastCanvasHeight);
    var charSize = charConfig ? getCharSize(charConfig) : {
      width: 225};
    var charPos = charConfig ? getCharPositionForViewport(charConfig, lastCanvasWidth, lastCanvasHeight, wrapperEl) : null;
    var baseCharX = (_x2 = (_ref21 = (_initialCharPosition2 = initialCharPosition) !== null && _initialCharPosition2 !== void 0 ? _initialCharPosition2 : charPos) === null || _ref21 === void 0 ? void 0 : _ref21.x) !== null && _x2 !== void 0 ? _x2 : 50;
    if (coinsConfig && (coinStaticImage || coinFrameImages.length > 0)) {
      coinStates.forEach(function (coin, index) {
        var _coinStaticImage;
        if (!coin.visible) return;
        var _getCoinPositionForVi = getCoinPositionForViewport(coinsConfig, baseCharX, charSize.width, index, lastCanvasWidth, lastCanvasHeight, wrapperEl),
          x = _getCoinPositionForVi.x,
          y = _getCoinPositionForVi.y;
        var img = coin.state === 'static' ? (_coinStaticImage = coinStaticImage) !== null && _coinStaticImage !== void 0 ? _coinStaticImage : coinFrameImages[0] : coinFrameImages[coin.frameIndex % coinFrameImages.length];
        if (img) drawCoin(ctx, img, coinsConfig, x, y);
      });
    }
    if (carsConfig && carVariantImages.length > 0) {
      fadeInCars.forEach(function (car) {
        drawCar(ctx, car.img, car.x, car.y, car.width, car.height);
      });
      runningCars.forEach(function (car) {
        if (car.y + car.height >= 0 && car.y <= lastCanvasHeight) {
          drawCar(ctx, car.img, car.x, car.y, car.width, car.height);
        }
      });
    }
    if (barrierConfig && coinsConfig && barrierFrameImages.length > 0) {
      barrierStates.forEach(function (barrier, index) {
        var _ref22, _coinsBp$width6, _barrierConfig$static;
        if (!barrier.visible) return;
        var coinPos = getCoinPositionForViewport(coinsConfig, baseCharX, charSize.width, index, lastCanvasWidth, lastCanvasHeight, wrapperEl);
        var coinsBp = getMatchedBreakpoint(coinsConfig === null || coinsConfig === void 0 ? void 0 : coinsConfig.breakpoints);
        var coinWidth = (_ref22 = (_coinsBp$width6 = coinsBp === null || coinsBp === void 0 ? void 0 : coinsBp.width) !== null && _coinsBp$width6 !== void 0 ? _coinsBp$width6 : coinsConfig === null || coinsConfig === void 0 ? void 0 : coinsConfig.width) !== null && _ref22 !== void 0 ? _ref22 : 134;
        var _getBarrierPositionFo2 = getBarrierPositionForViewport(barrierConfig, coinPos.x, coinPos.y, coinWidth),
          x = _getBarrierPositionFo2.x,
          y = _getBarrierPositionFo2.y;
        var frameIdx = barrier.state === 'static' ? (_barrierConfig$static = barrierConfig.staticFrameIndex) !== null && _barrierConfig$static !== void 0 ? _barrierConfig$static : 5 : barrier.frameIndex % barrierFrameImages.length;
        var img = barrierFrameImages[frameIdx];
        if (img) drawBarrier(ctx, img, barrierConfig, x, y);
      });
    }
    if (charFrameImages.length > 0 && charConfig) {
      var _charOverridePosition2;
      var frameIdx = charState === 'stay' ? 0 : charFrameIndex % charFrameImages.length;
      var charDrawPos = (_charOverridePosition2 = charOverridePosition) !== null && _charOverridePosition2 !== void 0 ? _charOverridePosition2 : charPos;
      drawChar(ctx, charFrameImages[frameIdx], charConfig, lastCanvasWidth, lastCanvasHeight, wrapperEl, charDrawPos);
    }
  }
  function coinFadeLoop() {
    drawFullFrame();
    var hasFadeOut = false;
    coinStates.forEach(function (coin, coinIndex) {
      var _coinsConfig$frames$l, _coinsConfig$frames3;
      if (coin.state !== 'fade-out' || !coin.visible) return;
      hasFadeOut = true;
      coin.frameIndex += 1;
      if (coin.frameIndex >= ((_coinsConfig$frames$l = coinsConfig === null || coinsConfig === void 0 ? void 0 : (_coinsConfig$frames3 = coinsConfig.frames) === null || _coinsConfig$frames3 === void 0 ? void 0 : _coinsConfig$frames3.length) !== null && _coinsConfig$frames$l !== void 0 ? _coinsConfig$frames$l : 0)) {
        coin.visible = false;
        coin.state = 'static';
        coin.frameIndex = 0;
        var barrier = barrierStates[coinIndex];
        if (barrier && barrier.state === 'hide') {
          barrier.state = 'fade-in';
          barrier.visible = true;
          barrier.frameIndex = 0;
          triggerCarFadeIn(coinIndex);
          if (barrierFadeInTimerId == null) {
            var _barrierConfig$fadeIn;
            var delay = (_barrierConfig$fadeIn = barrierConfig === null || barrierConfig === void 0 ? void 0 : barrierConfig.fadeInFrameDelay) !== null && _barrierConfig$fadeIn !== void 0 ? _barrierConfig$fadeIn : 60;
            barrierFadeInTimerId = window.setTimeout(barrierFadeInLoop, delay);
          }
          if (chainActive) {
            scheduleNextChainJump(coinIndex);
          }
        }
      }
    });
    if (hasFadeOut && coinStates.some(function (c) {
      return c.state === 'fade-out';
    })) {
      var _coinsConfig$fadeFram;
      var delay = (_coinsConfig$fadeFram = coinsConfig === null || coinsConfig === void 0 ? void 0 : coinsConfig.fadeFrameDelay) !== null && _coinsConfig$fadeFram !== void 0 ? _coinsConfig$fadeFram : 60;
      coinFadeTimerId = window.setTimeout(coinFadeLoop, delay);
    } else {
      coinFadeTimerId = null;
    }
  }
  function barrierFadeInLoop() {
    drawFullFrame();
    var hasFadeIn = false;
    barrierStates.forEach(function (barrier) {
      var _barrierConfig$frames3, _barrierConfig$frames4;
      if (barrier.state !== 'fade-in' || !barrier.visible) return;
      hasFadeIn = true;
      barrier.frameIndex += 1;
      if (barrier.frameIndex >= ((_barrierConfig$frames3 = barrierConfig === null || barrierConfig === void 0 ? void 0 : (_barrierConfig$frames4 = barrierConfig.frames) === null || _barrierConfig$frames4 === void 0 ? void 0 : _barrierConfig$frames4.length) !== null && _barrierConfig$frames3 !== void 0 ? _barrierConfig$frames3 : 0)) {
        var _barrierConfig$static2;
        barrier.state = 'static';
        barrier.frameIndex = (_barrierConfig$static2 = barrierConfig === null || barrierConfig === void 0 ? void 0 : barrierConfig.staticFrameIndex) !== null && _barrierConfig$static2 !== void 0 ? _barrierConfig$static2 : 5;
      }
    });
    if (hasFadeIn && barrierStates.some(function (b) {
      return b.state === 'fade-in';
    })) {
      var _barrierConfig$fadeIn2;
      var delay = (_barrierConfig$fadeIn2 = barrierConfig === null || barrierConfig === void 0 ? void 0 : barrierConfig.fadeInFrameDelay) !== null && _barrierConfig$fadeIn2 !== void 0 ? _barrierConfig$fadeIn2 : 60;
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
    var coin = coinStates[coinIndex];
    if (!coin.visible || coin.state === 'fade-out') return;
    coin.state = 'fade-out';
    coin.frameIndex = 0;
    updateCounter(coinIndex + 1);
    if (coinFadeTimerId == null) {
      var _coinsConfig$fadeFram2;
      var delay = (_coinsConfig$fadeFram2 = coinsConfig === null || coinsConfig === void 0 ? void 0 : coinsConfig.fadeFrameDelay) !== null && _coinsConfig$fadeFram2 !== void 0 ? _coinsConfig$fadeFram2 : 60;
      coinFadeTimerId = window.setTimeout(coinFadeLoop, delay);
    }
  }
  function jumpingLoop() {
    var _charConfig$jumpFrame;
    if (charState !== 'jumping') return;
    if (chainActive) {
      var continuing = updateChainJumpPosition();
      if (!continuing) return;
    }
    charFrameIndex = (charFrameIndex + 1) % (charFrameImages.length || 1);
    drawFullFrame();
    var delay = (_charConfig$jumpFrame = charConfig === null || charConfig === void 0 ? void 0 : charConfig.jumpFrameDelay) !== null && _charConfig$jumpFrame !== void 0 ? _charConfig$jumpFrame : 80;
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
    var _coinsConfig$defaultS, _barrierConfig$defaul, _charConfig$defaultSt;
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
    carSlotStates.forEach(function (s) {
      s.lastDriveEndTime = 0;
    });
    pendingJumpStart = false;
    pendingJumpForCoinIndex = null;
    chainFadeInCombo = null;
    chainActive = false;
    charOverridePosition = null;
    initialCharPosition = null;
    updateCounter(0);
    var coinDefaultState = (_coinsConfig$defaultS = coinsConfig === null || coinsConfig === void 0 ? void 0 : coinsConfig.defaultState) !== null && _coinsConfig$defaultS !== void 0 ? _coinsConfig$defaultS : 'static';
    var barrierDefaultState = (_barrierConfig$defaul = barrierConfig === null || barrierConfig === void 0 ? void 0 : barrierConfig.defaultState) !== null && _barrierConfig$defaul !== void 0 ? _barrierConfig$defaul : 'hide';
    charState = (_charConfig$defaultSt = charConfig === null || charConfig === void 0 ? void 0 : charConfig.defaultState) !== null && _charConfig$defaultSt !== void 0 ? _charConfig$defaultSt : 'stay';
    coinStates.forEach(function (c) {
      c.state = coinDefaultState;
      c.frameIndex = 0;
      c.visible = true;
    });
    barrierStates.forEach(function (b) {
      b.state = barrierDefaultState;
      b.frameIndex = 0;
      b.visible = false;
    });
    initBtnEl === null || initBtnEl === void 0 ? void 0 : initBtnEl.classList.remove(initBtnDisabledClass);
    var _getCanvasDimensionsF = getCanvasDimensionsFromBreakpoints(canvasBreakpoints, wrapperEl),
      width = _getCanvasDimensionsF.width,
      height = _getCanvasDimensionsF.height;
    if (width <= 0 || height <= 0) return;
    var bp = getBackgroundBreakpointForWidth(bgBreakpoints, width, switchThreshold);
    canvasEl.width = width;
    canvasEl.height = height;
    lastCanvasWidth = width;
    lastCanvasHeight = height;
    lastBp = bp;
    var onReady = function onReady() {
      drawFullFrame();
      if (charState === 'jumping') jumpingLoop();
      if (coinStates.some(function (c) {
        return c.state === 'fade-out';
      })) {
        var _coinsConfig$fadeFram3;
        var delay = (_coinsConfig$fadeFram3 = coinsConfig === null || coinsConfig === void 0 ? void 0 : coinsConfig.fadeFrameDelay) !== null && _coinsConfig$fadeFram3 !== void 0 ? _coinsConfig$fadeFram3 : 60;
        coinFadeTimerId = window.setTimeout(coinFadeLoop, delay);
      }
      if (barrierStates.some(function (b) {
        return b.state === 'fade-in';
      })) {
        var _barrierConfig$fadeIn3;
        var _delay = (_barrierConfig$fadeIn3 = barrierConfig === null || barrierConfig === void 0 ? void 0 : barrierConfig.fadeInFrameDelay) !== null && _barrierConfig$fadeIn3 !== void 0 ? _barrierConfig$fadeIn3 : 60;
        barrierFadeInTimerId = window.setTimeout(barrierFadeInLoop, _delay);
      }
      if (carsConfig && carVariantImages.length > 0) {
        scheduleFirstCarDrives();
      }
    };
    if (bp.src !== currentBgSrc) {
      loadImage(bp.src).then(function (img) {
        bgImage = img;
        currentBgSrc = bp.src;
        var promises = [];
        if (charConfig && charFrameImages.length === 0) promises.push(loadCharFrames());
        if (coinsConfig && coinFrameImages.length === 0) promises.push(loadCoinFramesTask());
        if (barrierConfig && barrierFrameImages.length === 0) promises.push(loadBarrierFramesTask());
        if (carsConfig && carVariantImages.length === 0) promises.push(loadCarVariantsTask());
        Promise.all(promises).then(onReady);
        if (promises.length === 0) onReady();
      }).catch(function () {});
    } else if (bgImage) {
      var promises = [];
      if (charConfig && charFrameImages.length === 0) promises.push(loadCharFrames());
      if (coinsConfig && coinFrameImages.length === 0) promises.push(loadCoinFramesTask());
      if (barrierConfig && barrierFrameImages.length === 0) promises.push(loadBarrierFramesTask());
      if (carsConfig && carVariantImages.length === 0) promises.push(loadCarVariantsTask());
      Promise.all(promises).then(onReady);
      if (promises.length === 0) onReady();
    } else if (charConfig && charFrameImages.length === 0 || coinsConfig && coinFrameImages.length === 0 || barrierConfig && barrierFrameImages.length === 0 || carsConfig && carVariantImages.length === 0) {
      var _promises = [];
      if (charConfig && charFrameImages.length === 0) _promises.push(loadCharFrames());
      if (coinsConfig && coinFrameImages.length === 0) _promises.push(loadCoinFramesTask());
      if (barrierConfig && barrierFrameImages.length === 0) _promises.push(loadBarrierFramesTask());
      if (carsConfig && carVariantImages.length === 0) _promises.push(loadCarVariantsTask());
      Promise.all(_promises).then(function () {
        return drawFullFrame();
      });
    }
  }
  function handleInitClick() {
    startAnimationChain();
    this.classList.add(initBtnDisabledClass);
  }
  function startAnimationChain() {
    if (!charConfig || !coinsConfig || lastCanvasWidth <= 0 || lastCanvasHeight <= 0) return;
    if (coinStates.length === 0) return;
    var combos = getValidFadeInCombos();
    chainFadeInCombo = new Set(combos[Math.floor(Math.random() * combos.length)]);
    initialCharPosition = getCharPositionForViewport(charConfig, lastCanvasWidth, lastCanvasHeight, wrapperEl);
    charOverridePosition = _objectSpread2({}, initialCharPosition);
    chainActive = true;
    updateCounter(0);
    if (carsConfig && runningCars.length > 0) {
      pendingJumpStart = true;
    } else {
      startJumpToCoin(0);
    }
  }
  if (charConfig !== null && charConfig !== void 0 && (_charConfig$frames2 = charConfig.frames) !== null && _charConfig$frames2 !== void 0 && _charConfig$frames2.length) {
    loadCharFrames();
  }
  if (coinsConfig !== null && coinsConfig !== void 0 && (_coinsConfig$frames4 = coinsConfig.frames) !== null && _coinsConfig$frames4 !== void 0 && _coinsConfig$frames4.length) {
    loadCoinFramesTask();
  }
  if (barrierConfig !== null && barrierConfig !== void 0 && (_barrierConfig$frames5 = barrierConfig.frames) !== null && _barrierConfig$frames5 !== void 0 && _barrierConfig$frames5.length) {
    loadBarrierFramesTask();
  }
  if (carsConfig !== null && carsConfig !== void 0 && (_carsConfig$variants3 = carsConfig.variants) !== null && _carsConfig$variants3 !== void 0 && _carsConfig$variants3.length) {
    loadCarVariantsTask();
  }
  return {
    recalcAndRestart: recalcAndRestart,
    handleInitClick: handleInitClick,
    setCharState: setCharState,
    setCoinFadeOut: setCoinFadeOut,
    startAnimationChain: startAnimationChain
  };
}

function initChickenCanvas(config) {
  if (!config) return null;
  var effectiveConfig = config.override ? _objectSpread2(_objectSpread2({}, config), config.override) : config;
  var selectors = effectiveConfig.selectors;
  var wrapperEl = document.querySelector(selectors.wrapper);
  var landLeftEl = document.querySelector(selectors.landLeft);
  var canvasEl = document.querySelector(selectors.canvas);
  var initBtnEl = document.querySelector(selectors.initBtn);
  if (!wrapperEl || !landLeftEl || !canvasEl) return null;
  var controller = createChickenCanvasController(effectiveConfig, {
    wrapperEl: wrapperEl,
    canvasEl: canvasEl,
    initBtnEl: initBtnEl
  });
  controller.recalcAndRestart();
  return {
    recalcAndRestart: controller.recalcAndRestart,
    handleInitClick: controller.handleInitClick,
    setCharState: controller.setCharState,
    setCoinFadeOut: controller.setCoinFadeOut,
    startAnimationChain: controller.startAnimationChain
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
    initBtn: '[data-canvas-init="chicken"]',
    initBtnDisabledClass: '_disabled',
    counterNumber: '.land__counter-number'
  },
  /** Root sizes sorted by width descending. Switch when canvasWidth >= rootWidth + switchThreshold. Optional orientation: 'portrait' | 'landscape' — applies only in that orientation. */
  backgroundBreakpoints: [{
    rootWidth: 1470,
    rootHeight: 1220,
    src: './img/canvas/bg.jpg'
  }, {
    rootWidth: 1080,
    rootHeight: 850,
    src: './img/canvas/bg-desc-small.jpg'
  }, {
    rootWidth: 868,
    rootHeight: 736,
    src: './img/canvas/bg-tab.jpg'
  },
  //portrait
  {
    rootWidth: 1300,
    rootHeight: 1000,
    orientation: 'portrait',
    src: './img/canvas/bg-tab.jpg'
  }, {
    rootWidth: 700,
    rootHeight: 1300,
    orientation: 'portrait',
    src: './img/canvas/bg-tab.jpg'
  }, {
    rootWidth: 670,
    rootHeight: 1000,
    orientation: 'portrait',
    src: './img/canvas/bg-mob.jpg'
  }],
  switchThreshold: 50,
  /**
   * Canvas size by breakpoint. Sorted by maxWidth ascending; first where viewportWidth <= maxWidth applies.
   * isWrapperFill: true — розмір з wrapper (.land__canvas).
   * orientation?: 'portrait' | 'landscape' — опційно, breakpoint тільки для відповідної орієнтації.
   */
  canvasBreakpoints: [{
    maxWidth: 1300,
    width: 1350,
    height: 2000,
    orientation: 'portrait'
  }, {
    maxWidth: 1150,
    width: 1150,
    height: 1500,
    orientation: 'portrait',
    src: './img/canvas/bg-tab.jpg'
  }, {
    maxWidth: 950,
    width: 950,
    height: 1300,
    orientation: 'portrait'
  }, {
    maxWidth: 850,
    width: 860,
    height: 900,
    orientation: 'portrait'
  }, {
    maxWidth: 670,
    width: 670,
    height: 800,
    orientation: 'portrait'
  }, {
    maxWidth: 500,
    width: 536,
    height: 910,
    orientation: 'portrait'
  }, {
    maxWidth: 374,
    width: 410,
    height: 820,
    orientation: 'portrait'
  }, {
    maxWidth: 950,
    width: 660,
    height: 1050,
    orientation: 'landscape'
  }, {
    maxWidth: 820,
    width: 550,
    height: 850,
    orientation: 'landscape'
  }, {
    maxWidth: 725,
    width: 490,
    height: 650,
    orientation: 'landscape'
  }, {
    maxWidth: 1500,
    width: 950,
    height: 1155
  }, {
    maxWidth: 1800,
    width: 1200,
    height: 1540
  }, {
    maxWidth: Infinity,
    width: 1360,
    height: 1540,
    isWrapperFill: false
  }],
  /** Char — дефолт 225×322px, стани stay | jumping. Розміри змінюються тільки через sizeBreakpoints. */
  char: {
    defaultState: 'stay',
    width: 225,
    height: 322,
    /** viewportWidth <= maxWidth. Зміни розміру тільки через sizeBreakpoints. */
    sizeBreakpoints: [{
      maxWidth: 1500,
      width: 225,
      height: 322,
      orientation: 'portrait'
    }, {
      maxWidth: 1500,
      width: 169,
      height: 242,
      orientation: 'landscape'
    }, {
      maxWidth: 950,
      width: 140,
      height: 201,
      orientation: 'portrait'
    }, {
      maxWidth: 670,
      width: 100,
      height: 143,
      orientation: 'portrait'
    }, {
      maxWidth: 950,
      width: 100,
      height: 143,
      orientation: 'landscape'
    }, {
      maxWidth: Infinity,
      width: 225,
      height: 322
    }],
    /** Затримка між кадрами jumping (ms) */
    jumpFrameDelay: 80,
    frames: ['./img/canvas/char/frame-1.png', './img/canvas/char/frame-2.png', './img/canvas/char/frame-3.png', './img/canvas/char/frame-4.png', './img/canvas/char/frame-5.png', './img/canvas/char/frame-6.png', './img/canvas/char/frame-7.png', './img/canvas/char/frame-8.png', './img/canvas/char/frame-9.png', './img/canvas/char/frame-10.png'],
    /** viewportWidth <= maxWidth. default: offsetX 50, centerY true */
    breakpoints: [{
      maxWidth: 950,
      offsetX: 40,
      orientation: 'landscape'
    }, {
      maxWidth: 374,
      offsetX: 20
    }, {
      maxWidth: 500,
      offsetX: 50
    }, {
      maxWidth: 1750,
      offsetX: 70
    }, {
      maxWidth: Infinity,
      offsetX: 100
    }]
  },
  /** Coins — 134×172px, стани static | fade-out. В ряд відносно char. static — static.png з папки. */
  coins: {
    defaultState: 'static',
    width: 134,
    height: 172,
    /** Усі параметри коінів за діапазоном: width, height, offsetRight, gapBetween, itemGaps. orientation опційно. */
    breakpoints: [{
      maxWidth: 1500,
      width: 101,
      height: 129,
      orientation: 'landscape',
      offsetRight: 0,
      gapBetween: 35,
      itemGaps: {
        2: {
          gapBetweenLeft: 40
        }
      }
    }, {
      maxWidth: 1300,
      width: 134,
      height: 172,
      orientation: 'portrait',
      offsetRight: 50,
      gapBetween: 55,
      itemGaps: {
        2: {
          gapBetweenLeft: 70
        }
      }
    }, {
      maxWidth: 1150,
      width: 134,
      height: 172,
      orientation: 'portrait',
      offsetRight: 10,
      gapBetween: 30,
      itemGaps: {
        2: {
          gapBetweenLeft: 20
        }
      }
    }, {
      maxWidth: 950,
      width: 80,
      height: 100,
      orientation: 'portrait',
      offsetRight: 40,
      gapBetween: 60,
      itemGaps: {
        2: {
          gapBetweenLeft: 50
        }
      }
    }, {
      maxWidth: 850,
      width: 80,
      height: 100,
      orientation: 'portrait',
      offsetRight: 10,
      gapBetween: 40,
      itemGaps: {
        2: {
          gapBetweenLeft: 50
        }
      }
    }, {
      maxWidth: 670,
      width: 70,
      height: 85,
      orientation: 'portrait',
      offsetRight: -10,
      gapBetween: 30,
      itemGaps: {
        2: {
          gapBetweenLeft: 24
        }
      }
    }, {
      maxWidth: 500,
      width: 54,
      height: 69,
      orientation: 'portrait',
      offsetRight: -10,
      gapBetween: 20,
      itemGaps: {
        2: {
          gapBetweenLeft: 24
        }
      }
    }, {
      maxWidth: 374,
      width: 40,
      height: 50,
      orientation: 'portrait',
      offsetRight: -15,
      gapBetween: 20,
      itemGaps: {
        2: {
          gapBetweenLeft: 20
        }
      }
    }, {
      maxWidth: 950,
      width: 70,
      height: 85,
      orientation: 'landscape',
      offsetRight: 20,
      gapBetween: 30,
      itemGaps: {
        2: {
          gapBetweenLeft: 24
        }
      }
    }, {
      maxWidth: 820,
      width: 70,
      height: 85,
      orientation: 'landscape',
      offsetRight: -10,
      gapBetween: 10,
      itemGaps: {
        2: {
          gapBetweenLeft: 15
        }
      }
    }, {
      maxWidth: 725,
      width: 60,
      height: 75,
      orientation: 'landscape',
      offsetRight: -20,
      gapBetween: 10,
      itemGaps: {
        2: {
          gapBetweenLeft: 15
        }
      }
    }, {
      maxWidth: 1800,
      offsetRight: 20,
      gapBetween: 30,
      itemGaps: {
        2: {
          gapBetweenLeft: 40
        }
      }
    }, {
      maxWidth: Infinity,
      offsetRight: 30,
      gapBetween: 70,
      itemGaps: {
        2: {
          gapBetweenLeft: 60
        }
      }
    }],
    imagePath: './img/canvas/coin',
    staticFrame: './img/canvas/coin/static.png',
    frames: ['./img/canvas/coin/frame-1.png', './img/canvas/coin/frame-2.png'],
    /** Затримка між кадрами fade-out (ms) */
    fadeFrameDelay: 120,
    /** items: { id } + опційно gapBetweenLeft (відступ зліва), gapBetweenRight (відступ справа) — fallback якщо нема в itemGaps */
    items: [{
      id: 0
    }, {
      id: 1
    }, {
      id: 2
    }, {
      id: 3
    }]
  },
  /** Barrier — 171×112px, прив'язка до coin[i]. Стани hide | fade-in | static. */
  barrier: {
    defaultState: 'hide',
    width: 171,
    height: 112,
    breakpoints: [{
      maxWidth: 1500,
      width: 128,
      height: 84,
      offsetAbove: 8
    }, {
      maxWidth: 950,
      width: 112,
      height: 74,
      offsetAbove: 8
    }, {
      maxWidth: 670,
      width: 96,
      height: 64,
      offsetAbove: 8
    }, {
      maxWidth: 500,
      width: 80,
      height: 56,
      offsetAbove: 8
    }, {
      maxWidth: 374,
      width: 64,
      height: 48,
      offsetAbove: 8
    }, {
      maxWidth: 950,
      width: 64,
      height: 48,
      offsetAbove: 8,
      orientation: 'landscape'
    },
    // mb not working
    {
      maxWidth: Infinity
    }],
    imagePath: './img/canvas/barrier',
    frames: ['./img/canvas/barrier/frame-1.png', './img/canvas/barrier/frame-2.png', './img/canvas/barrier/frame-3.png', './img/canvas/barrier/frame-4.png', './img/canvas/barrier/frame-5.png', './img/canvas/barrier/frame-6.png'],
    staticFrameIndex: 5,
    offsetAboveDefault: 10,
    offsetAboveBreakpoints: [{
      maxWidth: 600,
      offsetAbove: 8
    }, {
      maxWidth: 950,
      offsetAbove: 10
    }, {
      maxWidth: Infinity,
      offsetAbove: 10
    }],
    fadeInFrameDelay: 60,
    items: [{
      id: 0
    }, {
      id: 1
    }, {
      id: 2
    }, {
      id: 3
    }]
  },
  /** Cars — car-1 168×342, car-2 170×384. Випадковий візуал при кожному старті drive. Стани running | fade-in. */
  cars: {
    variants: [{
      width: 168,
      height: 342,
      src: './img/canvas/car-1.png'
    }, {
      width: 170,
      height: 384,
      src: './img/canvas/car-2.png'
    }],
    breakpoints: [{
      maxWidth: 1500,
      sizeScale: 0.75,
      offsetAboveCanvas: 15,
      stopBeforeBarrier: 15
    }, {
      maxWidth: 950,
      sizeScale: 0.65,
      offsetAboveCanvas: 15,
      stopBeforeBarrier: 0
    }, {
      maxWidth: 670,
      sizeScale: 0.5,
      offsetAboveCanvas: 15,
      stopBeforeBarrier: 0
    }, {
      maxWidth: 500,
      sizeScale: 0.45,
      offsetAboveCanvas: 15,
      stopBeforeBarrier: 0
    }, {
      maxWidth: 374,
      sizeScale: 0.35,
      offsetAboveCanvas: 15,
      stopBeforeBarrier: 0
    }, {
      maxWidth: Infinity,
      sizeScale: 1
    }],
    offsetAboveCanvas: 20,
    runningIntervalMin: 4,
    runningIntervalMax: 10,
    runningSpeed: 0.8,
    minStartGap: 1,
    maxConcurrent: 2,
    stopBeforeBarrier: 20,
    fadeInSpeed: 1.2,
    runningSpeedMultiplierDuringJump: 1.5
  },
  /** Animation chain: char стрибає по дузі до коінів по черзі. */
  animationChain: {
    jumpArcHeight: 60,
    jumpDuration: 600,
    betweenJumpsDelay: 500,
    popupOpenDelayAfterLastJump: 800
  },
  /** Override for testing: pass custom breakpoints/root to force a specific background. */
  override: null
};

var popupCanvasConfig = {
  selectors: {
    canvas: '[data-canvas="popup"]'
  },
  char: {
    frames: ['./img/popup/char/frame-1.png', './img/popup/char/frame-2.png', './img/popup/char/frame-3.png'],
    animationTimingFrame: 300
  }
};

function createPopupCanvasController(config, elements) {
  var char = config.char;
  var canvas = elements.canvas;
  var frames = char.frames,
    animationTimingFrame = char.animationTimingFrame;
  var frameIndex = 0;
  var loopStarted = false;
  var timerId = null;
  function drawFullFrame(frames, canvas, frameIndex) {
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var img = new Image();
    img.src = frames[frameIndex];
    img.onload = function () {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  }
  function drawFullFrameLoop() {
    if (loopStarted) return;
    loopStarted = true;
    runLoop();
  }
  function runLoop() {
    drawFullFrame(frames, canvas, frameIndex);
    frameIndex++;
    if (frameIndex >= frames.length) {
      frameIndex = 0;
    }
    timerId = setTimeout(runLoop, animationTimingFrame);
  }
  function stopLoop() {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
    loopStarted = false;
    frameIndex = 0;
  }
  return {
    drawFullFrameLoop: drawFullFrameLoop,
    drawFullFrame: drawFullFrame,
    stopLoop: stopLoop
  };
}

function initPopupCanvas(config) {
  if (!config) return null;
  var selectors = config.selectors;
  var canvasEl = document.querySelector(selectors.canvas);
  if (!canvasEl) return null;
  var controller = createPopupCanvasController(config, {
    canvas: canvasEl
  });
  return {
    drawFullFrameLoop: controller.drawFullFrameLoop,
    stopLoop: controller.stopLoop
  };
}

/**
 * Утиліти та бізнес-логіка сторінки.
 */

function getFadeInPopupConfig(btn, parrent, callbacks) {
  var fadeInClass = '_fade-in';
  var fadeOutClass = '_fade-out';
  var animationName = 'toggleAnimation';
  var popupWrapperEl = parrent.querySelector('.popup__wrapper');
  var firstTitleEl = parrent.querySelectorAll('.popup__title-item')[0];
  var secondTitleEl = parrent.querySelectorAll('.popup__title-item')[1];
  var thirdTitleEl = parrent.querySelectorAll('.popup__subtitle-item')[0];
  var fourthTitleEl = parrent.querySelectorAll('.popup__subtitle-item')[1];
  function showGloabalLink() {
    var globalLinkEl = document.querySelector('.global-link');
    if (globalLinkEl) globalLinkEl.classList.add('_fade-in');
  }
  var steps = [{
    animation: animationName,
    el: parrent,
    addClass: fadeInClass,
    removeClass: fadeOutClass,
    delay: 300,
    callback: function callback() {
      callbacks.drawFullFrameLoop();
      showGloabalLink();
    }
  }, {
    animation: animationName,
    el: popupWrapperEl,
    addClass: fadeInClass,
    removeClass: fadeOutClass,
    delay: 200
  }, {
    animation: animationName,
    el: firstTitleEl,
    addClass: fadeInClass,
    removeClass: fadeOutClass,
    delay: 0
  }, {
    animation: animationName,
    el: secondTitleEl,
    addClass: fadeInClass,
    removeClass: fadeOutClass,
    delay: 500
  }, {
    animation: animationName,
    el: thirdTitleEl,
    addClass: fadeInClass,
    removeClass: fadeOutClass,
    delay: 0
  }, {
    animation: animationName,
    el: fourthTitleEl,
    addClass: fadeInClass,
    removeClass: fadeOutClass,
    delay: 0
  }];
  return {
    beforeStartDelay: 0,
    steps: steps,
    delays: steps.map(function (s) {
      return s.delay;
    })
  };
}
function getPopupCloseConfig() {
  var fadeInClass = '_fade-in';
  var fadeOutClass = '_fade-out';
  var animationName = 'toggleAnimation';
  var popupEl = document.querySelector('.popup');
  return {
    beforeStartDelay: 0,
    steps: [{
      animation: animationName,
      el: popupEl,
      addClass: fadeOutClass,
      removeClass: fadeInClass,
      delay: 200
    }],
    delays: [200]
  };
}

var popupCanvasInstance = null;
function initTest(config) {
  if (!config.root) return;
  var root = config.root;
  var testButtons = [{
    className: 'js-test-open-popup',
    label: 'Відкрити попап',
    onClick: function onClick() {
      var popupEl = document.querySelector('.popup');
      if (!popupEl) return;
      if (popupCanvasInstance) {
        popupCanvasInstance.stopLoop();
      }
      popupCanvasInstance = initPopupCanvas(popupCanvasConfig);
      var callbacks = popupCanvasInstance ? {
        drawFullFrameLoop: popupCanvasInstance.drawFullFrameLoop
      } : {
        drawFullFrameLoop: function drawFullFrameLoop() {}
      };
      initAnimationChaining(getFadeInPopupConfig(null, popupEl, callbacks));
    }
  }, {
    className: 'js-test-close-popup',
    label: 'Закрити попап',
    onClick: function onClick() {
      if (popupCanvasInstance) {
        popupCanvasInstance.stopLoop();
      }
      initAnimationChaining(getPopupCloseConfig());
    }
  }];
  var buttonsMarkup = testButtons.map(function (btn) {
    return "<button class=\"menu-test__btn ".concat(btn.className, "\">").concat(btn.label, "</button>");
  }).join('');
  var markup = "\n    <div class=\"menu-test\">\n      <button class=\"menu-test__btn menu-test__menu-btn js-menu-test-toggle\">Menu</button>\n      <div class=\"menu-test__buttons\">".concat(buttonsMarkup, "</div>\n    </div>\n  ");
  root.insertAdjacentHTML('beforeend', markup);
  var menuTest = root.querySelector('.menu-test');
  var toggleBtn = menuTest.querySelector('.js-menu-test-toggle');
  var buttonsWrap = menuTest.querySelector('.menu-test__buttons');
  toggleBtn.addEventListener('click', function () {
    var isHidden = buttonsWrap.classList.contains('menu-test__buttons_hidden');
    buttonsWrap.classList.toggle('menu-test__buttons_hidden', !isHidden);
  });
  testButtons.forEach(function (btn, i) {
    var el = menuTest.querySelector('.' + btn.className);
    if (el && btn.onClick) el.addEventListener('click', btn.onClick);
  });
}

// test config
var testConfig = {
  root: document.querySelector('.land')
};

// ——— Init & entry point —————————————————————————————————————————————————————
// const fadeInPageConfig = getFadeInPageConfig();

function initPage() {
  {
    initTest(testConfig);
  }
  if (!chickenCanvasConfig.animationChain) {
    chickenCanvasConfig.animationChain = {};
  }
  chickenCanvasConfig.animationChain.onChainComplete = function () {
    try {
      window.scrollTo({
        top: 0
      });
    } catch (e) {
      window.scrollTo(0, 0);
    }
    if (document.body) {
      document.body.style.overflow = 'hidden';
    }
    var popupCanvas = initPopupCanvas(popupCanvasConfig);
    if (!popupCanvas) {
      console.warn('popupCanvas not initialized — canvas element not found');
      return;
    }
    var fadeInPopupConfig = getFadeInPopupConfig(null, document.querySelector('.popup'), {
      drawFullFrameLoop: popupCanvas.drawFullFrameLoop
    });
    initAnimationChaining(fadeInPopupConfig);
  };
  var chickenCanvas = initChickenCanvas(chickenCanvasConfig);
  if (chickenCanvas) {
    if (typeof chickenCanvas.recalcAndRestart === 'function') {
      window.addEventListener('resize', chickenCanvas.recalcAndRestart);
      window.addEventListener('orientationchange', chickenCanvas.recalcAndRestart);
    }
    var initBtn = document.querySelector(chickenCanvasConfig.selectors.initBtn);
    if (initBtn && typeof chickenCanvas.handleInitClick === 'function') {
      initBtn.addEventListener('click', chickenCanvas.handleInitClick);
    }
  }

  //  if (chickenCanvas?.startAnimationChain) {
  //    chickenCanvas.startAnimationChain();
  //  }

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
