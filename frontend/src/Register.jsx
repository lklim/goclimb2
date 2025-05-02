import { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "./supabaseClient";
import "./Login.css"; // Reusing Login styles
import logo from "./assets/goclimblogo_woBG.png";

function Register() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);

        // Register user with Supabase Auth
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (signUpError) {
            setMessage(signUpError.message);
            setLoading(false);
            return;
        }

        // If user is created
        if (signUpData?.user) {
            // Insert into profiles table
            const { error: profileError } = await supabase.from("profiles").insert([
                {
                    id: signUpData.user.id,
                    username: username,
                    email: email,
                    profile_picture: "https://mtkfbnzhyfyomshvzpeb.supabase.co/storage/v1/object/public/profile-pictures//default.jpg",
                },
            ]);

            if (profileError) {
                console.error("Error inserting profile:", profileError.message);
                setMessage("Registration succeeded, but failed to create profile.");
            } else {
                setShowPopup(true);
            }
        }

        setLoading(false);
    };

    return (
        <div className="login-container">
            {/* Branding section (left side) */}
            <img src={logo} alt="GoClimb Logo" className="logo-top-left" />
            <div className="branding">
                <h1>GoClimb</h1>
                <p>Find the best crags, climb higher, and experience adventure.</p>
            </div>

            {/* Registration form */}
            <div className="login-box">
                <h2>Register</h2>
                <form onSubmit={handleRegister}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? "Signing Up..." : "Sign Up"}
                    </button>
                </form>
                {message && <p className="error">{message}</p>}
                <p>
                    Already have an account?{" "}
                    <button onClick={() => navigate("/")} className="register-link">
                        Login Here
                    </button>
                </p>
            </div>

            {/* Popup after signup */}
            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup-box">
                        <h3>Check Your Email!</h3>
                        <p>Please verify your account via the confirmation email.</p>
                        <button onClick={() => navigate("/")}>Back to Login</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Register;
