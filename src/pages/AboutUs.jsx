import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PageWrapper from "../components/common/PageWrapper";
import api from "../api/axios";
import styles from "./AboutUs.module.css";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const AboutUs = () => {
    const [about, setAbout] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/about")
            .then(({ data }) => setAbout(data.about))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <PageWrapper>
                <div className={styles.skeletonWrap}>
                    {[1, 2, 3].map(n => <div key={n} className={styles.skeleton} />)}
                </div>
            </PageWrapper>
        );
    }

    if (!about) {
        return (
            <PageWrapper>
                <p className={styles.empty}>About Us content is coming soon. Stay tuned!</p>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <div className={styles.page}>

                {/* ── Hero ─────────────────────────────────────────── */}
                <motion.div
                    className={styles.hero}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className={styles.eyebrow}>👋 Who We Are</span>
                    <h1 className={styles.heading}>
                        {about.headline.split(" ").map((word, i, arr) =>
                            i === arr.length - 1
                                ? <span key={i} className={styles.gradient}> {word}</span>
                                : <span key={i}>{word} </span>
                        )}
                    </h1>
                    {about.subheadline && <p className={styles.subheading}>{about.subheadline}</p>}
                    <p className={styles.description}>{about.description}</p>
                </motion.div>

                {/* ── Stats ────────────────────────────────────────── */}
                {about.stats?.length > 0 && (
                    <motion.div
                        className={styles.statsGrid}
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                    >
                        {about.stats.map((s, i) => (
                            <motion.div key={i} className={styles.statCard} variants={fadeUp}>
                                <span className={styles.statValue}>{s.value}</span>
                                <span className={styles.statLabel}>{s.label}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* ── Mission & Vision ─────────────────────────────── */}
                {(about.mission || about.vision) && (
                    <motion.div
                        className={styles.mvGrid}
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                    >
                        {about.mission && (
                            <motion.div className={styles.mvCard} variants={fadeUp}>
                                <span className={styles.mvIcon}>🎯</span>
                                <h2 className={styles.mvTitle}>Our Mission</h2>
                                <p className={styles.mvText}>{about.mission}</p>
                            </motion.div>
                        )}
                        {about.vision && (
                            <motion.div className={styles.mvCard} variants={fadeUp}>
                                <span className={styles.mvIcon}>🔭</span>
                                <h2 className={styles.mvTitle}>Our Vision</h2>
                                <p className={styles.mvText}>{about.vision}</p>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* ── Values ───────────────────────────────────────── */}
                {about.values?.length > 0 && (
                    <motion.div
                        className={styles.valuesSection}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className={styles.sectionTitle}>Our Core Values</h2>
                        <div className={styles.valuesGrid}>
                            {about.values.map((v, i) => (
                                <motion.span
                                    key={i}
                                    className={styles.valueChip}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.08 }}
                                >
                                    ✦ {v}
                                </motion.span>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── Skills ───────────────────────────────────────── */}
                {about.skills?.length > 0 && (
                    <motion.div
                        className={styles.skillsSection}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className={styles.sectionTitle}>Tech Stack & Skills</h2>
                        <div className={styles.skillsGrid}>
                            {about.skills.map((skill, i) => (
                                <motion.div
                                    key={i}
                                    className={styles.skillBadge}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={{ y: -4, scale: 1.05 }}
                                >
                                    {skill}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── Team ─────────────────────────────────────────── */}
                {about.team?.length > 0 && (
                    <motion.div
                        className={styles.teamSection}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className={styles.sectionTitle}>Meet the Team</h2>
                        <motion.div
                            className={styles.teamGrid}
                            variants={stagger}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                        >
                            {about.team.map((member, i) => (
                                <motion.div
                                    key={i}
                                    className={styles.teamCard}
                                    variants={fadeUp}
                                    whileHover={{ y: -8 }}
                                >
                                    <div className={styles.avatarWrap}>
                                        {member.avatar ? (
                                            <img src={member.avatar} alt={member.name} className={styles.avatar} />
                                        ) : (
                                            <div className={styles.avatarFallback}>
                                                {member.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className={styles.memberName}>{member.name}</h3>
                                    <p className={styles.memberRole}>{member.role}</p>
                                    {member.bio && <p className={styles.memberBio}>{member.bio}</p>}
                                    <div className={styles.memberLinks}>
                                        {member.linkedin && (
                                            <a href={member.linkedin} target="_blank" rel="noreferrer" className={styles.socialLink} title="LinkedIn">
                                                🔗
                                            </a>
                                        )}
                                        {member.github && (
                                            <a href={member.github} target="_blank" rel="noreferrer" className={styles.socialLink} title="GitHub">
                                                📦
                                            </a>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                )}

            </div>
        </PageWrapper>
    );
};

export default AboutUs;
