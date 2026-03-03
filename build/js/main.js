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
  var x = (canvasWidth - drawWidth) / 2 - 50;
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

/**
 * Отримати значення з breakpoints за viewportWidth. Sorted by maxWidth ascending;
 * first where viewportWidth <= maxWidth.
 */
function getValueFromBreakpoints(breakpoints, key, fallback) {
  var _sorted$find2, _bp$key;
  if (!(breakpoints !== null && breakpoints !== void 0 && breakpoints.length)) return fallback;
  var sorted = _toConsumableArray(breakpoints).sort(function (a, b) {
    var _a$maxWidth3, _b$maxWidth3;
    return ((_a$maxWidth3 = a.maxWidth) !== null && _a$maxWidth3 !== void 0 ? _a$maxWidth3 : Infinity) - ((_b$maxWidth3 = b.maxWidth) !== null && _b$maxWidth3 !== void 0 ? _b$maxWidth3 : Infinity);
  });
  var viewportWidth = window.innerWidth;
  var bp = (_sorted$find2 = sorted.find(function (p) {
    var _p$maxWidth2;
    return viewportWidth <= ((_p$maxWidth2 = p.maxWidth) !== null && _p$maxWidth2 !== void 0 ? _p$maxWidth2 : Infinity);
  })) !== null && _sorted$find2 !== void 0 ? _sorted$find2 : sorted[sorted.length - 1];
  return (_bp$key = bp[key]) !== null && _bp$key !== void 0 ? _bp$key : fallback;
}

/**
 * Позиція коіна відносно char. Перший коін — offsetRight px вправо від char, далі в ряд з gapBetween.
 * По вертикалі — центр land__canvas.
 * Кожен item може мати gapBetweenLeft (відступ зліва) або gapBetweenRight (відступ справа) для кастомного інтервалу.
 */
