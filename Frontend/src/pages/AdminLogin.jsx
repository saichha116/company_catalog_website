import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import { adminLoginUser } from "../services/authService";
import "../styles/AdminLogin.css";

function AdminLogin() {

    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!formData.email || !formData.password) {
            toast.error("Please enter email and password.");
            return;
        }

        setLoading(true);

        try {

            const response = await adminLoginUser({
                email: formData.email,
                password: formData.password
            });

            // Save admin token
            localStorage.setItem(
                "adminToken",
                response.data.token
            );

            // Save admin details
            localStorage.setItem(
                "adminUser",
                JSON.stringify(response.data.user)
            );

            toast.success("🎉 Admin Login Successful!");

            setTimeout(() => {
                navigate("/admin");
            }, 1000);

        } catch (error) {

            console.error("Admin Login Error:", error);

            toast.error(
                error.response?.data?.message ||
                "Admin Login Failed!"
            );

        } finally {

            setLoading(false);

        }
    };

    return (

        <div className="admin-login-container">

            <div className="admin-login-card">

                <div className="admin-icon">
                    <FaLock />
                </div>

                <h1>Admin Login</h1>

                <p>
                    Sign in to access the administration panel
                </p>

                <form onSubmit={handleSubmit}>

                    {/* EMAIL */}

                    <div className="admin-input-group">

                        <label>Email Address</label>

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter admin email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    {/* PASSWORD */}

                    <div className="admin-input-group">

                        <label>Password</label>

                        <div className="admin-password-field">

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                name="password"
                                placeholder="Enter admin password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />

                            <button
                                type="button"
                                className="admin-eye-btn"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                            >

                                {showPassword ? (
                                    <FaEyeSlash />
                                ) : (
                                    <FaEye />
                                )}

                            </button>

                        </div>

                    </div>


                    {/* LOGIN BUTTON */}

                    <button
                        type="submit"
                        className="admin-login-btn"
                        disabled={loading}
                    >

                        {loading
                            ? "Signing In..."
                            : "Sign In as Admin"}

                    </button>

                </form>


                {/* BACK TO CUSTOMER LOGIN */}

                <button
                    className="back-user-login"
                    onClick={() => navigate("/")}
                >
                    ← Back to User Login
                </button>

            </div>

        </div>
    );
}

export default AdminLogin;