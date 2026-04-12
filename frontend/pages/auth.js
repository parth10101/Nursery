// Base API URL
const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '5000' ? 'http://localhost:5000/api' : '/api';

// Global helper to check if a user is logged in
export async function initCustomerAuth(callback) {
    const token = localStorage.getItem('token');
    
    if (token) {
        try {
            const res = await fetch(`${API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const user = await res.json();
                if (user.role === 'admin') {
                    console.warn("Logged in as Admin. Customer view may behave differently.");
                }
                callback(user);
            } else {
                localStorage.removeItem('token');
                callback(null);
            }
        } catch (error) {
            callback(null);
        }
    } else {
        callback(null);
    }
}

// Global script to handle navbar UI logic across the public site
export function setupNavbarAuthUI() {
    const navLinksList = document.querySelector(".nav-links");
    if (!navLinksList) return;

    // Check if dynamic user links already exist, if not, append placeholders
    let userLinksHtml = `
        <li class="auth-dynamic" id="nav-my-orders" style="display:none;"><a href="my-orders.html" class="nav-link">My Orders</a></li>
        <li class="auth-dynamic" id="nav-login-btn"><a href="login.html" class="btn" style="background:var(--primary-color);color:white;padding:0.7rem 1.5rem;border-radius:50px;text-decoration:none;margin-left:1rem;font-weight:600;">Login / Sign Up</a></li>
        <li class="auth-dynamic" id="nav-logout-section" style="display:none; align-items:center; margin-left:1rem;">
            <span id="nav-user-email" style="font-size:0.9rem; color:#666; margin-right:1rem;"></span>
            <button id="nav-logout-btn" style="background:#e74c3c;color:white;border:none;padding:0.5rem 1rem;border-radius:50px;cursor:pointer;font-weight:600;">Logout</button>
        </li>
    `;

    // Remove old "Admin Login" if it exists
    const adminLoginLink = Array.from(navLinksList.querySelectorAll("a")).find(a => a.textContent && a.textContent.includes("Admin Login"));
    if (adminLoginLink && adminLoginLink.parentElement) {
        adminLoginLink.parentElement.remove();
    }

    // Append our dynamic links
    navLinksList.insertAdjacentHTML('beforeend', userLinksHtml);

    // Bind auth listener to toggle standard UI elements
    initCustomerAuth((user) => {
        const loginBtn = document.getElementById("nav-login-btn");
        const logoutSec = document.getElementById("nav-logout-section");
        const myOrders = document.getElementById("nav-my-orders");
        const emailSpan = document.getElementById("nav-user-email");

        if (user) {
            if (loginBtn) loginBtn.style.display = "none";
            if (logoutSec) logoutSec.style.display = "flex";
            if (myOrders) myOrders.style.display = "list-item";
            if (emailSpan) emailSpan.textContent = user.email.split('@')[0];
            
            // Attach logout listener
            const logoutBtn = document.getElementById("nav-logout-btn");
            if (logoutBtn) {
                logoutBtn.addEventListener("click", () => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('nursery_cart'); // Clear cart on logout
                    window.location.reload();
                });
            }
        } else {
            if (loginBtn) loginBtn.style.display = "list-item";
            if (logoutSec) logoutSec.style.display = "none";
            if (myOrders) myOrders.style.display = "none";
        }
    });
}

// Auto-run on import
setupNavbarAuthUI();
