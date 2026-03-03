import { initAnimationChaining } from './animations/fabric-animation-chaining.js';
import { initTest } from './test.js';

// ——— Constants —————————————————————————————————————————————————————————————
const debug = true;

const MOBILE_BREAKPOINT = 1050;
let IS_PAGE_POPUP_ANIMATION = false;

let IS_MOBILE_PORTRAIT = window.innerWidth < 600 && window.innerHeight > window.innerWidth;




//-- set popup animation toggler (called when initial fade-in ends)
function setPopupAnimationToggler() {
  IS_PAGE_POPUP_ANIMATION = !IS_PAGE_POPUP_ANIMATION;
  const popupBtn = document.querySelector('.land__btn[data-popup="popup"]');
  if (popupBtn) popupBtn.style.pointerEvents = 'initial';
  const animLayerEl = document.querySelector('.land__anim-layer');
  if (animLayerEl) animLayerEl.classList.add('_fade-in-btn');
}


// ——— Text animation config ————————————————————————————————————————————————————
const textAnimationConfig = {
  wrapOrder: ['.land__text-item._first', '.land__text-item._second', '.land__text-item._third'],
  beforeShowBottomDelay: 500,
  showDuration: 200,
};

function buildTextAnimationSteps(config) {
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

// ——— Animation config getters —————————————————————————————————————————————————
function getFadeInPageConfig() {
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

function getFadeOutPopupConfig(btn) {
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

// function getPopupOpenChunkConfig() {
//   const fadeInClass = '_fade-in';
//   const fadeOutClass = '_fade-out';
//   const animationName = 'toggleAnimation';
//   const popupEl = document.querySelector('.popup');
//   const popupTitleEl = document.querySelector('.popup__title');
//   const popupTextTopEl = document.querySelector('.popup__text ._anim-text-top');
//   const popupTextBottomEl = document.querySelector('.popup__text ._anim-text-bottom');
//   const popupBtnEl = document.querySelector('.popup__btn');
//   const globalLinkEl = document.querySelector('.global-link');
//   const steps = [
//     { animation: animationName, el: popupEl, addClass: fadeInClass, removeClass: fadeOutClass, delay: 500 },
//     { animation: animationName, el: popupTitleEl, addClass: fadeInClass, removeClass: fadeOutClass, delay: 0 },
//     { animation: animationName, el: popupTextTopEl, addClass: fadeInClass, removeClass: fadeOutClass, delay: 0 },
//     { animation: animationName, el: popupTextBottomEl, addClass: fadeInClass, removeClass: fadeOutClass, delay: 0 },
//     { animation: animationName, el: popupBtnEl, addClass: '_anim-btn-scale', removeClass: '', delay: 1000 },
//     { animation: animationName, el: popupTextTopEl, addClass: '_anim-text-popup', removeClass: '', delay: 0 },
//     { animation: animationName, el: popupTextBottomEl, addClass: '_anim-text-popup', removeClass: '', delay: 0 },

//   ];
//   return {
//     beforeStartDelay: 0,
//     steps,
//     delays: steps.map(function (s) { return s.delay; }),
//   };
// }

function getPopupCloseConfig() {
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

// ——— Init & entry point —————————————————————————————————————————————————————

const fadeInPageConfig = getFadeInPageConfig();

function initPage() {
  const popupBtn = document.querySelector('.land__btn[data-popup="popup"]');
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
  //       if (IS_PAGE_POPUP_ANIMATION) {
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