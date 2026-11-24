import { positionAccessory, spritePresentation } from './accessory-placement.js';

function alphaRange(histogram, total, portion) {
  let seen = 0;
  return histogram.findIndex(weight => (seen += weight) >= portion * total);
}

function frameBounds(pixels, width, height, trim) {
  const columns = new Uint32Array(width);
  const rows = new Uint32Array(height);
  const top = Math.round(height * (trim?.[0] ?? 0) / 100);
  const bottom = height - Math.round(height * (trim?.[1] ?? 0) / 100);
  let count = 0;
  for (let y = top; y < bottom; y++) {
    for (let x = 0; x < width; x++) {
      if (pixels[(y * width + x) * 4 + 3] === 0) continue;
      columns[x]++;
      rows[y]++;
      count++;
    }
  }
  if (!count) return undefined;
  return [
    100 * alphaRange(columns, count, 0.03) / width,
    100 * alphaRange(rows, count, 0.02) / height,
    100 * alphaRange(columns, count, 0.97) / width,
    100 * alphaRange(rows, count, 0.98) / height,
  ];
}

async function decode(source, trim, signal) {
  const [{ GifReader }, response] = await Promise.all([
    import('./vendor/omggif-1.0.10.js'),
    fetch(source, {signal}),
  ]);
  if (!response.ok) throw new Error('GIF request failed');
  const gif = new GifReader(new Uint8Array(await response.arrayBuffer()));
  const {width, height} = gif;
  let pixels = new Uint8ClampedArray(width * height * 4);
  let duration = 0;
  const frames = [];
  for (let index = 0; index < gif.numFrames(); index++) {
    const frame = gif.frameInfo(index);
    const previous = frame.disposal === 3 ? pixels.slice() : null;
    gif.decodeAndBlitFrameRGBA(index, pixels);
    duration += Math.max(20, frame.delay * 10);
    frames.push({
      end: duration,
      image: new ImageData(pixels.slice(), width, height),
      bounds: frameBounds(pixels, width, height, trim),
    });

    if (previous) pixels = previous;
    if (frame.disposal === 2) {
      for (let y = frame.y; y < frame.y + frame.height; y++) {
        const start = (y * width + frame.x) * 4;
        pixels.fill(0, start, start + frame.width * 4);
      }
    }
  }
  if (!duration) throw new Error('Empty GIF');
  const repeats = gif.loopCount();
  return {frames, duration, iterations: repeats === 0 ? Infinity : 1 + (repeats ?? 0)};
}

export function createEquippedAnimation(image, canvas, accessory) {
  const context = canvas.getContext('2d');
  let source, item, controller, request, frame, info;
  const cache = new Map();

  function stop() {
    controller?.abort();
    cancelAnimationFrame(request);
    canvas.hidden = true;
    delete canvas.dataset.frame;
    image.style.visibility = '';
    frame = undefined;
  }

  function place() {
    if (frame) positionAccessory(accessory, info.characterId, info.level, item, info.state, frame.bounds);
  }

  async function start(url, signal) {
    try {
      const cached = cache.get(url);
      const animation = cached ?? await decode(url, info.trim, signal);
      if (signal.aborted) return;
      cache.delete(url);
      cache.set(url, animation);
      if (cache.size > 2) cache.delete(cache.keys().next().value);
      const {frames, duration, iterations} = animation;
      const first = frames[0].image;
      canvas.width = first.width;
      canvas.height = first.height;
      canvas.style.clipPath = image.style.clipPath;
      const started = performance.now();

      function tick(now) {
        const elapsed = Math.max(0, now - started);
        const ended = elapsed >= duration * iterations;
        const index = ended ? frames.length - 1 : frames.findIndex(candidate => candidate.end > elapsed % duration);
        if (frame !== frames[index]) {
          frame = frames[index];
          context.putImageData(frame.image, 0, 0);
          canvas.dataset.frame = String(index);
          place();
        }
        if (!ended) request = requestAnimationFrame(tick);
      }

      tick(started);
      image.style.visibility = 'hidden';
      canvas.hidden = false;
    } catch {
      // Keep the browser's sprite and state-based placement on decoder failure.
      if (!signal.aborted) stop();
    }
  }

  return equipped => {
    item = equipped;
    const next = equipped && image.src.endsWith('.gif') ? image.src : undefined;
    if (next === source) {
      place();
      return;
    }
    stop();
    source = next;
    if (!next || !context) return;
    info = spritePresentation(image.getAttribute('src'));
    if (!info) return;
    controller = new AbortController();
    void start(next, controller.signal);
  };
}
