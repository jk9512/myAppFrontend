import { useState, useEffect, useCallback } from "react";
import PageWrapper from "../../components/common/PageWrapper";
import DataTable from "../../components/common/DataTable";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import api from "../../api/axios";
import styles from "./UsersPage.module.css";

const EMPTY_FORM = { title: "", instagramUrl: "", caption: "", isActive: true, order: 0 };

const extractShortcode = (url) => {
    const match = url.match(/instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/);
    return match ? match[1] : "";
};

const ReelsPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/reels/all");
            setItems(data.reels);
        } catch {
            showToast("Failed to load reels", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setErrors({}); setModal(true); };
    const openEdit = (item) => {
        setEditItem(item);
        setForm({ title: item.title, instagramUrl: item.instagramUrl, caption: item.caption || "", isActive: item.isActive, order: item.order || 0 });
        setErrors({});
        setModal(true);
    };
    const closeModal = () => setModal(false);

    const validate = () => {
        const e = {};
        if (!form.title.trim()) e.title = "Title is required";
        if (!form.instagramUrl.trim()) e.instagramUrl = "Instagram URL is required";
        else if (!extractShortcode(form.instagramUrl)) e.instagramUrl = "Invalid Instagram URL (must contain /reel/ or /p/)";
        return e;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const e2 = validate();
        if (Object.keys(e2).length) { setErrors(e2); return; }
        setSaving(true);
        try {
            if (editItem) {
                await api.put(`/reels/${editItem._id}`, form);
                showToast("Reel updated");
            } else {
                await api.post("/reels", form);
                showToast("Reel created");
            }
            closeModal();
            fetchItems();
        } catch (err) {
            showToast(err.response?.data?.message || "Operation failed", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`Delete reel "${item.title}"?`)) return;
        try {
            await api.delete(`/reels/${item._id}`);
            showToast("Deleted");
            fetchItems();
        } catch {
            showToast("Delete failed", "error");
        }
    };

    const toggleActive = async (item) => {
        try {
            await api.put(`/reels/${item._id}`, { ...item, isActive: !item.isActive });
            fetchItems();
        } catch {
            showToast("Update failed", "error");
        }
    };

    const columns = [
        {
            header: "Reel",
            accessor: "title",
            render: (val, row) => (
                <div className={styles.userCell}>
                    {/* Tiny embed preview */}
                    <div style={{ width: 48, height: 72, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "var(--bg-hover)" }}>
                        {row.shortcode && (
                            <iframe
                                src={`https://www.instagram.com/reel/${row.shortcode}/embed/`}
                                style={{ width: 300, height: 450, transform: "scale(0.16)", transformOrigin: "top left", border: "none" }}
                                scrolling="no"
                                title={val}
                            />
                        )}
                    </div>
                    <div>
                        <div className={styles.userName}>{val}</div>
                        <div className={styles.userEmail} style={{ fontSize: 11 }}>
                            {row.shortcode ? `📎 ${row.shortcode}` : "No shortcode"}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: "Caption",
            accessor: "caption",
            render: (val) => (
                <span style={{ fontSize: 13, color: "var(--text-secondary)", maxWidth: 220, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {val || "—"}
                </span>
            ),
        },
        {
            header: "Order",
            accessor: "order",
            render: (val) => <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>#{val}</span>,
        },
        {
            header: "Status",
            accessor: "isActive",
            render: (val, row) => (
                <button
                    className={`${styles.badge} ${val ? styles.badgeAdmin : styles.badgeUser}`}
                    style={{ cursor: "pointer", border: "none", fontFamily: "inherit" }}
                    onClick={() => toggleActive(row)}
                    title="Click to toggle"
                >
                    {val ? "✅ Active" : "🔴 Hidden"}
                </button>
            ),
        },
        {
            header: "Actions",
            accessor: "_id",
            sortable: false,
            render: (_, row) => (
                <div className={styles.actions}>
                    <Button variant="outline" onClick={() => openEdit(row)}>Edit</Button>
                    <Button variant="danger" onClick={() => handleDelete(row)}>Delete</Button>
                </div>
            ),
        },
    ];

    return (
        <PageWrapper>
            <div className={styles.page}>
                {toast && <div className={`${styles.toast} ${styles[toast.type]}`}>{toast.msg}</div>}

                <div className={styles.pageHeader}>
                    <div>
                        <h1 className={styles.pageTitle}>Instagram Reels</h1>
                        <p className={styles.pageDesc}>Manage reels shown on the website</p>
                    </div>
                    <Button onClick={openAdd}>+ Add Reel</Button>
                </div>

                <div className={styles.tableCard}>
                    <DataTable columns={columns} data={items} loading={loading} pageSize={8} />
                </div>

                <Modal isOpen={modal} onClose={closeModal} title={editItem ? "Edit Reel" : "Add Instagram Reel"}>
                    <form onSubmit={handleSave} className={styles.modalForm}>
                        <Input
                            id="reel-title"
                            label="Title"
                            placeholder="e.g. Behind the scenes"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            error={errors.title}
                        />
                        <Input
                            id="reel-url"
                            label="Instagram Reel URL"
                            placeholder="https://www.instagram.com/reel/ABC123/"
                            value={form.instagramUrl}
                            onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
                            error={errors.instagramUrl}
                        />
                        {form.instagramUrl && extractShortcode(form.instagramUrl) && (
                            <p style={{ fontSize: 12, color: "var(--success)", marginTop: -8 }}>
                                ✅ Shortcode detected: <strong>{extractShortcode(form.instagramUrl)}</strong>
                            </p>
                        )}
                        <div className={styles.roleSelect}>
                            <label className={styles.roleLabel}>Caption (optional)</label>
                            <textarea
                                className={styles.select}
                                rows={3}
                                placeholder="Short description..."
                                value={form.caption}
                                onChange={(e) => setForm({ ...form, caption: e.target.value })}
                                style={{ resize: "vertical", fontFamily: "inherit" }}
                            />
                        </div>
                        <Input
                            id="reel-order"
                            label="Display Order (lower = first)"
                            type="number"
                            placeholder="0"
                            value={form.order}
                            onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                        />
                        <div className={styles.roleSelect}>
                            <label className={styles.roleLabel}>Status</label>
                            <select className={styles.select} value={form.isActive}
                                onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}>
                                <option value="true">✅ Active (visible on website)</option>
                                <option value="false">🔴 Hidden</option>
                            </select>
                        </div>
                        <div className={styles.modalActions}>
                            <Button variant="outline" type="button" onClick={closeModal}>Cancel</Button>
                            <Button type="submit" loading={saving}>{editItem ? "Save Changes" : "Add Reel"}</Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </PageWrapper>
    );
};

export default ReelsPage;
