import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "./supabaseClient";
import "./Login.css"; // Import styles
import logo from "./assets/goclimblogo_woBG.png"; // Import the logo

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Listen for authentication state changes
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                navigate("/home", { replace: true }); // Redirect immediately on login
            }
        });

        return () => authListener.subscription.unsubscribe(); // Cleanup listener
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        }
    };

    return (
        <div className="login-container">
            {/* Logo in the Top Left */}
            <img src={logo} alt="GoClimb Logo" className="logo-top-left" />

            {/* Branding Section (Left Side) */}
            <div className="branding">
            <h1 data-testid="test002">GoClimb</h1>
                <p>Find the best crags, climb higher, and experience adventure.</p>
            </div>

            {/* Login Box (Right Side) */}
            <div className="login-box">
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Login</button>
                </form>
                {error && <p className="error">{error}</p>}
                <p>
                    Don't have an account?{" "}
                    <button onClick={() => navigate("/register")} className="register-link">
                        Sign Up Here
                    </button>
                </p>
            </div>
        </div>
    );
}

export default Login;
