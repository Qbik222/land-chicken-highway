function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function getSizesForWidth(cfg, winWidth) {
  var w = cfg.width;
  var h = cfg.height;
  if (cfg.breakpoints && cfg.breakpoints.length) {
    for (var i = 0; i < cfg.breakpoints.length; i++) {
      var bp = cfg.breakpoints[i];
      if (winWidth <= bp.maxWidth) {
        w = bp.width;
        h = bp.height;
        break;
      }
    }
  }
  return {
    width: w,
    height: h
  };
}
function loadImages(elementDrawConfig, winWidth) {
  var result = new Map();
  var promises = [];
  var _loop = function _loop() {
    var cfg = elementDrawConfig[i];
    var sizes = getSizesForWidth(cfg, winWidth);
    var p = new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        result.set(cfg.className, {
          img: img,
          width: sizes.width,
          height: sizes.height
        });
        resolve();
      };
      img.onerror = reject;
      img.src = cfg.imageSrc;
    });
    promises.push(p);
  };
  for (var i = 0; i < elementDrawConfig.length; i++) {
    _loop();
  }
  return Promise.all(promises).then(function () {
    return result;
  });
}
function countByClassName(activeElements, className) {
  var count = 0;
  for (var i = 0; i < activeElements.length; i++) {
    if (activeElements[i].className === className) count++;
  }
  return count;
}
function countClouds(activeElements) {
  var count = 0;
  for (var i = 0; i < activeElements.length; i++) {
    var c = activeElements[i].className;
    if (c === 'cloud-penta' || c === 'cloud-row') count++;
  }
  return count;
}
function getAvailableTypes(activeElements, elementConfig) {
  return elementConfig.filter(function (cfg) {
    var count = countByClassName(activeElements, cfg.className);
    return count < cfg.limit;
  });
}
function isGoneForever(d, skyW, skyH) {
  var hw = d.w / 2;
  var hh = d.h / 2;
  var right = d.x + hw;
  var top = d.y - hh;
  var bottom = d.y + hh;
  return right < 0 || top > skyH || bottom < 0;
}
function createCanvas(skyEl, canvasSizeMultiplier) {
  var mul = canvasSizeMultiplier !== undefined ? canvasSizeMultiplier : 1.4;
  var canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  var baseW = skyEl.offsetWidth;
  var baseH = skyEl.offsetHeight;
  canvas.width = Math.ceil(baseW * mul);
  canvas.height = Math.ceil(baseH * mul);
  skyEl.appendChild(canvas);
  return canvas;
}
function initSky(config) {
  var _ref = config || {},
    _ref$selector = _ref.selector,
    selector = _ref$selector === void 0 ? '.sky' : _ref$selector,
    _ref$spawnIntervalMs = _ref.spawnIntervalMs,
    spawnIntervalMs = _ref$spawnIntervalMs === void 0 ? 1000 : _ref$spawnIntervalMs,
    _ref$angleMin = _ref.angleMin,
    angleMin = _ref$angleMin === void 0 ? -30 : _ref$angleMin,
    _ref$angleMax = _ref.angleMax,
    angleMax = _ref$angleMax === void 0 ? 30 : _ref$angleMax,
    _ref$baseSpeed = _ref.baseSpeed,
    baseSpeed = _ref$baseSpeed === void 0 ? 0.8 : _ref$baseSpeed,
    _ref$elementConfig = _ref.elementConfig,
    elementConfig = _ref$elementConfig === void 0 ? [] : _ref$elementConfig,
    _ref$elementDrawConfi = _ref.elementDrawConfig,
    elementDrawConfig = _ref$elementDrawConfi === void 0 ? [] : _ref$elementDrawConfi,
    _ref$canvasSizeMultip = _ref.canvasSizeMultiplier,
    canvasSizeMultiplier = _ref$canvasSizeMultip === void 0 ? 1.4 : _ref$canvasSizeMultip;
  var activeElements = [];
  var updateIntervalId = null;
  var spawnTimerId = null;
  var lastTime = null;
  var canvas = null;
  var ctx = null;
  var imageMap = null;
  var skyEl = null;
  var resizeObserver = null;
  var UPDATE_INTERVAL_MS = 16;
  function getImageData(className) {
    if (!imageMap) return null;
    return imageMap.get(className);
  }
  function spawnElement() {
    var available = getAvailableTypes(activeElements, elementConfig);
    if (available.length === 0) return;
    if (countClouds(activeElements) === 0) {
      available = available.filter(function (cfg) {
        return cfg.type === 'cloud-penta' || cfg.type === 'cloud-row';
      });
      if (available.length === 0) return;
    }
    var cfg = pickRandom(available);
    var imgData = getImageData(cfg.className);
    if (!imgData) return;
    var elemSpeed = cfg.speed !== undefined ? cfg.speed : baseSpeed;
    var angle = randomInRange(angleMin, angleMax);
    var speed = elemSpeed * randomInRange(0.7, 1.3) * 60;
    var slopeAngle = randomInRange(5, 15) * (Math.PI / 180);
    var vx = -speed;
    var vy = speed * Math.tan(slopeAngle);
    var skyW = canvas ? canvas.width : 0;
    var skyH = canvas ? canvas.height : 0;
    var startX = skyW + 150;
    var startY = randomInRange(-150, skyH - 50);
    activeElements.push({
      img: imgData.img,
      x: startX,
      y: startY,
      angle: angle,
      vx: vx,
      vy: vy,
      w: imgData.width,
      h: imgData.height,
      type: cfg.type,
      className: cfg.className
    });
    // console.log('Sky spawn:', selector, cfg.className, 'total:', activeElements.length);
  }

  function updateAndRender(now) {
    if (!canvas || !ctx) return;
    if (lastTime === null) lastTime = now;
    var dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    var skyW = canvas.width;
    var skyH = canvas.height;
    var toRemove = [];
    for (var i = 0; i < activeElements.length; i++) {
      var d = activeElements[i];
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      if (isGoneForever(d, skyW, skyH)) {
        toRemove.push(i);
      }
    }
    for (var j = toRemove.length - 1; j >= 0; j--) {
      activeElements.splice(toRemove[j], 1);
    }
    ctx.clearRect(0, 0, skyW, skyH);
    for (var _i = 0; _i < activeElements.length; _i++) {
      var _d = activeElements[_i];
      ctx.save();
      ctx.translate(_d.x, _d.y);
      ctx.rotate(_d.angle * Math.PI / 180);
      ctx.drawImage(_d.img, -_d.w / 2, -_d.h / 2, _d.w, _d.h);
      ctx.restore();
    }
  }
  function skyStart() {
    if (!skyEl || !canvas || !ctx || !imageMap || updateIntervalId) return;
    lastTime = null;
    updateIntervalId = setInterval(function () {
      updateAndRender(performance.now());
    }, UPDATE_INTERVAL_MS);
    spawnTimerId = setInterval(function () {
      spawnElement();
    }, spawnIntervalMs);
    spawnElement();
  }
  function skyStop() {
    if (spawnTimerId) {
      clearInterval(spawnTimerId);
      spawnTimerId = null;
    }
    if (updateIntervalId) {
      clearInterval(updateIntervalId);
      updateIntervalId = null;
    }
    lastTime = null;
    activeElements = [];
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  function resizeCanvas() {
    if (!canvas || !skyEl) return;
    var baseW = skyEl.offsetWidth;
    var baseH = skyEl.offsetHeight;
    var w = Math.ceil(baseW * canvasSizeMultiplier);
    var h = Math.ceil(baseH * canvasSizeMultiplier);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }
  skyEl = document.querySelector(selector);
  if (!skyEl) return;
  canvas = createCanvas(skyEl, canvasSizeMultiplier);
  ctx = canvas.getContext('2d');
  var winWidth = window.innerWidth;
  loadImages(elementDrawConfig, winWidth).then(function (loadedMap) {
    imageMap = loadedMap;
    resizeCanvas();
    skyStart();
    resizeObserver = new ResizeObserver(function () {
      resizeCanvas();
    });
    resizeObserver.observe(skyEl);
    if (typeof document.hidden !== 'undefined') {
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
          skyStop();
        } else {
          skyStart();
        }
      });
    }
  }).catch(function (err) {
    console.error('Sky animation: failed to load images', err);
  });
}

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

