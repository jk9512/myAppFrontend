import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import styles from "./ReelsSection.module.css";

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
};

const cardFade = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const ReelsSection = () => {
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeReel, setActiveReel] = useState(null);

    useEffect(() => {
        api.get("/reels")
            .then(({ data }) => setReels((data.reels || []).slice(0, 8)))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (!loading && reels.length === 0) return null;

    return (
        <section className={styles.section}>
            {/* ── Header — matches Home page section style ── */}
            <motion.div
                className={styles.heading}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, ease: "easeOut" }}
            >
                <span className={styles.eyebrow}>📱 Instagram</span>
                <h2 className={styles.title}>
                    Our Latest <span className={styles.gradient}>Reels</span>
                </h2>
                <p className={styles.sub}>
                    Catch us in action — behind the scenes, tips & highlights
                </p>
            </motion.div>

            {/* ── Horizontal scroll row ── */}
            <div className={styles.scrollWrap}>
                {loading ? (
                    <div className={styles.scroll}>
                        {[1, 2, 3, 4].map(i => <div key={i} className={styles.skeleton} />)}
                    </div>
                ) : (
                    <motion.div
                        className={styles.scroll}
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                    >
                        {reels.map(reel => (
                            <motion.div
                                key={reel._id}
                                className={styles.card}
                                variants={cardFade}
                                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                                onClick={() => setActiveReel(reel)}
                            >
                                <div className={styles.embedWrap}>
                                    <iframe
                                        src={`https://www.instagram.com/reel/${reel.shortcode}/embed/`}
                                        className={styles.embed}
                                        scrolling="no"
                                        title={reel.title}
                                        loading="lazy"
                                    />
                                    {/* Clickable overlay — prevents iframe from stealing clicks */}
                                    <div className={styles.overlay}>
                                        <div className={styles.playBtn}>
                                            <span>▶</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.cardMeta}>
                                    <p className={styles.cardTitle}>{reel.title}</p>
                                    {reel.caption && (
                                        <p className={styles.cardCaption}>{reel.caption}</p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>

            {/* ── Footer link ── */}
            <motion.div
                className={styles.footer}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.15 }}
            >
                <Link to="/reels" className={styles.viewAll}>View All Reels →</Link>
            </motion.div>

            {/* ── Lightbox ── */}
            {activeReel && (
                <div className={styles.lightbox} onClick={() => setActiveReel(null)}>
                    <div className={styles.lightboxInner} onClick={e => e.stopPropagation()}>
                        <button className={styles.close} onClick={() => setActiveReel(null)}>✕</button>
                        <div className={styles.lightboxLeft}>
                            <iframe
                                src={`https://www.instagram.com/reel/${activeReel.shortcode}/embed/`}
                                className={styles.lightboxIframe}
                                scrolling="no"
                                title={activeReel.title}
                                allowFullScreen
                            />
                        </div>
                        <div className={styles.lightboxRight}>
                            <div className={styles.igBadge}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                                Instagram Reel
                            </div>
                            <h3 className={styles.lightboxTitle}>{activeReel.title}</h3>
                            {activeReel.caption && (
                                <p className={styles.lightboxCaption}>{activeReel.caption}</p>
                            )}
                            <a
                                href={activeReel.instagramUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.igBtn}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                                Open on Instagram
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default ReelsSection;
