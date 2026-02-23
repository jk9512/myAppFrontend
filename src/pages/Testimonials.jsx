import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PageWrapper from "../components/common/PageWrapper";
import Spinner from "../components/common/Spinner";
import api from "../api/axios";
import styles from "./Testimonials.module.css";

const Stars = ({ rating }) => (
    <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className={n <= rating ? styles.starFilled : styles.starEmpty}>★</span>
        ))}
    </div>
);

const Avatar = ({ name, avatar }) => {
    if (avatar) return <img src={avatar} alt={name} className={styles.avatarImg} />;
    return (
        <div className={styles.avatarInitial}>
            {name?.charAt(0).toUpperCase()}
        </div>
    );
};

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const Testimonials = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/testimonials")
            .then(({ data }) => setTestimonials(data.testimonials))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

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
                    <span className={styles.eyebrow}>What people say</span>
                    <h1 className={styles.heading}>Client <span className={styles.gradient}>Testimonials</span></h1>
                    <p className={styles.subheading}>
                        Real feedback from real clients. Here's what they have to say about working together.
                    </p>
                </motion.div>

                {/* Cards */}
                {loading ? (
                    <Spinner message="Loading testimonials..." />
                ) : testimonials.length === 0 ? (
                    <p className={styles.empty}>No testimonials yet.</p>
                ) : (
                    <motion.div
                        className={styles.grid}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {testimonials.map((t) => (
                            <motion.div key={t._id} className={styles.card} variants={cardVariants} whileHover={{ y: -6, transition: { duration: 0.2 } }}>
                                {/* Quote icon */}
                                <div className={styles.quoteIcon}>"</div>

                                <Stars rating={t.rating} />

                                <p className={styles.message}>{t.message}</p>

                                <div className={styles.author}>
                                    <Avatar name={t.name} avatar={t.avatar} />
                                    <div>
                                        <div className={styles.authorName}>{t.name}</div>
                                        <div className={styles.authorDesig}>{t.designation}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </section>
        </PageWrapper>
    );
};

export default Testimonials;
