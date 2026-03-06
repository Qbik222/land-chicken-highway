export function createPopupCanvasController(config, elements) {
  const { char } = config;
  const { canvas } = elements;
  const { frames, animationTimingFrame } = char;

  let frameIndex = 0;

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
    drawFullFrame(frames, canvas, frameIndex);
    frameIndex++;
    if (frameIndex >= frames.length) {
      frameIndex = 0;
    }
    setTimeout(drawFullFrameLoop, animationTimingFrame);
  }

  return {
    drawFullFrameLoop,
    drawFullFrame,
  };
}
