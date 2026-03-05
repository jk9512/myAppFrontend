import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./Topbar.module.css";

const Topbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <header className={styles.topbar}>
            <div className={styles.left}>
                <span className={styles.greeting}>
                    Welcome back, <strong>{user?.name}</strong> 👋
                </span>
            </div>
            <div className={styles.right}>
                <div className={styles.avatar}>
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className={styles.userInfo}>
                    <span className={styles.name}>{user?.name}</span>
                    <span className={styles.role}>
                        {user?.role}
                        {user?.plan && (
                            <span style={{ fontSize: "0.6rem", padding: "1px 4px", borderRadius: "4px", background: "#f59e0b", color: "#fff", marginLeft: "6px", textTransform: "uppercase" }}>
                                {user.plan}
                            </span>
                        )}
                    </span>
                </div>
                <button className={styles.logoutBtn} onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Topbar;
