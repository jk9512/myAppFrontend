import { useState } from "react";
import { motion } from "framer-motion";
import PageWrapper from "../components/common/PageWrapper";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import api from "../api/axios";
import styles from "./Contact.module.css";

const EMPTY = { name: "", email: "", phone: "", subject: "", message: "" };

const SUBJECTS = [
    "Project Inquiry",
    "Freelance Collaboration",
    "Job Opportunity",
    "Bug Report",
    "General Question",
    "Other",
];

const Contact = () => {
    const [form, setForm] = useState(EMPTY);
    const [errors, setErrors] = useState({});
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);

    const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = "Name is required";
        if (!form.email.trim()) e.email = "Email is required";
        if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
        if (!form.subject) e.subject = "Please select a subject";
        if (!form.message.trim()) e.message = "Message is required";
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setSending(true);
        try {
            await api.post("/contacts", form);
            setSuccess(true);
            setForm(EMPTY);
            setErrors({});
        } catch (err) {
            setErrors({ api: err.response?.data?.message || "Failed to send. Please try again." });
        } finally {
            setSending(false);
        }
    };

    return (
        <PageWrapper>
            <section className={styles.page}>

                {/* ── Hero ──────────────────────────────────── */}
                <motion.div
                    className={styles.hero}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55 }}
                >
                    <span className={styles.eyebrow}>Get in Touch</span>
                    <h1 className={styles.heading}>Let's Build Something <span className={styles.gradient}>Amazing</span></h1>
                    <p className={styles.sub}>Have a project in mind or just want to say hello? Fill out the form and I'll get back to you within 24 hours.</p>
                </motion.div>

                <div className={styles.layout}>

                    {/* ── Info cards ─────────────────────────── */}
                    <motion.div
                        className={styles.infoCol}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.55, delay: 0.15 }}
                    >
                        {[
                            { icon: "📧", label: "Email", value: "admin@example.com", href: "mailto:admin@example.com" },
                            { icon: "📞", label: "Phone", value: "+91 99999 99999", href: "tel:+919999999999" },
                            { icon: "📍", label: "Location", value: "Surat, Gujarat, India", href: null },
                            { icon: "🕐", label: "Working Hours", value: "Mon–Fri, 9am–6pm IST", href: null },
                        ].map(item => (
                            <div key={item.label} className={styles.infoCard}>
                                <span className={styles.infoIcon}>{item.icon}</span>
                                <div>
                                    <div className={styles.infoLabel}>{item.label}</div>
                                    {item.href
                                        ? <a href={item.href} className={styles.infoValue}>{item.value}</a>
                                        : <div className={styles.infoValue}>{item.value}</div>
                                    }
                                </div>
                            </div>
                        ))}

                        <div className={styles.availability}>
                            <span className={styles.availDot} />
                            Currently available for new projects
                        </div>
                    </motion.div>

                    {/* ── Contact form ────────────────────────── */}
                    <motion.div
                        className={styles.formCard}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.55, delay: 0.2 }}
                    >
                        {success ? (
                            <motion.div
                                className={styles.successBox}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                            >
                                <span className={styles.successIcon}>✅</span>
                                <h3>Message Sent!</h3>
                                <p>Thanks for reaching out. I'll get back to you within 24 hours.</p>
                                <Button onClick={() => setSuccess(false)} variant="outline">Send Another Message</Button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className={styles.form} noValidate>
                                <h2 className={styles.formTitle}>Send a Message</h2>

                                {errors.api && <div className={styles.apiError}>{errors.api}</div>}

                                <div className={styles.row}>
                                    <Input id="c-name" label="Your Name *" placeholder="Jay Kachhadiya" value={form.name} onChange={set("name")} error={errors.name} />
                                    <Input id="c-email" label="Email Address *" placeholder="jay@example.com" value={form.email} onChange={set("email")} error={errors.email} />
                                </div>

                                <div className={styles.row}>
                                    <Input id="c-phone" label="Phone (optional)" placeholder="+91 99999 99999" value={form.phone} onChange={set("phone")} />
                                    <div className={styles.selectWrap}>
                                        <label className={styles.selectLabel}>Subject *</label>
                                        <select
                                            className={`${styles.select} ${errors.subject ? styles.selectError : ""}`}
                                            value={form.subject}
                                            onChange={set("subject")}
                                        >
                                            <option value="">— Choose a subject —</option>
                                            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        {errors.subject && <span className={styles.errMsg}>{errors.subject}</span>}
                                    </div>
                                </div>

                                <div className={styles.selectWrap}>
                                    <label className={styles.selectLabel}>Message *</label>
                                    <textarea
                                        className={`${styles.textarea} ${errors.message ? styles.selectError : ""}`}
                                        rows={5}
                                        placeholder="Tell me about your project, idea, or question..."
                                        value={form.message}
                                        onChange={set("message")}
                                    />
                                    {errors.message && <span className={styles.errMsg}>{errors.message}</span>}
                                </div>

                                <Button type="submit" loading={sending} style={{ width: "100%" }}>
                                    {sending ? "Sending..." : "Send Message 🚀"}
                                </Button>
                            </form>
                        )}
                    </motion.div>

                </div>
            </section>
        </PageWrapper>
    );
};

export default Contact;
