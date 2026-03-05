import styles from "./Input.module.css";

const Input = ({ label, error, id, type, options, ...props }) => {
    return (
        <div className={styles.wrapper}>
            {label && <label htmlFor={id} className={styles.label}>{label}</label>}
            {type === "select" ? (
                <select id={id} className={`${styles.input} ${error ? styles.hasError : ""}`} {...props}>
                    {options && options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            ) : (
                <input id={id} type={type} className={`${styles.input} ${error ? styles.hasError : ""}`} {...props} />
            )}
            {error && <p className={styles.errorMsg}>{error}</p>}
        </div>
    );
};

export default Input;
