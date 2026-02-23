import { useState, useEffect, useCallback } from "react";
import PageWrapper from "../../components/common/PageWrapper";
import DataTable from "../../components/common/DataTable";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import api from "../../api/axios";
import styles from "./RolesPage.module.css";

const EMPTY_FORM = { name: "", label: "", description: "" };

const RolesPage = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState(false);
    const [editRole, setEditRole] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchRoles = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/roles");
            setRoles(data.roles);
        } catch {
            showToast("Failed to load roles", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchRoles(); }, [fetchRoles]);

    const openAdd = () => { setEditRole(null); setForm(EMPTY_FORM); setErrors({}); setModal(true); };
    const openEdit = (role) => { setEditRole(role); setForm({ name: role.name, label: role.label, description: role.description }); setErrors({}); setModal(true); };
    const closeModal = () => setModal(false);

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = "Name (slug) is required";
        if (!form.label.trim()) e.label = "Label is required";
        if (!/^[a-z0-9_-]+$/.test(form.name.trim())) e.name = "Only lowercase letters, numbers, _ and -";
        return e;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const e2 = validate();
        if (Object.keys(e2).length) { setErrors(e2); return; }
        setSaving(true);
        try {
            if (editRole) {
                await api.put(`/roles/${editRole._id}`, form);
                showToast("Role updated successfully");
            } else {
                await api.post("/roles", form);
                showToast("Role created successfully");
            }
            closeModal();
            fetchRoles();
        } catch (err) {
            showToast(err.response?.data?.message || "Operation failed", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (role) => {
        if (!window.confirm(`Delete role "${role.label}"?`)) return;
        try {
            await api.delete(`/roles/${role._id}`);
            showToast("Role deleted");
            fetchRoles();
        } catch {
            showToast("Delete failed", "error");
        }
    };

    const columns = [
        {
            header: "Name (slug)",
            accessor: "name",
            render: (val) => <code className={styles.slug}>{val}</code>,
        },
        {
            header: "Label",
            accessor: "label",
            render: (val) => <span className={styles.label}>{val}</span>,
        },
        {
            header: "Description",
            accessor: "description",
            render: (val) => <span className={styles.desc}>{val || "—"}</span>,
        },
        {
            header: "Created",
            accessor: "createdAt",
            render: (val) =>
                new Date(val).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
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
                {/* Toast */}
                {toast && (
                    <div className={`${styles.toast} ${styles[toast.type]}`}>{toast.msg}</div>
                )}

                {/* Header */}
                <div className={styles.pageHeader}>
                    <div>
                        <h1 className={styles.pageTitle}>Roles</h1>
                        <p className={styles.pageDesc}>Manage dynamic roles assigned to users</p>
                    </div>
                    <Button onClick={openAdd}>+ Add Role</Button>
                </div>

                {/* Table */}
                <div className={styles.tableCard}>
                    <DataTable columns={columns} data={roles} loading={loading} pageSize={8} />
                </div>

                {/* Modal */}
                <Modal isOpen={modal} onClose={closeModal} title={editRole ? "Edit Role" : "Add Role"}>
                    <form onSubmit={handleSave} className={styles.modalForm}>
                        <Input
                            id="role-name"
                            label="Name (slug)"
                            type="text"
                            placeholder="e.g. manager"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                            error={errors.name}
                        />
                        <Input
                            id="role-label"
                            label="Label (display name)"
                            type="text"
                            placeholder="e.g. Manager"
                            value={form.label}
                            onChange={(e) => setForm({ ...form, label: e.target.value })}
                            error={errors.label}
                        />
                        <Input
                            id="role-description"
                            label="Description (optional)"
                            type="text"
                            placeholder="e.g. Can manage team members"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            error={errors.description}
                        />
                        <div className={styles.modalActions}>
                            <Button variant="outline" type="button" onClick={closeModal}>Cancel</Button>
                            <Button type="submit" loading={saving}>
                                {editRole ? "Save Changes" : "Create Role"}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </PageWrapper>
    );
};

export default RolesPage;
