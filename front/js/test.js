import { initAnimationChaining } from './animations/fabric-animation-chaining.js';

function initTest(root, getFadeOutPopupConfig, getPopupCloseConfig, getPopupOpenChunkConfig) {
  if (!root) return;

  const testButtons = [
  //   { className: 'js-menu-test-close', label: 'Закрити попап', onClick: function () { initAnimationChaining(getPopupCloseConfig()); } },
  //   { className: 'js-menu-test-popup-chunk', label: 'Popup open chunk', onClick: function () { initAnimationChaining(getPopupOpenChunkConfig()); } },
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
