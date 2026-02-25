import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import usePageTracking from "../hooks/usePageTracking";
import MainLayout from "../layout/MainLayout";
import AdminLayout from "../layout/AdminLayout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/admin/Dashboard";
import UsersPage from "../pages/admin/UsersPage";
import RolesPage from "../pages/admin/RolesPage";
import TestimonialsPage from "../pages/admin/TestimonialsPage";
import PortfolioPage from "../pages/admin/PortfolioPage";
import ContactsPage from "../pages/admin/ContactsPage";
import Testimonials from "../pages/Testimonials";
import Portfolio from "../pages/Portfolio";
import Contact from "../pages/Contact";
import Blogs from "../pages/Blogs";
import BlogDetail from "../pages/BlogDetail";
import BlogsPage from "../pages/admin/BlogsPage";
import Chat from "../pages/Chat";
import AboutUs from "../pages/AboutUs";
import AboutUsPage from "../pages/admin/AboutUsPage";
import Reels from "../pages/Reels";
import ReelsPage from "../pages/admin/ReelsPage";

// Guard: must be logged in
const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" replace />;
};

// Guard: must be admin
const AdminRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== "admin") return <Navigate to="/" replace />;
    return children;
};

// Inner component so hooks can access router context
const TrackedRoutes = () => {
    usePageTracking();
    return (
        <Routes>
            {/* Public routes */}
            <Route element={<MainLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/testimonials" element={<Testimonials />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/blogs" element={<Blogs />} />
                <Route path="/blogs/:id" element={<BlogDetail />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/reels" element={<Reels />} />
                <Route path="/" element={
                    <ProtectedRoute><Home /></ProtectedRoute>
                } />
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={
                <AdminRoute><AdminLayout /></AdminRoute>
            }>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="roles" element={<RolesPage />} />
                <Route path="testimonials" element={<TestimonialsPage />} />
                <Route path="portfolio" element={<PortfolioPage />} />
                <Route path="contacts" element={<ContactsPage />} />
                <Route path="blogs" element={<BlogsPage />} />
                <Route path="about" element={<AboutUsPage />} />
                <Route path="reels" element={<ReelsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

const AppRoutes = () => (
    <BrowserRouter>
        <TrackedRoutes />
    </BrowserRouter>
);

export default AppRoutes;
