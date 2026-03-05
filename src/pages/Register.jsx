import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageWrapper from "../components/common/PageWrapper";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import styles from "./Auth.module.css";

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", password: "", plan: "free" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");

    const validate = () => {
        const e = {};
        if (!form.name) e.name = "Name is required";
        if (!form.email) e.email = "Email is required";
        if (!form.password || form.password.length < 6) e.password = "Password must be at least 6 characters";
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const e2 = validate();
        if (Object.keys(e2).length) { setErrors(e2); return; }
        setLoading(true);
        setServerError("");
        try {
            await register(form.name, form.email, form.password, form.plan);
            navigate("/");
        } catch (err) {
            setServerError(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper>
            <div className={styles.authPage}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <div className={styles.iconBadge}>🚀</div>
                        <h1 className={styles.title}>Create account</h1>
                        <p className={styles.subtitle}>Start building today</p>
                    </div>

                    {serverError && <div className={styles.alert}>{serverError}</div>}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <Input
                            id="name"
                            label="Full Name"
                            type="text"
                            placeholder="Jay Kachhadiya"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            error={errors.name}
                        />
                        <Input
                            id="email"
                            label="Email Address"
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            error={errors.email}
                        />
                        <Input
                            id="password"
                            label="Password"
                            type="password"
                            placeholder="Min 6 characters"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            error={errors.password}
                        />
                        <Input
                            id="plan"
                            label="Subscription Plan"
                            type="select"
                            value={form.plan}
                            onChange={(e) => setForm({ ...form, plan: e.target.value })}
                            options={[
                                { value: "free", label: "Free (14 Days)" },
                                { value: "premium", label: "Premium (3 Months)" },
                                { value: "pro", label: "Pro (3 Months)" }
                            ]}
                        />
                        <Button type="submit" loading={loading} fullWidth>
                            Create Account
                        </Button>
                    </form>

                    <p className={styles.switchText}>
                        Already have an account? <Link to="/login" className={styles.link}>Login</Link>
                    </p>
                </div>
            </div>
        </PageWrapper>
    );
};

export default Register;
