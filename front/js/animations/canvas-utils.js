
export function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load: ' + src));
      try {
        img.src = new URL(src, window.location.href).href;
      } catch (e) {
        img.src = src;
      }
    });
  }

export function drawBackground(ctx, img, rootWidth, rootHeight, canvasWidth, canvasHeight) {
    const drawWidth = canvasWidth;
    const drawHeight = canvasHeight;
    const x = 0;
    const y = 0;
    ctx.drawImage(img, x, y, drawWidth, drawHeight);
  }