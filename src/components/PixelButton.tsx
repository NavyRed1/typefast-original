import React, { useState } from 'react';

export type PixelButtonVariant = 'default' | 'primary' | 'danger';

const VARIANT_BG: Record<PixelButtonVariant, string> = {
  default: '#1b1f2e',
  primary: '#34d3ff',
  danger: '#f85252',
};
const VARIANT_TEXT: Record<PixelButtonVariant, string> = {
  default: '#f5f7ff',
  primary: '#05060a',
  danger: '#05060a',
};
const VARIANT_BORDER: Record<PixelButtonVariant, string> = {
  default: '#2a3042',
  primary: '#7de5ff',
  danger: '#ffb0b0',
};

export function PixelButton({
  children,
  onClick,
  variant = 'default',
  disabled,
  full,
  small,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: PixelButtonVariant;
  disabled?: boolean;
  full?: boolean;
  small?: boolean;
  title?: string;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      title={title}
      disabled={disabled}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onClick={onClick}
      style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: small ? 10 : 12,
        lineHeight: 1.4,
        letterSpacing: 0.5,
        color: disabled ? '#626a80' : VARIANT_TEXT[variant],
        background: disabled ? '#121520' : VARIANT_BG[variant],
        border: `2px solid ${disabled ? '#2a3042' : VARIANT_BORDER[variant]}`,
        borderRadius: 2,
        padding: small ? '8px 12px' : '12px 18px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: full ? '100%' : undefined,
        boxShadow: disabled ? 'none' : pressed ? '2px 2px 0 #0a0c14' : '4px 4px 0 #0a0c14',
        transform: pressed ? 'translate(2px, 2px)' : 'translate(0, 0)',
        transition: 'transform 90ms ease, box-shadow 90ms ease',
        textAlign: 'center',
        userSelect: 'none',
      }}
    >
      {children}
    </button>
  );
}
