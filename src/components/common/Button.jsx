import { motion } from "framer-motion";
import styles from "./Button.module.css";

const Button = ({
    children,
    variant = "primary",
    loading = false,
    type = "button",
    fullWidth = false,
    onClick,
    ...props
}) => {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type={type}
            onClick={onClick}
            disabled={loading || props.disabled}
            className={`${styles.btn} ${styles[variant]} ${fullWidth ? styles.fullWidth : ""}`}
            {...props}
        >
            {loading ? <span className={styles.spinner} /> : children}
        </motion.button>
    );
};

export default Button;
