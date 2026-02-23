import { motion } from "framer-motion";

const PageWrapper = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -24 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={{ height: "100%" }}
    >
        {children}
    </motion.div>
);

export default PageWrapper;
