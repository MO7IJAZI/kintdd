import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
            <Sidebar />
            <main style={{
                flex: 1,
                marginLeft: '280px', // Matches Sidebar width + breathing room
                padding: '3rem',
                minHeight: '100vh',
                maxWidth: 'calc(100vw - 280px)', // Prevent overflow
                overflowX: 'hidden'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
