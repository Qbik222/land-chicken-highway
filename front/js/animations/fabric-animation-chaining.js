
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
  const elements = getElementsFromStep(step);
  switch (name) {
    case 'toggleAnimation':
      elements.forEach(function (el) {
        toggleAnimation(el, step.addClass, step.removeClass);
      });
      break;
    default:
      break;
  }
}

function initAnimationChaining(config) {
  if (!config) return;

  const {
    beforeStartDelay = 0,
    steps = [],
    delays = [],
  } = config;

  if (steps.length === 0) return;

  let timeoutId;

  function runStep(index) {
    if (index >= steps.length) return;

    const step = steps[index];
    const name = step.animation;
    runAnimation(name, step);

    if (typeof step.callback === 'function') {
      const args = [step, index];
      if (Array.isArray(step.callbackArgs)) {
        args.push.apply(args, step.callbackArgs);
      }
      step.callback.apply(null, args);
    }

    if (step.stopAnimationChaining) return;

    const delay = delays.length > 0 ? delays[index % delays.length] : undefined;
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

export { toggleAnimation, initAnimationChaining };
