import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import styles from "./MainLayout.module.css";

const MainLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate("/login"); };

    return (
        <div className={styles.layout}>
            <nav className={styles.navbar}>
                <Link to="/" className={styles.brand}>⚡ AdminPro</Link>
                <div className={styles.navRight}>
                    <Link to="/testimonials" className={styles.navLink}>Testimonials</Link>
                    <Link to="/portfolio" className={styles.navLink}>Portfolio</Link>
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
                </div>
            </nav>
            <main className={styles.main}>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
