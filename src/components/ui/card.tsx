import React from 'react';

type CardProps = React.HTMLAttributes<HTMLDivElement>;

type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

export function Card({ className, children, ...props }: CardProps) {
    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #f1f5f9',
            overflow: 'hidden',
        }} className={className} {...props}>
            {children}
        </div>
    );
}

export function CardHeader({ children, className, ...props }: CardProps) {
    return (
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }} className={className} {...props}>
            {children}
        </div>
    );
}

export function CardTitle({ children, className, ...props }: CardTitleProps) {
    return (
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', margin: 0 }} className={className} {...props}>
            {children}
        </h3>
    );
}

export function CardContent({ children, className, ...props }: CardProps) {
    return (
        <div style={{ padding: '1.5rem' }} className={className} {...props}>
            {children}
        </div>
    );
}
