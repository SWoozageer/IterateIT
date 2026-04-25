import Sidebar from './Sidebar'

// Wraps every authenticated page with the sidebar layout
export default function PageWrapper({ children, title, subtitle, actions }) {
  return (
    <div className="flex min-h-screen bg-brand-off-white">

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Page header */}
        <header className="bg-white border-b border-brand-divider px-8 py-5 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-brand-navy">
              {title}
            </h2>
            {subtitle && (
              <p className="text-brand-steel text-sm mt-0.5">{subtitle}</p>
            )}
          </div>
          {/* Optional action buttons (e.g., "New Ticket") passed in as props */}
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </header>

        {/* Page body */}
        <main className="flex-1 px-8 py-6">
          {children}
        </main>

      </div>
    </div>
  )
}