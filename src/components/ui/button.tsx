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
            backgroundColor: 'var(--primary)',
            color: 'white',
        },
        secondary: {
            backgroundColor: 'var(--input)',
            color: 'var(--secondary)',
        },
        outline: {
            backgroundColor: 'transparent',
            border: '2px solid var(--border)',
            color: 'var(--secondary)',
        },
        ghost: {
            backgroundColor: 'transparent',
            color: 'var(--secondary)',
        }
    };

    const combinedStyle = { ...baseStyle, ...variants[variant] };

    return (
        <button className={className} style={combinedStyle} {...props}>
            {children}
        </button>
    );
}
