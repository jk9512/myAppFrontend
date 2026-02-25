import { createContext, useContext, useState, useCallback } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem("user");
            if (!stored || stored === "undefined" || stored === "null") return null;
            return JSON.parse(stored);
        } catch {
            localStorage.removeItem("user");
            return null;
        }
    });
    const [token, setToken] = useState(() => localStorage.getItem("token") || null);

    const login = useCallback(async (email, password) => {
        const { data } = await api.post("/auth/login", { email, password });
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return data.user;
    }, []);

    const register = useCallback(async (name, email, password) => {
        const { data } = await api.post("/auth/register", { name, email, password });
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return data.user;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
    }, []);

    /** Call after avatar upload to refresh hasAvatar flag */
    const refreshUser = useCallback(async () => {
        try {
            const { data } = await api.get("/auth/me");
            const fresh = { ...data.user };
            // hasAvatar comes from a separate endpoint check since /me doesn't return it
            try {
                await api.get(`/users/${fresh._id}/avatar`);
                fresh.hasAvatar = true;
            } catch {
                fresh.hasAvatar = false;
            }
            localStorage.setItem("user", JSON.stringify(fresh));
            setUser(fresh);
        } catch { /* ignore */ }
    }, []);

    /** Update local user state (name, hasAvatar, etc.) without server call */
    const updateLocalUser = useCallback((patch) => {
        setUser(prev => {
            const updated = { ...prev, ...patch };
            localStorage.setItem("user", JSON.stringify(updated));
            return updated;
        });
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, refreshUser, updateLocalUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
};
