import { useEffect, useRef } from 'react';

/**
 * Interactive "dots + lines" grid background. Faint green lines sit on white;
 * near the cursor the lines darken and dots fade in at each intersection,
 * then fade back out with a short delay so the cursor leaves a soft trail.
 */

const LINE_RGB = '31, 107, 46';
const BASE_LINE_ALPHA = 0.09;
const HOVER_LINE_ALPHA = 0.7; // added on top of the base at full intensity
const DOT_ALPHA = 1;
const DOT_RADIUS = 2.8;
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
      ctx.lineWidth = 1;

      // base grid
      ctx.strokeStyle = `rgba(${LINE_RGB}, ${BASE_LINE_ALPHA})`;
      ctx.beginPath();
      for (let c = 0; c < cols; c++) {
        const x = c * gap + 0.5;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let r = 0; r < rows; r++) {
        const y = r * gap + 0.5;
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      // darkened segments and dots near the cursor
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const v = level[r * cols + c];
          if (v < 0.01) continue;
          const x = c * gap + 0.5;
          const y = r * gap + 0.5;
          const right = c + 1 < cols ? level[r * cols + c + 1] : 0;
          const down = r + 1 < rows ? level[(r + 1) * cols + c] : 0;
          ctx.strokeStyle = `rgba(${LINE_RGB}, ${(HOVER_LINE_ALPHA * (v + right)) / 2})`;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + gap, y);
          ctx.stroke();
          ctx.strokeStyle = `rgba(${LINE_RGB}, ${(HOVER_LINE_ALPHA * (v + down)) / 2})`;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + gap);
          ctx.stroke();
          ctx.fillStyle = `rgba(${LINE_RGB}, ${DOT_ALPHA * v})`;
          ctx.beginPath();
          ctx.arc(x, y, DOT_RADIUS * (0.6 + 0.4 * v), 0, Math.PI * 2);
          ctx.fill();
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
            const d = Math.hypot(c * gap - pointer.x, r * gap - pointer.y);
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
