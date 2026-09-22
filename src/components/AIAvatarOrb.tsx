import React, { useEffect, useRef, useState } from 'react';
import { ConnectionState, AuraConfig } from '../types';
import { MayaAvatar } from './maya/MayaAvatar';
import { loadAssistantConfig } from './maya/mayaStorage';

interface AIAvatarOrbProps {
  state: ConnectionState;
  aura: AuraConfig;
  getFrequencyData: () => Uint8Array;
  getVolumeRMS: () => number;
  onOrbClick: () => void;
  isPowerOn?: boolean;
  isLight?: boolean;
}

interface Particle {
  x: number;
  y: number;
  baseRadius: number;
  angle: number;
  speed: number;
  size: number;
  alpha: number;
}

export const AIAvatarOrb: React.FC<AIAvatarOrbProps> = ({
  state,
  aura,
  getFrequencyData,
  getVolumeRMS,
  onOrbClick,
  isPowerOn = true,
  isLight = false,
}) => {
  const [assistantName, setAssistantName] = useState(() => {
    return loadAssistantConfig().assistantName || 'molla';
  });

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail?.assistantName) {
        setAssistantName(e.detail.assistantName);
      } else {
        setAssistantName(loadAssistantConfig().assistantName || 'molla');
      }
    };
    window.addEventListener('maya_assistant_config_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('maya_assistant_config_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const orbCoreRef = useRef<HTMLDivElement | null>(null);
  const currentScaleRef = useRef(1);
  const animationFrameId = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  // Initialize particle system
  useEffect(() => {
    const particles: Particle[] = [];
    const numParticles = 32;
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: 0,
        y: 0,
        baseRadius: 95 + Math.random() * 55,
        angle: (i / numParticles) * Math.PI * 2,
        speed: (0.004 + Math.random() * 0.008) * (Math.random() > 0.5 ? 1 : -1),
        size: 1.5 + Math.random() * 2.5,
        alpha: 0.3 + Math.random() * 0.7,
      });
    }
    particlesRef.current = particles;
  }, []);

  // Canvas visualizer loop with both particle visualizer and circular EQ bars
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let angleOffset = 0;

    if (!isPowerOn) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (orbCoreRef.current) {
        orbCoreRef.current.style.transform = 'scale(1)';
      }
      return;
    }

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      const freqData = getFrequencyData();
      const rms = getVolumeRMS();
      const dynamicScale = 1 + Math.min(rms * 1.7, 0.4);
      currentScaleRef.current = currentScaleRef.current * 0.85 + dynamicScale * 0.15;

      if (orbCoreRef.current) {
        orbCoreRef.current.style.transform = `scale(${currentScaleRef.current})`;
      }

      const numBars = 44;
      const baseRadius = 88;
      angleOffset += 0.008;

      // 1. Render orbital floating particles
      const particles = particlesRef.current;
      for (const p of particles) {
        p.angle += p.speed;
        const currentDistance = p.baseRadius + (state === 'speaking' ? rms * 60 : rms * 30);
        p.x = centerX + Math.cos(p.angle) * currentDistance;
        p.y = centerY + Math.sin(p.angle) * currentDistance;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = state === 'speaking' ? aura.accentColor : aura.particleColor;
        ctx.globalAlpha = state === 'disconnected' ? p.alpha * 0.3 : p.alpha;
        ctx.shadowColor = aura.accentColor;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // 2. Render circular equalizer bars
      if (state === 'speaking' || state === 'listening') {
        for (let i = 0; i < numBars; i++) {
          const angle = (i / numBars) * Math.PI * 2 + angleOffset;
          const dataIndex = Math.floor((i / numBars) * (freqData.length / 2));
          const val = (freqData[dataIndex] || 0) / 255;
          const barLength = Math.max(3, val * 48 * (state === 'speaking' ? 1.3 : 1.0));

          const x1 = centerX + Math.cos(angle) * (baseRadius + 6);
          const y1 = centerY + Math.sin(angle) * (baseRadius + 6);
          const x2 = centerX + Math.cos(angle) * (baseRadius + 6 + barLength);
          const y2 = centerY + Math.sin(angle) * (baseRadius + 6 + barLength);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.lineWidth = 2.4;
          ctx.lineCap = 'round';
          ctx.strokeStyle = state === 'speaking' ? aura.accentColor : aura.particleColor;
          ctx.shadowColor = aura.accentColor;
          ctx.shadowBlur = 7;
          ctx.stroke();
        }
      } else if (state === 'connecting') {
        // Rotating tech radar arc
        const startArc = angleOffset * 3;
        const endArc = startArc + Math.PI * 1.1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius + 14, startArc, endArc);
        ctx.lineWidth = 3;
        ctx.strokeStyle = aura.accentColor;
        ctx.shadowColor = aura.accentColor;
        ctx.shadowBlur = 12;
        ctx.stroke();
      } else {
        // Idle gentle breathing halo
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius + 8, 0, Math.PI * 2);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.stroke();
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [state, aura, getFrequencyData, getVolumeRMS, isPowerOn]);

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-6">
      {/* Orb container */}
      <div
        id="molla-central-orb"
        onClick={onOrbClick}
        className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] flex items-center justify-center cursor-pointer group active:scale-95 transition-transform duration-150"
      >
        {/* Canvas visualizer layer */}
        <canvas
          ref={canvasRef}
          width={360}
          height={360}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Outer orbital boundary rings */}
        <div
          className={`absolute rounded-full border border-dashed transition-all duration-700 pointer-events-none ${
            !isPowerOn
              ? isLight
                ? 'w-[200px] h-[200px] border-slate-400/30 opacity-50'
                : 'w-[200px] h-[200px] border-slate-500/15 opacity-40'
              : state === 'speaking'
              ? `w-[250px] h-[250px] ${isLight ? 'border-rose-500/35' : 'border-white/25'} animate-[spin_12s_linear_infinite]`
              : state === 'listening'
              ? `w-[230px] h-[230px] ${isLight ? 'border-emerald-600/35' : 'border-white/15'} animate-[spin_25s_linear_infinite]`
              : `w-[215px] h-[215px] ${isLight ? 'border-slate-400/35' : 'border-white/15'} animate-[spin_40s_linear_infinite]`
          }`}
          style={{
            borderColor: isPowerOn && state !== 'disconnected' ? aura.accentColor + '55' : undefined,
          }}
        />

        {/* Core Glowing Orb */}
        <div
          ref={orbCoreRef}
          onClick={onOrbClick}
          className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full transition-all duration-300 flex items-center justify-center shadow-2xl cursor-pointer active:scale-95"
          style={{
            background: isPowerOn
              ? `radial-gradient(circle at 45% 35%, #ffffff 0%, #fda4af 18%, ${aura.accentColor} 58%, #700c28 96%)`
              : isLight
              ? `radial-gradient(circle at 45% 35%, #e2e8f0 0%, #cbd5e1 35%, #94a3b8 70%, #64748b 100%)`
              : `radial-gradient(circle at 45% 35%, #475569 0%, #334155 35%, #1e293b 70%, #0f172a 100%)`,
            boxShadow: isPowerOn
              ? `0 0 ${state === 'speaking' ? '70px' : state === 'listening' ? '55px' : '45px'} ${aura.glowColor}`
              : isLight
              ? '0 4px 24px rgba(148, 163, 184, 0.3)'
              : '0 4px 24px rgba(0, 0, 0, 0.4)',
            opacity: isPowerOn ? 1 : 0.65,
          }}
        >
          {/* Inner pulsating core sheen */}
          {isPowerOn && (
            <div
              className={`w-36 h-36 sm:w-42 sm:h-42 rounded-full transition-opacity duration-500 backdrop-blur-sm ${
                state === 'speaking'
                  ? 'opacity-90 animate-pulse'
                  : state === 'listening'
                  ? 'opacity-70 animate-[pulse_2.5s_ease-in-out_infinite]'
                  : state === 'connecting'
                  ? 'opacity-50 animate-[spin_3s_linear_infinite]'
                  : 'opacity-70 animate-[pulse_3s_ease-in-out_infinite]'
              }`}
              style={{
                background: `radial-gradient(circle at 45% 40%, rgba(255,255,255,0.9) 0%, ${aura.particleColor} 50%, transparent 80%)`,
              }}
            />
          )}

          {/* Central status emblem / glyph */}
          <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center px-2">
            <MayaAvatar size="md" className="mb-2 shadow-2xl rounded-2xl ring-2 ring-white/30 drop-shadow-lg pointer-events-auto" onClick={onOrbClick} />
            {!isPowerOn ? (
              <div className="flex flex-col items-center">
                <span className="text-white/90 text-sm sm:text-base font-bold tracking-widest font-display drop-shadow uppercase">
                  {assistantName}
                </span>
                <span className="text-[10px] sm:text-xs text-slate-300 font-bold tracking-wider uppercase mt-0.5">
                  POWER OFF
                </span>
              </div>
            ) : state === 'connecting' ? (
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-white text-sm sm:text-base font-bold tracking-widest font-display drop-shadow uppercase">
                  {assistantName}
                </span>
                <span className="text-[11px] sm:text-xs text-white/90 tracking-wider font-semibold uppercase mt-0.5 drop-shadow-sm">
                  {state === 'speaking'
                    ? 'SPEAKING...'
                    : state === 'listening'
                    ? 'LISTENING...'
                    : 'TAP TO TALK'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
