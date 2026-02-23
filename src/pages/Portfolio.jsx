import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PageWrapper from "../components/common/PageWrapper";
import Spinner from "../components/common/Spinner";
import api from "../api/axios";
import styles from "./Portfolio.module.css";

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
    hidden: { opacity: 0, scale: 0.96, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const Portfolio = () => {
    const [items, setItems] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [categories, setCategories] = useState(["All"]);
    const [active, setActive] = useState("All");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/portfolio")
            .then(({ data }) => {
                const list = data.portfolios;
                setItems(list);
                setFiltered(list);
                const cats = ["All", ...new Set(list.map((p) => p.category).filter(Boolean))];
                setCategories(cats);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const handleFilter = (cat) => {
        setActive(cat);
        setFiltered(cat === "All" ? items : items.filter((p) => p.category === cat));
    };

    return (
        <PageWrapper>
            <section className={styles.page}>
                {/* Hero */}
                <motion.div
                    className={styles.hero}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className={styles.eyebrow}>My Work</span>
                    <h1 className={styles.heading}>Featured <span className={styles.gradient}>Projects</span></h1>
                    <p className={styles.subheading}>
                        A curated collection of projects built with modern technologies and a passion for great user experience.
                    </p>
                </motion.div>

                {loading ? <Spinner message="Loading projects..." /> : (
                    <>
                        {/* Filter chips */}
                        <motion.div
                            className={styles.filters}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    className={`${styles.chip} ${active === cat ? styles.chipActive : ""}`}
                                    onClick={() => handleFilter(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </motion.div>

                        {/* Grid */}
                        {filtered.length === 0 ? (
                            <p className={styles.empty}>No projects found.</p>
                        ) : (
                            <motion.div
                                className={styles.grid}
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                key={active}
                            >
                                {filtered.map((item) => (
                                    <motion.div key={item._id} className={styles.card} variants={cardVariants} whileHover={{ y: -8, transition: { duration: 0.2 } }}>
                                        {/* Image / Placeholder */}
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.title} className={styles.cardImage} />
                                        ) : (
                                            <div className={styles.cardPlaceholder}>
                                                <span className={styles.placeholderIcon}>🚀</span>
                                            </div>
                                        )}

                                        <div className={styles.cardBody}>
                                            <div className={styles.cardMeta}>
                                                <span className={styles.category}>{item.category}</span>
                                            </div>
                                            <h3 className={styles.cardTitle}>{item.title}</h3>
                                            <p className={styles.cardDesc}>{item.description}</p>

                                            {/* Tech stack */}
                                            <div className={styles.techStack}>
                                                {(item.technologies || []).map((t) => (
                                                    <span key={t} className={styles.techBadge}>{t}</span>
                                                ))}
                                            </div>

                                            {/* Link */}
                                            {item.projectUrl && (
                                                <a href={item.projectUrl} target="_blank" rel="noopener noreferrer" className={styles.viewBtn}>
                                                    View Project →
                                                </a>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </>
                )}
            </section>
        </PageWrapper>
    );
};

export default Portfolio;
