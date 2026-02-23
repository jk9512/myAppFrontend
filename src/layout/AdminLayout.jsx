import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import styles from "./AdminLayout.module.css";

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className={styles.shell}>
            <Sidebar collapsed={collapsed} onCollapse={() => setCollapsed((c) => !c)} />
            <div className={styles.main}>
                <Topbar />
                <main className={styles.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
