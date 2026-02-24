import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/axios";

/**
 * usePageTracking
 * Call this once at the top-level router component.
 * Sends a page view ping to POST /api/analytics/track on every route change.
 * Skips /admin/* routes to avoid inflating counts with admin activity.
 */
const usePageTracking = () => {
    const location = useLocation();
    const lastTracked = useRef(null);

    useEffect(() => {
        const page = location.pathname;

        // Don't track admin pages or duplicate calls
        if (page.startsWith("/admin") || page === lastTracked.current) return;
        lastTracked.current = page;

        // Fire & forget — don't block UI
        api.post("/analytics/track", { page }).catch(() => {
            // Silently ignore tracking errors — never break UX
        });
    }, [location.pathname]);
};

export default usePageTracking;
