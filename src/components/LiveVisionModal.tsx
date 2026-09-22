import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, RefreshCw, Eye, Sparkles, Check, AlertCircle } from 'lucide-react';
import { AtmosphereConfig } from '../types';

interface LiveVisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendVisualInput: (imageDataUrl: string, promptText?: string) => void;
  onSendVideoFrame?: (imageDataUrl: string) => void;
  aura: AtmosphereConfig;
  isLiveActive: boolean;
  effectiveTheme?: 'light' | 'dark';
}

export const LiveVisionModal: React.FC<LiveVisionModalProps> = ({
  isOpen,
  onClose,
  onSendVisualInput,
  onSendVideoFrame,
  aura,
  isLiveActive,
  effectiveTheme = 'dark',
}) => {
  const isLight = effectiveTheme === 'light';
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStreamingVision, setIsStreamingVision] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const visionStreamIntervalRef = useRef<any>(null);

  // Stop current camera stream
  const stopStream = useCallback(() => {
    if (visionStreamIntervalRef.current) {
      clearInterval(visionStreamIntervalRef.current);
      visionStreamIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      streamRef.current = null;
    }
  }, []);

  // Start camera stream
  const startCamera = useCallback(async () => {
    stopStream();
    setCameraError(null);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('[Vision] Camera access error:', err);
      setCameraError('Unable to access camera. Please allow camera permissions in your browser.');
    }
  }, [facingMode, stopStream]);

  // Handle open / close lifecycle
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopStream();
      setIsStreamingVision(false);
      setCapturedPhoto(null);
      setQuestionText('');
      setIsSending(false);
    }
    return () => {
      stopStream();
    };
  }, [isOpen, startCamera, stopStream]);

  // Capture current video frame as base64 JPEG
  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return null;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.75);
  }, []);

  // Continuous vision stream loop
  useEffect(() => {
    if (isStreamingVision && isLiveActive && !capturedPhoto) {
      visionStreamIntervalRef.current = setInterval(() => {
        const frame = captureFrame();
        if (frame && onSendVideoFrame) {
          onSendVideoFrame(frame);
        }
      }, 2400);
    } else {
      if (visionStreamIntervalRef.current) {
        clearInterval(visionStreamIntervalRef.current);
        visionStreamIntervalRef.current = null;
      }
    }

    return () => {
      if (visionStreamIntervalRef.current) {
        clearInterval(visionStreamIntervalRef.current);
        visionStreamIntervalRef.current = null;
      }
    };
  }, [isStreamingVision, isLiveActive, capturedPhoto, captureFrame, onSendVideoFrame]);

  // Flip camera (front / back)
  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Take snapshot
  const handleSnapPhoto = () => {
    const frame = captureFrame();
    if (frame) {
      setCapturedPhoto(frame);
    }
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedPhoto(null);
    setQuestionText('');
  };

  // Submit photo to Molla
  const handleSendPhoto = () => {
    if (!capturedPhoto) return;
    setIsSending(true);
    onSendVisualInput(capturedPhoto, questionText.trim());
    setTimeout(() => {
      setIsSending(false);
      onClose();
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border backdrop-blur-2xl transition-colors ${
          isLight
            ? 'bg-white/95 border-white/90 text-slate-800 shadow-[0_20px_50px_rgba(15,23,42,0.15)]'
            : 'bg-[#0b1120]/90 border-white/15 text-slate-100 shadow-[0_25px_60px_rgba(0,0,0,0.6)]'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-4 py-3 border-b backdrop-blur-xl ${
            isLight ? 'bg-slate-100/80 border-slate-200/80' : 'bg-[#151c2c]/80 border-white/10'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2
                className={`text-sm font-bold flex items-center gap-1.5 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Camera Vision (Visual AI)
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  GEMINI VISION
                </span>
              </h2>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {isLiveActive ? 'Molla can view your camera stream and talk in real-time' : 'Snap a photo or show an object to ask questions'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder View */}
        <div className="relative bg-black aspect-4/3 w-full flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center text-slate-300 flex flex-col items-center gap-3">
              <AlertCircle className="w-10 h-10 text-rose-400" />
              <p className="text-xs text-rose-300 max-w-xs">{cameraError}</p>
              <button
                type="button"
                onClick={startCamera}
                className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-xs text-white"
              >
                Try Again
              </button>
            </div>
          ) : capturedPhoto ? (
            <img
              src={capturedPhoto}
              alt="Captured"
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Futuristic scanning visual effect if streaming */}
              {isStreamingVision && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden border-2 border-cyan-400/50">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-pulse" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 border border-cyan-400/40 text-[10px] font-mono text-cyan-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    LIVE VISION STREAMING
                  </div>
                </div>
              )}

              {/* Target focus reticle */}
              <div className="absolute inset-10 border border-white/20 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
                <div className="flex justify-between">
                  <span className="w-4 h-4 border-t-2 border-l-2 border-pink-400" />
                  <span className="w-4 h-4 border-t-2 border-r-2 border-pink-400" />
                </div>
                <div className="flex justify-between">
                  <span className="w-4 h-4 border-b-2 border-l-2 border-pink-400" />
                  <span className="w-4 h-4 border-b-2 border-r-2 border-pink-400" />
                </div>
              </div>
            </>
          )}

          {/* Hidden Canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Flip camera button */}
          {!capturedPhoto && !cameraError && (
            <button
              type="button"
              onClick={handleToggleFacingMode}
              title="Flip Camera (Front / Back)"
              className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 border border-white/20 text-white backdrop-blur-md transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div
          className={`p-4 flex flex-col gap-3 backdrop-blur-xl ${
            isLight ? 'bg-slate-50/90' : 'bg-[#0d1424]/90'
          }`}
        >
          {capturedPhoto ? (
            <div className="flex flex-col gap-2.5">
              <input
                type="text"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Want to ask something about this picture? (Optional)"
                className={`w-full border rounded-xl px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:border-pink-500 ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-900 shadow-xs'
                    : 'bg-[#1b253b] border-white/10 text-slate-100'
                }`}
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRetake}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isLight
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                      : 'bg-white/10 hover:bg-white/15 text-slate-200'
                  }`}
                >
                  Retake
                </button>
                <button
                  type="button"
                  disabled={isSending}
                  onClick={handleSendPhoto}
                  className="flex-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  {isSending ? 'Sending...' : 'Show to Molla & Ask'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {/* Live continuous vision toggle (when in 1st live call) */}
              {isLiveActive && (
                <div
                  className={`flex items-center justify-between px-3 py-2 rounded-xl border ${
                    isLight
                      ? 'bg-white border-slate-200 shadow-xs'
                      : 'bg-[#162035] border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Eye className={`w-4 h-4 ${isStreamingVision ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <div className="flex flex-col">
                      <span
                        className={`text-xs font-medium ${
                          isLight ? 'text-slate-800' : 'text-slate-200'
                        }`}
                      >
                        Live Vision Stream
                      </span>
                      <span className="text-[10px] text-slate-400">Molla will see your camera live while talking</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsStreamingVision(!isStreamingVision)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      isStreamingVision
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                        : isLight
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    {isStreamingVision ? 'Active' : 'Enable'}
                  </button>
                </div>
              )}

              {/* Snap snapshot button */}
              <button
                type="button"
                onClick={handleSnapPhoto}
                disabled={Boolean(cameraError)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-500/30 active:scale-98 transition-all cursor-pointer disabled:opacity-40"
              >
                <Camera className="w-4 h-4" />
                Snap Photo & Ask
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
