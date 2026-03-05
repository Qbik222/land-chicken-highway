![page.jpg](front/page.jpg)

---

## Chicken Canvas — стани елементів і флоу

Canvas-анімація з персонажем (char), монетами (coins), бар'єрами (barriers) та машинами (cars). Логіка в `chicken-canvas.js`, `chicken-canvas-utils.js`. Конфіг — `animations.config.js`. Умови роботи — `front/canvas-flow.md`.

### Порядок малювання

Background → Coins → Cars → Barriers → Char

---

### Char (персонаж)

| Стан      | Опис                                                                 |
|-----------|----------------------------------------------------------------------|
| `stay`    | Статичний кадр (frame 1). Відображається завжди, коли не jumping.     |
| `jumping` | Циклічна анімація frame 1…10. Char летить по дузі до коіна.         |

**Переходи:**
- `stay` → `jumping`: `startJumpToCoin(index)` — запуск ланцюга або окремий стрибок.
- `jumping` → `stay`: коли char досягає цільового коіна (progress >= 1), викликається `setCoinFadeOut(coinIndex)` і `setCharState('stay')`.

**Позиціонування:** по вертикалі — центр `.land__canvas`; по горизонталі — `offsetX` від лівого краю (breakpoints). Під час jumping позиція інтерполюється по дузі.

---

### Coins (монети)

| Стан      | visible | Опис                                                                 |
|-----------|---------|----------------------------------------------------------------------|
| `static`  | true    | Кадр static.png з папки coin. Монета видима.                        |
| `fade-out`| true    | Анімація зникнення — цикл по frame-1, frame-2, … Після останнього кадру монета зникає. |
| `static`  | false   | Після fade-out. Монета не малюється.                                |

**Переходи:**
- `static` + visible → `fade-out`: `setCoinFadeOut(coinIndex)` — коли char досягає коіна.
- `fade-out` → `static` + visible=false: коли `coin.frameIndex >= frames.length` — монета прибирається, запускається barrier fade-in і car fade-in для цього слоту.

**Позиціонування:** в ряд праворуч від char. Перший — `offsetRight` px; далі — `gapBetween` або `itemGaps` по breakpoints.

---

### Barrier (бар'єр)

| Стан     | visible | Опис                                                                 |
|----------|---------|----------------------------------------------------------------------|
| `hide`   | false   | Не видимий. Бар'єр над coin[i] ще не активний.                      |
| `fade-in`| true    | Анімація появи — цикл по frame 1…6.                                 |
| `static` | true    | Статичний кадр (frame 6). Бар'єр залишається на місці.              |

**Переходи:**
- `hide` → `fade-in`: коли coin[i] завершує fade-out — barrier[i] стає видимим і починає fade-in.
- `fade-in` → `static`: коли `barrier.frameIndex >= frames.length`.

**Позиціонування:** barrier[i] центрується над coin[i], з `offsetAbove` над монетою (breakpoints).

---

### Cars (машини)

| Тип     | Опис                                                                 |
|---------|----------------------------------------------------------------------|
| running | Їде зверху вниз по vertical. Вибір car-1 або car-2 — випадково при кожному старті. |
| fade-in | З'являється зверху, їде до barrier і зупиняється за 20px до нього.   |

**Умови спавну running:**
- Coin у стані `static` і visible (char ще не досяг).
- Немає running машини на цьому coin slot.
- Немає fade-in машини на цьому slot.
- `pendingJumpStart === false`.
- max 2 running машини глобально, min 1 с між стартами на slot.

**Умови спавну fade-in:**
- Коли coin[i] завершує fade-out — автоматично викликається `triggerCarFadeIn(coinIndex)`.
- Якщо chainActive і chainFadeInCombo — тільки для слотів з `chainFadeInCombo.has(coinIndex)` (2–3 машини з 4, комбінації типу [0,1], [1,2], [0,1,3] тощо).
- Max 1 fade-in машина на slot.

**Перед jumping:**
- Якщо є running машини — встановлюється `pendingJumpStart`, нові running не стартують.
- Коли всі running закінчують — `startJumpToCoin(0)`.

**Під час jumping:** running машини прискорюються (множник з конфігу).

---

### Загальний флоу

```
Клік на [data-canvas-init] (main.js)
    → handleInitClick() → startAnimationChain()
        → chainActive = true
        → якщо runningCars.length > 0: pendingJumpStart = true
        → інакше: startJumpToCoin(0)

startJumpToCoin(0)
    → char: stay → jumping
    → char летить по дузі до coin[0]

Char досягає coin[0] (progress >= 1)
    → setCoinFadeOut(0)
    → setCharState('stay')
    → coin[0]: static → fade-out

coinFadeLoop: coin[0] завершив fade-out
    → coin[0].visible = false
    → barrier[0]: hide → fade-in
    → triggerCarFadeIn(0)
    → якщо chainActive: scheduleNextChainJump(0) → startJumpToCoin(1)

barrierFadeInLoop: barrier[0] завершив fade-in
    → barrier[0]: fade-in → static

runCarFadeInLoop: fade-in машина доїхала до targetY
    → car.moving = false, залишається на місці
```

---

### API

| Метод                 | Опис                                                                 |
|-----------------------|----------------------------------------------------------------------|
| `recalcAndRestart()`  | Перерахунок розмірів canvas, перезавантаження ресурсів, перезапуск анімацій. |
| `handleInitClick()`   | Обробник кліку — викликає startAnimationChain, додає _disabled на кнопку.  |
| `setCharState(state)` | Встановити char: 'stay' | 'jumping'.                              |
| `setCoinFadeOut(i)`   | Запустити fade-out для coin[i].                                      |
| `startAnimationChain()`| Запустити ланцюг стрибків char по коінах.                           |

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
