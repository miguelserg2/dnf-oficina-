import React from 'react';

interface LogoProps {
    className?: string;
}

const Logo: React.FC<LogoProps> = (props) => (
    <svg 
        viewBox="0 0 130 40" 
        xmlns="http://www.w3.org/2000/svg" 
        aria-label="Logo de DNF"
        {...props}
    >
        <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#818cf8' }} />
                <stop offset="100%" style={{ stopColor: '#4f46e5' }} />
            </linearGradient>
        </defs>
        <g fill="url(#logoGradient)">
            {/* D */}
            <path d="M0 0 H15 C30 0, 30 40, 15 40 H0 V0 Z M10 10 V30 H15 C25 30, 25 10, 15 10 H10 Z" />
            
            {/* N */}
            <path d="M40 0 H50 V15 L70 40 H80 V25 L60 0 H50 V40 H40 V0 Z" />
            
            {/* F */}
            <path d="M90 0 H120 V10 H100 V17 H115 V27 H100 V40 H90 V0 Z" />
        </g>
    </svg>
);

export default Logo;
