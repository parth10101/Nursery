import { showLoader, hideLoader, showToast } from "./admin.js";

// Cloudinary Configuration
const CLOUD_NAME = "dnc6mlhox";
const UPLOAD_PRESET = "nursery_images";
const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '5000' ? 'http://localhost:5000/api' : '/api';

/**
 * Upload image to Cloudinary
 */
export async function uploadImageToCloudinary(file) {
    if (!file) return null;

    if (CLOUD_NAME === "YOUR_NAME" || UPLOAD_PRESET === "YOUR_PRESET") {
        throw new Error("Cloudinary credentials are not configured.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    showLoader();
    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        hideLoader();

        if (data.secure_url) {
            return data.secure_url;
        } else {
            throw new Error(data.error?.message || "Image upload failed");
        }
    } catch (error) {
        hideLoader();
        console.error("Cloudinary Error:", error);
        throw error;
    }
}

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
}

// Store listeners to simulate realtime updates
let productListeners = [];

async function triggerProductListeners() {
    try {
        const res = await fetch(`${API_URL}/products`);
        let products = await res.json();
        products = products.map(p => ({ ...p, id: p._id }));
        productListeners.forEach(cb => cb(products));
    } catch (error) {
        console.error(error);
    }
}

/**
 * Add a new product
 */
export async function addProduct(productData) {
    try {
        showLoader();
        const res = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(productData)
        });
        
        if (!res.ok) throw new Error("Failed to add product");
        hideLoader();
        triggerProductListeners();
        return true;
    } catch (error) {
        hideLoader();
        console.error("Add Error:", error);
        throw error;
    }
}

/**
 * Delete product
 */
export async function deleteProduct(productId) {
    try {
        showLoader();
        const res = await fetch(`${API_URL}/products/${productId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error("Failed to delete product");
        hideLoader();
        triggerProductListeners();
        return true;
    } catch (error) {
        hideLoader();
        console.error("Delete Error:", error);
        throw error;
    }
}

/**
 * Update an existing product
 */
export async function editProduct(productId, updateData) {
    try {
        showLoader();
        const res = await fetch(`${API_URL}/products/${productId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(updateData)
        });
        if (!res.ok) throw new Error("Failed to update product");
        hideLoader();
        triggerProductListeners();
        return true;
    } catch (error) {
        hideLoader();
        console.error("Update Error:", error);
        throw error;
    }
}

/**
 * Listen to products (Rest API implementation)
 */
export function listenToProducts(callback) {
    productListeners.push(callback);
    // Initial fetch
    triggerProductListeners();
    // Return an unsubscribe function to mimic Firebase
    return () => {
        productListeners = productListeners.filter(cb => cb !== callback);
    };
}
