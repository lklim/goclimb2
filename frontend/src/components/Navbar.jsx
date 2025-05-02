import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import "./Navbar.css";
import logo from "../assets/goclimblogo_woBG.png";

const Navbar = () => {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("account_type, profile_picture")
          .eq("id", user.id)
          .single();

        if (!error && profile) {
          setAccountType(profile.account_type);
          setProfilePic(profile.profile_picture || "https://mtkfbnzhyfyomshvzpeb.supabase.co/storage/v1/object/public/profile-pictures//default.jpg");
        }
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout failed:", error.message);
      return;
    }
    navigate("/", { replace: true });
    window.location.reload();
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  return (
    <nav className="navbar">
      <div className="navbar-left" onClick={() => navigate("/home")} style={{ cursor: "pointer" }}>
        <img src={logo} alt="GoClimb Logo" className="navbar-logo" />
        <h1>GoClimb</h1>
      </div>

      <div className="navbar-right">
        <a href="/home">Home</a>
        <a href="/map">Map</a>
        <a href="/search">Search</a>
        <a href="/activities">Activities</a>
        {accountType === 2 && <a href="/admin">Admin</a>}

        <div className="profile-dropdown">
          <img
            src={profilePic || "https://mtkfbnzhyfyomshvzpeb.supabase.co/storage/v1/object/public/profile-pictures//default.jpg"}
            alt="Profile"
            className="profile-pic-icon"
            onClick={toggleDropdown}
          />
          {dropdownOpen && (
            <div className="dropdown-menu left-align">
              <a onClick={() => navigate(`/profile/${userId}`)}>Profile</a>
              <a href="/achievement">Achievement</a>
              <a href="/point-shop">Point Shop</a>
              <a href="/workout">Workout</a>
              <a href="/sos">SOS</a>
              <a href="/feedback">Feedback</a>
              <button className="logout-button" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;