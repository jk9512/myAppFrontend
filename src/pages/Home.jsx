import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageWrapper from "../components/common/PageWrapper";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import api from "../api/axios";
import styles from "./Home.module.css";

const CONTACT_EMPTY = { name: "", email: "", phone: "", subject: "", message: "" };
const SUBJECTS = ["Project Inquiry", "Freelance Collaboration", "Job Opportunity", "General Question", "Other"];

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
    const [blogs, setBlogs] = useState([]);
    const [blogsLoading, setBlogsLoading] = useState(true);

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

    /* fetch blogs */
    useEffect(() => {
        api.get("/blogs?limit=3")
            .then(({ data }) => setBlogs(data.blogs || []))
            .finally(() => setBlogsLoading(false));
    }, []);

    /* contact form */
    const [cForm, setCForm] = useState(CONTACT_EMPTY);
    const [cErrors, setCErrors] = useState({});
    const [cSending, setCSending] = useState(false);
    const [cSuccess, setCSuccess] = useState(false);

    // Pre-fill name & email from logged-in user (still fully editable)
    useEffect(() => {
        if (user) {
            setCForm(f => ({
                ...f,
                name: f.name || user.name || "",
                email: f.email || user.email || "",
            }));
        }
    }, [user]);

    const setC = (field) => (e) => setCForm(f => ({ ...f, [field]: e.target.value }));

    const validateContact = () => {
        const e = {};
        if (!cForm.name.trim()) e.name = "Name is required";
        if (!cForm.subject) e.subject = "Please select a subject";
        if (!cForm.message.trim()) e.message = "Message is required";
        return e;
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        const errs = validateContact();
        if (Object.keys(errs).length) { setCErrors(errs); return; }
        setCSending(true);
        try {
            await api.post("/contacts", { ...cForm, email: user?.email || cForm.email });
            setCSuccess(true);
            setCForm(CONTACT_EMPTY);
            setCErrors({});
        } catch (err) {
            setCErrors({ api: err.response?.data?.message || "Failed to send. Try again." });
        } finally {
            setCSending(false);
        }
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

                {/* ── BLOG ─────────────────────────────────────────── */}
                <section className={styles.blogSection}>
                    <motion.div {...fadeUp()}>
                        <p className={styles.sectionEyebrow}>From the Blog</p>
                        <h2 className={styles.sectionTitle}>Latest <span className={styles.gradient}>Articles</span></h2>
                        <p className={styles.sectionSub}>Thoughts on code, design, and building for the web.</p>
                    </motion.div>

                    {blogsLoading ? (
                        <div className={styles.loadingRow}>
                            {[1, 2, 3].map(n => <div key={n} className={styles.skeleton} />)}
                        </div>
                    ) : blogs.length === 0 ? (
                        <p className={styles.empty}>No blog posts yet.</p>
                    ) : (
                        <motion.div
                            className={styles.blogGrid}
                            variants={stagger}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                        >
                            {blogs.map(blog => (
                                <motion.div
                                    key={blog._id}
                                    className={styles.blogCard}
                                    variants={childFade}
                                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                                >
                                    {blog.coverImage ? (
                                        <img src={blog.coverImage} alt={blog.title} className={styles.blogImage} />
                                    ) : (
                                        <div className={styles.blogPlaceholder}>
                                            <span className={styles.blogPlaceholderIcon}>📝</span>
                                        </div>
                                    )}
                                    <div className={styles.blogBody}>
                                        <div className={styles.blogMeta}>
                                            <span className={styles.portCategory}>{blog.category}</span>
                                            <span className={styles.blogReadTime}>⏱ {blog.readTime} min</span>
                                        </div>
                                        <h3 className={styles.portTitle}>{blog.title}</h3>
                                        {blog.excerpt && <p className={styles.portDesc}>{blog.excerpt}</p>}
                                        <Link to={`/blogs/${blog.slug || blog._id}`} className={styles.portLink}>
                                            Read Article →
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    <motion.div className={styles.sectionFooter} {...fadeUp(0.2)}>
                        <Link to="/blogs" className={styles.btnOutline}>View All Articles →</Link>
                    </motion.div>
                </section>

                {/* ── CONTACT ─────────────────────────────────── */}
                <section id="contact" className={styles.contactSection}>
                    <motion.div {...fadeUp()} style={{ textAlign: "center", marginBottom: 48 }}>
                        <p className={styles.sectionEyebrow}>📩 Get in Touch</p>
                        <h2 className={styles.sectionTitle}>Let's Build Something <span className={styles.gradient}>Amazing</span></h2>
                        <p className={styles.sectionSub}>Have a project in mind? Fill out the form and I'll get back to you within 24 hours.</p>
                    </motion.div>

                    <div className={styles.contactLayout}>

                        {/* Info cards */}
                        <motion.div className={styles.contactInfo} {...fadeUp(0.1)}>
                            {[
                                { icon: "📧", label: "Email", value: "admin@example.com", href: "mailto:admin@example.com" },
                                { icon: "📞", label: "Phone", value: "+91 99999 99999", href: "tel:+919999999999" },
                                { icon: "📍", label: "Location", value: "Surat, Gujarat, India", href: null },
                                { icon: "🕐", label: "Working Hours", value: "Mon–Fri, 9am–6pm IST", href: null },
                            ].map(item => (
                                <div key={item.label} className={styles.contactCard}>
                                    <span className={styles.contactIcon}>{item.icon}</span>
                                    <div>
                                        <div className={styles.contactLabel}>{item.label}</div>
                                        {item.href
                                            ? <a href={item.href} className={styles.contactValue}>{item.value}</a>
                                            : <div className={styles.contactValue}>{item.value}</div>
                                        }
                                    </div>
                                </div>
                            ))}
                            <div className={styles.contactAvail}>
                                <span className={styles.availDot} />
                                Currently available for new projects
                            </div>
                        </motion.div>

                        {/* Form */}
                        <motion.div className={styles.contactFormCard} {...fadeUp(0.2)}>
                            {cSuccess ? (
                                <motion.div className={styles.contactSuccess}
                                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                    <span style={{ fontSize: 52 }}>✅</span>
                                    <h3>Message Sent!</h3>
                                    <p>Thanks for reaching out — I'll reply within 24 hours.</p>
                                    <Button variant="outline" onClick={() => setCSuccess(false)}>Send Another</Button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleContactSubmit} className={styles.contactForm} noValidate>
                                    <h3 className={styles.contactFormTitle}>Send a Message</h3>
                                    {cErrors.api && <div className={styles.contactApiError}>{cErrors.api}</div>}
                                    <div className={styles.contactRow}>
                                        <Input id="h-name" label="Your Name *" placeholder="Jay Kachhadiya"
                                            value={cForm.name} onChange={setC("name")} error={cErrors.name} />
                                        <div className={styles.contactSelectWrap}>
                                            <label className={styles.contactSelectLabel}>Email</label>
                                            <div className={styles.contactEmailLocked}>
                                                <span className={styles.contactEmailIcon}>📧</span>
                                                <span>{user?.email || "—"}</span>
                                                {/* <span className={styles.contactEmailBadge}>Account</span> */}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.contactRow}>
                                        <Input id="h-phone" label="Phone (optional)" placeholder="+91 99999 99999"
                                            value={cForm.phone} onChange={setC("phone")} />
                                        <div className={styles.contactSelectWrap}>
                                            <label className={styles.contactSelectLabel}>Subject *</label>
                                            <select
                                                className={`${styles.contactSelect} ${cErrors.subject ? styles.contactSelectError : ""}`}
                                                value={cForm.subject} onChange={setC("subject")}
                                            >
                                                <option value="">— Choose a subject —</option>
                                                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            {cErrors.subject && <span className={styles.contactErrMsg}>{cErrors.subject}</span>}
                                        </div>
                                    </div>
                                    <div className={styles.contactTextareaWrap}>
                                        <label className={styles.contactSelectLabel}>Message *</label>
                                        <textarea
                                            className={`${styles.contactTextarea} ${cErrors.message ? styles.contactSelectError : ""}`}
                                            rows={5}
                                            placeholder="Tell me about your project, idea, or question..."
                                            value={cForm.message}
                                            onChange={setC("message")}
                                        />
                                        {cErrors.message && <span className={styles.contactErrMsg}>{cErrors.message}</span>}
                                    </div>
                                    <Button type="submit" loading={cSending} style={{ width: "100%" }}>
                                        {cSending ? "Sending..." : "Send Message 🚀"}
                                    </Button>
                                </form>
                            )}
                        </motion.div>

                    </div>
                </section>

            </div>
        </PageWrapper>
    );
};

export default Home;
