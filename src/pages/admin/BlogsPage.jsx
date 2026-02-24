import { useState, useEffect, useCallback } from "react";
import PageWrapper from "../../components/common/PageWrapper";
import DataTable from "../../components/common/DataTable";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import api from "../../api/axios";
import styles from "./UsersPage.module.css";

const EMPTY_FORM = {
    title: "",
    excerpt: "",
    content: "",
    category: "Tech",
    tags: "",
    coverImage: "",
    author: "Jay Kachhadiya",
    published: true,
};

const CATEGORIES = ["Tech", "Web Dev", "Design", "Career", "Tutorial", "General", "Other"];

const BlogsPage = () => {
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
            const { data } = await api.get("/blogs?all=true&limit=100");
            setItems(data.blogs || []);
        } catch {
            showToast("Failed to load blog posts", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setErrors({}); setModal(true); };
    const openEdit = (item) => {
        setEditItem(item);
        setForm({
            title: item.title || "",
            excerpt: item.excerpt || "",
            content: item.content || "",
            category: item.category || "Tech",
            tags: Array.isArray(item.tags) ? item.tags.join(", ") : "",
            coverImage: item.coverImage || "",
            author: item.author || "Jay Kachhadiya",
            published: item.published,
        });
        setErrors({});
        setModal(true);
    };
    const closeModal = () => setModal(false);

    const validate = () => {
        const e = {};
        if (!form.title.trim()) e.title = "Title is required";
        if (!form.content.trim()) e.content = "Content is required";
        return e;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const e2 = validate();
        if (Object.keys(e2).length) { setErrors(e2); return; }
        setSaving(true);
        try {
            const payload = {
                ...form,
                tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
            };
            if (editItem) {
                await api.put(`/blogs/${editItem._id}`, payload);
                showToast("Blog post updated");
            } else {
                await api.post("/blogs", payload);
                showToast("Blog post created");
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
            await api.delete(`/blogs/${item._id}`);
            showToast("Blog post deleted");
            fetchItems();
        } catch {
            showToast("Delete failed", "error");
        }
    };

    const columns = [
        {
            header: "Post",
            accessor: "title",
            render: (val, row) => (
                <div className={styles.userCell}>
                    <div className={styles.avatar} style={{ borderRadius: 8, fontSize: 13 }}>
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
            header: "Tags",
            accessor: "tags",
            sortable: false,
            render: (val) => (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {(val || []).slice(0, 3).map(t => (
                        <span key={t} className={`${styles.badge} ${styles.badgeAdmin}`} style={{ fontSize: 11 }}>#{t}</span>
                    ))}
                    {(val || []).length > 3 && <span className={styles.badge} style={{ fontSize: 11 }}>+{val.length - 3}</span>}
                </div>
            ),
        },
        {
            header: "Read Time",
            accessor: "readTime",
            render: (val) => <span style={{ color: "var(--text-muted)", fontSize: 13 }}>⏱ {val} min</span>,
        },
        {
            header: "Status",
            accessor: "published",
            render: (val) => (
                <span className={`${styles.badge} ${val ? styles.badgeAdmin : styles.badgeUser}`}>
                    {val ? "✅ Published" : "🔴 Draft"}
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
                        <h1 className={styles.pageTitle}>Blog Posts</h1>
                        <p className={styles.pageDesc}>Create and manage blog articles displayed on the website</p>
                    </div>
                    <Button onClick={openAdd}>+ New Post</Button>
                </div>

                <div className={styles.tableCard}>
                    <DataTable columns={columns} data={items} loading={loading} pageSize={8} />
                </div>

                <Modal isOpen={modal} onClose={closeModal} title={editItem ? "Edit Blog Post" : "New Blog Post"}>
                    <form onSubmit={handleSave} className={styles.modalForm}>
                        <Input id="b-title" label="Title *" placeholder="My First Blog Post"
                            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} error={errors.title} />

                        <Input id="b-excerpt" label="Excerpt (short summary)" placeholder="A brief description shown in cards..."
                            value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />

                        <div className={styles.roleSelect}>
                            <label className={styles.roleLabel}>Content * (full article)</label>
                            <textarea
                                className={styles.select}
                                rows={8}
                                placeholder="Write your full article here..."
                                value={form.content}
                                onChange={(e) => setForm({ ...form, content: e.target.value })}
                                style={{ resize: "vertical", fontFamily: "inherit" }}
                            />
                            {errors.content && <span style={{ color: "var(--danger)", fontSize: 12 }}>{errors.content}</span>}
                        </div>

                        <div className={styles.roleSelect}>
                            <label className={styles.roleLabel}>Category</label>
                            <select className={styles.select} value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <Input id="b-tags" label="Tags (comma separated)" placeholder="react, nodejs, tips"
                            value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />

                        <Input id="b-cover" label="Cover Image URL (optional)" placeholder="https://..."
                            value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} />

                        <Input id="b-author" label="Author" placeholder="Jay Kachhadiya"
                            value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />

                        <div className={styles.roleSelect}>
                            <label className={styles.roleLabel}>Status</label>
                            <select className={styles.select} value={form.published}
                                onChange={(e) => setForm({ ...form, published: e.target.value === "true" })}>
                                <option value="true">✅ Published (visible on website)</option>
                                <option value="false">🔴 Draft (hidden)</option>
                            </select>
                        </div>

                        <div className={styles.modalActions}>
                            <Button variant="outline" type="button" onClick={closeModal}>Cancel</Button>
                            <Button type="submit" loading={saving}>{editItem ? "Save Changes" : "Create Post"}</Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </PageWrapper>
    );
};

export default BlogsPage;
