const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "company_catalog_jwt_secret_key_2026";


// ==========================================
// CUSTOMER REGISTER
// ==========================================
const register = async (req, res) => {

    try {

        const {
            full_name,
            email,
            phone,
            password,
            address
        } = req.body;

        if (!full_name || !email || !phone || !password) {

            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });

        }

        // Check if user already exists
        const [existingUser] = await db.execute(
            "SELECT * FROM users WHERE email = ? OR phone = ?",
            [email, phone]
        );

        if (existingUser.length > 0) {

            return res.status(400).json({
                success: false,
                message: "User already exists"
            });

        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create customer
        await db.execute(
            `INSERT INTO users
            (full_name, email, phone, password, address)
            VALUES (?, ?, ?, ?, ?)`,
            [
                full_name,
                email,
                phone,
                hashedPassword,
                address || null
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Registration Successful"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ==========================================
// CUSTOMER LOGIN
// ==========================================
const login = async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Email and Password are required"
            });
        }

        // Find user
        const [users] = await db.execute(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = users[0];

        // Compare password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {

            return res.status(401).json({
                success: false,
                message: "Invalid Password"
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user.user_id,
                role: user.role
            },
            JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Login Successful",

            token,

            user: {
                id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};


// ==========================================
// ADMIN LOGIN
// ==========================================
const adminLogin = async (req, res) => {

    try {

        const { email, password } = req.body;

        // Check fields
        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Admin email and password are required"
            });
        }

        // Find admin by email
        const [users] = await db.execute(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        // User does not exist
        if (users.length === 0) {

            return res.status(401).json({
                success: false,
                message: "Invalid admin credentials"
            });
        }

        const user = users[0];

        // IMPORTANT:
        // Only users with admin role can use Admin Login
        if (user.role !== "admin") {

            return res.status(403).json({
                success: false,
                message: "Access denied. Admin account required."
            });
        }

        // Check password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {

            return res.status(401).json({
                success: false,
                message: "Invalid admin credentials"
            });
        }

        // Generate ADMIN JWT
        const token = jwt.sign(
            {
                id: user.user_id,
                role: "admin"
            },
            JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return res.status(200).json({

            success: true,

            message: "Admin Login Successful",

            token,

            user: {
                id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                role: "admin"
            }
        });

    } catch (error) {

        console.error("ADMIN LOGIN ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Admin Login Failed"
        });
    }
};


// ==========================================
// GOOGLE LOGIN
// ==========================================
const googleLogin = async (req, res) => {

    try {

        const {
            full_name,
            email,
            google_id
        } = req.body;

        if (!email || !google_id) {

            return res.status(400).json({
                success: false,
                message: "Google account information is required"
            });
        }

        // Check Google user
        const [users] = await db.execute(
            "SELECT * FROM users WHERE email = ? OR google_id = ?",
            [email, google_id]
        );

        let user;

        if (users.length > 0) {

            user = users[0];

        } else {

            // Create Google customer
            const [result] = await db.execute(
                `INSERT INTO users
                (full_name, email, phone, password, address, google_id, auth_provider)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    full_name,
                    email,
                    null,
                    null,
                    null,
                    google_id,
                    "google"
                ]
            );

            const [newUsers] = await db.execute(
                "SELECT * FROM users WHERE user_id = ?",
                [result.insertId]
            );

            user = newUsers[0];
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user.user_id,
                role: user.role
            },
            JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return res.status(200).json({

            success: true,

            message: "Google Login Successful",

            token,

            user: {
                id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Google Login Failed"
        });
    }
};


// ==========================================
// EXPORT
// ==========================================
module.exports = {
    register,
    login,
    adminLogin,
    googleLogin
};