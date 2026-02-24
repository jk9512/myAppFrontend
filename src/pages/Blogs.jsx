import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageWrapper from "../components/common/PageWrapper";
import api from "../api/axios";
import styles from "./Blogs.module.css";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const childFade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const Blogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("All");
    const [categories, setCategories] = useState(["All"]);
    const [filtered, setFiltered] = useState([]);

    useEffect(() => {
        api.get("/blogs?limit=50")
            .then(({ data }) => {
                const list = data.blogs || [];
                setBlogs(list);
                setFiltered(list);
                setCategories(["All", ...new Set(list.map(b => b.category).filter(Boolean))]);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleFilter = (cat) => {
        setActiveCategory(cat);
        setFiltered(cat === "All" ? blogs : blogs.filter(b => b.category === cat));
    };

    return (
        <PageWrapper>
            <div className={styles.page}>
                {/* Hero */}
                <motion.div
                    className={styles.hero}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <span className={styles.eyebrow}>✍️ Insights</span>
                    <h1 className={styles.heading}>
                        My <span className={styles.gradient}>Blog</span>
                    </h1>
                    <p className={styles.subheading}>
                        Thoughts on web development, tech, and building things that matter.
                    </p>
                </motion.div>

                {/* Category filters */}
                {!loading && categories.length > 1 && (
                    <div className={styles.filters}>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`${styles.chip} ${activeCategory === cat ? styles.chipActive : ""}`}
                                onClick={() => handleFilter(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {/* Grid */}
                {loading ? (
                    <div className={styles.skeletonGrid}>
                        {[1, 2, 3, 4, 5, 6].map(n => <div key={n} className={styles.skeleton} />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <p className={styles.empty}>No blog posts published yet. Check back soon!</p>
                ) : (
                    <motion.div
                        className={styles.grid}
                        variants={stagger}
                        initial="hidden"
                        animate="show"
                        key={activeCategory}
                    >
                        {filtered.map(blog => (
                            <motion.article key={blog._id} className={styles.card} variants={childFade} whileHover={{ y: -6 }}>
                                {blog.coverImage ? (
                                    <img src={blog.coverImage} alt={blog.title} className={styles.cardImage} />
                                ) : (
                                    <div className={styles.cardPlaceholder}>
                                        <span className={styles.placeholderIcon}>📝</span>
                                    </div>
                                )}
                                <div className={styles.cardBody}>
                                    <div className={styles.cardMeta}>
                                        <span className={styles.category}>{blog.category}</span>
                                        <span className={styles.readTime}>⏱ {blog.readTime} min read</span>
                                    </div>
                                    <h2 className={styles.cardTitle}>{blog.title}</h2>
                                    {blog.excerpt && <p className={styles.cardExcerpt}>{blog.excerpt}</p>}
                                    <div className={styles.cardFooter}>
                                        <div className={styles.tags}>
                                            {(blog.tags || []).slice(0, 3).map(tag => (
                                                <span key={tag} className={styles.tag}>#{tag}</span>
                                            ))}
                                        </div>
                                        <div className={styles.cardBottom}>
                                            <span className={styles.date}>
                                                {new Date(blog.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                            </span>
                                            <Link to={`/blogs/${blog.slug || blog._id}`} className={styles.readBtn}>
                                                Read More →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </motion.div>
                )}
            </div>
        </PageWrapper>
    );
};

export default Blogs;
