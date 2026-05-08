import { Sidebar, MobileNav } from '@/components/dashboard/sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100dvh',
      background: 'var(--bg-base)',
    }}>
      {/* Desktop Sidebar */}
      <div style={{ display: 'none' }} className="md-sidebar">
        <Sidebar />
      </div>

      {/* Mobile Sidebar jako overlay / hidden on mobile */}
      <style>{`
        @media (min-width: 768px) {
          .md-sidebar { display: block !important; }
          .mobile-nav { display: none !important; }
          .main-content { padding-bottom: 0 !important; }
        }
        @media (max-width: 767px) {
          .md-sidebar { display: none !important; }
        }
      `}</style>

      {/* Main content */}
      <main
        className="main-content"
        style={{
          flex: 1,
          minWidth: 0,
          overflowX: 'hidden',
          paddingBottom: '80px',  // space for mobile nav
        }}
      >
        {children}
      </main>

      {/* Mobile bottom nav */}
      <div className="mobile-nav">
        <MobileNav />
      </div>
    </div>
  )
}