function getCoinPositionForViewport(coinsConfig, charX, charWidth, index, canvasWidth, canvasHeight, wrapperEl) {
  var _coinsConfig$width, _coinsConfig$height, _getValueFromBreakpoi, _coinsConfig$offsetRi, _coinsConfig$items, _wrapperEl$offsetHeig2;
  var w = (_coinsConfig$width = coinsConfig.width) !== null && _coinsConfig$width !== void 0 ? _coinsConfig$width : 134;
  var h = (_coinsConfig$height = coinsConfig.height) !== null && _coinsConfig$height !== void 0 ? _coinsConfig$height : 172;
  var offsetRight = (_getValueFromBreakpoi = getValueFromBreakpoints(coinsConfig.offsetRightBreakpoints, 'offsetRight', null)) !== null && _getValueFromBreakpoi !== void 0 ? _getValueFromBreakpoi : (_coinsConfig$offsetRi = coinsConfig.offsetRightDefault) !== null && _coinsConfig$offsetRi !== void 0 ? _coinsConfig$offsetRi : 50;
  var gapBetween = getValueFromBreakpoints(coinsConfig.gapBreakpoints, 'gapBetween', 70);
  var items = (_coinsConfig$items = coinsConfig === null || coinsConfig === void 0 ? void 0 : coinsConfig.items) !== null && _coinsConfig$items !== void 0 ? _coinsConfig$items : [];
  var wrapperHeight = (_wrapperEl$offsetHeig2 = wrapperEl === null || wrapperEl === void 0 ? void 0 : wrapperEl.offsetHeight) !== null && _wrapperEl$offsetHeig2 !== void 0 ? _wrapperEl$offsetHeig2 : canvasHeight;
  var y = Math.max(0, Math.min((wrapperHeight - h) / 2, canvasHeight - h));
  var leftEdge = charX + (charWidth !== null && charWidth !== void 0 ? charWidth : 160);
  for (var i = 0; i <= index; i++) {
    var _items$i$gapBetweenLe, _items$i, _ref, _items$i$gapBetweenLe2, _items$i2, _items;
    var gap = i === 0 ? (_items$i$gapBetweenLe = (_items$i = items[i]) === null || _items$i === void 0 ? void 0 : _items$i.gapBetweenLeft) !== null && _items$i$gapBetweenLe !== void 0 ? _items$i$gapBetweenLe : offsetRight : (_ref = (_items$i$gapBetweenLe2 = (_items$i2 = items[i]) === null || _items$i2 === void 0 ? void 0 : _items$i2.gapBetweenLeft) !== null && _items$i$gapBetweenLe2 !== void 0 ? _items$i$gapBetweenLe2 : (_items = items[i - 1]) === null || _items === void 0 ? void 0 : _items.gapBetweenRight) !== null && _ref !== void 0 ? _ref : gapBetween;
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
function drawBarrier(ctx, img, barrierConfig, x, y) {
  ctx.drawImage(img, x, y, barrierConfig.width, barrierConfig.height);
}
function drawCoin(ctx, img, coinsConfig, x, y) {
  ctx.drawImage(img, x, y, coinsConfig.width, coinsConfig.height);
}
function drawChar(ctx, charImg, charConfig, canvasWidth, canvasHeight, wrapperEl) {
  var _getCharPositionForVi = getCharPositionForViewport(charConfig, canvasWidth, canvasHeight, wrapperEl),
    x = _getCharPositionForVi.x,
    y = _getCharPositionForVi.y;
  ctx.drawImage(charImg, x, y, charConfig.width, charConfig.height);
}
function createChickenCanvasController(config, elements) {
  var _charConfig$frames2, _coinsConfig$frames4, _barrierConfig$frames5;
  var wrapperEl = elements.wrapperEl,
    canvasEl = elements.canvasEl;
  var backgroundBreakpoints = config.backgroundBreakpoints,
    _config$switchThresho = config.switchThreshold,
    switchThreshold = _config$switchThresho === void 0 ? 50 : _config$switchThresho,
    canvasBreakpoints = config.canvasBreakpoints,
    charConfig = config.char,
    coinsConfig = config.coins,
    barrierConfig = config.barrier;
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
  var coinStates = ((coinsConfig === null || coinsConfig === void 0 ? void 0 : coinsConfig.items) || []).map(function () {
    return {
      state: 'fade-out',
      frameIndex: 0,
      visible: true
    };
  });
  var coinFrameImages = [];
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
    var _coinsConfig$frames2;
    if (!(coinsConfig !== null && coinsConfig !== void 0 && (_coinsConfig$frames2 = coinsConfig.frames) !== null && _coinsConfig$frames2 !== void 0 && _coinsConfig$frames2.length)) return Promise.resolve();
    return loadCoinFrames(coinsConfig).then(function (imgs) {
      coinFrameImages = imgs;
    });
  }
  function loadBarrierFramesTask() {
    var _barrierConfig$frames2;
    if (!(barrierConfig !== null && barrierConfig !== void 0 && (_barrierConfig$frames2 = barrierConfig.frames) !== null && _barrierConfig$frames2 !== void 0 && _barrierConfig$frames2.length)) return Promise.resolve();
    return loadBarrierFrames(barrierConfig).then(function (imgs) {
      barrierFrameImages = imgs;
    });
  }
  function drawFullFrame() {
    var ctx = canvasEl.getContext('2d');
    if (!ctx || !bgImage || lastCanvasWidth <= 0 || lastCanvasHeight <= 0) return;
    drawBackground(ctx, bgImage, lastBp.rootWidth, lastBp.rootHeight, lastCanvasWidth, lastCanvasHeight);
    var charPos = charConfig ? getCharPositionForViewport(charConfig, lastCanvasWidth, lastCanvasHeight, wrapperEl) : null;
    if (coinsConfig && coinFrameImages.length > 0) {
      coinStates.forEach(function (coin, index) {
        var _charPos$x, _charConfig$width;
        if (!coin.visible) return;
        var _getCoinPositionForVi = getCoinPositionForViewport(coinsConfig, (_charPos$x = charPos === null || charPos === void 0 ? void 0 : charPos.x) !== null && _charPos$x !== void 0 ? _charPos$x : 50, (_charConfig$width = charConfig === null || charConfig === void 0 ? void 0 : charConfig.width) !== null && _charConfig$width !== void 0 ? _charConfig$width : 160, index, lastCanvasWidth, lastCanvasHeight, wrapperEl),
          x = _getCoinPositionForVi.x,
          y = _getCoinPositionForVi.y;
        var frameIdx = coin.state === 'static' ? 0 : coin.frameIndex % coinFrameImages.length;
        var img = coinFrameImages[frameIdx];
        if (img) drawCoin(ctx, img, coinsConfig, x, y);
      });
    }
    if (barrierConfig && coinsConfig && barrierFrameImages.length > 0) {
      barrierStates.forEach(function (barrier, index) {
        var _charPos$x2, _charConfig$width2, _coinsConfig$width2, _barrierConfig$static;
        if (!barrier.visible) return;
        var coinPos = getCoinPositionForViewport(coinsConfig, (_charPos$x2 = charPos === null || charPos === void 0 ? void 0 : charPos.x) !== null && _charPos$x2 !== void 0 ? _charPos$x2 : 50, (_charConfig$width2 = charConfig === null || charConfig === void 0 ? void 0 : charConfig.width) !== null && _charConfig$width2 !== void 0 ? _charConfig$width2 : 160, index, lastCanvasWidth, lastCanvasHeight, wrapperEl);
        var _getBarrierPositionFo = getBarrierPositionForViewport(barrierConfig, coinPos.x, coinPos.y, (_coinsConfig$width2 = coinsConfig === null || coinsConfig === void 0 ? void 0 : coinsConfig.width) !== null && _coinsConfig$width2 !== void 0 ? _coinsConfig$width2 : 134),
          x = _getBarrierPositionFo.x,
          y = _getBarrierPositionFo.y;
        var frameIdx = barrier.state === 'static' ? (_barrierConfig$static = barrierConfig.staticFrameIndex) !== null && _barrierConfig$static !== void 0 ? _barrierConfig$static : 5 : barrier.frameIndex % barrierFrameImages.length;
        var img = barrierFrameImages[frameIdx];
        if (img) drawBarrier(ctx, img, barrierConfig, x, y);
      });
    }
    if (charFrameImages.length > 0 && charConfig) {
      var frameIdx = charState === 'stay' ? 0 : charFrameIndex % charFrameImages.length;
      drawChar(ctx, charFrameImages[frameIdx], charConfig, lastCanvasWidth, lastCanvasHeight, wrapperEl);
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
          if (barrierFadeInTimerId == null) {
            var _barrierConfig$fadeIn;
            var delay = (_barrierConfig$fadeIn = barrierConfig === null || barrierConfig === void 0 ? void 0 : barrierConfig.fadeInFrameDelay) !== null && _barrierConfig$fadeIn !== void 0 ? _barrierConfig$fadeIn : 60;
            barrierFadeInTimerId = window.setTimeout(barrierFadeInLoop, delay);
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
    };
    if (bp.src !== currentBgSrc) {
      loadImage(bp.src).then(function (img) {
        bgImage = img;
        currentBgSrc = bp.src;
        var promises = [];
        if (charConfig && charFrameImages.length === 0) promises.push(loadCharFrames());
        if (coinsConfig && coinFrameImages.length === 0) promises.push(loadCoinFramesTask());
        if (barrierConfig && barrierFrameImages.length === 0) promises.push(loadBarrierFramesTask());
        Promise.all(promises).then(onReady);
        if (promises.length === 0) onReady();
      }).catch(function () {});
    } else if (bgImage) {
      var promises = [];
      if (charConfig && charFrameImages.length === 0) promises.push(loadCharFrames());
      if (coinsConfig && coinFrameImages.length === 0) promises.push(loadCoinFramesTask());
      if (barrierConfig && barrierFrameImages.length === 0) promises.push(loadBarrierFramesTask());
      Promise.all(promises).then(onReady);
      if (promises.length === 0) onReady();
    } else if (charConfig && charFrameImages.length === 0 || coinsConfig && coinFrameImages.length === 0 || barrierConfig && barrierFrameImages.length === 0) {
      var _promises = [];
      if (charConfig && charFrameImages.length === 0) _promises.push(loadCharFrames());
      if (coinsConfig && coinFrameImages.length === 0) _promises.push(loadCoinFramesTask());
      if (barrierConfig && barrierFrameImages.length === 0) _promises.push(loadBarrierFramesTask());
      Promise.all(_promises).then(function () {
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
  if (coinsConfig !== null && coinsConfig !== void 0 && (_coinsConfig$frames4 = coinsConfig.frames) !== null && _coinsConfig$frames4 !== void 0 && _coinsConfig$frames4.length) {
    loadCoinFramesTask();
  }
  if (barrierConfig !== null && barrierConfig !== void 0 && (_barrierConfig$frames5 = barrierConfig.frames) !== null && _barrierConfig$frames5 !== void 0 && _barrierConfig$frames5.length) {
    loadBarrierFramesTask();
  }
  return {
    recalcAndRestart: recalcAndRestart,
    handleInitClick: handleInitClick,
    setCharState: setCharState,
    setCoinFadeOut: setCoinFadeOut
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
    setCharState: controller.setCharState,
    setCoinFadeOut: controller.setCoinFadeOut
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
    height: 1100
  }],
  /** Char — розміри 160×228px, стани stay | jumping. Позиції по брейкпоінтах. */
  char: {
    width: 225,
    height: 322,
    /** Затримка між кадрами jumping (ms) */
    jumpFrameDelay: 80,
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
  },
  /** Coins — 134×172px, стани static | fade-out. В ряд відносно char. */
  coins: {
    width: 134,
    height: 172,
    imagePath: './img/canvas/coin',
    frames: ['./img/canvas/coin/frame-1.png', './img/canvas/coin/frame-2.png'],
    /** Перший коін: offsetRight px вправо від char. offsetRightDefault — fallback коли breakpoints не підходять */
    offsetRightDefault: 40,
    offsetRightBreakpoints: [{
      maxWidth: 600,
      offsetRight: 40
    }, {
      maxWidth: 950,
      offsetRight: 50
    }, {
      maxWidth: Infinity,
      offsetRight: 50
    }],
    /** Відстань між коінами (px). viewportWidth <= maxWidth */
    gapBreakpoints: [{
      maxWidth: 600,
      gapBetween: 60
    }, {
      maxWidth: 950,
      gapBetween: 70
    }, {
      maxWidth: Infinity,
      gapBetween: 80
    }],
    /** Затримка між кадрами fade-out (ms) */
    fadeFrameDelay: 120,
    /** items: { id } + опційно gapBetweenLeft (відступ зліва), gapBetweenRight (відступ справа) */
    items: [{
      id: 0
    }, {
      id: 1
    }, {
      id: 2,
      gapBetweenLeft: 130
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
