import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageWrapper from "../../components/common/PageWrapper";
import DataTable from "../../components/common/DataTable";
import Button from "../../components/common/Button";
import api from "../../api/axios";
import styles from "./UsersPage.module.css";

const STATUS_STYLE = {
    new: { background: "rgba(99,102,241,0.15)", color: "#818cf8" },
    read: { background: "rgba(234,179,8,0.15)", color: "#eab308" },
    replied: { background: "rgba(34,197,94,0.15)", color: "#22c55e" },
};

const ContactsPage = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [toast, setToast] = useState(null);
    const [exporting, setExporting] = useState(false);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    /* ── Fetch ──────────────────────────────────────── */
    const fetchContacts = useCallback(async () => {
        setLoading(true);
        try {
            const params = filter !== "all" ? { status: filter } : {};
            const { data } = await api.get("/contacts", { params });
            setContacts(data.contacts);
        } catch {
            showToast("Failed to fetch contacts", "error");
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => { fetchContacts(); }, [fetchContacts]);

    /* ── Status inline update ───────────────────────── */
    const handleStatusChange = async (id, status) => {
        try {
            await api.put(`/contacts/${id}`, { status });
            setContacts(prev => prev.map(c => c._id === id ? { ...c, status } : c));
            showToast("Status updated");
        } catch {
            showToast("Failed to update status", "error");
        }
    };

    /* ── Delete ─────────────────────────────────────── */
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this contact submission?")) return;
        try {
            await api.delete(`/contacts/${id}`);
            setContacts(prev => prev.filter(c => c._id !== id));
            showToast("Contact deleted");
        } catch {
            showToast("Failed to delete", "error");
        }
    };

    /* ── Excel export ───────────────────────────────── */
    const handleExport = async () => {
        setExporting(true);
        try {
            const res = await api.get("/contacts/export", { responseType: "blob" });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement("a");
            a.href = url;
            a.download = `contacts_${new Date().toISOString().slice(0, 10)}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            showToast("Excel downloaded ✅");
        } catch {
            showToast("Export failed", "error");
        } finally {
            setExporting(false);
        }
    };

    /* ── Table columns ──────────────────────────────── */
    const columns = [
        {
            header: "Name",
            accessor: "name",
            render: (val) => <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{val}</span>,
        },
        {
            header: "Email",
            accessor: "email",
            render: (val) => (
                <a href={`mailto:${val}`} style={{ color: "var(--primary-light)", fontSize: 13 }}>{val}</a>
            ),
        },
        {
            header: "Phone",
            accessor: "phone",
            sortable: false,
            render: (val) => <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>{val || "—"}</span>,
        },
        {
            header: "Subject",
            accessor: "subject",
            render: (val) => (
                <span style={{
                    background: "rgba(99,102,241,0.12)",
                    color: "var(--primary-light)",
                    padding: "3px 10px",
                    borderRadius: "99px",
                    fontSize: 12,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                }}>{val}</span>
            ),
        },
        {
            header: "Message",
            accessor: "message",
            sortable: false,
            render: (val) => (
                <span title={val} style={{
                    display: "block",
                    maxWidth: 220,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                }}>{val}</span>
            ),
        },
        {
            header: "Status",
            accessor: "status",
            render: (val, row) => (
                <select
                    value={val}
                    onChange={e => handleStatusChange(row._id, e.target.value)}
                    style={{
                        padding: "4px 10px",
                        borderRadius: "99px",
                        border: "1px solid var(--border)",
                        background: STATUS_STYLE[val]?.background,
                        color: STATUS_STYLE[val]?.color,
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        outline: "none",
                    }}
                >
                    <option value="new">NEW</option>
                    <option value="read">READ</option>
                    <option value="replied">REPLIED</option>
                </select>
            ),
        },
        {
            header: "Received",
            accessor: "createdAt",
            render: (val) => (
                <span style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                    {new Date(val).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
            ),
        },
        {
            header: "Actions",
            accessor: "_id",
            sortable: false,
            render: (id) => (
                <button
                    onClick={() => handleDelete(id)}
                    className={styles.deleteBtn}
                >
                    Delete
                </button>
            ),
        },
    ];

    /* ── Counts for filter tabs ─────────────────────── */
    const allContacts = contacts;
    const counts = {
        all: allContacts.length,
        new: allContacts.filter(c => c.status === "new").length,
        read: allContacts.filter(c => c.status === "read").length,
        replied: allContacts.filter(c => c.status === "replied").length,
    };

    /* ── Displayed rows (client-side status filter) ─── */
    const displayed = filter === "all" ? contacts : contacts.filter(c => c.status === filter);

    return (
        <PageWrapper>
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        className={`${styles.toast} ${toast.type === "error" ? styles.toastError : styles.toastSuccess}`}
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                    >
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>📬 Contact Submissions</h1>
                    <p className={styles.pageSubtitle}>
                        {contacts.length} message{contacts.length !== 1 ? "s" : ""} received
                    </p>
                </div>
                <Button onClick={handleExport} loading={exporting}>
                    {exporting ? "Exporting..." : "⬇ Download Excel"}
                </Button>
            </div>

            {/* Filter chips */}
            <div className={styles.filterRow}>
                {["all", "new", "read", "replied"].map(f => (
                    <button
                        key={f}
                        className={`${styles.filterChip} ${filter === f ? styles.filterActive : ""}`}
                        onClick={() => setFilter(f)}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                        {counts[f] > 0 && <span className={styles.filterCount}>{counts[f]}</span>}
                    </button>
                ))}
            </div>

            {/* Table */}
            <DataTable
                columns={columns}
                data={displayed}
                loading={loading}
                pageSize={10}
            />
        </PageWrapper>
    );
};

export default ContactsPage;
