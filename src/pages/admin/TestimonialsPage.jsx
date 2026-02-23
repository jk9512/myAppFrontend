import { useState, useEffect, useCallback } from "react";
import PageWrapper from "../../components/common/PageWrapper";
import DataTable from "../../components/common/DataTable";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import api from "../../api/axios";
import styles from "./UsersPage.module.css";

const EMPTY_FORM = { name: "", designation: "", message: "", rating: 5, avatar: "", isActive: true };

const TestimonialsPage = () => {
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
            const { data } = await api.get("/testimonials?all=true");
            setItems(data.testimonials);
        } catch {
            showToast("Failed to load testimonials", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setErrors({}); setModal(true); };
    const openEdit = (item) => {
        setEditItem(item);
        setForm({ name: item.name, designation: item.designation, message: item.message, rating: item.rating, avatar: item.avatar || "", isActive: item.isActive });
        setErrors({});
        setModal(true);
    };
    const closeModal = () => setModal(false);

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = "Name is required";
        if (!form.designation.trim()) e.designation = "Designation is required";
        if (!form.message.trim()) e.message = "Message is required";
        return e;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const e2 = validate();
        if (Object.keys(e2).length) { setErrors(e2); return; }
        setSaving(true);
        try {
            if (editItem) {
                await api.put(`/testimonials/${editItem._id}`, form);
                showToast("Testimonial updated");
            } else {
                await api.post("/testimonials", form);
                showToast("Testimonial created");
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
        if (!window.confirm(`Delete testimonial from "${item.name}"?`)) return;
        try {
            await api.delete(`/testimonials/${item._id}`);
            showToast("Deleted");
            fetchItems();
        } catch {
            showToast("Delete failed", "error");
        }
    };

    const columns = [
        {
            header: "Person",
            accessor: "name",
            render: (val, row) => (
                <div className={styles.userCell}>
                    <div className={styles.avatar}>{val?.charAt(0).toUpperCase()}</div>
                    <div>
                        <div className={styles.userName}>{val}</div>
                        <div className={styles.userEmail}>{row.designation}</div>
                    </div>
                </div>
            ),
        },
        {
            header: "Message",
            accessor: "message",
            render: (val) => <span style={{ fontSize: 13, color: "var(--text-secondary)", maxWidth: 300, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{val}</span>,
        },
        {
            header: "Rating",
            accessor: "rating",
            render: (val) => <span>{"⭐".repeat(val)}</span>,
        },
        {
            header: "Status",
            accessor: "isActive",
            render: (val) => (
                <span className={`${styles.badge} ${val ? styles.badgeAdmin : styles.badgeUser}`}>
                    {val ? "✅ Active" : "🔴 Hidden"}
                </span>
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
                        <h1 className={styles.pageTitle}>Testimonials</h1>
                        <p className={styles.pageDesc}>Manage client testimonials shown on the website</p>
                    </div>
                    <Button onClick={openAdd}>+ Add Testimonial</Button>
                </div>

                <div className={styles.tableCard}>
                    <DataTable columns={columns} data={items} loading={loading} pageSize={8} />
                </div>

                <Modal isOpen={modal} onClose={closeModal} title={editItem ? "Edit Testimonial" : "Add Testimonial"}>
                    <form onSubmit={handleSave} className={styles.modalForm}>
                        <Input id="t-name" label="Name" placeholder="Sarah Johnson" value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
                        <Input id="t-desig" label="Designation" placeholder="CEO at Acme" value={form.designation}
                            onChange={(e) => setForm({ ...form, designation: e.target.value })} error={errors.designation} />
                        <Input id="t-avatar" label="Avatar URL (optional)" placeholder="https://..." value={form.avatar}
                            onChange={(e) => setForm({ ...form, avatar: e.target.value })} />
                        <div className={styles.roleSelect}>
                            <label className={styles.roleLabel}>Message</label>
                            <textarea
                                className={styles.select}
                                rows={3}
                                placeholder="Write testimonial message..."
                                value={form.message}
                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                style={{ resize: "vertical", fontFamily: "inherit" }}
                            />
                            {errors.message && <span style={{ color: "var(--danger)", fontSize: 12 }}>{errors.message}</span>}
                        </div>
                        <div className={styles.roleSelect}>
                            <label className={styles.roleLabel}>Rating</label>
                            <select className={styles.select} value={form.rating}
                                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
                                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{"⭐".repeat(n)} ({n})</option>)}
                            </select>
                        </div>
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
                            <Button type="submit" loading={saving}>{editItem ? "Save Changes" : "Create"}</Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </PageWrapper>
    );
};

export default TestimonialsPage;
