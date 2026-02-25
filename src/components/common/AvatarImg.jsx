import { useState } from "react";
import styles from "./AvatarImg.module.css";

const SERVER_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

/**
 * AvatarImg — shows photo from /api/users/:id/avatar when userId is given.
 * Falls back to a gradient letter circle if image 404s or userId is missing.
 *
 * Props:
 *   userId   — MongoDB _id string (used to build image URL)
 *   name     — display name (used for initial fallback)
 *   size     — px number (default 36)
 *   className— extra CSS class (optional)
 *
 * Note: hasAvatar prop is no longer required. AvatarImg always tries loading
 * the real photo; if the server returns 404 the fallback shows automatically.
 */
const AvatarImg = ({ userId, name, size = 36, className = "" }) => {
    const [imgError, setImgError] = useState(false);
    const initial = name?.charAt(0)?.toUpperCase() || "?";

    const commonStyle = {
        width: size,
        height: size,
        fontSize: Math.round(size * 0.38),
        flexShrink: 0,
        borderRadius: "50%",
    };

    if (userId && !imgError) {
        return (
            <img
                src={`${SERVER_URL}/api/users/${userId}/avatar`}
                alt={name || "User"}
                className={`${styles.avatarImg} ${className}`}
                style={commonStyle}
                onError={() => setImgError(true)}
            />
        );
    }

    return (
        <div
            className={`${styles.avatarFallback} ${className}`}
            style={commonStyle}
            title={name}
        >
            {initial}
        </div>
    );
};

export default AvatarImg;
