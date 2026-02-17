"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { Search as SearchIcon, X, Loader2 } from 'lucide-react';
import { useLocale } from 'next-intl';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const t = useTranslations('Search');
    const locale = useLocale();
    const isAr = locale === 'ar';

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        router.push(`/search?q=${encodeURIComponent(query)}` as any);
        onClose();
        setIsSearching(false);
    };

    if (!isOpen) return null;

    return (
        <div className="search-modal-overlay" onClick={onClose}>
            <div className="search-modal-content" onClick={e => e.stopPropagation()} style={{ direction: isAr ? 'rtl' : 'ltr' }}>
                <button className="close-btn" onClick={onClose}>
                    <X size={24} />
                </button>
                
                <form onSubmit={handleSearch} className="search-form">
                    <div className="input-wrapper">
                        <SearchIcon className="search-icon" size={24} />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t('placeholder')}
                            className="search-input"
                        />
                        {isSearching && <Loader2 className="spinner" size={20} />}
                    </div>
                    <button type="submit" className="search-submit-btn" disabled={!query.trim() || isSearching}>
                        {t('search')}
                    </button>
                </form>
            </div>

            <style jsx>{`
                .search-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(8px);
                    z-index: 2000;
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                    padding-top: 20vh;
                    animation: fadeIn 0.2s ease-out;
                }

                .search-modal-content {
                    width: 90%;
                    max-width: 600px;
                    background: white;
                    border-radius: 24px;
                    padding: 2rem;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    position: relative;
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .close-btn {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: none;
                    border: none;
                    color: #64748b;
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 50%;
                    transition: all 0.2s;
                }

                .close-btn:hover {
                    background: #f1f5f9;
                    color: #0f172a;
                }

                .search-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .search-icon {
                    position: absolute;
                    left: ${isAr ? 'unset' : '1rem'};
                    right: ${isAr ? '1rem' : 'unset'};
                    color: #94a3b8;
                    pointer-events: none;
                }

                .spinner {
                    position: absolute;
                    right: ${isAr ? 'unset' : '1rem'};
                    left: ${isAr ? '1rem' : 'unset'};
                    color: #e9496c;
                    animation: spin 1s linear infinite;
                }

                .search-input {
                    width: 100%;
                    padding: 1rem;
                    padding-left: ${isAr ? '1rem' : '3.5rem'};
                    padding-right: ${isAr ? '3.5rem' : '1rem'};
                    font-size: 1.25rem;
                    border: 2px solid #e2e8f0;
                    border-radius: 16px;
                    outline: none;
                    transition: all 0.2s;
                    font-family: inherit;
                }

                .search-input:focus {
                    border-color: #e9496c;
                    box-shadow: 0 0 0 4px rgba(233, 73, 108, 0.1);
                }

                .search-submit-btn {
                    background: #e9496c;
                    color: white;
                    border: none;
                    padding: 1rem;
                    border-radius: 14px;
                    font-size: 1.1rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .search-submit-btn:hover:not(:disabled) {
                    background: #d63d5c;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(233, 73, 108, 0.3);
                }

                .search-submit-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
