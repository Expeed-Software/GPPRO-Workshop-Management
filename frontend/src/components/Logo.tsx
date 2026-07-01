import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  textColor?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 36,
  showText = true,
  textColor = '#fff',
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="36" height="36" rx="10" fill="#fff" fillOpacity="0.18" />
      <rect x="1" y="1" width="34" height="34" rx="9" stroke="#fff" strokeOpacity="0.4" strokeWidth="1.5" />
      <path
        d="M18 7L28 13V23L18 29L8 23V13L18 7Z"
        fill="#fff"
        fillOpacity="0.9"
      />
      <path
        d="M18 11L24 14.5V21.5L18 25L12 21.5V14.5L18 11Z"
        fill="#3831c4"
        fillOpacity="0.85"
      />
      <circle cx="18" cy="18" r="3" fill="#fff" />
    </svg>
    {showText && (
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span
          style={{
            color: textColor,
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
          }}
        >
          GPPRO Workshop Management
        </span>
        <span
          style={{
            color: textColor,
            opacity: 0.7,
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Business Ops
        </span>
      </div>
    )}
  </div>
);