function _typeof(obj) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, _typeof(obj);
}

function loadParticleImage(src) {
  return new Promise(function (resolve, reject) {
    var img = new Image();
    img.onload = function () {
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}
function initSmokeTrail(canvas, config, particleImg) {
  var smokeCfg = config.smokeTail || {};
  var particleCount = smokeCfg.particleCount !== undefined ? smokeCfg.particleCount : 25;
  var particleSpeed = smokeCfg.particleSpeed !== undefined ? smokeCfg.particleSpeed : 80;
  var particleSizePercent = smokeCfg.particleSizePercent !== undefined ? smokeCfg.particleSizePercent : 6.4;
  var renderDelay = smokeCfg.renderDelay !== undefined ? smokeCfg.renderDelay : 0;
  var spawnInterval = smokeCfg.spawnInterval !== undefined ? smokeCfg.spawnInterval : 50;
  var ctx = canvas.getContext('2d');
  var particles = [];
  var lastTime = null;
  var lastSpawnTime = null;
  var rafId = null;
  var renderDelayTimeoutId = null;
  var currentParticleSize = {
    width: 24,
    height: 24
  };
  function resizeCanvas() {
    var parent = canvas.parentElement;
    if (!parent) return;
    var w = parent.offsetWidth;
    var h = parent.offsetHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }
  function createParticle(innerLeft, innerRight, innerTop, innerBottom) {
    var spreadX = Math.random() * (innerRight - innerLeft) * 0.3;
    var spreadY = Math.random() * (innerBottom - innerTop) * 0.2;
    return {
      x: innerRight - spreadX,
      y: innerTop + spreadY,
      vx: -particleSpeed * (0.8 + Math.random() * 0.4),
      vy: particleSpeed * (0.3 + Math.random() * 0.4),
      opacity: 0.7 + Math.random() * 0.3,
      w: currentParticleSize.width,
      h: currentParticleSize.height
    };
  }
  function updateAndRender(now) {
    if (!ctx || !particleImg || canvas.width === 0 || canvas.height === 0) return;
    if (lastTime === null) lastTime = now;
    var dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    var w = canvas.width;
    var h = canvas.height;
    var sizePx = w * (particleSizePercent / 100);
    currentParticleSize = {
      width: sizePx,
      height: sizePx
    };
    var padding = Math.max(currentParticleSize.width, currentParticleSize.height) + 10;
    var innerLeft = padding;
    var innerRight = w - padding;
    var innerTop = padding;
    var innerBottom = h - padding;
    if (particles.length < particleCount && (lastSpawnTime === null || now - lastSpawnTime >= spawnInterval)) {
      lastSpawnTime = now;
      var spawnCount = Math.min(2, particleCount - particles.length);
      for (var i = 0; i < spawnCount; i++) {
        particles.push(createParticle(innerLeft, innerRight, innerTop, innerBottom));
      }
    }
    for (var _i = 0; _i < particles.length; _i++) {
      var p = particles[_i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      var distToBottomLeft = Math.sqrt(p.x * p.x + (h - p.y) * (h - p.y));
      var maxDist = Math.sqrt(w * w + h * h);
      p.opacity = Math.max(0, distToBottomLeft / maxDist * 0.85);
      if (p.x < innerLeft || p.x > innerRight || p.y < innerTop || p.y > innerBottom || p.opacity <= 0.01) {
        var spreadX = Math.random() * (innerRight - innerLeft) * 0.3;
        var spreadY = Math.random() * (innerBottom - innerTop) * 0.2;
        p.x = innerRight - spreadX;
        p.y = innerTop + spreadY;
        p.vx = -particleSpeed * (0.8 + Math.random() * 0.4);
        p.vy = particleSpeed * (0.3 + Math.random() * 0.4);
        p.opacity = 0.7 + Math.random() * 0.3;
      }
    }
    ctx.clearRect(0, 0, w, h);
    for (var _i2 = 0; _i2 < particles.length; _i2++) {
      var _p = particles[_i2];
      ctx.save();
      ctx.globalAlpha = _p.opacity;
      ctx.drawImage(particleImg, _p.x - _p.w / 2, _p.y - _p.h / 2, _p.w, _p.h);
      ctx.restore();
    }
  }
  function startRender() {
    lastTime = null;
    function tick(now) {
      updateAndRender(now);
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
  }
  function start() {
    resizeCanvas();
    particles = [];
    lastSpawnTime = null;
    if (renderDelay > 0) {
      renderDelayTimeoutId = setTimeout(function () {
        renderDelayTimeoutId = null;
        startRender();
      }, renderDelay);
    } else {
      startRender();
    }
  }
  function stop() {
    if (renderDelayTimeoutId) {
      clearTimeout(renderDelayTimeoutId);
      renderDelayTimeoutId = null;
    }
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    lastTime = null;
    lastSpawnTime = null;
    particles = [];
    if (ctx && canvas.width > 0 && canvas.height > 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  return {
    start: start,
    stop: stop,
    resize: resizeCanvas
  };
}
function initAirplaneFly(config) {
  var cfg = config || {};
  var wrapSelector = cfg.wrapSelector || '.airplane-fly-wrap';
  var scaleWrapSelector = cfg.scaleWrapSelector || '.airplane-fly-scale-wrap';
  var canvasSelector = cfg.canvasSelector || '.airplane__smoke-tail';
  var smokeTail = cfg.smokeTail || {};

  // Дефолтний конфіг для всіх параметрів польоту
  var defaultConfig = {
    baseFlySpeed: 120,
    increaseFlySpeed: 200,
    speedAccelDuration: 500,
    trajectoryAngleDeg: -35,
    changeSizeDelay: 2000,
    scaleToSpeedDelay: 0,
    flyScale: 0.6,
    scaleTransitionDuration: 0.4,
    scaleTransitionTiming: 'ease'
  };

  // Активний стан параметрів, залежних від конфігу.
  var state = {
    baseFlySpeed: defaultConfig.baseFlySpeed,
    targetFlySpeed: defaultConfig.increaseFlySpeed,
    speedAccelDuration: defaultConfig.speedAccelDuration,
    angleRad: defaultConfig.trajectoryAngleDeg * Math.PI / 180,
    changeSizeDelay: defaultConfig.changeSizeDelay,
    scaleToSpeedDelay: defaultConfig.scaleToSpeedDelay,
    flyScale: defaultConfig.flyScale,
    scaleTransitionDuration: defaultConfig.scaleTransitionDuration,
    scaleTransitionTiming: defaultConfig.scaleTransitionTiming
  };
  function applyConfigFromCfg() {
    var angleDeg = cfg.trajectoryAngleDeg !== undefined ? cfg.trajectoryAngleDeg : defaultConfig.trajectoryAngleDeg;
    state.baseFlySpeed = cfg.baseFlySpeed !== undefined ? cfg.baseFlySpeed : defaultConfig.baseFlySpeed;
    state.targetFlySpeed = cfg.increaseFlySpeed !== undefined ? cfg.increaseFlySpeed : defaultConfig.increaseFlySpeed;
    state.speedAccelDuration = cfg.speedAccelDuration !== undefined ? cfg.speedAccelDuration : defaultConfig.speedAccelDuration;
    state.angleRad = angleDeg * Math.PI / 180;
    state.changeSizeDelay = cfg.changeSizeDelay !== undefined ? cfg.changeSizeDelay : defaultConfig.changeSizeDelay;
    state.scaleToSpeedDelay = cfg.scaleToSpeedDelay !== undefined ? cfg.scaleToSpeedDelay : defaultConfig.scaleToSpeedDelay;
    state.flyScale = cfg.flyScale !== undefined ? cfg.flyScale : defaultConfig.flyScale;
    state.scaleTransitionDuration = cfg.scaleTransitionDuration !== undefined ? cfg.scaleTransitionDuration : defaultConfig.scaleTransitionDuration;
    state.scaleTransitionTiming = cfg.scaleTransitionTiming !== undefined ? cfg.scaleTransitionTiming : defaultConfig.scaleTransitionTiming;
  }

  // Стартове застосування конфігу
  applyConfigFromCfg();
  var wrapEl = null;
  var scaleWrapEl = null;
  var canvasEl = null;
  var smokeTrail = null;
  var moveRafId = null;
  var scaleTimeoutId = null;
  var speedIncreaseTimeoutId = null;
  var posX = 0;
  var posY = 0;
  var lastTime = null;
  var speedAccelStartTime = null;
  var vx = state.baseFlySpeed * Math.cos(state.angleRad);
  var vy = state.baseFlySpeed * Math.sin(state.angleRad);
  function easeInQuad(t) {
    return t * t;
  }
  function isFullyOffScreen() {
    if (!wrapEl) return false;
    var rect = wrapEl.getBoundingClientRect();
    return rect.right < 0 || rect.left > window.innerWidth || rect.bottom < 0 || rect.top > window.innerHeight;
  }
  function updatePosition(now) {
    if (!wrapEl) return;
    if (lastTime === null) lastTime = now;
    var dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    if (speedAccelStartTime !== null) {
      var elapsed = now - speedAccelStartTime;
      var angleRad = state.angleRad;
      if (elapsed >= state.speedAccelDuration) {
        speedAccelStartTime = null;
        vx = state.targetFlySpeed * Math.cos(angleRad);
        vy = state.targetFlySpeed * Math.sin(angleRad);
      } else {
        var t = elapsed / state.speedAccelDuration;
        var easeT = easeInQuad(t);
        var speed = state.baseFlySpeed + (state.targetFlySpeed - state.baseFlySpeed) * easeT;
        vx = speed * Math.cos(angleRad);
        vy = speed * Math.sin(angleRad);
      }
    }
    posX += vx * dt;
    posY += vy * dt;
    if (isFullyOffScreen()) {
      stopFly();
      return;
    }
    wrapEl.style.transform = 'translate(' + posX + 'px, ' + posY + 'px)';
  }
  function applyScale() {
    if (scaleWrapEl) {
      scaleWrapEl.style.transition = 'transform ' + state.scaleTransitionDuration + 's ' + state.scaleTransitionTiming;
      scaleWrapEl.style.transform = 'scale(' + state.flyScale + ')';
    }
    if (state.scaleToSpeedDelay > 0) {
      speedIncreaseTimeoutId = setTimeout(applySpeedIncrease, state.scaleToSpeedDelay);
    } else {
      applySpeedIncrease();
    }
  }
  function applySpeedIncrease() {
    if (state.speedAccelDuration > 0) {
      speedAccelStartTime = performance.now();
    } else {
      var angleRad = state.angleRad;
      vx = state.targetFlySpeed * Math.cos(angleRad);
      vy = state.targetFlySpeed * Math.sin(angleRad);
    }
  }
  function startFly() {
    wrapEl = document.querySelector(wrapSelector);
    scaleWrapEl = wrapEl ? wrapEl.querySelector(scaleWrapSelector) : null;
    canvasEl = document.querySelector(canvasSelector);
    if (!wrapEl) return;
    posX = 0;
    posY = 0;
    speedAccelStartTime = null;
    lastTime = null;

    // Оновлюємо стартову швидкість відповідно до поточного стану конфігу
    var angleRad = state.angleRad;
    vx = state.baseFlySpeed * Math.cos(angleRad);
    vy = state.baseFlySpeed * Math.sin(angleRad);

    // wrapEl.style.transition = 'none';
    wrapEl.style.transform = 'translate(0px, 0px)';
    if (scaleWrapEl) {
      // scaleWrapEl.style.transition = '';
      scaleWrapEl.style.transform = 'scale(1)';
    }
    var particleSrc = smokeTail.particleImageSrc || '../img/smoke-particle.png';
    if (canvasEl) {
      loadParticleImage(particleSrc).then(function (img) {
        smokeTrail = initSmokeTrail(canvasEl, cfg, img);
        smokeTrail.start();
        var resizeObserver = new ResizeObserver(function () {
          if (smokeTrail) smokeTrail.resize();
        });
        resizeObserver.observe(canvasEl.parentElement);
      }).catch(function () {
        if (canvasEl) {
          var fallbackImg = document.createElement('canvas');
          fallbackImg.width = 24;
          fallbackImg.height = 24;
          var fCtx = fallbackImg.getContext('2d');
          if (fCtx) {
            fCtx.fillStyle = 'rgba(200,200,200,0.5)';
            fCtx.beginPath();
            fCtx.arc(12, 12, 10, 0, Math.PI * 2);
            fCtx.fill();
          }
          smokeTrail = initSmokeTrail(canvasEl, cfg, fallbackImg);
          smokeTrail.start();
        }
      });
    }
    function tick(now) {
      updatePosition(now);
      moveRafId = requestAnimationFrame(tick);
    }
    moveRafId = requestAnimationFrame(tick);
    if (state.changeSizeDelay > 0) {
      scaleTimeoutId = setTimeout(applyScale, state.changeSizeDelay);
    }
  }
  function stopFly() {
    if (scaleTimeoutId) {
      clearTimeout(scaleTimeoutId);
      scaleTimeoutId = null;
    }
    if (speedIncreaseTimeoutId) {
      clearTimeout(speedIncreaseTimeoutId);
      speedIncreaseTimeoutId = null;
    }
    if (moveRafId !== null) {
      cancelAnimationFrame(moveRafId);
      moveRafId = null;
    }
    if (smokeTrail && smokeTrail.stop) {
      smokeTrail.stop();
    }
    smokeTrail = null;
    lastTime = null;
  }
  function updateConfig(partial) {
    if (partial && _typeof(partial) === 'object') {
      Object.assign(cfg, partial);
      applyConfigFromCfg();
    }
  }
  return {
    start: function start() {
      startFly();
    },
    updateConfig: updateConfig
  };
}

function initTest(root, getFadeOutPopupConfig, getPopupCloseConfig, getPopupOpenChunkConfig) {
  if (!root) return;
  var testButtons = [
  // { className: 'js-menu-test-open', label: 'Відкрити попап', onClick: function () { initAnimationChaining(getFadeOutPopupConfig(null)); } },
  {
    className: 'js-menu-test-close',
    label: 'Закрити попап',
    onClick: function onClick() {
      initAnimationChaining(getPopupCloseConfig());
    }
  }, {
    className: 'js-menu-test-popup-chunk',
    label: 'Popup open chunk',
    onClick: function onClick() {
      initAnimationChaining(getPopupOpenChunkConfig());
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

var MOBILE_BREAKPOINT = 1050;
var IS_PAGE_POPUP_ANIMATION = false;
var IS_MOBILE_PORTRAIT = window.innerWidth < 600 && window.innerHeight > window.innerWidth;
var trajectoryAngleDeg = IS_MOBILE_PORTRAIT ? -60 : -10;

//-- set popup animation toggler (called when initial fade-in ends)
function setPopupAnimationToggler() {
  IS_PAGE_POPUP_ANIMATION = !IS_PAGE_POPUP_ANIMATION;
  var popupBtn = document.querySelector('.land__btn[data-popup="popup"]');
  if (popupBtn) popupBtn.style.pointerEvents = 'initial';
  var animLayerEl = document.querySelector('.land__anim-layer');
  if (animLayerEl) animLayerEl.classList.add('_fade-in-btn');
}

// ——— Sky / Parallax configs —————————————————————————————————————————————————
var elementDrawConfig = [{
  type: 'cloud-penta',
  className: 'cloud-penta',
  imageSrc: 'img/cloud-penta.png',
  width: 490,
  height: 490,
  breakpoints: [{
    maxWidth: MOBILE_BREAKPOINT,
    width: 245,
    height: 245
  }]
}, {
  type: 'cloud-row',
  className: 'cloud-row',
  imageSrc: 'img/cloud-row.png',
  width: 760,
  height: 270,
  breakpoints: [{
    maxWidth: MOBILE_BREAKPOINT,
    width: 380,
    height: 135
  }]
}, {
  type: 'coin',
  className: 'coin-1',
  imageSrc: 'img/coin-1.png',
  width: 170,
  height: 130,
  breakpoints: [{
    maxWidth: MOBILE_BREAKPOINT,
    width: 85,
    height: 65
  }]
}, {
  type: 'coin',
  className: 'coin-2',
  imageSrc: 'img/coin-2.png',
  width: 170,
  height: 130,
  breakpoints: [{
    maxWidth: MOBILE_BREAKPOINT,
    width: 85,
    height: 65
  }]
}, {
  type: 'money',
  className: 'money-1',
  imageSrc: 'img/money-1.png',
  width: 270,
  height: 130,
  breakpoints: [{
    maxWidth: MOBILE_BREAKPOINT,
    width: 135,
    height: 65
  }]
}, {
  type: 'money',
  className: 'money-2',
  imageSrc: 'img/money-2.png',
  width: 145,
  height: 90,
  breakpoints: [{
    maxWidth: MOBILE_BREAKPOINT,
    width: 72,
    height: 45
  }]
}];
var baseElementConfig = [{
  type: 'cloud-penta',
  className: 'cloud-penta',
  limit: 4,
  speed: 1.5
}, {
  type: 'coin',
  className: 'coin-1',
  limit: 2
}, {
  type: 'coin',
  className: 'coin-2',
  limit: 2
}, {
  type: 'money',
  className: 'money-1',
  limit: 2
}, {
  type: 'money',
  className: 'money-2',
  limit: 2
}, {
  type: 'cloud-row',
  className: 'cloud-row',
  limit: 2,
  speed: 1.4
}];
function splitElementConfig(config) {
  var foreground = config.map(function (cfg) {
    var total = Math.round(cfg.limit * 1.5);
    var fg = Math.ceil(total / 2);
    var item = {
      type: cfg.type,
      className: cfg.className,
      limit: fg
    };
    if (cfg.speed !== undefined) item.speed = cfg.speed;
    return item;
  });
  var background = config.map(function (cfg) {
    var total = Math.round(cfg.limit * 1.5);
    var bg = Math.floor(total / 2);
    var item = {
      type: cfg.type,
      className: cfg.className,
      limit: bg
    };
    if (cfg.speed !== undefined) item.speed = cfg.speed;
    return item;
  });
  return {
    foreground: foreground,
    background: background
  };
}
var skyConfigs = function () {
  var split = splitElementConfig(baseElementConfig);
  var base = {
    spawnIntervalMs: 1000,
    angleMin: -30,
    angleMax: 30,
    baseSpeed: 9.8,
    canvasSizeMultiplier: 1.4,
    elementDrawConfig: elementDrawConfig
  };
  return {
    background: Object.assign({
      selector: '.sky--background',
      elementConfig: split.background
    }, base),
    foreground: Object.assign({
      selector: '.sky:not(.sky--background)',
      elementConfig: split.foreground
    }, base)
  };
}();

// ——— Airplane fly config ————————————————————————————————————————————————————
var airplaneFlyConfig = {
  baseFlySpeed: 750,
  // базова швидкість літака (px/s)
  increaseFlySpeed: 25000,
  // цільова швидкість після розгону (px/s), від baseFlySpeed до цього значення
  speedAccelDuration: 100,
  // тривалість плавного розгону від baseFlySpeed до increaseFlySpeed (ms)
  changeSizeDelay: 500,
  // затримка перед застосуванням scale літака (ms)
  scaleToSpeedDelay: 3000,
  // затримка після scale перед початком прискорення (ms)
  flyScale: 0.8,
  // масштаб літака після changeSizeDelay (0.8 = 80%)
  scaleTransitionDuration: 3,
  // тривалість анімації scale (s)
  scaleTransitionTiming: 'ease',
  // easing для scale-анімації
  trajectoryAngleDeg: trajectoryAngleDeg,
  // кут траєкторії руху (градуси, -10 = трохи вгору)
  smokeTail: {
    particleCount: 250,
    // макс. кількість частинок у хвості
    particleSpeed: 80,
    // швидкість руху частинок
    particleSizePercent: 6.4,
    // розмір частинки у % від ширини контейнера (ширина і висота однакові)
    particleImageSrc: '../img/smoke-particle.png',
    // зображення частинки диму
    renderDelay: 100,
    // затримка перед початком рендеру частинок (ms)
    spawnInterval: 20 // інтервал між спавном нових частинок (ms)
  }
};

// ——— Text animation config ————————————————————————————————————————————————————
var textAnimationConfig = {
  wrapOrder: ['.land__text-item._first', '.land__text-item._second', '.land__text-item._third'],
  beforeShowBottomDelay: 500,
  showDuration: 200
};
function buildTextAnimationSteps(config) {
  var cfg = textAnimationConfig;
  var steps = [];
  var animationName = 'toggleAnimation';
  cfg.wrapOrder.forEach(function (wrapSelector) {
    var wrap = document.querySelector(wrapSelector);
    if (!wrap) return;
    var topEl = wrap.querySelector('._anim-text-top');
    var bottomEl = wrap.querySelector('._anim-text-bottom');
    if (!topEl || !bottomEl) return;
    steps.push({
      animation: animationName,
      el: topEl,
      addClass: '_fade-in',
      removeClass: '_fade-out',
      delay: 100
    }, {
      animation: animationName,
      el: bottomEl,
      addClass: '_fade-in',
      removeClass: '_fade-out',
      delay: cfg.beforeShowBottomDelay
    }, {
      animation: animationName,
      el: topEl,
      addClass: '_fade-out',
      removeClass: '_fade-in',
      delay: cfg.showDuration
    }, {
      animation: animationName,
      el: bottomEl,
      addClass: '_fade-out',
      removeClass: '_fade-in',
      delay: cfg.showDuration
    });
  });
  return steps;
}

// ——— Animation config getters —————————————————————————————————————————————————
function getFadeInPageConfig() {
  var yourEl = document.querySelector('.land__title-your');
  var airplaneWrapEl = document.querySelector('.airplane-fly-wrap');
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
    el: airplaneWrapEl,
    addClass: fadeInClass,
    removeClass: fadeOutClass,
    delay: 300
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
function getFadeOutPopupConfig(btn) {
  var fadeInClass = '_fade-in';
  var fadeOutClass = '_fade-out';
  var animationName = 'toggleAnimation';
  var titleYourEl = document.querySelector('.land__title-your');
  var firstTitleEl = document.querySelector('.land__title-animated-item._first');
  var secondTitleEl = document.querySelector('.land__title-animated-item._second');
  var thirdTitleEl = document.querySelector('.land__title-animated-item._third');
  var animLayerEl = document.querySelector('.land__anim-layer');
  var popupEl = document.querySelector('.popup');
  var landTextEl = document.querySelector('.land__text');
  var steps = [{
    animation: animationName,
    el: titleYourEl,
    addClass: fadeOutClass,
    removeClass: fadeInClass,
    delay: 0,
    callback: function callback() {
      startAirplaneFly.start();
      if (btn) btn.style.pointerEvents = 'none';
    }
  }, {
    animation: animationName,
    el: firstTitleEl,
    addClass: fadeOutClass,
    removeClass: fadeInClass,
    delay: 0
  }, {
    animation: animationName,
    el: secondTitleEl,
    addClass: fadeOutClass,
    removeClass: fadeInClass,
    delay: 0
  }, {
    animation: animationName,
    el: thirdTitleEl,
    addClass: "",
    removeClass: fadeInClass,
    delay: 0
  }, {
    animation: animationName,
    el: animLayerEl,
    addClass: fadeOutClass,
    removeClass: fadeInClass,
    delay: 0
  }, {
    animation: animationName,
    el: landTextEl,
    addClass: '',
    removeClass: '',
    delay: 600
  }];
  steps.push.apply(steps, buildTextAnimationSteps());
  var popupTitleEl = document.querySelector('.popup__title');
  var popupTextTopEl = document.querySelector('.popup__text ._anim-text-top');
  var popupTextBottomEl = document.querySelector('.popup__text ._anim-text-bottom');
  var popupBtnEl = document.querySelector('.popup__btn');
  var globalLinkEl = document.querySelector('.global-link');
  steps.push({
    animation: animationName,
    el: popupEl,
    addClass: fadeInClass,
    removeClass: fadeOutClass,
    delay: 500
  }, {
    animation: animationName,
    el: popupTitleEl,
    addClass: fadeInClass,
    removeClass: fadeOutClass,
    delay: 0
  }, {
    animation: animationName,
    el: popupTextTopEl,
    addClass: fadeInClass,
    removeClass: fadeOutClass,
    delay: 0
  }, {
    animation: animationName,
    el: popupTextBottomEl,
    addClass: fadeInClass,
    removeClass: fadeOutClass,
    delay: 0
  }, {
    animation: animationName,
    el: globalLinkEl,
    addClass: '_fade-in',
    removeClass: '',
    delay: 0
  }, {
    animation: animationName,
    el: popupBtnEl,
    addClass: '_anim-btn-scale',
    removeClass: '',
    delay: 700
  }, {
    animation: animationName,
    el: popupTextTopEl,
    addClass: '_anim-text-popup',
    removeClass: '',
    delay: 0
  }, {
    animation: animationName,
    el: popupTextBottomEl,
    addClass: '_anim-text-popup',
    removeClass: '',
    delay: 0
  });
  return {
    beforeStartDelay: 0,
    steps: steps,
    delays: steps.map(function (s) {
      return s.delay;
    })
  };
}
function getPopupOpenChunkConfig() {
  var fadeInClass = '_fade-in';
  var fadeOutClass = '_fade-out';
  var animationName = 'toggleAnimation';
  var popupEl = document.querySelector('.popup');
  var popupTitleEl = document.querySelector('.popup__title');
  var popupTextTopEl = document.querySelector('.popup__text ._anim-text-top');
  var popupTextBottomEl = document.querySelector('.popup__text ._anim-text-bottom');
  var popupBtnEl = document.querySelector('.popup__btn');
  document.querySelector('.global-link');
  var steps = [{
    animation: animationName,
    el: popupEl,
    addClass: fadeInClass,
    removeClass: fadeOutClass,
    delay: 500
  }, {
    animation: animationName,
    el: popupTitleEl,
    addClass: fadeInClass,
    removeClass: fadeOutClass,
    delay: 0
  }, {
    animation: animationName,
    el: popupTextTopEl,
    addClass: fadeInClass,
    removeClass: fadeOutClass,
    delay: 0
  }, {
    animation: animationName,
    el: popupTextBottomEl,
    addClass: fadeInClass,
    removeClass: fadeOutClass,
    delay: 0
  }, {
    animation: animationName,
    el: popupBtnEl,
    addClass: '_anim-btn-scale',
    removeClass: '',
    delay: 1000
  }, {
    animation: animationName,
    el: popupTextTopEl,
    addClass: '_anim-text-popup',
    removeClass: '',
    delay: 0
  }, {
    animation: animationName,
    el: popupTextBottomEl,
    addClass: '_anim-text-popup',
    removeClass: '',
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

// ——— Viewport-dependent config —————————————————————————————————————————————
function applyViewportDependentConfig() {
  IS_MOBILE_PORTRAIT = window.innerWidth < 600 && window.innerHeight > window.innerWidth;
  trajectoryAngleDeg = IS_MOBILE_PORTRAIT ? -60 : -10;
  startAirplaneFly.updateConfig({
    trajectoryAngleDeg: trajectoryAngleDeg
  });
}

// ——— Init & entry point —————————————————————————————————————————————————————
var startAirplaneFly = initAirplaneFly(airplaneFlyConfig);
var fadeInPageConfig = getFadeInPageConfig();
function initPage() {
  window.addEventListener('resize', applyViewportDependentConfig);
  window.addEventListener('orientationchange', applyViewportDependentConfig);
  initSky(skyConfigs.background);
  initSky(skyConfigs.foreground);
  var popupBtn = document.querySelector('.land__btn[data-popup="popup"]');
  if (popupBtn) popupBtn.style.pointerEvents = 'none';
  initAnimationChaining(fadeInPageConfig);
  var landEl = document.querySelector('.land');
  if (landEl) {
    landEl.addEventListener('click', function (e) {
      var btn = e.target.closest('.land__btn');
      if (!btn) return;
      var popupId = btn.dataset.popup;
      if (!popupId) return;
      if (popupId === 'popup') {
        var fadeOutPopupConfig = getFadeOutPopupConfig(btn);
        if (IS_PAGE_POPUP_ANIMATION) {
          initAnimationChaining(fadeOutPopupConfig);
        }
        return;
      }
      var container = document.querySelector('[data-popup-container="' + popupId + '"]');
      if (container) {
        btn.parentElement;
      }
    });

    // const popupEl = document.querySelector('.popup');
    // if (popupEl) {
    //   popupEl.addEventListener('click', function (e) {
    //     if (e.target === popupEl) {
    //       initAnimationChaining(getPopupCloseConfig());
    //     }
    //   });
    // }

    document.querySelectorAll('.land__btn[data-popup]').forEach(function (btn) {
      var animLayer = btn.parentElement;
      btn.addEventListener('mouseenter', function () {
        if (animLayer) animLayer.classList.add('_btn-popup-init');
      });
      btn.addEventListener('mouseleave', function () {
        if (animLayer) animLayer.classList.remove('_btn-popup-init');
      });
    });
  }
  {
    var _landEl = document.querySelector('.land');
    initTest(_landEl, getFadeOutPopupConfig, getPopupCloseConfig, getPopupOpenChunkConfig);
  }
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
