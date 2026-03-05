import { useState } from "react";
import Logo from "../assets/Logo.png";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import AvatarImg from "../components/common/AvatarImg";
import ProfileModal from "../components/common/ProfileModal";
import styles from "./MainLayout.module.css";

const MainLayout = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const handleLogout = () => { logout(); navigate("/login"); setDrawerOpen(false); };

    return (
        <div className={styles.layout}>
            {/* ── Desktop Navbar ── */}
            <nav className={styles.navbar}>
                <Link to="/" className={styles.brand}>
                    <img src={Logo} alt="Sankalp Infotech" className={styles.brandLogo} />
                </Link>

                {/* Desktop links */}
                <div className={styles.navRight}>
                    <Link to="/testimonials" className={styles.navLink}>Testimonials</Link>
                    <Link to="/about" className={styles.navLink}>About Us</Link>
                    <Link to="/portfolio" className={styles.navLink}>Portfolio</Link>
                    <Link to="/blogs" className={styles.navLink}>Blog</Link>
                    <Link to="/chat" className={styles.navLink}>💬 Chat</Link>
                    <Link to="/reels" className={styles.navLink}>📱 Reels</Link>
                    <Link to="/contact" className={styles.navLink}>Contact</Link>
                    {user ? (
                        <>
                            {user.role === "admin" && (
                                <Link to="/admin/dashboard" className={styles.navLink}>Admin Panel</Link>
                            )}
                            {/* Avatar button opens ProfileModal */}
                            <button
                                className={styles.avatarBtn}
                                onClick={() => setProfileOpen(true)}
                                title="My Profile"
                            >
                                <AvatarImg userId={user._id} name={user.name} hasAvatar={user.hasAvatar} size={32} />
                                <span className={styles.avatarName}>{user.name?.split(" ")[0]}</span>
                                {user.plan && (
                                    <span style={{ fontSize: "0.65rem", padding: "2px 6px", borderRadius: "10px", background: "var(--primary)", color: "white", marginLeft: "6px", textTransform: "uppercase", fontWeight: "bold" }}>
                                        {user.plan}
                                    </span>
                                )}
                            </button>
                            <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className={styles.navLink}>Login</Link>
                            <Link to="/register" className={styles.navLink}>Register</Link>
                        </>
                    )}

                    {/* Theme toggle */}
                    <button
                        className={styles.themeToggle}
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                        title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {theme === "dark" ? "☀️" : "🌙"}
                    </button>

                    {/* Hamburger (shown on mobile) */}
                    <button
                        className={styles.hamburger}
                        onClick={() => setDrawerOpen(true)}
                        aria-label="Open menu"
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                </div>
            </nav>

            {/* ── Mobile Drawer ── */}
            {drawerOpen && (
                <div
                    className={`${styles.mobileDrawer} ${styles.mobileDrawerOpen}`}
                    onClick={() => setDrawerOpen(false)}
                >
                    <div className={styles.mobileDrawerInner} onClick={e => e.stopPropagation()}>
                        <button className={styles.mobileClose} onClick={() => setDrawerOpen(false)}>✕</button>
                        <Link to="/" className={styles.mobileNavLink} onClick={() => setDrawerOpen(false)}>Home</Link>
                        <Link to="/testimonials" className={styles.mobileNavLink} onClick={() => setDrawerOpen(false)}>Testimonials</Link>
                        <Link to="/about" className={styles.mobileNavLink} onClick={() => setDrawerOpen(false)}>About Us</Link>
                        <Link to="/portfolio" className={styles.mobileNavLink} onClick={() => setDrawerOpen(false)}>Portfolio</Link>
                        <Link to="/blogs" className={styles.mobileNavLink} onClick={() => setDrawerOpen(false)}>Blog</Link>
                        <Link to="/chat" className={styles.mobileNavLink} onClick={() => setDrawerOpen(false)}>💬 Chat</Link>
                        <Link to="/reels" className={styles.mobileNavLink} onClick={() => setDrawerOpen(false)}>📱 Reels</Link>
                        <Link to="/contact" className={styles.mobileNavLink} onClick={() => setDrawerOpen(false)}>Contact</Link>
                        {user ? (
                            <>
                                {user.role === "admin" && (
                                    <Link to="/admin/dashboard" className={styles.mobileNavLink} onClick={() => setDrawerOpen(false)}>Admin Panel</Link>
                                )}
                                <button
                                    className={styles.mobileProfileBtn}
                                    onClick={() => { setDrawerOpen(false); setProfileOpen(true); }}
                                >
                                    <AvatarImg userId={user._id} name={user.name} hasAvatar={user.hasAvatar} size={28} />
                                    My Profile
                                </button>
                                <button className={styles.mobileLogoutBtn} onClick={handleLogout}>Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className={styles.mobileNavLink} onClick={() => setDrawerOpen(false)}>Login</Link>
                                <Link to="/register" className={styles.mobileNavLink} onClick={() => setDrawerOpen(false)}>Register</Link>
                            </>
                        )}
                    </div>
                </div>
            )}

            <main className={styles.main}>
                <Outlet />
            </main>
            {pathname !== "/chat" && <Footer />}

            {/* Profile modal */}
            <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
        </div>
    );
};

export default MainLayout;
