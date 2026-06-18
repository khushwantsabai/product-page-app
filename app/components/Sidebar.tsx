import { Link, useLocation } from "@remix-run/react";

export function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    // Exact match for dashboard to avoid matching /app/templates
    if (path === "/app") {
      return currentPath === "/app" || currentPath === "/app/";
    }
    return currentPath.startsWith(path);
  };

  return (
    <aside className="app-sidebar">
      <nav className="sidebar-nav">
        <Link to="/app" className={`sidebar-link ${isActive("/app") ? "active" : ""}`}>
          <div className="sidebar-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </div>
          Dashboard
        </Link>
        <Link to="/app/pages" className={`sidebar-link ${isActive("/app/pages") ? "active" : ""}`}>
          <div className="sidebar-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
          </div>
          My Pages
        </Link>
        <Link to="/app/templates" className={`sidebar-link ${isActive("/app/templates") ? "active" : ""}`}>
          <div className="sidebar-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
          </div>
          Templates
        </Link>
        <Link to="/app/analytics" className={`sidebar-link ${isActive("/app/analytics") ? "active" : ""}`}>
          <div className="sidebar-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
          </div>
          Analytics
        </Link>
        <Link to="/app/settings" className={`sidebar-link ${isActive("/app/settings") ? "active" : ""}`}>
          <div className="sidebar-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          </div>
          Settings
        </Link>
        <Link to="/app/help" className={`sidebar-link ${isActive("/app/help") ? "active" : ""}`}>
          <div className="sidebar-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          Help Center
        </Link>
      </nav>

      <div className="sidebar-divider"></div>

      <div className="premium-card">
        <div className="premium-icon">👑</div>
        <div className="premium-title">Premium Plan</div>
        <div className="premium-desc">
          Unlock all premium sections and templates.
        </div>
        <button className="premium-btn">Upgrade Now</button>
      </div>

      <div className="why-card">
        <div className="why-title">Why Mako Product Builder?</div>
        <div className="why-list">
          {[
            "High converting templates",
            "No coding required",
            "Mobile first editor",
            "Built for speed & SEO",
            "Increase sales & conversion"
          ].map((item, index) => (
            <div className="why-item" key={index}>
              <div className="why-check">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              {item}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
