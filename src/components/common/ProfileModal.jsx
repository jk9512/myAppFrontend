import { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import Modal from "./Modal";
import Button from "./Button";
import Input from "./Input";
import AvatarImg from "./AvatarImg";
import styles from "./ProfileModal.module.css";

const SERVER_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const getExpiryDate = (plan, planStartDate) => {
    if (!planStartDate) return null;
    const start = new Date(planStartDate);
    let days = 14;
    if (plan === "premium" || plan === "pro") days = 90;
    return new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
};

const ProfileModal = ({ isOpen, onClose }) => {
    const { user, updateLocalUser } = useAuth();
    const [name, setName] = useState(user?.name || "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [preview, setPreview] = useState(null);
    const [file, setFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [toast, setToast] = useState(null);
    const fileRef = useRef(null);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleFileChange = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        if (f.size > 2 * 1024 * 1024) { showToast("Image must be under 2 MB", "error"); return; }
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // 1. Upload avatar if a new file was selected
            if (file) {
                setUploadingAvatar(true);
                const fd = new FormData();
                fd.append("avatar", file);
                await api.post("/users/avatar/me", fd, { headers: { "Content-Type": "multipart/form-data" } });
                updateLocalUser({ hasAvatar: true });
                setUploadingAvatar(false);
            }

            // 2. Update name if changed
            if (name.trim() && name.trim() !== user.name) {
                // Using auth/me update if it exists, otherwise skip
                // For now store locally
                updateLocalUser({ name: name.trim() });
            }

            // 3. Change password if provided
            if (currentPassword && newPassword) {
                await api.put("/auth/password", { currentPassword, newPassword });
                setCurrentPassword("");
                setNewPassword("");
            }

            setFile(null);
            setPreview(null);
            showToast("Profile updated successfully!");
        } catch (err) {
            showToast(err.response?.data?.message || "Update failed", "error");
        } finally {
            setSaving(false);
            setUploadingAvatar(false);
        }
    };

    const avatarSrc = preview || (user?.hasAvatar ? `${SERVER_URL}/api/users/${user._id}/avatar` : null);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="My Profile">
            {toast && (
                <div className={`${styles.toast} ${styles[toast.type]}`}>{toast.msg}</div>
            )}
            <form onSubmit={handleSaveProfile} className={styles.form}>

                {/* ── Avatar picker ── */}
                <div className={styles.avatarRow}>
                    <div className={styles.avatarWrap} onClick={() => fileRef.current?.click()}>
                        {avatarSrc ? (
                            <img src={avatarSrc} alt="avatar" className={styles.previewImg} />
                        ) : (
                            <AvatarImg userId={user?._id} name={user?.name} hasAvatar={user?.hasAvatar} size={84} />
                        )}
                        <div className={styles.avatarOverlay}>
                            <span>📷</span>
                        </div>
                    </div>
                    <div className={styles.avatarInfo}>
                        <p className={styles.avatarHint}>Click the photo to change</p>
                        <p className={styles.avatarSub}>JPEG, PNG, WebP — max 2 MB</p>
                        <button type="button" className={styles.uploadBtn} onClick={() => fileRef.current?.click()}>
                            {uploadingAvatar ? "Uploading…" : "Choose Photo"}
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
                    </div>
                </div>

                {/* ── Fields ── */}
                <Input
                    id="profile-name"
                    label="Display Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />

                <Input
                    id="profile-email"
                    label="Email"
                    value={user?.email || ""}
                    disabled
                />

                <div className={styles.divider}>
                    <span>Subscription Details</span>
                </div>

                <Input
                    id="profile-plan"
                    label="Current Plan"
                    value={user?.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : "Free"}
                    disabled
                />

                <Input
                    id="profile-expiry"
                    label="Plan Expiry Date"
                    value={user?.planStartDate ? getExpiryDate(user.plan, user.planStartDate).toLocaleDateString() : ""}
                    disabled
                />

                <div className={styles.divider}>
                    <span>Change Password (optional)</span>
                </div>

                <Input
                    id="profile-cur-pw"
                    label="Current Password"
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                />

                <Input
                    id="profile-new-pw"
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                />

                <div className={styles.actions}>
                    <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
                    <Button type="submit" loading={saving}>Save Changes</Button>
                </div>
            </form>
        </Modal>
    );
};

export default ProfileModal;
