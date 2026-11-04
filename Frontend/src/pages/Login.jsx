import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { loginUser, googleLoginUser } from "../services/authService";
import { toast } from "react-toastify";
import "../styles/Login.css";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase/firebase";
function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const [errors, setErrors] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        let newErrors = { ...errors };

        if (name === "email") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (value.trim() === "") {
                newErrors.email = "Email is required.";
            } else if (!emailRegex.test(value)) {
                newErrors.email = "Please enter a valid email.";
            } else {
                newErrors.email = "";
            }
        }

        if (name === "password") {
            if (value.length < 8) {
                newErrors.password = "Password must be at least 8 characters.";
            } else {
                newErrors.password = "";
            }
        }

        setErrors(newErrors);

        setFormData({
            ...formData,
            [name]: value,
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await loginUser({
                email: formData.email,
                password: formData.password
            });

            toast.success("🎉 Login Successful! Welcome back.");

            // Save JWT Token
            localStorage.setItem("token", response.data.token);

            // Save user details with normalized name
            const userData = {
                ...response.data.user,
                name: response.data.user?.full_name || response.data.user?.name || ""
            };
            localStorage.setItem("user", JSON.stringify(userData));

            // Notify Navbar and other listeners
            window.dispatchEvent(new Event("auth-change"));

            setTimeout(() => {
                navigate("/");
            }, 1000);

        } catch (error) {
            toast.error(
                error.response?.data?.message || "❌ Login Failed!"
            );
        }
        finally {
            setLoading(false);
        }
    };
    const handleGoogleLogin = async () => {
        if (googleLoading || loading) return;
        setGoogleLoading(true);

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const response = await googleLoginUser({
                full_name: user.displayName || user.email.split("@")[0],
                email: user.email,
                phone: user.phoneNumber || null,
                password: null,
                google_id: user.uid
            });

            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
            }

            const userData = {
                ...response.data.user,
                photoURL: user.photoURL || null,
                name: response.data.user?.full_name || user.displayName || user.email.split("@")[0]
            };

            localStorage.setItem(
                "user",
                JSON.stringify(userData)
            );

            // Notify Navbar and other listeners
            window.dispatchEvent(new Event("auth-change"));

            toast.success(`🎉 Welcome, ${userData.name}!`);

            setTimeout(() => {
                navigate("/");
            }, 1000);

        } catch (error) {
            console.error("Google Login Error:", error);

            if (error.code === "auth/popup-closed-by-user") {
                toast.info("Google Sign-In was cancelled.");
            } else if (error.code === "auth/cancelled-popup-request") {
                // Ignore repeated click cancellations
            } else if (error.code === "auth/popup-blocked") {
                toast.warning("Pop-up blocked! Please allow pop-ups for this site.");
            } else if (error.code === "auth/configuration-not-found") {
                toast.error("⚠️ Google Sign-In is not enabled yet in Firebase Console. Go to Firebase Console -> Authentication -> Sign-in method -> Enable Google.", { autoClose: 7000 });
            } else if (error.code === "auth/network-request-failed") {
                toast.error("⚠️ Network Request Failed! Please check: 1) Disable Ad-blocker/Brave Shields, 2) Add 'localhost' to Firebase Console -> Authentication -> Settings -> Authorized domains.", { autoClose: 9000 });
            } else {
                toast.error(
                    error.response?.data?.message ||
                    error.message ||
                    "❌ Google Login Failed!"
                );
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="login-container">

            <div className="login-card">

                <h1>Welcome</h1>

                <p>Sign into your account</p>

                <div className="tab-buttons">
                    <button className="active">Sign In</button>
                    <button
                        className="inactive"
                        onClick={() => navigate("/register")}
                    >
                        Register
                    </button>
                </div>

                <form onSubmit={handleSubmit}>

                    <div className="input-group">
                        <label>Email</label>

                        <input
                            className={errors.email ? "input-error" : ""}
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        {errors.email ? (
                            <small className="error-text">
                                {errors.email}
                            </small>
                        ) : (
                            formData.email.includes("@") &&
                            formData.email.includes(".") && (
                                <small className="success-text">
                                    ✓ Valid Email
                                </small>
                            )
                        )}
                    </div>
                    <div className="input-group">
                        <label>Password</label>

                        <div className="password-field">
                            <input
                                className={errors.password ? "input-error" : ""}
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />

                            <button
                                type="button"
                                className="eye-btn"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                            </button>
                        </div>

                        {errors.password ? (
                            <small className="error-text">
                                {errors.password}
                            </small>
                        ) : (
                            formData.password.length >= 8 && (
                                <small className="success-text">

                                </small>
                            )
                        )}
                    </div>
                    <div className="login-options">
                        <label>
                            <input type="checkbox" />
                            Remember Me
                        </label>

                        <span
                            className="forgot-password"
                            onClick={() => navigate("/forgot-password")}
                        >
                            Forgot Password?
                        </span>
                    </div>
                    <button
                        type="submit"
                        className="login-btn"
                        disabled={loading}
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>

                    <div className="divider">
                        <span>OR</span>
                    </div>

                    <button
                        type="button"
                        className={`google-btn ${googleLoading ? "google-btn-loading" : ""}`}
                        onClick={handleGoogleLogin}
                        disabled={loading || googleLoading}
                    >
                        {googleLoading ? (
                            <span className="google-spinner"></span>
                        ) : (
                            <img
                                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                alt="Google"
                            />
                        )}
                        <span>{googleLoading ? "Signing in with Google..." : "Continue with Google"}</span>
                    </button>

                </form>

            </div>

        </div>
    );
}

export default Login;