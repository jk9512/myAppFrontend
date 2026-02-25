import { useState, useEffect, useCallback } from "react";
import PageWrapper from "../../components/common/PageWrapper";
import DataTable from "../../components/common/DataTable";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import api from "../../api/axios";
import styles from "./UsersPage.module.css";

const EMPTY_FORM = {
    headline: "",
    subheadline: "",
    description: "",
    mission: "",
    vision: "",
    values: "",
    skills: "",
    stats: "",
    team: "",
    isActive: true,
};

const defaultStats = [
    { label: "Projects Delivered", value: "50+" },
    { label: "Happy Clients", value: "30+" },
    { label: "Years of Experience", value: "5+" },
    { label: "Technologies", value: "20+" },
];

const defaultStatsTeam = [
    {
        name: "Jay Kachhadiya",
        role: "Founder & Full-Stack Developer",
        bio: "Passionate about building scalable web apps.",
        avatar: "",
        linkedin: "https://linkedin.com/in/jay",
        github: "https://github.com/jay",
    },
    {
        name: "Priya Sharma",
        role: "UI/UX Designer",
        bio: "Creates beautiful user-centred designs.",
        avatar: "",
        linkedin: "https://linkedin.com/in/priya",
        github: "",
    },
];

const AboutUsPage = () => {
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
            const { data } = await api.get("/about/all");
            setItems(data.items || []);
        } catch {
            showToast("Failed to load About Us records", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const openAdd = () => {
        setEditItem(null);
        setForm({
            ...EMPTY_FORM,
            stats: JSON.stringify(defaultStats, null, 2),
            team: JSON.stringify(defaultStatsTeam, null, 2),
        });
        setErrors({});
        setModal(true);
    };

    const openEdit = (item) => {
        setEditItem(item);
        setForm({
            headline: item.headline || "",
            subheadline: item.subheadline || "",
            description: item.description || "",
            mission: item.mission || "",
            vision: item.vision || "",
            values: (item.values || []).join(", "),
            skills: (item.skills || []).join(", "),
            stats: JSON.stringify(item.stats || [], null, 2),
            team: JSON.stringify(item.team || [], null, 2),
            isActive: item.isActive,
        });
        setErrors({});
        setModal(true);
    };

    const closeModal = () => setModal(false);

    const validate = () => {
        const e = {};
        if (!form.headline.trim()) e.headline = "Headline is required";
        if (!form.description.trim()) e.description = "Description is required";
        try { JSON.parse(form.stats || "[]"); } catch { e.stats = "Stats must be valid JSON"; }
        try { JSON.parse(form.team || "[]"); } catch { e.team = "Team must be valid JSON"; }
        return e;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const e2 = validate();
        if (Object.keys(e2).length) { setErrors(e2); return; }
        setSaving(true);
        try {
            const payload = {
                headline: form.headline,
                subheadline: form.subheadline,
                description: form.description,
                mission: form.mission,
                vision: form.vision,
                values: form.values ? form.values.split(",").map(v => v.trim()).filter(Boolean) : [],
                skills: form.skills ? form.skills.split(",").map(s => s.trim()).filter(Boolean) : [],
                stats: JSON.parse(form.stats || "[]"),
                team: JSON.parse(form.team || "[]"),
                isActive: form.isActive,
            };
            if (editItem) {
                await api.put(`/about/${editItem._id}`, payload);
                showToast("About Us record updated");
            } else {
                await api.post("/about", payload);
                showToast("About Us record created");
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
        if (!window.confirm("Delete this About Us record?")) return;
        try {
            await api.delete(`/about/${item._id}`);
            showToast("Record deleted");
            fetchItems();
        } catch {
            showToast("Delete failed", "error");
        }
    };

    const handleToggleActive = async (item) => {
        try {
            await api.put(`/about/${item._id}`, { isActive: !item.isActive });
            showToast(`Marked as ${!item.isActive ? "active" : "inactive"}`);
            fetchItems();
        } catch {
            showToast("Update failed", "error");
        }
    };

    // ── DataTable columns ────────────────────────────────────────────
    const columns = [
        {
            header: "Record",
            accessor: "headline",
            render: (val, row) => (
                <div className={styles.userCell}>
                    <div className={styles.avatar} style={{ borderRadius: 8, fontSize: 13 }}>
                        {val?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className={styles.userName}>{val}</div>
                        <div className={styles.userEmail}>{row.subheadline}</div>
                    </div>
                </div>
            ),
        },
        {
            header: "Team",
            accessor: "team",
            sortable: false,
            render: (val) => (
                <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                    👥 {val?.length || 0} members
                </span>
            ),
        },
        {
            header: "Skills",
            accessor: "skills",
            sortable: false,
            render: (val) => (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {(val || []).slice(0, 3).map(s => (
                        <span key={s} className={`${styles.badge} ${styles.badgeAdmin}`} style={{ fontSize: 11 }}>
                            {s}
                        </span>
                    ))}
                    {(val || []).length > 3 && (
                        <span className={styles.badge} style={{ fontSize: 11 }}>
                            +{val.length - 3}
                        </span>
                    )}
                </div>
            ),
        },
        {
            header: "Status",
            accessor: "isActive",
            render: (val, row) => (
                <span
                    className={`${styles.badge} ${val ? styles.badgeAdmin : styles.badgeUser}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleToggleActive(row)}
                    title="Click to toggle"
                >
                    {val ? "✅ Active" : "🔴 Inactive"}
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

                {/* ── Page Header ── */}
                <div className={styles.pageHeader}>
                    <div>
                        <h1 className={styles.pageTitle}>About Us</h1>
                        <p className={styles.pageDesc}>Manage the About Us page — headline, team, stats, values &amp; skills</p>
                    </div>
                    <Button onClick={openAdd}>+ New Record</Button>
                </div>

                {/* ── Table ── */}
                <div className={styles.tableCard}>
                    <DataTable columns={columns} data={items} loading={loading} pageSize={8} />
                </div>

                {/* ── Create / Edit Modal ── */}
                <Modal isOpen={modal} onClose={closeModal} title={editItem ? "Edit About Us" : "New About Us Record"}>
                    <form onSubmit={handleSave} className={styles.modalForm}>

                        <Input id="au-headline" label="Headline *" placeholder="Building Digital Experiences"
                            value={form.headline} onChange={e => setForm({ ...form, headline: e.target.value })} error={errors.headline} />

                        <Input id="au-sub" label="Subheadline" placeholder="We craft modern, scalable web solutions..."
                            value={form.subheadline} onChange={e => setForm({ ...form, subheadline: e.target.value })} />

                        <div className={styles.roleSelect}>
                            <label className={styles.roleLabel}>Description *</label>
                            <textarea className={styles.select} rows={4}
                                placeholder="Full description of the company..."
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                style={{ resize: "vertical", fontFamily: "inherit" }}
                            />
                            {errors.description && <span style={{ color: "var(--danger)", fontSize: 12 }}>{errors.description}</span>}
                        </div>

                        <div className={styles.roleSelect}>
                            <label className={styles.roleLabel}>Mission</label>
                            <textarea className={styles.select} rows={2}
                                placeholder="Our mission statement..."
                                value={form.mission}
                                onChange={e => setForm({ ...form, mission: e.target.value })}
                                style={{ resize: "vertical", fontFamily: "inherit" }}
                            />
                        </div>

                        <div className={styles.roleSelect}>
                            <label className={styles.roleLabel}>Vision</label>
                            <textarea className={styles.select} rows={2}
                                placeholder="Our vision statement..."
                                value={form.vision}
                                onChange={e => setForm({ ...form, vision: e.target.value })}
                                style={{ resize: "vertical", fontFamily: "inherit" }}
                            />
                        </div>

                        <Input id="au-values" label="Core Values (comma separated)"
                            placeholder="Quality First, Innovation, Transparency"
                            value={form.values} onChange={e => setForm({ ...form, values: e.target.value })} />

                        <Input id="au-skills" label="Skills / Tech Stack (comma separated)"
                            placeholder="React, Node.js, MongoDB, Docker"
                            value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} />

                        <div className={styles.roleSelect}>
                            <label className={styles.roleLabel}>Stats (JSON array)</label>
                            <textarea className={styles.select} rows={5}
                                placeholder={`[\n  { "label": "Projects", "value": "50+" },\n  { "label": "Clients", "value": "30+" }\n]`}
                                value={form.stats}
                                onChange={e => setForm({ ...form, stats: e.target.value })}
                                style={{ resize: "vertical", fontFamily: "monospace", fontSize: 12 }}
                            />
                            {errors.stats && <span style={{ color: "var(--danger)", fontSize: 12 }}>{errors.stats}</span>}
                        </div>

                        <div className={styles.roleSelect}>
                            <label className={styles.roleLabel}>Team (JSON array)</label>
                            <textarea className={styles.select} rows={8}
                                placeholder={`[\n  {\n    "name": "Jay Kachhadiya",\n    "role": "Founder & Full-Stack Developer",\n    "bio": "Passionate about building scalable web apps.",\n    "avatar": "https://example.com/jay.jpg",\n    "linkedin": "https://linkedin.com/in/jay",\n    "github": "https://github.com/jay"\n  }\n]`}
                                value={form.team}
                                onChange={e => setForm({ ...form, team: e.target.value })}
                                style={{ resize: "vertical", fontFamily: "monospace", fontSize: 12 }}
                            />
                            {errors.team && <span style={{ color: "var(--danger)", fontSize: 12 }}>{errors.team}</span>}
                        </div>

                        <div className={styles.roleSelect}>
                            <label className={styles.roleLabel}>Status</label>
                            <select className={styles.select} value={form.isActive}
                                onChange={e => setForm({ ...form, isActive: e.target.value === "true" })}>
                                <option value="true">✅ Active (visible on website)</option>
                                <option value="false">🔴 Inactive (hidden)</option>
                            </select>
                        </div>

                        <div className={styles.modalActions}>
                            <Button variant="outline" type="button" onClick={closeModal}>Cancel</Button>
                            <Button type="submit" loading={saving}>{editItem ? "Save Changes" : "Create Record"}</Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </PageWrapper>
    );
};

export default AboutUsPage;
