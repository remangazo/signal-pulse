export function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-signal/20 border border-signal/30 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="oklch(68% 0.18 75)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-muted">SignalPulse</span>
          </div>
          <p className="text-xs text-subtle">
            &copy; {new Date().getFullYear()} SignalPulse. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-subtle hover:text-muted transition-colors">Privacy</a>
            <a href="#" className="text-xs text-subtle hover:text-muted transition-colors">Terms</a>
            <a href="#" className="text-xs text-subtle hover:text-muted transition-colors">hello@signalpulse.ai</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
