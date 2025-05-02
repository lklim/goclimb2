import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from "./supabaseClient";
import Login from "./Login";
import Register from "./Register";
import Home from "./Home";
import Map from "./Map";
import Search from "./Search";
import Profile from "./Profile";
import EditProfile from "./editProfile";
import Achievement from "./Achievement";
import Activities from "./Activities";
import Feedback from "./Feedback";
import Marketing from "./Marketing";
import Marketing_Contact from "./Marketing_Contact";
import Marketing_Features from "./Marketing_Features";
import Marketing_Support from "./Marketing_Support";
import ProtectedAdminRoute from "./admin/ProtectedAdminRoute";
import AdminHome from "./admin/AdminHome";
import AdminManageUser from "./admin/AdminManageUsers";
import AdminManagePosts from "./admin/AdminManagePosts";
import AdminManageCrags from "./admin/AdminManageCrags";
import AdminFeedback from "./admin/AdminFeedback";
import AdminManageMarketing from "./admin/AdminManageMarketing";
import AdminManageAchievement from "./admin/AdminManageAchievement";
import AdminManageActivities from "./admin/AdminManageActivities";
import SOS from "./SOS";
import PointShop from "./PointShop";
import AdminPointShop from "./admin/AdminPointShop";

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };

        fetchUser();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user || null);
        });

        return () => authListener.subscription.unsubscribe();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Marketing />} />
                <Route path="/marketing_contact" element={<Marketing_Contact />} />
                <Route path="/marketing_features" element={<Marketing_Features />} />
                <Route path="/marketing_support" element={<Marketing_Support />} />
                <Route path="/login" element={user ? <Navigate to="/home" replace /> : <Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/home" element={user ? <Home /> : <Navigate to="/" replace />} />
                <Route path="/map" element={user ? <Map /> : <Navigate to="/" replace />} />
                <Route path="/map/:cragId" element={user ? <Map /> : <Navigate to="/" replace />} />
                <Route path="/search" element={user ? <Search /> : <Navigate to="/" replace />} />
                <Route path="/profile/:userId" element={user ? <Profile /> : <Navigate to="/" replace />} />
                <Route path="/editprofile" element={user ? <EditProfile /> : <Navigate to="/" replace />} />
                <Route path="/achievement" element={user ? <Achievement /> : <Navigate to="/" replace />} />
                <Route path="/activities" element={user ? <Activities /> : <Navigate to="/" replace />} />
                <Route path="/feedback" element={user ? <Feedback /> : <Navigate to="/" replace />} />
                <Route path="/sos" element={user ? <SOS /> : <Navigate to="/" replace />} />
                <Route path="/point-shop" element={user ? <PointShop /> : <Navigate to="/" replace />} />

                {/* Admin Routes */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedAdminRoute>
                            <AdminHome />
                        </ProtectedAdminRoute>
                    }
                />
                <Route
                    path="/admin/users"
                    element={
                        <ProtectedAdminRoute>
                            <AdminManageUser />
                        </ProtectedAdminRoute>
                    }
                />
                <Route
                    path="/admin/posts"
                    element={
                        <ProtectedAdminRoute>
                            <AdminManagePosts />
                        </ProtectedAdminRoute>
                    }
                />
                <Route
                    path="/admin/crags"
                    element={
                        <ProtectedAdminRoute>
                            <AdminManageCrags />
                        </ProtectedAdminRoute>
                    }
                />
                <Route
                    path="/admin/feedback"
                    element={
                        <ProtectedAdminRoute>
                            <AdminFeedback />
                        </ProtectedAdminRoute>
                    }
                />
                <Route
                    path="/admin/marketing"
                    element={
                        <ProtectedAdminRoute>
                            <AdminManageMarketing />
                        </ProtectedAdminRoute>
                    }
                />
                <Route
                    path="/admin/achievements"
                    element={
                        <ProtectedAdminRoute>
                            <AdminManageAchievement />
                        </ProtectedAdminRoute>
                    }
                />
                <Route
                    path="/admin/activities"
                    element={
                        <ProtectedAdminRoute>
                            <AdminManageActivities />
                        </ProtectedAdminRoute>
                    }
                />
                <Route
                    path="/admin/shop"
                    element={
                        <ProtectedAdminRoute>
                        <AdminPointShop />
                        </ProtectedAdminRoute>
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;