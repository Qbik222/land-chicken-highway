![page.jpg](front/page.jpg)

---

## fabric-animation-chaining.js

Система послідовного запуску анімацій через зміну CSS-класів.

### Імпорт

```js
import { initAnimationChaining, toggleAnimation } from './animations/fabric-animation-chaining.js';
```

### initAnimationChaining(config)

Запускає ланцюжок кроків з заданими затримками.

**Конфіг:**

| Поле              | Тип     | Опис                                                    |
|-------------------|---------|---------------------------------------------------------|
| `beforeStartDelay`| `number`| Затримка перед першим кроком (ms). За замовч. `0`      |
| `steps`           | `array` | Масив кроків анімації                                  |
| `delays`          | `array` | Масив затримок між кроками (ms). Індекс відповідає кроку |

**Крок (step):**

| Поле                | Тип         | Опис                                                                 |
|---------------------|-------------|----------------------------------------------------------------------|
| `animation`         | `string`    | Тип анімації. Наразі: `'toggleAnimation'`                            |
| `el`                | `Element`   | DOM-елемент (один)                                                   |
| `elements`          | `Element[]` | Масив елементів (замість `el`)                                       |
| `addClass`          | `string`    | Клас для додавання                                                  |
| `removeClass`       | `string`    | Клас для видалення                                                  |
| `delay`             | `number`    | Затримка перед наступним кроком (опційно, якщо `delays` не вказано) |
| `callback`          | `function`  | Функція після виконання кроку. Аргументи: `(step, index)`           |
| `callbackArgs`      | `array`     | Додаткові аргументи для `callback`                                  |
| `stopAnimationChaining` | `boolean` | Якщо `true`, ланцюжок зупиняється після цього кроку         |

**Приклад:**

```js
initAnimationChaining({
  beforeStartDelay: 500,
  steps: [
    { animation: 'toggleAnimation', el: el1, addClass: '_fade-in', removeClass: '_fade-out', delay: 200 },
    { animation: 'toggleAnimation', el: el2, addClass: '_fade-in', removeClass: '_fade-out', delay: 0, callback: function () { console.log('done'); } },
  ],
  delays: [200, 0],
});
```

**Повертає:** функцію `cancel()` для зупинки ланцюжка.

### toggleAnimation(el, addClass, removeClass)

Допоміжна функція: додає/знімає класи на елементі без запуску ланцюжка.

---

## sky-animation.js

Canvas-анімація парних об’єктів (хмари, монети, купюри) на фоні.

### Імпорт

```js
import { initSky } from './animations/sky-animation.js';
```

### initSky(config)

Створює canvas на елементі `.sky`, підвантажує зображення й запускає анімацію.

**Конфіг:**

| Поле                 | Тип     | Опис                                                      |
|----------------------|---------|-----------------------------------------------------------|
| `selector`           | `string`| Селектор контейнера (напр. `.sky`, `.sky--background`)    |
| `spawnIntervalMs`    | `number`| Інтервал спавну елементів (ms). За замовч. `1000`         |
| `angleMin` / `angleMax` | `number` | Кут обертання елемента (градуси)                      |
| `baseSpeed`          | `number` | Базова швидкість руху                                |
| `elementConfig`      | `array`  | Опис типів елементів: `{ type, className, limit, speed? }` |
| `elementDrawConfig` | `array`  | Опис зображень: `{ type, className, imageSrc, width, height, breakpoints? }` |
| `canvasSizeMultiplier` | `number` | Множник розміру canvas (напр. 1.4 для більшої області) |

**Логіка:**
- Елементи з’являються справа з випадковим кутом і швидкістю.
- Спочатку спавняться хмари (`cloud-penta`, `cloud-row`).
- Обмеження кількості кожного типу задає `limit` в `elementConfig`.
- `breakpoints` у `elementDrawConfig` задають інші розміри для різних ширин екрана.
- Анімація призупиняється при `document.hidden` і відновлюється при поверненні на вкладку.

---

## airplane-fly-animation.js

Анімація польоту літака з димовим слідом.

### Імпорт

```js
import { initAirplaneFly } from './animations/airplane-fly-animation.js';
```

### initAirplaneFly(config)

Повертає об’єкт з методами `start()` та `updateConfig(partial)`.

**Конфіг:**

| Поле                    | Тип     | Опис                                                    |
|-------------------------|---------|---------------------------------------------------------|
| `wrapSelector`           | `string`| Контейнер літака. За замовч. `.airplane-fly-wrap`       |
| `scaleWrapSelector`      | `string`| Елемент для scale. За замовч. `.airplane-fly-scale-wrap` |
| `canvasSelector`         | `string`| Canvas для диму. За замовч. `.airplane__smoke-tail`     |
| `baseFlySpeed`          | `number`| Початкова швидкість (px/s)                             |
| `increaseFlySpeed`      | `number`| Кінцева швидкість після розгону (px/s)                 |
| `speedAccelDuration`    | `number`| Час розгону (ms)                                       |
| `trajectoryAngleDeg`    | `number`| Кут траєкторії в градусах (напр. -10 — вгору вправо)   |
| `changeSizeDelay`       | `number`| Затримка перед scale (ms)                              |
| `scaleToSpeedDelay`     | `number`| Затримка після scale перед розгоном (ms)               |
| `flyScale`              | `number`| Масштаб після scale (напр. 0.8)                        |
| `scaleTransitionDuration` | `number` | Тривалість scale (s)                              |
| `smokeTail`             | `object`| Параметри диму: `particleCount`, `particleSpeed`, `particleSizePercent`, `particleImageSrc`, тощо |

**Приклад:**

```js
const fly = initAirplaneFly({
  baseFlySpeed: 750,
  increaseFlySpeed: 25000,
  trajectoryAngleDeg: -10,
  changeSizeDelay: 500,
  flyScale: 0.8,
});

fly.start();
fly.updateConfig({ trajectoryAngleDeg: -60 });
```

**Поведінка:**
- Літак рухається за `trajectoryAngleDeg`.
- Після `changeSizeDelay` застосовується scale.
- Потім відбувається розгон до `increaseFlySpeed`.
- Димовий слід рендериться на окремому canvas.
- Після повного виходу за межі екрана анімація зупиняється.

---

## test.js

Модуль тестових кнопок для відладки анімацій. Використовується лише при `debug: true` в `main.js`.

**Що робить:**
- Додає блок `.menu-test` з кнопкою «Menu» і набором тестових кнопок.
- Кнопка «Menu» перемикає показ/приховування інших кнопок.
- Список кнопок задається масивом `testButtons`: кожен елемент містить `className`, `label`, `onClick`.

**Додавання нової кнопки:** додати об’єкт до `testButtons`:

```js
{ className: 'js-menu-test-my', label: 'Мій тест', onClick: function () { /* ... */ } },
```

Функція `initTest(root, getFadeOutPopupConfig, getPopupCloseConfig, getPopupOpenChunkConfig)` викликається з `main.js`, їй передається root-елемент (`.land`) та потрібні конфіги.
