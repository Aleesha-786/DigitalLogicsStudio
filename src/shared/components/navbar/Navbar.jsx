import { memo, useMemo, useState, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/context/AuthContext";

import { BrandLogo } from "./BrandLogo";
import { ProfileDropdown } from "./ProfileDropdown";
import ThemeToggler from "./ThemeToggler";

const DLD_NAV_LINKS = [
  { to: "/", label: "Home", end: true }, 
  { to: "/problems", label: "Problems" },
  { to: "/boolforge", label: "Circuit Forge" },
  { to: "/kmapgenerator", label: "K-Map Studio" },
];

const COAL_NAV_LINKS = [
  { to: "/", label: "Home", end: true }, 
  { to: "/problems", label: "Problems" },
  { to: "/resources/coal", label: "COAL Home", end: true },
  { to: "/resources/coal/practical", label: "Practical" },
];

function isCoalTheoryRoute(pathname) {
  return pathname.startsWith("/resources/coal/theory") || pathname.startsWith("/coal/");
}

function isCoalRoute(pathname) {
  return pathname.startsWith("/resources/coal") || pathname.startsWith("/coal/");
}

function NavbarBase({ 
  toggleTheme, 
  theme, 
  onHomeClick, 
  isVisible = true 
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu automatically if navbar is hidden externally
  useEffect(() => {
    if (!isVisible) {
      setMenuOpen(false);
    }
  }, [isVisible]);

  const onCoalTrack = isCoalRoute(location.pathname);
  const navLinks = (onCoalTrack ? COAL_NAV_LINKS : DLD_NAV_LINKS).filter(
    (link) => !(link.to === "/" && location.pathname === "/"),
  );
  const brandTagline = onCoalTrack
    ? "Computer Organization & Assembly"
    : "The Digital Logic Playground";

  const userInitials = useMemo(() => {
    const name = user?.name?.trim();
    if (!name) return "U";
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }, [user?.name]);

  if (!isVisible) return null;

  const handleHomeClick = () => {
    setMenuOpen(false);
    onHomeClick?.();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setMenuOpen(false);
    }
  };

  const renderNavLinks = (baseClassName) =>
    navLinks.map(({ to, label, end, matchTheory }) => (
      <NavLink
        key={to}
        to={to}
        end={end}
        className={() => {
          const active = matchTheory
            ? isCoalTheoryRoute(location.pathname)
            : end
              ? location.pathname === to
              : location.pathname.startsWith(to);
          return active ? `${baseClassName} home-nav-link--active` : baseClassName;
        }}
        onClick={() => setMenuOpen(false)}
      >
        {label}
      </NavLink>
    ));

  return (
    <header className="home-header">
      <div className="home-header-inner">
        <BrandLogo tagline={brandTagline} onClick={handleHomeClick} />

        <nav className="home-nav" aria-label="Main navigation">
          {renderNavLinks("home-nav-link")}
        </nav>

        <div className="home-nav-controls">
          {!loading && (
            <div className="home-auth-actions">
              {user ? (
                <ProfileDropdown
                  user={user}
                  userInitials={userInitials}
                  onLogout={handleLogout}
                  onCloseAll={() => setMenuOpen(false)}
                />
              ) : (
                <>
                  <Link to="/login" className="home-auth-btn home-auth-btn--ghost" onClick={() => setMenuOpen(false)}>
                    Login
                  </Link>
                  <Link to="/signup" className="home-auth-btn home-auth-btn--primary" onClick={() => setMenuOpen(false)}>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          )}

          <ThemeToggler theme={theme} toggleTheme={toggleTheme} />

          <button
            className={`home-hamburger${menuOpen ? " is-open" : ""}`}
            onClick={() => setMenuOpen((p) => !p)}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="home-mobile-nav"
          >
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
          </button>
        </div>
      </div>

      <nav
        id="home-mobile-nav"
        className={`home-mobile-nav${menuOpen ? " is-open" : ""}`}
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        <div className="home-mobile-nav-inner">
          {renderNavLinks("home-mobile-link")}
          {!loading && (
            <div className="home-mobile-auth">
              {user ? (
                <>
                  <Link to="/profile" className="home-auth-btn home-auth-btn--ghost" onClick={() => setMenuOpen(false)}>
                    Profile
                  </Link>
                  <Link to="/settings" className="home-auth-btn home-auth-btn--ghost" onClick={() => setMenuOpen(false)}>
                    Settings
                  </Link>
                  <button type="button" className="home-auth-btn home-auth-btn--danger" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="home-auth-btn home-auth-btn--ghost" onClick={() => setMenuOpen(false)}>
                    Login
                  </Link>
                  <Link to="/signup" className="home-auth-btn home-auth-btn--primary" onClick={() => setMenuOpen(false)}>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export const Navbar = memo(NavbarBase);
