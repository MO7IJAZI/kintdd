"use client";

import Sidebar from "@/components/admin/Sidebar";
import { useState } from "react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
            {/* Mobile Toggle Button */}
            <div className="mobile-nav-toggle">
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="toggle-btn"
                    aria-label="Toggle Menu"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
            </div>

            {/* Sidebar Wrapper */}
            <div className={`admin-sidebar-wrapper ${isSidebarOpen ? 'open' : ''}`}>
                <Sidebar />
            </div>

            {/* Backdrop for mobile */}
            {isSidebarOpen && (
                <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* Main Content */}
            <main className="admin-main-content">
                <div style={{ width: '100%' }}>
                    {children}
                </div>
            </main>
            
            <style jsx global>{`
                /* Hide sidebar and adjust main content on login page */
                body:has(.admin-login-page) .admin-sidebar-wrapper,
                body:has(.admin-login-page) .mobile-nav-toggle {
                    display: none !important;
                }
                
                body:has(.admin-login-page) .admin-main-content {
                    margin-left: 0 !important;
                    padding: 0 !important;
                    width: 100% !important;
                    max-width: 100vw !important;
                }

                /* Default Admin Layout Styles */
                .admin-sidebar-wrapper {
                    width: 280px;
                    flex-shrink: 0;
                    height: 100vh;
                    position: fixed;
                    left: 0;
                    top: 0;
                    z-index: 100;
                    background-color: #0f172a;
                    box-shadow: 4px 0 24px rgba(0,0,0,0.1);
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .admin-main-content {
                    flex: 1;
                    margin-left: 280px;
                    padding: 2rem;
                    min-height: 100vh;
                    width: calc(100% - 280px);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .mobile-nav-toggle {
                    display: none;
                    position: fixed;
                    top: 1rem;
                    left: 1rem;
                    z-index: 110;
                }

                .toggle-btn {
                    padding: 0.75rem;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.5rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #0f172a;
                    transition: all 0.2s;
                }

                .toggle-btn:hover {
                    background: #f8fafc;
                    transform: translateY(-1px);
                }

                .sidebar-backdrop {
                    display: none;
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                    z-index: 90;
                    animation: fadeIn 0.2s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                /* Responsive Styles */
                @media (max-width: 1024px) {
                    .admin-sidebar-wrapper {
                        transform: translateX(-100%);
                    }

                    .admin-sidebar-wrapper.open {
                        transform: translateX(0);
                    }

                    .admin-main-content {
                        margin-left: 0;
                        width: 100%;
                        padding: 1.5rem;
                        padding-top: 5rem; /* Space for the toggle button */
                    }

                    .mobile-nav-toggle {
                        display: block;
                    }

                    .sidebar-backdrop {
                        display: block;
                    }
                }

                @media (max-width: 640px) {
                    .admin-main-content {
                        padding: 1rem;
                        padding-top: 5rem;
                    }
                }
            `}</style>
        </div>
    );
}
