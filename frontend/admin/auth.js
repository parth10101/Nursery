// Utility to check if current page is login or signup
const isLoginPage = window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('signup.html') || window.location.pathname.endsWith('admin/') || window.location.pathname.endsWith('admin');

// Base URL for API
const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '5000' ? 'http://localhost:5000/api' : '/api';

// 1. Auth Guard & Role Check
const checkAuth = async () => {
    const token = localStorage.getItem('token');
    
    if (token) {
        try {
            const res = await fetch(`${API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Token invalid');

            const user = await res.json();

            if (user.role !== 'admin') {
                // Not an admin
                localStorage.removeItem('token');
                alert("Unauthorized access. You are not an admin.");
                if (!isLoginPage) {
                    window.location.href = "../pages/login.html"; // We also need to fix this if the path was wrong.
                }
            } else {
                // Is an admin
                if (isLoginPage) {
                    window.location.href = "dashboard.html";
                } else {
                    const emailElement = document.getElementById("admin-user-email");
                    if (emailElement) {
                        emailElement.textContent = user.email;
                    }
                }
            }
        } catch (error) {
            console.error("Error checking admin status:", error);
            localStorage.removeItem('token');
            if (!isLoginPage) window.location.href = "../pages/login.html";
        }
    } else {
        // User is not logged in
        if (!isLoginPage) {
            window.location.href = "../pages/login.html";
        }
    }
};

checkAuth();

// 2. Global Logout Function
export const handleLogout = async () => {
    try {
        localStorage.removeItem('token');
        window.location.href = "../pages/login.html";
    } catch (error) {
        console.error("Logout Error", error);
        alert("Failed to logout");
    }
};

// 3. Login Function (Used by login.html)
export const handleLogin = async (email, password) => {
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            localStorage.setItem('token', data.token);
            return { success: true, user: data };
        } else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        console.error("Login Error:", error);
        return { success: false, message: error.message };
    }
};

// 4. Signup Function (Admin Signup)
export const handleSignup = async (email, password) => {
    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role: 'admin' })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            localStorage.setItem('token', data.token);
            return { success: true, user: data };
        } else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        console.error("Signup Error:", error);
        return { success: false, message: error.message };
    }
};

window.logoutAdmin = handleLogout;
