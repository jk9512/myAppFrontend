import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PageWrapper from "../../components/common/PageWrapper";
import api from "../../api/axios";
import styles from "./Dashboard.module.css";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 20, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35 } } };

const STATUS_COLOR = {
    new: { bg: "rgba(99,102,241,0.15)", color: "#818cf8" },
    read: { bg: "rgba(234,179,8,0.15)", color: "#eab308" },
    replied: { bg: "rgba(34,197,94,0.15)", color: "#22c55e" },
};

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get("/stats"),
            api.get("/analytics"),
        ])
            .then(([{ data: s }, { data: a }]) => {
                setStats(s);
                setAnalytics(a.analytics);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const s = stats?.stats;
    const a = analytics;

    const statCards = [
        { icon: "👁️", label: "Total Page Views", value: a?.totalViews ?? "—", sub: `+${a?.todayViews ?? 0} today`, color: "#6366f1", link: null },
        { icon: "👤", label: "Unique Visitors", value: a?.uniqueVisitors ?? "—", sub: `+${a?.uniqueToday ?? 0} today`, color: "#0ea5e9", link: null },
        { icon: "📅", label: "Views This Week", value: a?.weekViews ?? "—", sub: `${a?.monthViews ?? 0} this month`, color: "#ec4899", link: null },
        { icon: "👥", label: "Total Users", value: s?.users.total ?? "—", sub: `+${s?.users.joinedToday ?? 0} today`, color: "#8b5cf6", link: "/admin/users" },
        { icon: "📬", label: "New Messages", value: s?.contacts.new ?? "—", sub: `${s?.contacts.total ?? 0} total`, color: "#f59e0b", link: "/admin/contacts" },
        { icon: "⭐", label: "Testimonials", value: s?.testimonials.active ?? "—", sub: `${s?.testimonials.total ?? 0} total`, color: "#22c55e", link: "/admin/testimonials" },
        { icon: "💼", label: "Portfolio Items", value: s?.portfolio.active ?? "—", sub: `${s?.portfolio.total ?? 0} total`, color: "#06b6d4", link: "/admin/portfolio" },
        { icon: "✍️", label: "Blog Posts", value: "Blog", sub: "manage articles", color: "#f97316", link: "/admin/blogs" },
    ];

    // Build simple bar chart data from dailyLast7
    const maxCount = Math.max(...(a?.dailyLast7 ?? [{ count: 1 }]).map(d => d.count), 1);

    return (
        <PageWrapper>
            <div className={styles.page}>

                {/* Header */}
                <div className={styles.pageHeader}>
                    <div>
                        <h1 className={styles.pageTitle}>📊 Dashboard</h1>
                        <p className={styles.pageDesc}>Welcome back, <strong>{user?.name}</strong> — here's what's happening</p>
                    </div>
                    <span className={styles.roleBadge}>{user?.role}</span>
                </div>

                {/* Stat cards */}
                <motion.div className={styles.statsGrid} variants={container} initial="hidden" animate="show">
                    {statCards.map((s) => (
                        <motion.div key={s.label} variants={item} className={styles.statCard} style={{ "--card-color": s.color }}>
                            {s.link ? (
                                <Link to={s.link} className={styles.statLink}>
                                    <StatCardInner s={s} loading={loading} />
                                </Link>
                            ) : (
                                <div className={styles.statLink}>
                                    <StatCardInner s={s} loading={loading} />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </motion.div>

                {/* Analytics row */}
                <div className={styles.bottomGrid}>

                    {/* Daily chart (last 7 days) */}
                    <motion.div className={styles.panel} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                        <div className={styles.panelHeader}>
                            <span className={styles.panelTitle}>📈 Visits — Last 7 Days</span>
                        </div>
                        {loading ? (
                            [1, 2, 3].map(i => <div key={i} className={styles.skeletonRow} />)
                        ) : !a?.dailyLast7?.length ? (
                            <div className={styles.empty}>No visit data yet</div>
                        ) : (
                            <div className={styles.barChart}>
                                {a.dailyLast7.map(d => (
                                    <div key={d.date} className={styles.barCol}>
                                        <div
                                            className={styles.bar}
                                            style={{ height: `${Math.round((d.count / maxCount) * 100)}%` }}
                                            title={`${d.count} views`}
                                        />
                                        <span className={styles.barLabel}>
                                            {new Date(d.date).toLocaleDateString("en-IN", { weekday: "short" })}
                                        </span>
                                        <span className={styles.barCount}>{d.count}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Top pages */}
                    <motion.div className={styles.panel} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <div className={styles.panelHeader}>
                            <span className={styles.panelTitle}>🔥 Top Pages (this month)</span>
                        </div>
                        {loading ? (
                            [1, 2, 3].map(i => <div key={i} className={styles.skeletonRow} />)
                        ) : !a?.topPages?.length ? (
                            <div className={styles.empty}>No page views tracked yet</div>
                        ) : (
                            a.topPages.map((p, idx) => (
                                <div key={p.page} className={styles.activityRow}>
                                    <div className={styles.actAvatar} style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8", fontSize: 13, fontWeight: 700 }}>
                                        {idx + 1}
                                    </div>
                                    <div className={styles.actBody}>
                                        <div className={styles.actName}>{p.page}</div>
                                        <div className={styles.actSub}>{p.count} views</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </motion.div>

                </div>

                {/* Bottom grid: Recent contacts + Recent users */}
                <div className={styles.bottomGrid}>

                    {/* Recent messages */}
                    <motion.div className={styles.panel} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                        <div className={styles.panelHeader}>
                            <span className={styles.panelTitle}>📬 Recent Messages</span>
                            <Link to="/admin/contacts" className={styles.panelLink}>View all →</Link>
                        </div>
                        {loading ? (
                            [1, 2, 3].map(i => <div key={i} className={styles.skeletonRow} />)
                        ) : stats?.recentContacts?.length === 0 ? (
                            <div className={styles.empty}>No messages yet</div>
                        ) : (
                            stats?.recentContacts?.map(c => (
                                <div key={c._id} className={styles.activityRow}>
                                    <div className={styles.actAvatar}>{c.name[0].toUpperCase()}</div>
                                    <div className={styles.actBody}>
                                        <div className={styles.actName}>{c.name}</div>
                                        <div className={styles.actSub}>{c.subject}</div>
                                    </div>
                                    <span className={styles.statusBadge} style={{ background: STATUS_COLOR[c.status]?.bg, color: STATUS_COLOR[c.status]?.color }}>
                                        {c.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </motion.div>

                    {/* Recent users */}
                    <motion.div className={styles.panel} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <div className={styles.panelHeader}>
                            <span className={styles.panelTitle}>👥 Recent Users</span>
                            <Link to="/admin/users" className={styles.panelLink}>View all →</Link>
                        </div>
                        {loading ? (
                            [1, 2, 3].map(i => <div key={i} className={styles.skeletonRow} />)
                        ) : stats?.recentUsers?.length === 0 ? (
                            <div className={styles.empty}>No users yet</div>
                        ) : (
                            stats?.recentUsers?.map(u => (
                                <div key={u._id} className={styles.activityRow}>
                                    <div className={styles.actAvatar} style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8" }}>
                                        {u.name[0].toUpperCase()}
                                    </div>
                                    <div className={styles.actBody}>
                                        <div className={styles.actName}>{u.name}</div>
                                        <div className={styles.actSub}>{u.email}</div>
                                    </div>
                                    <span className={styles.rolePill}>{u.role}</span>
                                </div>
                            ))
                        )}
                    </motion.div>

                </div>
            </div>
        </PageWrapper>
    );
};

// Small inner component to avoid repetition
const StatCardInner = ({ s, loading }) => (
    <>
        <div className={styles.statIcon} style={{ background: s.color + "22", color: s.color }}>
            {s.icon}
        </div>
        <div className={styles.statBody}>
            <div className={styles.statValue}>
                {loading ? <span className={styles.skeleton} /> : s.value}
            </div>
            <div className={styles.statLabel}>{s.label}</div>
            <div className={styles.statSub}>{loading ? "" : s.sub}</div>
        </div>
        <div className={styles.statArrow}>{s.link ? "→" : ""}</div>
    </>
);

export default Dashboard;
