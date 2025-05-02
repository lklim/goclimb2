import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Marketing_Nav.css"; 
import logo from "../assets/goclimblogo_woBG.png";

const Navbar = () => {
    const navigate = useNavigate();

    return (
        <nav className="navbar">
            <div
                className="navbar-left"
                onClick={() => navigate("/")}
                style={{ cursor: "pointer" }}
            >
                <img src={logo} alt="GoClimb Logo" className="navbar-logo" />
                <h1>GoClimb</h1>
            </div>

            <div className="navbar-right">
                <Link to="/">Home</Link>
                <Link to="/marketing_features">Our Features</Link>
                <Link to="/marketing_contact">Contact us</Link>
                <Link to="/marketing_support">Our Team</Link>
                <Link to="/marketing_map">Try it now</Link> {/* Now fully React Router */}
            </div>
        </nav>
    );
};

export default Navbar;
