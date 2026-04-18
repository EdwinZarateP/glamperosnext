'use client';

interface ChevronIconoProps {
  open?: boolean;
  size?: number;
  className?: string;
}

export default function ChevronIcono({
  open = false,
  size = 12,
  className,
}: ChevronIconoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      className={className}
      style={{
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s ease',
        transformOrigin: 'center',
      }}
    >
      <path
        d="M2 4l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}