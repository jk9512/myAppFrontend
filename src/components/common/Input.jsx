import styles from "./Input.module.css";

const Input = ({ label, error, id, ...props }) => {
    return (
        <div className={styles.wrapper}>
            {label && <label htmlFor={id} className={styles.label}>{label}</label>}
            <input id={id} className={`${styles.input} ${error ? styles.hasError : ""}`} {...props} />
            {error && <p className={styles.errorMsg}>{error}</p>}
        </div>
    );
};

export default Input;
