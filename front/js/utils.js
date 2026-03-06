/**
 * Утиліти та бізнес-логіка сторінки.
 */

import { textAnimationConfig } from './animations/config/chicken-canvas.config.js';

let isPagePopupAnimation = false;

export function setPopupAnimationToggler() {
  isPagePopupAnimation = !isPagePopupAnimation;
  const popupBtn = document.querySelector('.land__btn[data-popup="popup"]');
  if (popupBtn) popupBtn.style.pointerEvents = 'initial';
  const animLayerEl = document.querySelector('.land__anim-layer');
  if (animLayerEl) animLayerEl.classList.add('_fade-in-btn');
}

export function getIsPagePopupAnimation() {
  return isPagePopupAnimation;
}

export function buildTextAnimationSteps(config) {
  const cfg = config || textAnimationConfig;
  const steps = [];
  const animationName = 'toggleAnimation';

  cfg.wrapOrder.forEach(function (wrapSelector) {
    const wrap = document.querySelector(wrapSelector);
    if (!wrap) return;

    const topEl = wrap.querySelector('._anim-text-top');
    const bottomEl = wrap.querySelector('._anim-text-bottom');
    if (!topEl || !bottomEl) return;

    steps.push(
      { animation: animationName, el: topEl, addClass: '_fade-in', removeClass: '_fade-out', delay: 100 },
      { animation: animationName, el: bottomEl, addClass: '_fade-in', removeClass: '_fade-out', delay: cfg.beforeShowBottomDelay },
      { animation: animationName, el: topEl, addClass: '_fade-out', removeClass: '_fade-in', delay: cfg.showDuration },
      { animation: animationName, el: bottomEl, addClass: '_fade-out', removeClass: '_fade-in', delay: cfg.showDuration }
    );
  });

  return steps;
}

export function getFadeInPageConfig() {
  const yourEl = document.querySelector('.land__title-your');
  const airplaneBtnEl = document.querySelector('.land__anim-layer');
  const firstEl = document.querySelector('.land__title-animated-item._first');
  const secondEl = document.querySelector('.land__title-animated-item._second');
  const thirdEl = document.querySelector('.land__title-animated-item._third');
  const fadeInClass = '_fade-in';
  const fadeOutClass = '_fade-out';
  const animationName = 'toggleAnimation';

  const steps = [
    { animation: animationName, el: yourEl, addClass: fadeInClass, removeClass: fadeOutClass, delay: 200 },
    { animation: animationName, el: firstEl, addClass: fadeInClass, removeClass: fadeOutClass, delay: 200 },
    { animation: animationName, el: airplaneBtnEl, addClass: fadeInClass, removeClass: fadeOutClass, delay: 200 },
    { animation: animationName, el: firstEl, addClass: fadeOutClass, removeClass: fadeInClass, delay: 1000 },
    { animation: animationName, el: secondEl, addClass: fadeInClass, removeClass: fadeOutClass, delay: 1000 },
    { animation: animationName, el: secondEl, addClass: fadeOutClass, removeClass: fadeInClass, delay: 1000 },
    { animation: animationName, el: thirdEl, addClass: fadeInClass, removeClass: fadeOutClass, delay: 1000, callback: setPopupAnimationToggler },
  ];

  return {
    beforeStartDelay: 500,
    steps,
    delays: steps.map(function (s) {
      return s.delay;
    }),
  };
}

export function getFadeInPopupConfig(btn, parrent, callbacks) {
  const fadeInClass = '_fade-in';
  const fadeOutClass = '_fade-out';
  const animationName = 'toggleAnimation';

  const popupWrapperEl = parrent.querySelector('.popup__wrapper');
  const firstTitleEl = parrent.querySelectorAll('.popup__title-item')[0];
  const secondTitleEl = parrent.querySelectorAll('.popup__title-item')[1];
  const thirdTitleEl = parrent.querySelectorAll('.popup__subtitle-item')[0];
  const fourthTitleEl = parrent.querySelectorAll('.popup__subtitle-item')[1];

  function showGloabalLink() {
    const globalLinkEl = document.querySelector('.global-link');
    if (globalLinkEl) globalLinkEl.classList.add('_fade-in');
  }


  const steps = [
    { animation: animationName, el: parrent, addClass: fadeInClass, removeClass: fadeOutClass, delay: 300, 
      callback: () => {
      callbacks.drawFullFrameLoop();
      showGloabalLink();
    }},
    { animation: animationName, el: popupWrapperEl, addClass: fadeInClass, removeClass: fadeOutClass, delay: 200 },
    { animation: animationName, el: firstTitleEl, addClass: fadeInClass, removeClass: fadeOutClass, delay: 0 },
    { animation: animationName, el: secondTitleEl, addClass: fadeInClass, removeClass: fadeOutClass, delay: 500 },
    { animation: animationName, el: thirdTitleEl, addClass: fadeInClass, removeClass: fadeOutClass, delay: 0},
    { animation: animationName, el: fourthTitleEl, addClass: fadeInClass, removeClass: fadeOutClass, delay: 0},
  ];

  return {
    beforeStartDelay: 0,
    steps,
    delays: steps.map(function (s) {
      return s.delay;
    }),
  };
}

export function getPopupCloseConfig() {
  const fadeInClass = '_fade-in';
  const fadeOutClass = '_fade-out';
  const animationName = 'toggleAnimation';
  const popupEl = document.querySelector('.popup');
  return {
    beforeStartDelay: 0,
    steps: [
      {
        animation: animationName,
        el: popupEl,
        addClass: fadeOutClass,
        removeClass: fadeInClass,
        delay: 200,
      },
    ],
    delays: [200],
  };
}
