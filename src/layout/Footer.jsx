import { Link } from "react-router-dom";
import Logo from "../assets/Logo.png";
import { motion } from "framer-motion";
import styles from "./Footer.module.css";

const currentYear = new Date().getFullYear();

const quickLinks = [
    { to: "/", label: "Home" },
    { to: "/portfolio", label: "Portfolio" },
    { to: "/testimonials", label: "Testimonials" },
    { to: "/contact", label: "Contact Us" },
    { to: "/login", label: "Login" },
];

const socialLinks = [
    { href: "https://github.com", icon: "🐙", label: "GitHub" },
    { href: "https://linkedin.com", icon: "💼", label: "LinkedIn" },
    { href: "https://twitter.com", icon: "🐦", label: "Twitter" },
];

const Footer = () => (
    <motion.footer
        className={styles.footer}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
    >
        <div className={styles.inner}>

            {/* ── Brand ──────────────────────────────────── */}
            <div className={styles.col}>
                <Link to="/" className={styles.brand}>
                    <img src={Logo} alt="Sankalp Infotech" className={styles.footerLogo} />
                </Link>
                <p className={styles.brandDesc}>
                    Sankalp Infotech delivers innovative, scalable, and beautiful
                    web &amp; software solutions. Let's build something great together.
                </p>
                <div className={styles.socials}>
                    {socialLinks.map(s => (
                        <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                            className={styles.socialBtn} title={s.label}>
                            <span>{s.icon}</span>
                        </a>
                    ))}
                </div>
            </div>

            {/* ── Quick Links ─────────────────────────────── */}
            <div className={styles.col}>
                <h4 className={styles.colTitle}>Quick Links</h4>
                <ul className={styles.linkList}>
                    {quickLinks.map(l => (
                        <li key={l.to}>
                            <Link to={l.to} className={styles.footLink}>{l.label}</Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* ── Contact Info ─────────────────────────────── */}
            <div className={styles.col}>
                <h4 className={styles.colTitle}>Contact</h4>
                <ul className={styles.contactList}>
                    <li className={styles.contactItem}>
                        <span className={styles.contactIcon}>📧</span>
                        <a href="mailto:admin@example.com" className={styles.footLink}>
                            admin@example.com
                        </a>
                    </li>
                    <li className={styles.contactItem}>
                        <span className={styles.contactIcon}>📞</span>
                        <a href="tel:+919999999999" className={styles.footLink}>
                            +91 99999 99999
                        </a>
                    </li>
                    <li className={styles.contactItem}>
                        <span className={styles.contactIcon}>📍</span>
                        <span className={styles.footText}>Surat, Gujarat, India</span>
                    </li>
                    <li className={styles.contactItem}>
                        <span className={styles.contactIcon}>🕐</span>
                        <span className={styles.footText}>Mon – Fri, 9am – 6pm IST</span>
                    </li>
                </ul>
            </div>

            {/* ── Newsletter / CTA ───────────────────────── */}
            <div className={styles.col}>
                <h4 className={styles.colTitle}>Let's Work Together</h4>
                <p className={styles.brandDesc}>
                    Have a project in mind? Reach out and let's build something amazing.
                </p>
                <a href="mailto:admin@example.com" className={styles.ctaBtn}>
                    Get in Touch →
                </a>
                <div className={styles.availability}>
                    <span className={styles.availDot} />
                    Available for new projects
                </div>
            </div>

        </div>

        {/* ── Bottom bar ─────────────────────────────────── */}
        <div className={styles.bottomBar}>
            <span className={styles.copy}>© {currentYear} Sankalp Infotech. All rights reserved.</span>
            <div className={styles.bottomLinks}>
                <a href="#" className={styles.bottomLink}>Privacy Policy</a>
                <a href="#" className={styles.bottomLink}>Terms of Service</a>
            </div>
        </div>
    </motion.footer>
);

export default Footer;
