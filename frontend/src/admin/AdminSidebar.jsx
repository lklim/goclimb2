import React from "react";
import { Link } from "react-router-dom";
import "./AdminSidebar.css";

function AdminSidebar() {
    return (
        <div className="admin-sidebar">
            <ul>
                <li><Link to="/admin">Analytics</Link></li>
                <li><Link to="/admin/users">Manage User</Link></li>
                <li><Link to="/admin/marketing">Manage Marketing Page</Link></li>
                <li><Link to="/admin/posts">Manage Post</Link></li>
                <li><Link to="/admin/crags">Manage Crags</Link></li>
                <li><Link to="/admin/workout">Manage Workout</Link></li>
                <li><Link to="/admin/activities">Manage Activities</Link></li>
                <li><Link to="/admin/achievements">Manage Achievement</Link></li> 
                <li><Link to="/admin/feedback">View Feedback</Link></li>
                <li><Link to="/admin/shop">Manage Point Shop</Link></li>
            </ul>
        </div>
    );
}

export default AdminSidebar;