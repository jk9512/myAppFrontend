import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import styles from "./Reels.module.css";

const Reels = () => {
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeReel, setActiveReel] = useState(null);

    useEffect(() => {
        api.get("/reels")
            .then(({ data }) => setReels(data.reels || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <p className={styles.heroTag}>Follow Along</p>
                <h1 className={styles.heroTitle}>
                    Our <span className={styles.gradient}>Reels</span>
                </h1>
                <p className={styles.heroSub}>
                    Behind the scenes, tips & highlights — straight from our Instagram.
                </p>
                <a
                    href="https://www.instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.igBtn}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    Follow on Instagram
                </a>
            </div>

            {loading ? (
                <div className={styles.grid}>
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className={styles.skeleton} />)}
                </div>
            ) : reels.length === 0 ? (
                <div className={styles.empty}>
                    <span className={styles.emptyIcon}>📱</span>
                    <p>No reels available yet.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {reels.map(reel => (
                        <div key={reel._id} className={styles.card} onClick={() => setActiveReel(reel)}>
                            <div className={styles.embedWrap}>
                                <iframe
                                    src={`https://www.instagram.com/reel/${reel.shortcode}/embed/`}
                                    className={styles.embed}
                                    scrolling="no"
                                    title={reel.title}
                                    loading="lazy"
                                />
                                {/* Overlay to capture clicks and open modal */}
                                <div className={styles.embedOverlay}>
                                    <div className={styles.playBtn}>▶</div>
                                </div>
                            </div>
                            <div className={styles.cardBody}>
                                <p className={styles.cardTitle}>{reel.title}</p>
                                {reel.caption && <p className={styles.cardCaption}>{reel.caption}</p>}
                                <a
                                    href={reel.instagramUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.igLink}
                                    onClick={e => e.stopPropagation()}
                                >
                                    View on Instagram ↗
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Lightbox Modal ── */}
            {activeReel && (
                <div className={styles.lightbox} onClick={() => setActiveReel(null)}>
                    <div className={styles.lightboxInner} onClick={e => e.stopPropagation()}>
                        <button className={styles.lightboxClose} onClick={() => setActiveReel(null)}>✕</button>
                        <div className={styles.lightboxEmbed}>
                            <iframe
                                src={`https://www.instagram.com/reel/${activeReel.shortcode}/embed/`}
                                className={styles.lightboxIframe}
                                scrolling="no"
                                title={activeReel.title}
                                allowFullScreen
                            />
                        </div>
                        <div className={styles.lightboxInfo}>
                            <p className={styles.lightboxTitle}>{activeReel.title}</p>
                            {activeReel.caption && <p className={styles.lightboxCaption}>{activeReel.caption}</p>}
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
        </div>
    );
};

export default Reels;
