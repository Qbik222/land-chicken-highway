export function createPopupCanvasController(config, elements) {
  const { char } = config;
  const { canvas } = elements;
  const { frames, animationTimingFrame } = char;

  let frameIndex = 0;
  let loopStarted = false;
  let timerId = null;

  function drawFullFrame(frames, canvas, frameIndex) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.src = frames[frameIndex];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  }

  function drawFullFrameLoop() {
    if (loopStarted) return;
    loopStarted = true;
    runLoop();
  }

  function runLoop() {
    drawFullFrame(frames, canvas, frameIndex);
    frameIndex++;
    if (frameIndex >= frames.length) {
      frameIndex = 0;
    }
    timerId = setTimeout(runLoop, animationTimingFrame);
  }

  function stopLoop() {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
    loopStarted = false;
    frameIndex = 0;
  }

  return {
    drawFullFrameLoop,
    drawFullFrame,
    stopLoop,
  };
}
