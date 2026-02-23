import { useState, useEffect, useCallback } from "react";
import PageWrapper from "../../components/common/PageWrapper";
import DataTable from "../../components/common/DataTable";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import api from "../../api/axios";
import styles from "./UsersPage.module.css";

const EMPTY_FORM = { title: "", description: "", category: "Web App", imageUrl: "", projectUrl: "", technologies: "", isActive: true, order: 0 };

const CATEGORIES = ["Web App", "Mobile", "SaaS", "CMS", "AI Tool", "E-Commerce", "Other"];

const PortfolioPage = () => {
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
            const { data } = await api.get("/portfolio?all=true");
            setItems(data.portfolios);
        } catch {
            showToast("Failed to load portfolio items", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setErrors({}); setModal(true); };
    const openEdit = (item) => {
        setEditItem(item);
        setForm({
            title: item.title, description: item.description, category: item.category,
            imageUrl: item.imageUrl || "", projectUrl: item.projectUrl || "",
            technologies: Array.isArray(item.technologies) ? item.technologies.join(", ") : item.technologies,
            isActive: item.isActive, order: item.order || 0,
        });
        setErrors({});
        setModal(true);
    };
    const closeModal = () => setModal(false);

    const validate = () => {
        const e = {};
        if (!form.title.trim()) e.title = "Title is required";
        if (!form.description.trim()) e.description = "Description is required";
        return e;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const e2 = validate();
        if (Object.keys(e2).length) { setErrors(e2); return; }
        setSaving(true);
        try {
            const payload = { ...form };
            if (editItem) {
                await api.put(`/portfolio/${editItem._id}`, payload);
                showToast("Portfolio item updated");
            } else {
                await api.post("/portfolio", payload);
                showToast("Portfolio item created");
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
        if (!window.confirm(`Delete "${item.title}"?`)) return;
        try {
            await api.delete(`/portfolio/${item._id}`);
            showToast("Deleted");
            fetchItems();
        } catch {
            showToast("Delete failed", "error");
        }
    };

    const columns = [
        {
            header: "Project",
            accessor: "title",
            render: (val, row) => (
                <div className={styles.userCell}>
                    <div className={styles.avatar} style={{ borderRadius: 8 }}>
                        {val?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className={styles.userName}>{val}</div>
                        <div className={styles.userEmail}>{row.category}</div>
                    </div>
                </div>
            ),
        },
        {
            header: "Technologies",
            accessor: "technologies",
            sortable: false,
            render: (val) => (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {(val || []).slice(0, 3).map((t) => (
                        <span key={t} className={`${styles.badge} ${styles.badgeAdmin}`} style={{ fontSize: 11 }}>{t}</span>
                    ))}
                    {(val || []).length > 3 && <span className={styles.badge} style={{ fontSize: 11 }}>+{val.length - 3}</span>}
                </div>
            ),
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
            header: "Order",
            accessor: "order",
            render: (val) => <span style={{ color: "var(--text-muted)", fontSize: 13 }}>#{val}</span>,
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
                        <h1 className={styles.pageTitle}>Portfolio</h1>
                        <p className={styles.pageDesc}>Manage projects displayed on the public portfolio page</p>
                    </div>
                    <Button onClick={openAdd}>+ Add Project</Button>
                </div>

                <div className={styles.tableCard}>
                    <DataTable columns={columns} data={items} loading={loading} pageSize={8} />
                </div>

                <Modal isOpen={modal} onClose={closeModal} title={editItem ? "Edit Project" : "Add Project"}>
                    <form onSubmit={handleSave} className={styles.modalForm}>
                        <Input id="p-title" label="Project Title" placeholder="E-Commerce Platform" value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })} error={errors.title} />
                        <div className={styles.roleSelect}>
                            <label className={styles.roleLabel}>Description</label>
                            <textarea className={styles.select} rows={3} placeholder="Describe the project..."
                                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                                style={{ resize: "vertical", fontFamily: "inherit" }} />
                            {errors.description && <span style={{ color: "var(--danger)", fontSize: 12 }}>{errors.description}</span>}
                        </div>
                        <div className={styles.roleSelect}>
                            <label className={styles.roleLabel}>Category</label>
                            <select className={styles.select} value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <Input id="p-technologies" label="Technologies (comma separated)" placeholder="React, Node.js, MongoDB"
                            value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} />
                        <Input id="p-image" label="Image URL (optional)" placeholder="https://..."
                            value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
                        <Input id="p-url" label="Project URL (optional)" placeholder="https://github.com/..."
                            value={form.projectUrl} onChange={(e) => setForm({ ...form, projectUrl: e.target.value })} />
                        <Input id="p-order" label="Display Order" type="number" placeholder="1"
                            value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
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

export default PortfolioPage;
