import { showLoader, hideLoader, showToast } from "./admin.js";

const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '5000' ? 'http://localhost:5000/api' : '/api';

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
}

let messageListeners = [];

async function triggerMessageListeners() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn("No auth token found for messages fetch");
            return;
        }

        const res = await fetch(`${API_URL}/messages`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const messages = await res.json();
            messageListeners.forEach(cb => cb(messages));
        } else {
            const errorData = await res.json();
            console.error("Fetch Error:", errorData.message);
            // Broadcast empty or error state if needed
            if (res.status === 401) {
                // Handle unauthorized (maybe redirect?)
            }
        }
    } catch (error) {
        console.error("Error fetching messages:", error);
    }
}

/**
 * Listen to messages (Real-time polling)
 */
export function listenToMessages(callback) {
    messageListeners.push(callback);
    // Initial fetch
    triggerMessageListeners();
    
    // Set polling every 5 seconds
    const intervalId = setInterval(triggerMessageListeners, 5000);
    
    // Return unsubscribe function
    return () => {
        messageListeners = messageListeners.filter(cb => cb !== callback);
        clearInterval(intervalId);
    };
}

/**
 * Delete a message
 */
export async function deleteMessage(id) {
    if (!confirm("Are you sure you want to delete this message?")) return false;
    showLoader();
    try {
        const res = await fetch(`${API_URL}/messages/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error("Failed to delete message");
        showToast("Message deleted", "success");
        triggerMessageListeners();
        return true;
    } catch (error) {
        console.error("Delete Error:", error);
        showToast("Error deleting message", "error");
        return false;
    } finally {
        hideLoader();
    }
}

/**
 * Mark message as read
 */
export async function markAsRead(id) {
    showLoader();
    try {
        const res = await fetch(`${API_URL}/messages/${id}/status`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status: 'read' })
        });
        if (!res.ok) throw new Error("Failed to update status");
        showToast("Message marked as read", "success");
        triggerMessageListeners();
        return true;
    } catch (error) {
        console.error("Update Status Error:", error);
        showToast("Error updating message", "error");
        return false;
    } finally {
        hideLoader();
    }
}
