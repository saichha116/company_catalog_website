import axios from "axios";

const API = "http://localhost:5000/api/auth";

// ===============================
// CUSTOMER AUTHENTICATION
// ===============================

export const registerUser = (data) => {
    return axios.post(`${API}/register`, data);
};

export const loginUser = (data) => {
    return axios.post(`${API}/login`, data);
};

export const googleLoginUser = (data) => {
    return axios.post(`${API}/google-login`, data);
};


// ===============================
// PRIVATE ADMIN AUTHENTICATION
// ===============================

export const adminLoginUser = (data) => {
    return axios.post(`${API}/admin-login`, data);
};