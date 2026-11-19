import { useEffect, useRef } from 'react';

/**
 * Interactive "plus symbols" grid background. Faint green plus marks sit on
 * white; near the cursor they darken and grow, then fade back with a short
 * delay so the cursor leaves a soft trail.
 */

const RGB = '31, 107, 46';
const BASE_ALPHA = 0.2;
const HOVER_ALPHA = 0.95; // at full intensity
const ARM = 4; // half-length of each plus arm at rest, px
const ARM_GROW = 3.5; // extra half-length at full intensity
const STROKE = 1.25;
const RADIUS = 230; // proximity radius in px
const RISE = 0.22; // how fast elements fade in (per frame)
const FALL = 0.035; // how fast they fade out: the "fade delay"

function spacingFor(width: number) {
  return width < 640 ? 40 : 56;
}

export default function Pattern() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let w = 0;
    let h = 0;
    let gap = 56;
    let cols = 0;
    let rows = 0;
    let level = new Float32Array(0);
    let pointer: { x: number; y: number } | null = null;
    let raf = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      gap = spacingFor(w);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / gap) + 1;
      rows = Math.ceil(h / gap) + 1;
      level = new Float32Array(cols * rows);
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = STROKE;
      ctx.lineCap = 'round';
      const off = gap / 2; // keep marks off the window edges
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const v = level[r * cols + c];
          const x = c * gap + off;
          const y = r * gap + off;
          const arm = ARM + ARM_GROW * v;
          ctx.strokeStyle = `rgba(${RGB}, ${BASE_ALPHA + (HOVER_ALPHA - BASE_ALPHA) * v})`;
          ctx.beginPath();
          ctx.moveTo(x - arm, y);
          ctx.lineTo(x + arm, y);
          ctx.moveTo(x, y - arm);
          ctx.lineTo(x, y + arm);
          ctx.stroke();
        }
      }
    };

    const step = () => {
      let active = false;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          let target = 0;
          if (pointer) {
            const d = Math.hypot(c * gap + gap / 2 - pointer.x, r * gap + gap / 2 - pointer.y);
            if (d < RADIUS) target = (1 - d / RADIUS) ** 1.3;
          }
          const v = level[i];
          const next = v + (target - v) * (target > v ? RISE : FALL);
          level[i] = next < 0.004 ? 0 : next;
          if (level[i] > 0 || target > 0) active = true;
        }
      }
      draw();
      raf = active ? requestAnimationFrame(step) : 0;
    };

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(step);
    };
    const onMove = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY };
      wake();
    };
    const onLeave = () => {
      pointer = null;
      wake();
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
    };
  }, []);

  return <canvas ref={ref} className="bg-pattern" />;
}
