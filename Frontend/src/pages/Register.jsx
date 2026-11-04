import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { registerUser, googleLoginUser } from "../services/authService";
import { toast } from "react-toastify";
import "../styles/Register.css";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase/firebase";

function Register() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        password: "",
        address: ""
    });

    const [errors, setErrors] = useState({
        full_name: "",
        email: "",
        phone: "",
        password: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newErrors = { ...errors };

        if (name === "full_name") {
            newErrors.full_name = value.trim() ? "" : "Full name is required.";
        }

        if (name === "email") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value.trim()) {
                newErrors.email = "Email is required.";
            } else if (!emailRegex.test(value)) {
                newErrors.email = "Please enter a valid email address.";
            } else {
                newErrors.email = "";
            }
        }

        if (name === "phone") {
            const phoneRegex = /^[0-9]{10}$/;
            if (!value.trim()) {
                newErrors.phone = "Phone number is required.";
            } else if (!phoneRegex.test(value.replace(/[-\s]/g, ""))) {
                newErrors.phone = "Please enter a valid 10-digit phone number.";
            } else {
                newErrors.phone = "";
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
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.full_name || !formData.email || !formData.phone || !formData.password) {
            toast.error("Please fill in all required fields.");
            return;
        }

        if (errors.email || errors.phone || errors.password) {
            toast.error("Please fix the validation errors before submitting.");
            return;
        }

        setLoading(true);

        try {
            const response = await registerUser(formData);

            toast.success(response.data?.message || "🎉 Registration Successful! Please sign in.");

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (error) {
            console.error("Register Error:", error);
            toast.error(
                error.response?.data?.message || "❌ Registration Failed! Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
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

            localStorage.setItem("user", JSON.stringify(userData));

            // Notify Navbar and app
            window.dispatchEvent(new Event("auth-change"));

            toast.success(`🎉 Welcome, ${userData.name}! Account ready.`);

            setTimeout(() => {
                navigate("/");
            }, 1000);

        } catch (error) {
            console.error("Google Sign-Up Error:", error);

            if (error.code === "auth/popup-closed-by-user") {
                toast.info("Google Sign-Up was cancelled.");
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
                    "❌ Google Sign-Up Failed!"
                );
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <h1>Create Account</h1>
                <p>Join us today to explore products and services</p>

                <div className="tab-buttons">
                    <button
                        type="button"
                        className="inactive"
                        onClick={() => navigate("/login")}
                    >
                        Sign In
                    </button>
                    <button
                        type="button"
                        className="active"
                    >
                        Register
                    </button>
                </div>

                {/* Google Sign-up Button at the top for convenience */}
                <button
                    type="button"
                    className={`google-btn ${googleLoading ? "google-btn-loading" : ""}`}
                    onClick={handleGoogleSignUp}
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
                    <span>{googleLoading ? "Connecting to Google..." : "Sign up with Google"}</span>
                </button>

                <div className="divider">
                    <span>OR REGISTER WITH EMAIL</span>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Full Name *</label>
                        <input
                            type="text"
                            name="full_name"
                            placeholder="Enter your full name"
                            value={formData.full_name}
                            onChange={handleChange}
                            required
                        />
                        {errors.full_name && (
                            <small className="error-text">{errors.full_name}</small>
                        )}
                    </div>

                    <div className="input-group">
                        <label>Email Address *</label>
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
                            <small className="error-text">{errors.email}</small>
                        ) : (
                            formData.email.includes("@") &&
                            formData.email.includes(".") && (
                                <small className="success-text">✓ Valid Email</small>
                            )
                        )}
                    </div>

                    <div className="input-group">
                        <label>Phone Number *</label>
                        <input
                            className={errors.phone ? "input-error" : ""}
                            type="tel"
                            name="phone"
                            placeholder="Enter 10-digit mobile number"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                        {errors.phone && (
                            <small className="error-text">{errors.phone}</small>
                        )}
                    </div>

                    <div className="input-group">
                        <label>Password *</label>
                        <div className="password-field">
                            <input
                                className={errors.password ? "input-error" : ""}
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Create a password (min 8 characters)"
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
                        {errors.password && (
                            <small className="error-text">{errors.password}</small>
                        )}
                    </div>

                    <div className="input-group">
                        <label>Address (Optional)</label>
                        <input
                            type="text"
                            name="address"
                            placeholder="Enter your address / city"
                            value={formData.address}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        className="register-btn"
                        disabled={loading}
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                <p className="login-footer-text">
                    Already have an account?{" "}
                    <span onClick={() => navigate("/login")}>Sign In here</span>
                </p>
            </div>
        </div>
    );
}

export default Register;
