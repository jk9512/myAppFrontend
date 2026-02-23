import { useState, useEffect, useCallback } from "react";
import PageWrapper from "../../components/common/PageWrapper";
import DataTable from "../../components/common/DataTable";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import api from "../../api/axios";
import styles from "./UsersPage.module.css";

const EMPTY_FORM = { name: "", email: "", password: "", role: "user", roleId: "" };

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/users?limit=100");
            setUsers(data.users);
        } catch (err) {
            showToast("Failed to load users", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRoles = useCallback(async () => {
        try {
            const { data } = await api.get("/roles");
            setRoles(data.roles);
        } catch { }
    }, []);

    useEffect(() => { fetchUsers(); fetchRoles(); }, [fetchUsers, fetchRoles]);

    const openAdd = () => { setEditUser(null); setForm(EMPTY_FORM); setErrors({}); setModal(true); };
    const openEdit = (user) => {
        setEditUser(user);
        setForm({
            name: user.name,
            email: user.email,
            role: user.role,
            roleId: user.roleId?._id || user.roleId || "",
        });
        setErrors({});
        setModal(true);
    };
    const closeModal = () => setModal(false);

    const validate = () => {
        const e = {};
        if (!form.name) e.name = "Name is required";
        if (!form.email) e.email = "Email is required";
        if (!editUser && !form.password) e.password = "Password is required";
        if (!editUser && form.password && form.password.length < 6)
            e.password = "Password must be at least 6 characters";
        return e;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const e2 = validate();
        if (Object.keys(e2).length) { setErrors(e2); return; }
        setSaving(true);
        try {
            if (editUser) {
                await api.put(`/users/${editUser._id}`, {
                    name: form.name,
                    email: form.email,
                    role: form.role,
                    roleId: form.roleId || null,
                });
                showToast("User updated successfully");
            } else {
                await api.post("/users", {
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    role: form.role,
                    roleId: form.roleId || null,
                });
                showToast("User created successfully");
            }
            closeModal();
            fetchUsers();
        } catch (err) {
            showToast(err.response?.data?.message || "Operation failed", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (user) => {
        if (!window.confirm(`Delete "${user.name}"?`)) return;
        try {
            await api.delete(`/users/${user._id}`);
            showToast("User deleted");
            fetchUsers();
        } catch (err) {
            showToast("Delete failed", "error");
        }
    };

    const columns = [
        {
            header: "User",
            accessor: "name",
            render: (val, row) => (
                <div className={styles.userCell}>
                    <div className={styles.avatar}>{val?.charAt(0)?.toUpperCase()}</div>
                    <div>
                        <div className={styles.userName}>{val}</div>
                        <div className={styles.userEmail}>{row.email}</div>
                    </div>
                </div>
            ),
        },
        {
            header: "Role",
            accessor: "roleId",
            render: (roleId, row) => {
                const label = roleId?.label || row.role;
                const isAdmin = (roleId?.name || row.role) === "admin";
                return (
                    <span className={`${styles.badge} ${isAdmin ? styles.badgeAdmin : styles.badgeUser}`}>
                        {isAdmin ? "👑" : "🔑"} {label}
                    </span>
                );
            },
        },
        {
            header: "Joined",
            accessor: "createdAt",
            render: (val) => new Date(val).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
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
                        <h1 className={styles.pageTitle}>Users</h1>
                        <p className={styles.pageDesc}>Manage all registered users</p>
                    </div>
                    <Button onClick={openAdd}>+ Add User</Button>
                </div>

                {/* DataTable */}
                <div className={styles.tableCard}>
                    <DataTable columns={columns} data={users} loading={loading} pageSize={8} />
                </div>

                {/* Modal */}
                <Modal isOpen={modal} onClose={closeModal} title={editUser ? "Edit User" : "Add User"}>
                    <form onSubmit={handleSave} className={styles.modalForm}>
                        <Input
                            id="modal-name"
                            label="Full Name"
                            type="text"
                            placeholder="John Doe"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            error={errors.name}
                        />
                        <Input
                            id="modal-email"
                            label="Email"
                            type="email"
                            placeholder="john@example.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            error={errors.email}
                        />
                        {/* Password — only shown when ADDING a new user */}
                        {!editUser && (
                            <Input
                                id="modal-password"
                                label="Password"
                                type="password"
                                placeholder="Min 6 characters"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                error={errors.password}
                            />
                        )}
                        {/* Role dropdown — dynamic from API */}
                        <div className={styles.roleSelect}>
                            <label className={styles.roleLabel}>Role (Dynamic)</label>
                            <select
                                className={styles.select}
                                value={form.roleId}
                                onChange={(e) => {
                                    const selectedRole = roles.find((r) => r._id === e.target.value);
                                    setForm({
                                        ...form,
                                        roleId: e.target.value,
                                        role: selectedRole?.name === "admin" ? "admin" : "user",
                                    });
                                }}
                            >
                                <option value="">— Select a role —</option>
                                {roles.map((r) => (
                                    <option key={r._id} value={r._id}>{r.label} ({r.name})</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.modalActions}>
                            <Button variant="outline" type="button" onClick={closeModal}>Cancel</Button>
                            <Button type="submit" loading={saving}>
                                {editUser ? "Save Changes" : "Create"}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </PageWrapper>
    );
};

export default UsersPage;
