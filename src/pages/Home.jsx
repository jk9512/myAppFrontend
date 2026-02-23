import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageWrapper from "../components/common/PageWrapper";
import api from "../api/axios";
import styles from "./Home.module.css";

/* ─── animation helpers ──────────────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.55, ease: "easeOut", delay },
});

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
};

const childFade = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

/* ─── static data ────────────────────────────────────────────────────────── */
const stats = [
    { value: "50+", label: "Projects Delivered" },
    { value: "30+", label: "Happy Clients" },
    { value: "5+", label: "Years Experience" },
    { value: "99%", label: "Client Satisfaction" },
];

const skills = [
    { icon: "⚛️", label: "React / Next.js" },
    { icon: "🟢", label: "Node.js / Express" },
    { icon: "🍃", label: "MongoDB / Mongoose" },
    { icon: "🐘", label: "PostgreSQL / Prisma" },
    { icon: "🎨", label: "Framer Motion / CSS" },
    { icon: "🔒", label: "JWT / Auth / RBAC" },
    { icon: "☁️", label: "AWS / Vercel / Railway" },
    { icon: "🐳", label: "Docker / CI/CD" },
];

const Stars = ({ rating }) => (
    <span className={styles.stars}>
        {[1, 2, 3, 4, 5].map(n => (
            <span key={n} style={{ color: n <= rating ? "#f59e0b" : "var(--border)" }}>★</span>
        ))}
    </span>
);

