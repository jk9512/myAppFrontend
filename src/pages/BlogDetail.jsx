import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageWrapper from "../components/common/PageWrapper";
import api from "../api/axios";
import styles from "./BlogDetail.module.css";

const BlogDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get(`/blogs/${id}`)
            .then(({ data }) => setBlog(data.blog))
            .catch(() => setError("Blog post not found."))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <PageWrapper>
            <div className={styles.page}>
                <div className={styles.skeletonHero} />
                <div className={styles.skeletonLine} />
                <div className={styles.skeletonLine} style={{ width: "60%" }} />
                <div className={styles.skeletonBlock} />
            </div>
        </PageWrapper>
    );

    if (error) return (
        <PageWrapper>
            <div className={styles.page}>
                <div className={styles.errorBox}>
                    <span className={styles.errorIcon}>😕</span>
                    <h2>{error}</h2>
                    <button className={styles.backBtn} onClick={() => navigate("/blogs")}>← Back to Blog</button>
                </div>
            </div>
        </PageWrapper>
    );

    return (
        <PageWrapper>
            <div className={styles.page}>
                <motion.article
                    className={styles.article}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Back */}
                    <Link to="/blogs" className={styles.backLink}>← Back to Blog</Link>

                    {/* Cover */}
                    {blog.coverImage ? (
                        <img src={blog.coverImage} alt={blog.title} className={styles.coverImage} />
                    ) : (
                        <div className={styles.coverPlaceholder}>📝</div>
                    )}

                    {/* Meta */}
                    <div className={styles.meta}>
                        <span className={styles.category}>{blog.category}</span>
                        <span className={styles.dot}>·</span>
                        <span className={styles.readTime}>⏱ {blog.readTime} min read</span>
                        <span className={styles.dot}>·</span>
                        <span className={styles.date}>
                            {new Date(blog.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric", month: "long", year: "numeric",
                            })}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className={styles.title}>{blog.title}</h1>

                    {/* Author */}
                    <div className={styles.author}>
                        <div className={styles.authorAvatar}>{blog.author?.charAt(0)?.toUpperCase()}</div>
                        <span className={styles.authorName}>{blog.author}</span>
                    </div>

                    {/* Tags */}
                    {blog.tags?.length > 0 && (
                        <div className={styles.tags}>
                            {blog.tags.map(tag => (
                                <span key={tag} className={styles.tag}>#{tag}</span>
                            ))}
                        </div>
                    )}

                    {/* Content */}
                    <div className={styles.content}>
                        {blog.content.split("\n").map((para, i) =>
                            para.trim() ? <p key={i}>{para}</p> : <br key={i} />
                        )}
                    </div>
                </motion.article>
            </div>
        </PageWrapper>
    );
};

export default BlogDetail;
