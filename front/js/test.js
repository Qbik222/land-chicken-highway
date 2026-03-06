import { initAnimationChaining } from './animations/fabric-animation-chaining.js';
import { getFadeInPopupConfig, getPopupCloseConfig } from './utils.js';
import { initPopupCanvas } from './animations/popup-canvas/popup-canvas.js';
import { popupCanvasConfig } from './animations/config/popup-canvas.config.js';

let popupCanvasInstance = null;

function initTest(config) {
  if (!config.root) return;

  const { root } = config;

  const testButtons = [
    {
      className: 'js-test-open-popup',
      label: 'Відкрити попап',
      onClick: function () {
        const popupEl = document.querySelector('.popup');
        if (!popupEl) return;
        if (popupCanvasInstance) {
          popupCanvasInstance.stopLoop();
        }
        popupCanvasInstance = initPopupCanvas(popupCanvasConfig);
        const callbacks = popupCanvasInstance
          ? { drawFullFrameLoop: popupCanvasInstance.drawFullFrameLoop }
          : { drawFullFrameLoop: () => {} };
        initAnimationChaining(getFadeInPopupConfig(null, popupEl, callbacks));
      },
    },
    {
      className: 'js-test-close-popup',
      label: 'Закрити попап',
      onClick: function () {
        if (popupCanvasInstance) {
          popupCanvasInstance.stopLoop();
        }
        initAnimationChaining(getPopupCloseConfig());
      },
    },
  ];

  const buttonsMarkup = testButtons.map(function (btn) {
    return `<button class="menu-test__btn ${btn.className}">${btn.label}</button>`;
  }).join('');

  const markup = `
    <div class="menu-test">
      <button class="menu-test__btn menu-test__menu-btn js-menu-test-toggle">Menu</button>
      <div class="menu-test__buttons">${buttonsMarkup}</div>
    </div>
  `;
  root.insertAdjacentHTML('beforeend', markup);

  const menuTest = root.querySelector('.menu-test');
  const toggleBtn = menuTest.querySelector('.js-menu-test-toggle');
  const buttonsWrap = menuTest.querySelector('.menu-test__buttons');

  toggleBtn.addEventListener('click', function () {
    const isHidden = buttonsWrap.classList.contains('menu-test__buttons_hidden');
    buttonsWrap.classList.toggle('menu-test__buttons_hidden', !isHidden);
  });

  testButtons.forEach(function (btn, i) {
    const el = menuTest.querySelector('.' + btn.className);
    if (el && btn.onClick) el.addEventListener('click', btn.onClick);
  });
}

export { initTest };
