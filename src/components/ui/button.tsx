import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
}

export function Button({ className, variant = 'primary', size = 'md', children, ...props }: ButtonProps) {
    const baseStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        borderRadius: '0.5rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        border: 'none',
        textDecoration: 'none',
        padding: size === 'lg' ? '0.75rem 2rem' : '0.5rem 1rem',
        fontSize: size === 'lg' ? '1.1rem' : '0.9rem',
    };

    const variants: Record<ButtonVariant, React.CSSProperties> = {
        primary: {
            backgroundColor: '#e9496c', // coral red
            color: 'white',
        },
        secondary: {
            backgroundColor: '#f1f5f9', // slate-100
            color: '#1e293b', // slate-800
        },
        outline: {
            backgroundColor: 'transparent',
            border: '2px solid #e2e8f0', // slate-200
            color: '#1e293b',
        },
        ghost: {
            backgroundColor: 'transparent',
            color: '#1e293b',
        }
    };

    const combinedStyle = { ...baseStyle, ...variants[variant] };

    return (
        <button className={className} style={combinedStyle} {...props}>
            {children}
        </button>
    );
}
