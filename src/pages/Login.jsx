import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageWrapper from "../components/common/PageWrapper";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import styles from "./Auth.module.css";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");

    const validate = () => {
        const e = {};
        if (!form.email) e.email = "Email is required";
        if (!form.password) e.password = "Password is required";
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const e2 = validate();
        if (Object.keys(e2).length) { setErrors(e2); return; }
        setLoading(true);
        setServerError("");
        try {
            const user = await login(form.email, form.password);
            navigate(user.role === "admin" ? "/admin/dashboard" : "/");
        } catch (err) {
            setServerError(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper>
            <div className={styles.authPage}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <div className={styles.iconBadge}>🔐</div>
                        <h1 className={styles.title}>Welcome back</h1>
                        <p className={styles.subtitle}>Sign in to your account</p>
                    </div>

                    {serverError && <div className={styles.alert}>{serverError}</div>}

                    <form onSubmit={handleSubmit} className={styles.form}>
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
                            placeholder="••••••••"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            error={errors.password}
                        />
                        <Button type="submit" loading={loading} fullWidth>
                            Sign In
                        </Button>
                    </form>

                    <p className={styles.switchText}>
                        Don't have an account? <Link to="/register" className={styles.link}>Register</Link>
                    </p>

                    {/* Quick login hint */}
                    <div className={styles.hint}>
                        <strong>Demo:</strong> admin@example.com / admin123
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default Login;
