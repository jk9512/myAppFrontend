import styles from "./Spinner.module.css";

const Spinner = ({ size = 40, message = "Loading..." }) => (
    <div className={styles.wrapper}>
        <div className={styles.ring} style={{ width: size, height: size }} />
        {message && <p className={styles.message}>{message}</p>}
    </div>
);

export default Spinner;