/* ─── Home component ─────────────────────────────────────────────────────── */
const Home = () => {
    const { user } = useAuth();
    const [portfolios, setPortfolios] = useState([]);
    const [testimonials, setTestimonials] = useState([]);
    const [portLoading, setPortLoading] = useState(true);
    const [testLoading, setTestLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("All");
    const [categories, setCategories] = useState(["All"]);
    const [filtered, setFiltered] = useState([]);

    /* fetch portfolio */
    useEffect(() => {
        api.get("/portfolio")
            .then(({ data }) => {
                const list = data.portfolios;
                setPortfolios(list);
                setFiltered(list);
                setCategories(["All", ...new Set(list.map(p => p.category).filter(Boolean))]);
            })
            .finally(() => setPortLoading(false));
    }, []);

    /* fetch testimonials */
    useEffect(() => {
        api.get("/testimonials")
            .then(({ data }) => setTestimonials(data.testimonials))
            .finally(() => setTestLoading(false));
    }, []);

    const handleFilter = (cat) => {
        setActiveFilter(cat);
        setFiltered(cat === "All" ? portfolios : portfolios.filter(p => p.category === cat));
    };

    return (
        <PageWrapper>
            <div className={styles.page}>

                {/* ── HERO ──────────────────────────────────────────────── */}
                <section className={styles.hero}>
                    <motion.div
                        className={styles.heroContent}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className={styles.eyebrow}>👋 Available for hire</span>
                        <h1 className={styles.heroTitle}>
                            I Build <span className={styles.gradient}>Modern</span><br />
                            Web Applications
                        </h1>
                        <p className={styles.heroSub}>
                            Full-stack developer specialising in React, Node.js & MongoDB.
                            I craft fast, scalable, and beautiful digital experiences.
                        </p>
                        <div className={styles.heroBtns}>
                            <a href="#portfolio" className={styles.btnPrimary}>View My Work ↓</a>
                            <a href="#contact" className={styles.btnOutline}>Get in Touch</a>
                            {user?.role === "admin" && (
                                <Link to="/admin/dashboard" className={styles.btnGhost}>Admin Panel →</Link>
                            )}
                        </div>
                    </motion.div>

                    {/* floating blobs */}
                    <div className={styles.blob1} />
                    <div className={styles.blob2} />
                </section>

                {/* ── STATS ─────────────────────────────────────────────── */}
                <section className={styles.statsSection}>
                    <motion.div
                        className={styles.statsGrid}
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                    >
                        {stats.map(s => (
                            <motion.div key={s.label} className={styles.statCard} variants={childFade}>
                                <span className={styles.statValue}>{s.value}</span>
                                <span className={styles.statLabel}>{s.label}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                {/* ── SKILLS ────────────────────────────────────────────── */}
                <section className={styles.skillsSection}>
                    <motion.div {...fadeUp()}>
                        <p className={styles.sectionEyebrow}>Tech Stack</p>
                        <h2 className={styles.sectionTitle}>What I Work With</h2>
                    </motion.div>
                    <motion.div
                        className={styles.skillsGrid}
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                    >
                        {skills.map(s => (
                            <motion.div key={s.label} className={styles.skillChip} variants={childFade}>
                                <span className={styles.skillIcon}>{s.icon}</span>
                                <span>{s.label}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                {/* ── PORTFOLIO ─────────────────────────────────────────── */}
                <section id="portfolio" className={styles.portfolioSection}>
                    <motion.div {...fadeUp()}>
                        <p className={styles.sectionEyebrow}>My Work</p>
                        <h2 className={styles.sectionTitle}>Featured <span className={styles.gradient}>Projects</span></h2>
                        <p className={styles.sectionSub}>A curated collection of projects built with passion and precision.</p>
                    </motion.div>

                    {/* filter chips */}
                    {!portLoading && (
                        <motion.div className={styles.filters} {...fadeUp(0.1)}>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    className={`${styles.filterChip} ${activeFilter === cat ? styles.chipActive : ""}`}
                                    onClick={() => handleFilter(cat)}
                                >{cat}</button>
                            ))}
                        </motion.div>
                    )}

                    {portLoading ? (
                        <div className={styles.loadingRow}>
                            {[1, 2, 3].map(n => <div key={n} className={styles.skeleton} />)}
                        </div>
                    ) : filtered.length === 0 ? (
                        <p className={styles.empty}>No projects published yet.</p>
                    ) : (
                        <motion.div
                            className={styles.portGrid}
                            variants={stagger}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                            key={activeFilter}
                        >
                            {filtered.map(item => (
                                <motion.div
                                    key={item._id}
                                    className={styles.portCard}
                                    variants={childFade}
                                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                >
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.title} className={styles.portImage} />
                                    ) : (
                                        <div className={styles.portPlaceholder}>
                                            <span className={styles.portPlaceholderIcon}>🚀</span>
                                        </div>
                                    )}
                                    <div className={styles.portBody}>
                                        <span className={styles.portCategory}>{item.category}</span>
                                        <h3 className={styles.portTitle}>{item.title}</h3>
                                        <p className={styles.portDesc}>{item.description}</p>
                                        <div className={styles.techStack}>
                                            {(item.technologies || []).slice(0, 4).map(t => (
                                                <span key={t} className={styles.techBadge}>{t}</span>
                                            ))}
                                            {(item.technologies || []).length > 4 && (
                                                <span className={styles.techBadge}>+{item.technologies.length - 4}</span>
                                            )}
                                        </div>
                                        {item.projectUrl && (
                                            <a href={item.projectUrl} target="_blank" rel="noopener noreferrer" className={styles.portLink}>
                                                View Project →
                                            </a>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    <motion.div className={styles.sectionFooter} {...fadeUp(0.2)}>
                        <Link to="/portfolio" className={styles.btnOutline}>View All Projects →</Link>
                    </motion.div>
                </section>

                {/* ── TESTIMONIALS ──────────────────────────────────────── */}
                <section className={styles.testimonialSection}>
                    <motion.div {...fadeUp()}>
                        <p className={styles.sectionEyebrow}>Client Words</p>
                        <h2 className={styles.sectionTitle}>What Clients <span className={styles.gradient}>Say</span></h2>
                        <p className={styles.sectionSub}>Real feedback from real people I've worked with.</p>
                    </motion.div>

                    {testLoading ? (
                        <div className={styles.loadingRow}>
                            {[1, 2, 3].map(n => <div key={n} className={`${styles.skeleton} ${styles.skeletonTall}`} />)}
                        </div>
                    ) : testimonials.length === 0 ? (
                        <p className={styles.empty}>No testimonials yet.</p>
                    ) : (
                        <motion.div
                            className={styles.testGrid}
                            variants={stagger}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                        >
                            {testimonials.map(t => (
                                <motion.div
                                    key={t._id}
                                    className={styles.testCard}
                                    variants={childFade}
                                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                                >
                                    <div className={styles.quoteIcon}>"</div>
                                    <Stars rating={t.rating} />
                                    <p className={styles.testMessage}>{t.message}</p>
                                    <div className={styles.testAuthor}>
                                        <div className={styles.testAvatar}>
                                            {t.avatar
                                                ? <img src={t.avatar} alt={t.name} className={styles.testAvatarImg} />
                                                : t.name?.charAt(0).toUpperCase()
                                            }
                                        </div>
                                        <div>
                                            <div className={styles.testName}>{t.name}</div>
                                            <div className={styles.testDesig}>{t.designation}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    <motion.div className={styles.sectionFooter} {...fadeUp(0.2)}>
                        <Link to="/testimonials" className={styles.btnOutline}>Read All Reviews →</Link>
                    </motion.div>
                </section>

                {/* ── CTA ───────────────────────────────────────────────── */}
                <section id="contact">
                    <motion.div className={styles.ctaSection} {...fadeUp()}>
                        <h2 className={styles.ctaTitle}>Ready to Build Something <span className={styles.gradient}>Amazing?</span></h2>
                        <p className={styles.ctaSub}>Let's collaborate on your next project. I'm open to freelance, contract, and full-time roles.</p>
                        <div className={styles.heroBtns}>
                            <a href="mailto:admin@example.com" className={styles.btnPrimary}>Send Me an Email →</a>
                            {!user && <Link to="/register" className={styles.btnOutline}>Create Account</Link>}
                        </div>
                    </motion.div>
                </section>

            </div>
        </PageWrapper>
    );
};

export default Home;
