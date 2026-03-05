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

/**
 * Chicken canvas — бізнес-логіка.
 * Умови: front/canvas-flow.md
 */

/**
 * Розміри canvas з брейкпоінтів. Якщо bp.isWrapperFill === true — width/height з wrapperEl.
 */
function getCanvasDimensionsFromBreakpoints(sizeBreakpoints, wrapperEl) {
  var sorted = _toConsumableArray(sizeBreakpoints || []).sort(function (a, b) {
    var _a$maxWidth, _b$maxWidth;
    return ((_a$maxWidth = a.maxWidth) !== null && _a$maxWidth !== void 0 ? _a$maxWidth : Infinity) - ((_b$maxWidth = b.maxWidth) !== null && _b$maxWidth !== void 0 ? _b$maxWidth : Infinity);
  });
  var viewportWidth = window.innerWidth;
  for (var i = 0; i < sorted.length; i++) {
    var _bp$maxWidth;
    var bp = sorted[i];
    if (viewportWidth <= ((_bp$maxWidth = bp.maxWidth) !== null && _bp$maxWidth !== void 0 ? _bp$maxWidth : Infinity)) {
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
  var drawWidth = canvasWidth;
  var drawHeight = canvasHeight;
  var x = 0;
  var y = 0;
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
  var _wrapperEl$offsetHeig, _sorted$find, _bp$offsetX, _bp$offsetY;
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
 */
function getMatchedBreakpoint(breakpoints) {
  var _sorted$find2;
  if (!(breakpoints !== null && breakpoints !== void 0 && breakpoints.length)) return null;
  var sorted = _toConsumableArray(breakpoints).sort(function (a, b) {
    var _a$maxWidth3, _b$maxWidth3;
    return ((_a$maxWidth3 = a.maxWidth) !== null && _a$maxWidth3 !== void 0 ? _a$maxWidth3 : Infinity) - ((_b$maxWidth3 = b.maxWidth) !== null && _b$maxWidth3 !== void 0 ? _b$maxWidth3 : Infinity);
  });
  var viewportWidth = window.innerWidth;
  return (_sorted$find2 = sorted.find(function (p) {
    var _p$maxWidth2;
    return viewportWidth <= ((_p$maxWidth2 = p.maxWidth) !== null && _p$maxWidth2 !== void 0 ? _p$maxWidth2 : Infinity);
  })) !== null && _sorted$find2 !== void 0 ? _sorted$find2 : sorted[sorted.length - 1];
}

/**
 * Позиція коіна відносно char. Перший коін — offsetRight px вправо від char, далі в ряд з gapBetween.
 * По вертикалі — центр land__canvas.
 * Кожен item може мати gapBetweenLeft (відступ зліва) або gapBetweenRight (відступ справа) для кастомного інтервалу.
 * У gapBreakpoints можна передати itemGaps: { index: { gapBetweenLeft, gapBetweenRight } } для перевизначення по брейкпоінтах.
 */
function getCoinPositionForViewport(coinsConfig, charX, charWidth, index, canvasWidth, canvasHeight, wrapperEl) {
  var _coinsConfig$width, _coinsConfig$height, _getValueFromBreakpoi, _coinsConfig$offsetRi, _gapBp$gapBetween, _coinsConfig$items, _wrapperEl$offsetHeig2;
  var w = (_coinsConfig$width = coinsConfig.width) !== null && _coinsConfig$width !== void 0 ? _coinsConfig$width : 134;
  var h = (_coinsConfig$height = coinsConfig.height) !== null && _coinsConfig$height !== void 0 ? _coinsConfig$height : 172;
  var offsetRight = (_getValueFromBreakpoi = getValueFromBreakpoints(coinsConfig.offsetRightBreakpoints, 'offsetRight', null)) !== null && _getValueFromBreakpoi !== void 0 ? _getValueFromBreakpoi : (_coinsConfig$offsetRi = coinsConfig.offsetRightDefault) !== null && _coinsConfig$offsetRi !== void 0 ? _coinsConfig$offsetRi : 50;
  var gapBp = getMatchedBreakpoint(coinsConfig.gapBreakpoints);
  var gapBetween = (_gapBp$gapBetween = gapBp === null || gapBp === void 0 ? void 0 : gapBp.gapBetween) !== null && _gapBp$gapBetween !== void 0 ? _gapBp$gapBetween : 70;
  var items = (_coinsConfig$items = coinsConfig === null || coinsConfig === void 0 ? void 0 : coinsConfig.items) !== null && _coinsConfig$items !== void 0 ? _coinsConfig$items : [];
  var wrapperHeight = (_wrapperEl$offsetHeig2 = wrapperEl === null || wrapperEl === void 0 ? void 0 : wrapperEl.offsetHeight) !== null && _wrapperEl$offsetHeig2 !== void 0 ? _wrapperEl$offsetHeig2 : canvasHeight;
  var y = Math.max(0, Math.min((wrapperHeight - h) / 2, canvasHeight - h));
  var leftEdge = charX + (charWidth !== null && charWidth !== void 0 ? charWidth : 225);
  for (var i = 0; i <= index; i++) {
    var _gapBp$itemGaps, _gapBp$itemGaps2, _ref, _itemGap$gapBetweenLe, _items$i, _ref2, _ref3, _ref4, _itemGap$gapBetweenLe2, _items$i2, _items;
    var itemGap = gapBp === null || gapBp === void 0 ? void 0 : (_gapBp$itemGaps = gapBp.itemGaps) === null || _gapBp$itemGaps === void 0 ? void 0 : _gapBp$itemGaps[i];
    var prevItemGap = i > 0 ? gapBp === null || gapBp === void 0 ? void 0 : (_gapBp$itemGaps2 = gapBp.itemGaps) === null || _gapBp$itemGaps2 === void 0 ? void 0 : _gapBp$itemGaps2[i - 1] : null;
    var gap = i === 0 ? (_ref = (_itemGap$gapBetweenLe = itemGap === null || itemGap === void 0 ? void 0 : itemGap.gapBetweenLeft) !== null && _itemGap$gapBetweenLe !== void 0 ? _itemGap$gapBetweenLe : (_items$i = items[i]) === null || _items$i === void 0 ? void 0 : _items$i.gapBetweenLeft) !== null && _ref !== void 0 ? _ref : offsetRight : (_ref2 = (_ref3 = (_ref4 = (_itemGap$gapBetweenLe2 = itemGap === null || itemGap === void 0 ? void 0 : itemGap.gapBetweenLeft) !== null && _itemGap$gapBetweenLe2 !== void 0 ? _itemGap$gapBetweenLe2 : (_items$i2 = items[i]) === null || _items$i2 === void 0 ? void 0 : _items$i2.gapBetweenLeft) !== null && _ref4 !== void 0 ? _ref4 : prevItemGap === null || prevItemGap === void 0 ? void 0 : prevItemGap.gapBetweenRight) !== null && _ref3 !== void 0 ? _ref3 : (_items = items[i - 1]) === null || _items === void 0 ? void 0 : _items.gapBetweenRight) !== null && _ref2 !== void 0 ? _ref2 : gapBetween;
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
  var _barrierConfig$width, _barrierConfig$height, _getValueFromBreakpoi2, _barrierConfig$offset;
  var barrierWidth = (_barrierConfig$width = barrierConfig.width) !== null && _barrierConfig$width !== void 0 ? _barrierConfig$width : 171;
  var barrierHeight = (_barrierConfig$height = barrierConfig.height) !== null && _barrierConfig$height !== void 0 ? _barrierConfig$height : 112;
  var offsetAbove = (_getValueFromBreakpoi2 = getValueFromBreakpoints(barrierConfig.offsetAboveBreakpoints, 'offsetAbove', null)) !== null && _getValueFromBreakpoi2 !== void 0 ? _getValueFromBreakpoi2 : (_barrierConfig$offset = barrierConfig.offsetAboveDefault) !== null && _barrierConfig$offset !== void 0 ? _barrierConfig$offset : 10;
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
  ctx.drawImage(img, x, y, barrierConfig.width, barrierConfig.height);
}
function drawCoin(ctx, img, coinsConfig, x, y) {
  ctx.drawImage(img, x, y, coinsConfig.width, coinsConfig.height);
}
function drawCar(ctx, carImg, x, y, width, height) {
  if (carImg) ctx.drawImage(carImg, x, y, width, height);
}
function drawChar(ctx, charImg, charConfig, canvasWidth, canvasHeight, wrapperEl, overridePosition) {
  var _getCharSize2 = getCharSize(charConfig),
    width = _getCharSize2.width,
    height = _getCharSize2.height;
  var pos = overridePosition !== null && overridePosition !== void 0 ? overridePosition : getCharPositionForViewport(charConfig, canvasWidth, canvasHeight, wrapperEl);
  ctx.drawImage(charImg, pos.x, pos.y, width, height);
}
function createChickenCanvasController(config, elements) {
  var _charConfig$frames2, _coinsConfig$frames4, _barrierConfig$frames5, _carsConfig$variants3;
  var wrapperEl = elements.wrapperEl,
    canvasEl = elements.canvasEl;
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
    var _coinsConfig$width2;
    var charSize = getCharSize(charConfig);
    var pos = getCoinPositionForViewport(coinsConfig, baseCharXForCoins(), charSize.width, coinIndex, lastCanvasWidth, lastCanvasHeight, wrapperEl);
    return pos.x + ((_coinsConfig$width2 = coinsConfig === null || coinsConfig === void 0 ? void 0 : coinsConfig.width) !== null && _coinsConfig$width2 !== void 0 ? _coinsConfig$width2 : 134) / 2;
  }
  function getCoinCenterAsCharLeft(coinIndex) {
    var charSize = getCharSize(charConfig);
    var centerX = getCoinCenterX(coinIndex);
    return centerX - charSize.width / 2;
  }
  function baseCharXForCoins() {
    var _x, _ref5, _initialCharPosition;
    return (_x = (_ref5 = (_initialCharPosition = initialCharPosition) !== null && _initialCharPosition !== void 0 ? _initialCharPosition : charConfig ? getCharPositionForViewport(charConfig, lastCanvasWidth, lastCanvasHeight, wrapperEl) : null) === null || _ref5 === void 0 ? void 0 : _ref5.x) !== null && _x !== void 0 ? _x : 50;
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
        chainActive = false;
      }
    };
    if (betweenDelay > 0) {
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
    var _coinsConfig$width3;
    var charSize = getCharSize(charConfig);
    var pos = getCoinPositionForViewport(coinsConfig, baseCharXForCoins(), charSize.width, coinIndex, lastCanvasWidth, lastCanvasHeight, wrapperEl);
    return pos.x + ((_coinsConfig$width3 = coinsConfig === null || coinsConfig === void 0 ? void 0 : coinsConfig.width) !== null && _coinsConfig$width3 !== void 0 ? _coinsConfig$width3 : 134) / 2;
  }
  function getCarStartY(carHeight) {
    var _carsConfig$offsetAbo;
    var offset = (_carsConfig$offsetAbo = carsConfig === null || carsConfig === void 0 ? void 0 : carsConfig.offsetAboveCanvas) !== null && _carsConfig$offsetAbo !== void 0 ? _carsConfig$offsetAbo : 20;
    return -carHeight - offset;
  }
  function getCarFadeInTargetY(coinIndex, carHeight) {
    var _coinsConfig$width4, _carsConfig$stopBefor;
    var coinPos = getCoinPositionForViewport(coinsConfig, baseCharXForCoins(), getCharSize(charConfig).width, coinIndex, lastCanvasWidth, lastCanvasHeight, wrapperEl);
    var _getBarrierPositionFo = getBarrierPositionForViewport(barrierConfig, coinPos.x, coinPos.y, (_coinsConfig$width4 = coinsConfig === null || coinsConfig === void 0 ? void 0 : coinsConfig.width) !== null && _coinsConfig$width4 !== void 0 ? _coinsConfig$width4 : 134),
      barrierY = _getBarrierPositionFo.y;
    var stopBefore = (_carsConfig$stopBefor = carsConfig === null || carsConfig === void 0 ? void 0 : carsConfig.stopBeforeBarrier) !== null && _carsConfig$stopBefor !== void 0 ? _carsConfig$stopBefor : 20;
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
    var variant = pickRandomCarVariant(carVariantImages);
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
    var variant = pickRandomCarVariant(carVariantImages);
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
    var _x2, _ref6, _initialCharPosition2;
    var ctx = canvasEl.getContext('2d');
    if (!ctx || !bgImage || lastCanvasWidth <= 0 || lastCanvasHeight <= 0) return;
    drawBackground(ctx, bgImage, lastBp.rootWidth, lastBp.rootHeight, lastCanvasWidth, lastCanvasHeight);
    var charSize = charConfig ? getCharSize(charConfig) : {
      width: 225};
    var charPos = charConfig ? getCharPositionForViewport(charConfig, lastCanvasWidth, lastCanvasHeight, wrapperEl) : null;
    var baseCharX = (_x2 = (_ref6 = (_initialCharPosition2 = initialCharPosition) !== null && _initialCharPosition2 !== void 0 ? _initialCharPosition2 : charPos) === null || _ref6 === void 0 ? void 0 : _ref6.x) !== null && _x2 !== void 0 ? _x2 : 50;
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
        var _coinsConfig$width5, _barrierConfig$static;
        if (!barrier.visible) return;
        var coinPos = getCoinPositionForViewport(coinsConfig, baseCharX, charSize.width, index, lastCanvasWidth, lastCanvasHeight, wrapperEl);
        var _getBarrierPositionFo2 = getBarrierPositionForViewport(barrierConfig, coinPos.x, coinPos.y, (_coinsConfig$width5 = coinsConfig === null || coinsConfig === void 0 ? void 0 : coinsConfig.width) !== null && _coinsConfig$width5 !== void 0 ? _coinsConfig$width5 : 134),
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
    this.classList.add('_disabled');
  }
  function startAnimationChain() {
    if (!charConfig || !coinsConfig || lastCanvasWidth <= 0 || lastCanvasHeight <= 0) return;
    if (coinStates.length === 0) return;
    var combos = getValidFadeInCombos();
    chainFadeInCombo = new Set(combos[Math.floor(Math.random() * combos.length)]);
    initialCharPosition = getCharPositionForViewport(charConfig, lastCanvasWidth, lastCanvasHeight, wrapperEl);
    charOverridePosition = _objectSpread2({}, initialCharPosition);
    chainActive = true;
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
  var effectiveConfig = config;
  var selectors = effectiveConfig.selectors;
  var wrapperEl = document.querySelector(selectors.wrapper);
  var landLeftEl = document.querySelector(selectors.landLeft);
  var canvasEl = document.querySelector(selectors.canvas);
  document.querySelector(selectors.initBtn);
  if (!wrapperEl || !landLeftEl || !canvasEl) return null;
  var controller = createChickenCanvasController(effectiveConfig, {
    wrapperEl: wrapperEl,
    canvasEl: canvasEl});
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
  /** Canvas size by breakpoint. Sorted by maxWidth ascending; first where viewportWidth <= maxWidth applies. isWrapperFill: true — розмір з wrapper (.land__canvas). */
  canvasBreakpoints: [{
    maxWidth: 1700,
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
    width: 225,
    height: 322,
    /** viewportWidth <= maxWidth. Зміни розміру тільки через sizeBreakpoints. */
    // sizeBreakpoints: [{ maxWidth: 600, width: 200, height: 286 }, ...],
    /** Затримка між кадрами jumping (ms) */
    jumpFrameDelay: 80,
    frames: ['./img/canvas/char/frame-1.png', './img/canvas/char/frame-2.png', './img/canvas/char/frame-3.png', './img/canvas/char/frame-4.png', './img/canvas/char/frame-5.png', './img/canvas/char/frame-6.png', './img/canvas/char/frame-7.png', './img/canvas/char/frame-8.png', './img/canvas/char/frame-9.png', './img/canvas/char/frame-10.png'],
    /** viewportWidth <= maxWidth. default: offsetX 50, centerY true */
    breakpoints: [{
      maxWidth: 1750,
      offsetX: 70
    }, {
      maxWidth: Infinity,
      offsetX: 100
    }]
  },
  /** Coins — 134×172px, стани static | fade-out. В ряд відносно char. static — static.png з папки. */
  coins: {
    width: 134,
    height: 172,
    imagePath: './img/canvas/coin',
    staticFrame: './img/canvas/coin/static.png',
    frames: ['./img/canvas/coin/frame-1.png', './img/canvas/coin/frame-2.png'],
    /** Перший коін: offsetRight px вправо від char. offsetRightDefault — fallback коли breakpoints не підходять */
    offsetRightDefault: 70,
    offsetRightBreakpoints: [{
      maxWidth: 1700,
      offsetRight: 20
    }, {
      maxWidth: Infinity,
      offsetRight: 40
    }],
    /** Відстань між коінами (px). viewportWidth <= maxWidth. itemGaps: { index: { gapBetweenLeft, gapBetweenRight } } */
    gapBreakpoints: [{
      maxWidth: 1700,
      gapBetween: 30,
      itemGaps: {
        2: {
          gapBetweenLeft: 40
        }
      }
    }, {
      maxWidth: Infinity,
      gapBetween: 70,
      itemGaps: {
        2: {
          gapBetweenLeft: 50
        }
      }
    }],
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
    width: 171,
    height: 112,
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
    betweenJumpsDelay: 500
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
