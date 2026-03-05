import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "./Sidebar.module.css";

const navItems = [
    { to: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { to: "/admin/users", label: "Users", icon: "👥" },
    { to: "/admin/roles", label: "Roles", icon: "🔑" },
    { to: "/admin/testimonials", label: "Testimonials", icon: "⭐" },
    { to: "/admin/portfolio", label: "Portfolio", icon: "💼" },
    { to: "/admin/contacts", label: "Contacts", icon: "📬" },
    { to: "/admin/blogs", label: "Blogs", icon: "✍️" },
    { to: "/admin/about", label: "About Us", icon: "🏢" },
    { to: "/admin/reels", label: "Reels", icon: "📱" },
    { to: "/whatsapp", label: "WhatsApp", icon: "💬" },
];

const Sidebar = ({ collapsed, onCollapse }) => {
    return (
        <motion.aside
            className={styles.sidebar}
            animate={{ width: collapsed ? 68 : 240 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            {/* Logo */}
            <div className={styles.logo}>
                {!collapsed && <span className={styles.logoText}>⚡ AdminPro</span>}
                <button className={styles.collapseBtn} onClick={onCollapse} title="Toggle sidebar">
                    {collapsed ? "▶" : "◀"}
                </button>
            </div>

            {/* Nav */}
            <nav className={styles.nav}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `${styles.navItem} ${isActive ? styles.active : ""}`
                        }
                        title={collapsed ? item.label : ""}
                    >
                        <span className={styles.icon}>{item.icon}</span>
                        {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>
        </motion.aside>
    );
};

export default Sidebar;
