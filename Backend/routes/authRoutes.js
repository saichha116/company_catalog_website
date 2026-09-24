const express = require("express");
const router = express.Router();

const {
    register,
    login,
    adminLogin,
    googleLogin
} = require("../controllers/authController");


// ===============================
// CUSTOMER AUTHENTICATION
// ===============================

router.post("/register", register);

router.post("/login", login);

router.post("/google-login", googleLogin);


// ===============================
// PRIVATE ADMIN AUTHENTICATION
// ===============================

router.post("/admin-login", adminLogin);


// ===============================
// TEST ROUTE
// ===============================

router.get("/login", (req, res) => {
    res.send("Login Route Working");
});


module.exports = router;