import { initAnimationChaining } from './animations/fabric-animation-chaining.js';
import { initChickenCanvas } from './animations/chicken-canvas.js';
import { chickenCanvasConfig } from './animations/config/animations.config.js';
import { getFadeInPageConfig, getFadeOutPopupConfig, getPopupCloseConfig, getIsPagePopupAnimation } from './utils.js';
import { initTest } from './test.js';

// ——— Constants —————————————————————————————————————————————————————————————
const debug = true;

// ——— Init & entry point —————————————————————————————————————————————————————
const fadeInPageConfig = getFadeInPageConfig();

function initPage() {
  const chickenCanvas = initChickenCanvas(chickenCanvasConfig);
  if (chickenCanvas && typeof chickenCanvas.recalcAndRestart === 'function') {
    window.addEventListener('resize', chickenCanvas.recalcAndRestart);
    window.addEventListener('orientationchange', chickenCanvas.recalcAndRestart);
  }
  // if (chickenCanvas?.startAnimationChain) {
  //   chickenCanvas.startAnimationChain();
  // }

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
