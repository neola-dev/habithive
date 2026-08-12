import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Swords, 
  LogOut
} from "lucide-react";

function AppShell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const userName = userInfo?.name || "User";
  const userInitials = userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const menuItems = [
    { name: "Dashboard", path: "/app", icon: LayoutDashboard },
    { name: "Battles", path: "/battles", icon: Swords },
  ];

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleItemClick = (path) => {
    navigate(path);
  };

  return (
    <div className="app-shell">
      {/* DESKTOP SIDEBAR */}
      <aside className="app-sidebar">
        <div>
          <div className="sidebar-logo" style={{ color: "var(--color-primary, #FF7200)" }}>
            HabitHive
          </div>

          <nav className="sidebar-menu">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.name}
                  onClick={() => handleItemClick(item.path)}
                  className={`sidebar-item ${isActive ? "active" : ""}`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{userInitials}</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{userName}</span>
              <span className="sidebar-user-role">Streak Builder</span>
            </div>
          </div>

          <button onClick={handleLogout} className="sidebar-item" style={{ color: "var(--color-error)", border: "none", padding: "12px var(--space-md)", background: "transparent" }}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="mobile-header">
        <div className="sidebar-logo" style={{ marginBottom: 0, fontSize: "18px", color: "var(--color-primary, #FF7200)" }}>
          HabitHive
        </div>
        <div className="sidebar-avatar" style={{ width: "32px", height: "32px", fontSize: "12px" }}>
          {userInitials}
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="app-main">
        {children}
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="mobile-bottom-nav">
        <div style={{ display: "flex", height: "100%", width: "100%" }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => handleItemClick(item.path)}
                className={`mobile-nav-item ${isActive ? "active" : ""}`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </button>
            );
          })}
          <button
            onClick={handleLogout}
            className="mobile-nav-item"
            style={{ color: "var(--color-error)" }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default AppShell;
