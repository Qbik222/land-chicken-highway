/**
 * Утиліти та бізнес-логіка сторінки.
 */

import { textAnimationConfig } from './animations/config/animations.config.js';

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

export function getFadeOutPopupConfig(btn) {
  const fadeInClass = '_fade-in';
  const fadeOutClass = '_fade-out';
  const animationName = 'toggleAnimation';

  const titleYourEl = document.querySelector('.land__title-your');
  const firstTitleEl = document.querySelector('.land__title-animated-item._first');
  const secondTitleEl = document.querySelector('.land__title-animated-item._second');
  const thirdTitleEl = document.querySelector('.land__title-animated-item._third');
  const animLayerEl = document.querySelector('.land__anim-layer');
  const popupEl = document.querySelector('.popup');
  const landTextEl = document.querySelector('.land__text');

  const steps = [
    {
      animation: animationName,
      el: titleYourEl,
      addClass: fadeOutClass,
      removeClass: fadeInClass,
      delay: 0,
      callback: function () {
        if (btn) btn.style.pointerEvents = 'none';
      },
    },
    { animation: animationName, el: firstTitleEl, addClass: fadeOutClass, removeClass: fadeInClass, delay: 0 },
    { animation: animationName, el: secondTitleEl, addClass: fadeOutClass, removeClass: fadeInClass, delay: 0},
    { animation: animationName, el: thirdTitleEl, addClass: "", removeClass: fadeInClass, delay: 0 },
    { animation: animationName, el: animLayerEl, addClass: fadeOutClass, removeClass: fadeInClass, delay: 0 },
    {
      animation: animationName,
      el: landTextEl,
      addClass: '',
      removeClass: '',
      delay: 600,
    },
  ];

  steps.push.apply(steps, buildTextAnimationSteps());

  const popupTitleEl = document.querySelector('.popup__title');
  const popupTextTopEl = document.querySelector('.popup__text ._anim-text-top');
  const popupTextBottomEl = document.querySelector('.popup__text ._anim-text-bottom');
  const popupBtnEl = document.querySelector('.popup__btn');
  const globalLinkEl = document.querySelector('.global-link');

  steps.push(
    { animation: animationName, el: popupEl, addClass: fadeInClass, removeClass: fadeOutClass, delay: 500 },
    { animation: animationName, el: popupTitleEl, addClass: fadeInClass, removeClass: fadeOutClass, delay: 0 },
    { animation: animationName, el: popupTextTopEl, addClass: fadeInClass, removeClass: fadeOutClass, delay: 0 },
    { animation: animationName, el: popupTextBottomEl, addClass: fadeInClass, removeClass: fadeOutClass, delay: 0 },
    { animation: animationName, el: globalLinkEl, addClass: '_fade-in', removeClass: '', delay: 0 },
    { animation: animationName, el: popupBtnEl, addClass: '_anim-btn-scale', removeClass: '', delay: 700 },
    { animation: animationName, el: popupTextTopEl, addClass: '_anim-text-popup', removeClass: '', delay: 0 },
    { animation: animationName, el: popupTextBottomEl, addClass: '_anim-text-popup', removeClass: '', delay: 0 },
  );

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
