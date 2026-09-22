import React from 'react';

interface MayaAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  className?: string;
  onClick?: () => void;
}

export const MayaAvatar: React.FC<MayaAvatarProps> = ({
  size = 'md',
  showLabel = false,
  className = '',
  onClick,
}) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14',
  };

  return (
    <div
      onClick={onClick}
      className={`relative rounded-xl flex items-center justify-center cursor-pointer select-none overflow-hidden transition-all duration-200 active:scale-95 ${sizeMap[size]} ${className}`}
      style={{
        background: 'linear-gradient(135deg, #0b1736 0%, #172554 50%, #1e1b4b 100%)',
        border: '1.5px solid rgba(59, 130, 246, 0.5)',
        boxShadow: '0 0 12px rgba(59, 130, 246, 0.35)',
      }}
      title="Maya AI"
    >
      {/* Stylized cyber anime portrait representation */}
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full p-1 drop-shadow"
      >
        {/* Outer subtle glow circle */}
        <circle cx="24" cy="24" r="20" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
        
        {/* Headphone band */}
        <path
          d="M12 24C12 16 17 11 24 11C31 11 36 16 36 24"
          stroke="#00f2fe"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Headphone ear pads */}
        <rect x="9" y="21" width="4.5" height="9" rx="2" fill="#38bdf8" />
        <rect x="34.5" y="21" width="4.5" height="9" rx="2" fill="#38bdf8" />

        {/* Character Hair & Face */}
        <path
          d="M16 23C16 19 19.5 15 24 15C28.5 15 32 19 32 23V27C32 30.5 28.5 33 24 33C19.5 33 16 30.5 16 27V23Z"
          fill="#0f172a"
        />
        {/* Glowing cyber bangs / hair strands */}
        <path
          d="M17 19C21 21 27 21 31 19C29 25 25 26 24 26C23 26 19 25 17 19Z"
          fill="#3b82f6"
          opacity="0.9"
        />
        {/* Cyber glowing eyes */}
        <circle cx="20.5" cy="24" r="1.5" fill="#38bdf8" />
        <circle cx="27.5" cy="24" r="1.5" fill="#38bdf8" />

        {/* Cyber ear piece glow accents */}
        <circle cx="11.25" cy="25.5" r="1" fill="#fff" />
        <circle cx="36.75" cy="25.5" r="1" fill="#fff" />

        {/* Collar / suit glow */}
        <path
          d="M17 38C19 35 29 35 31 38"
          stroke="#60a5fa"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {showLabel && (
        <span className="absolute bottom-0 text-[7px] font-black tracking-widest text-cyan-300 uppercase px-1 bg-black/60 rounded">
          MAYA
        </span>
      )}
    </div>
  );
};
