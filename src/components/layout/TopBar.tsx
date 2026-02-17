import { Link } from '@/navigation';

export default function TopBar() {
    return (
        <div style={{
            backgroundColor: 'var(--secondary)',
            color: 'white',
            height: 'var(--top-bar-height)',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center'
        }}>
            <div className="container" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <span>KAFRI INTERNATIONAL - Leading Excellence in Agriculture</span>
                    <Link href={{pathname: '/news'}} style={{ color: 'var(--accent)', fontWeight: '600' }}>
                        Latest News: Innovations in Bio-fertilizers →
                    </Link>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <select style={{
                        background: 'transparent',
                        color: 'white',
                        border: 'none',
                        fontSize: 'inherit',
                        cursor: 'pointer'
                    }}>
                        <option value="en">ENGLISH</option>
                        <option value="pl">POLSKI</option>
                        <option value="es">ESPAÑOL</option>
                    </select>
                    <Link href="/contact" style={{ opacity: 0.9 }}>Contact Us</Link>
                </div>
            </div>
        </div>
    );
}
