import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import styles from "./MainLayout.module.css";

const MainLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleLogout = () => { logout(); navigate("/login"); setDrawerOpen(false); };

    return (
        <div className={styles.layout}>
            {/* ── Desktop Navbar ── */}
            <nav className={styles.navbar}>
                <Link to="/" className={styles.brand}>⚡ AdminPro</Link>

                {/* Desktop links */}
                <div className={styles.navRight}>
                    <Link to="/testimonials" className={styles.navLink}>Testimonials</Link>
                    <Link to="/portfolio" className={styles.navLink}>Portfolio</Link>
                    <Link to="/blogs" className={styles.navLink}>Blog</Link>
                    <Link to="/chat" className={styles.navLink}>💬 Chat</Link>
                    <Link to="/contact" className={styles.navLink}>Contact</Link>
                    {user ? (
                        <>
                            {user.role === "admin" && (
                                <Link to="/admin/dashboard" className={styles.navLink}>Admin Panel</Link>
                            )}
                            <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className={styles.navLink}>Login</Link>
                            <Link to="/register" className={styles.navLink}>Register</Link>
                        </>
                    )}

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
                        <Link to="/portfolio" className={styles.mobileNavLink} onClick={() => setDrawerOpen(false)}>Portfolio</Link>
                        <Link to="/blogs" className={styles.mobileNavLink} onClick={() => setDrawerOpen(false)}>Blog</Link>
                        <Link to="/chat" className={styles.mobileNavLink} onClick={() => setDrawerOpen(false)}>💬 Chat</Link>
                        <Link to="/contact" className={styles.mobileNavLink} onClick={() => setDrawerOpen(false)}>Contact</Link>
                        {user ? (
                            <>
                                {user.role === "admin" && (
                                    <Link to="/admin/dashboard" className={styles.mobileNavLink} onClick={() => setDrawerOpen(false)}>Admin Panel</Link>
                                )}
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
            <Footer />
        </div>
    );
};

export default MainLayout;
