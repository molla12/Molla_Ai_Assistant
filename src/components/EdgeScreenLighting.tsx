import React, { useEffect, useRef } from 'react';

interface EdgeScreenLightingProps {
  isPowerOn: boolean;
  speed?: number; // rotation speed in radians per frame (~0.024 rad/frame)
}

// Exact revolving neon rainbow spectrum from user's video:
// Coral Red -> Vivid Orange -> Gold -> Neon Lime/Emerald -> Aqua/Cyan -> Electric Blue -> Violet -> Neon Magenta -> Coral Red
const RAINBOW_STOPS: [number, string][] = [
  [0.0, '#FF2A55'],
  [0.125, '#FF7A00'],
  [0.25, '#FFD200'],
  [0.375, '#00E676'],
  [0.5, '#00E5FF'],
  [0.625, '#2979FF'],
  [0.75, '#8B5CF6'],
  [0.875, '#EC4899'],
  [1.0, '#FF2A55'],
];

export const EdgeScreenLighting: React.FC<EdgeScreenLightingProps> = ({
  isPowerOn,
  speed = 0.01,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isPowerOn) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;
    let currentWidth = 0;
    let currentHeight = 0;

    const updateCanvasDimensions = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

      // Measure full vertical display height from top status bar to absolute bottom
      const rect = canvas.getBoundingClientRect();
      const w = Math.round(
        Math.max(
          rect.width || 0,
          window.innerWidth || 0,
          document.documentElement.clientWidth || 0,
          360
        )
      );
      const h = Math.round(
        Math.max(
          rect.height || 0,
          window.innerHeight || 0,
          document.documentElement.clientHeight || 0,
          640
        )
      );

      currentWidth = w;
      currentHeight = h;

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.style.top = '0px';
      canvas.style.left = '0px';
      canvas.style.right = '0px';
      canvas.style.bottom = '0px';

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    updateCanvasDimensions();

    window.addEventListener('resize', updateCanvasDimensions, { passive: true });
    window.addEventListener('orientationchange', updateCanvasDimensions, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateCanvasDimensions, { passive: true });
    }

    // Precise rounded rectangle path generator matching display corner curvature
    const createRoundedRectPath = (
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      w: number,
      h: number,
      r: number
    ) => {
      const radius = Math.max(0, Math.min(r, w / 2, h / 2));
      context.beginPath();
      context.moveTo(x + radius, y);
      context.lineTo(x + w - radius, y);
      context.arcTo(x + w, y, x + w, y + radius, radius);
      context.lineTo(x + w, y + h - radius);
      context.arcTo(x + w, y + h, x + w - radius, y + h, radius);
      context.lineTo(x + radius, y + h);
      context.arcTo(x, y + h, x, y + h - radius, radius);
      context.lineTo(x, y + radius);
      context.arcTo(x, y, x + radius, y, radius);
      context.closePath();
    };

    const render = () => {
      const w = currentWidth;
      const h = currentHeight;

      if (w <= 0 || h <= 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, w, h);

      // Increment rotation smoothly clockwise
      angle = (angle + speed) % (Math.PI * 2);

      const centerX = w / 2;
      const centerY = h / 2;

      // Conic gradient matching the revolving rainbow aura in the video
      let gradient: CanvasGradient;
      if (typeof ctx.createConicGradient === 'function') {
        gradient = ctx.createConicGradient(angle, centerX, centerY);
      } else {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const x0 = centerX - cos * (w / 2);
        const y0 = centerY - sin * (h / 2);
        const x1 = centerX + cos * (w / 2);
        const y1 = centerY + sin * (h / 2);
        gradient = ctx.createLinearGradient(x0, y0, x1, y1);
      }

      for (const [stop, color] of RAINBOW_STOPS) {
        gradient.addColorStop(stop, color);
      }

      // Exact edge positioning:
      // On mobile smartphones, screen corners are subtly curved (14px-16px, matching modern phone bezels).
      // On desktop browsers, screen corners are 8px.
      const isMobile = w <= 768 || ('ontouchstart' in window);
      const cornerRadius = isMobile
        ? Math.min(16, Math.max(10, Math.round(w * 0.038)))
        : 8;

      // Refined sleeker wire thickness: crisp 2.0px neon wire with 4.2px ambient glow bloom (not too thick)
      const coreLineWidth = isMobile ? 2.0 : 2.2;
      const glowLineWidth = isMobile ? 4.2 : 5.0;
      const whiteCoreWidth = isMobile ? 2.2 : 2.5;
      const whiteGlowWidth = isMobile ? 5.2 : 6.2;

      // Halved stroke offset ensures stroke outer boundary reaches exactly 0 and W, 0 and H (extreme display edge)
      const halfStroke = Math.max(coreLineWidth, whiteCoreWidth) / 2;
      const rectX = halfStroke;
      const rectY = halfStroke;
      const rectW = Math.max(0, w - halfStroke * 2);
      const rectH = Math.max(0, h - halfStroke * 2);

      // Perimeter calculation for exact traveling beam positioning
      // L = 2 * (w + h) - (8 - 2*pi) * r
      const totalPerimeter = Math.max(
        100,
        2 * (rectW + rectH) - (8 - 2 * Math.PI) * cornerRadius
      );
      const halfPerimeter = totalPerimeter / 2;

      // Length of each white highlight beam (~8.5% of perimeter, ~95px-110px on mobile)
      const streakLength = Math.max(70, Math.min(130, Math.round(totalPerimeter * 0.085)));
      const gapLength = halfPerimeter - streakLength;

      // Synchronize travel position with rainbow rotation angle clockwise
      const streakOffset = (angle / (Math.PI * 2)) * totalPerimeter;

      // Pass 1: Luminous ambient neon bloom around the screen edge
      ctx.save();
      ctx.setLineDash([]);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = glowLineWidth;
      ctx.globalAlpha = 0.45;
      try {
        ctx.filter = 'blur(3px)';
      } catch {}
      createRoundedRectPath(ctx, rectX, rectY, rectW, rectH, cornerRadius);
      ctx.stroke();
      ctx.restore();

      // Pass 2: High-contrast, razor-sharp revolving neon edge border
      ctx.save();
      ctx.setLineDash([]);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = coreLineWidth;
      ctx.globalAlpha = 1.0;
      try {
        ctx.filter = 'none';
      } catch {}
      createRoundedRectPath(ctx, rectX, rectY, rectW, rectH, cornerRadius);
      ctx.stroke();
      ctx.restore();

      // Pass 3: Dual revolving white highlight beams - Soft luminous white halo
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const glowStreak = Math.min(halfPerimeter * 0.9, streakLength * 1.3);
      const glowGap = halfPerimeter - glowStreak;
      ctx.setLineDash([glowStreak, glowGap]);
      ctx.lineDashOffset = -(streakOffset + (glowStreak - streakLength) / 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = whiteGlowWidth;
      ctx.globalAlpha = 0.6;
      try {
        ctx.filter = 'blur(2px)';
      } catch {}
      createRoundedRectPath(ctx, rectX, rectY, rectW, rectH, cornerRadius);
      ctx.stroke();
      ctx.restore();

      // Pass 4: Dual revolving white highlight beams - Intense pure white core laser (two white rotating heads)
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash([streakLength, gapLength]);
      ctx.lineDashOffset = -streakOffset;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = whiteCoreWidth;
      ctx.globalAlpha = 0.98;
      try {
        ctx.filter = 'none';
      } catch {}
      createRoundedRectPath(ctx, rectX, rectY, rectW, rectH, cornerRadius);
      ctx.stroke();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', updateCanvasDimensions);
      window.removeEventListener('orientationchange', updateCanvasDimensions);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateCanvasDimensions);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPowerOn, speed]);

  if (!isPowerOn) return null;

  return (
    <canvas
      ref={canvasRef}
      id="mobile-edge-screen-lighting"
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[9999] select-none"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100lvh',
        zIndex: 9999,
        pointerEvents: 'none',
        userSelect: 'none',
        touchAction: 'none',
        willChange: 'transform, opacity',
      }}
    />
  );
};
