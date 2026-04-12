// admin.js - UI Utilities for Dashboard

// Sidebar Toggle (Optional logic for mobile responsiveness)
export function initSidebar() {
    // Left empty for future toggle requirements
}

// Show/Hide Loading Overlay
export function showLoader() {
    let loader = document.getElementById('global-loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'global-loader';
        loader.className = 'loading-overlay';
        loader.innerHTML = '<div class="spinner"></div><p style="color:var(--text-dark); font-weight:500;">Loading...</p>';
        document.body.appendChild(loader);
    }
    loader.classList.add('active');
}

export function hideLoader() {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.classList.remove('active');
    }
}

// Show Toast Notification
export function showToast(message, type = 'success') {
    let toast = document.getElementById('global-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'global-toast';
        document.body.appendChild(toast);
    }
    
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    
    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;
    
    // Force reflow
    void toast.offsetWidth;
    
    toast.classList.add('show');
    
    // Auto hide
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Preview Image utility
export function handleImagePreview(fileInputId, previewContainerId) {
    const input = document.getElementById(fileInputId);
    const container = document.getElementById(previewContainerId);
    
    if(!input || !container) return;
    
    const img = container.querySelector('img');
    const text = container.querySelector('span');
    
    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if(file) {
            // Validate image size (e.g. max 5MB)
            if(file.size > 5 * 1024 * 1024) {
                showToast("Image size must be less than 5MB", "error");
                input.value = "";
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(evt) {
                img.src = evt.target.result;
                img.style.display = 'block';
                if(text) text.style.display = 'none';
            };
            reader.readAsDataURL(file);
        } else {
            img.style.display = 'none';
            img.src = "";
            if(text) text.style.display = 'block';
        }
    });
}
