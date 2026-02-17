"use client";

import { useState } from "react";

interface Tab {
    label: string;
    content: React.ReactNode;
}

export default function Tabs({ tabs }: { tabs: Tab[] }) {
    // -1 means no tab is active by default, or 0 if we want the first one open
    // The user said "content hidden, when clicking... it opens", implying initially closed or toggleable.
    // Let's start with all closed (null) or first one open? 
    // Usually product pages have at least one open. But "content hidden" suggests maybe all closed?
    // Let's default to null (all closed) to strictly follow "content hidden".
    // Actually, for better UX, usually the first one is open. But let's stick to the request "content hidden".
    // I will allow toggling.
    
    const [activeTab, setActiveTab] = useState<number | null>(null);

    const toggleTab = (index: number) => {
        if (activeTab === index) {
            setActiveTab(null); // Close if already open
        } else {
            setActiveTab(index); // Open new one
        }
    };

    return (
        <div style={{ width: '100%', marginTop: '3rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', overflow: 'hidden' }}>
            {tabs.map((tab, index) => (
                <div key={index} style={{ borderBottom: index === tabs.length - 1 ? 'none' : '1px solid #e2e8f0' }}>
                    <button
                        onClick={() => toggleTab(index)}
                        style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1.25rem 1.5rem',
                            backgroundColor: activeTab === index ? '#f8fafc' : 'white',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            border: 'none',
                            outline: 'none',
                            textAlign: 'left'
                        }}
                    >
                        <span style={{ 
                            fontSize: '1.1rem', 
                            fontWeight: 700, 
                            color: activeTab === index ? 'var(--primary)' : '#334155' 
                        }}>
                            {tab.label}
                        </span>
                        <span style={{ 
                            transform: activeTab === index ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease',
                            fontSize: '0.9rem',
                            color: '#94a3b8'
                        }}>
                            ▼
                        </span>
                    </button>
                    
                    <div 
                        style={{
                            maxHeight: activeTab === index ? '2000px' : '0',
                            opacity: activeTab === index ? 1 : 0,
                            overflow: 'hidden',
                            transition: 'all 0.3s ease-in-out',
                            backgroundColor: 'white'
                        }}
                    >
                        <div style={{ padding: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                            {tab.content}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
