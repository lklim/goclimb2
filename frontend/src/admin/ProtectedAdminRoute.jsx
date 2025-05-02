import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import supabase from "../supabaseClient";

function ProtectedAdminRoute({ children }) {
    const [isAdmin, setIsAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setIsAdmin(false);
                setLoading(false);
                return;
            }

            const { data: profile, error } = await supabase
                .from("profiles")
                .select("account_type")
                .eq("id", user.id)
                .single();

            if (error || !profile || profile.account_type !== 2) {
                setIsAdmin(false);
            } else {
                setIsAdmin(true);
            }

            setLoading(false);
        };

        checkAdmin();
    }, []);

    if (loading) return <div>Loading...</div>;

    return isAdmin ? children : <Navigate to="/" replace />;
}

export default ProtectedAdminRoute;
