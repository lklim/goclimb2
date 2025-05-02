import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import supabase from "../supabaseClient";
import Navbar from "../components/Navbar";
import AdminSidebar from "./AdminSidebar";
import "./AdminHome.css"; // We'll create this too

function AdminHome() {
    const [userCounts, setUserCounts] = useState({ User: 0, Premium: 0, Admin: 0 });
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const { data, error } = await supabase.from("profiles").select("*");
            if (!error) {
                setUsers(data);

                const counts = { User: 0, Premium: 0, Admin: 0 };

                data.forEach(user => {
                    if (user.account_type === 0) counts.User++;
                    else if (user.account_type === 1) counts.Premium++;
                    else if (user.account_type === 2) counts.Admin++;
                });

                setUserCounts(counts);
            }
        };

        fetchUsers();
    }, []);

    const pieData = [
        { name: "User", value: userCounts.User },
        { name: "Premium User", value: userCounts.Premium },
        { name: "Admin", value: userCounts.Admin },
    ];

    const COLORS = ["#0088FE", "#00C49F", "#FF8042"];

    return (
        <div className="admin-wrapper">
            <Navbar />
            <div className="admin-layout">
                <AdminSidebar />
                <div className="admin-content">
                    <h1>Admin Home Dashboard</h1>

                    <div className="dashboard-grid">
                        {/* Pie Chart Box */}
                        <div className="dashboard-box">
                            <h3>User Role Distribution</h3>
                            <PieChart width={300} height={300}>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </div>

                        {/* Another Empty Box for Future Stats */}
                        <div className="dashboard-box">
                            <h3>Placeholder for Other Analytics</h3>
                            <p>e.g., Number of Crags, Activities, etc.</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default AdminHome;
