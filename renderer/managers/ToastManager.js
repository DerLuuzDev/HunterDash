/**
 * ToastManager
 * 
 * Handles toast notification display.
 */

const ToastManager = {
    /**
     * Show a toast notification
     * @param {string} message - The message to display
     * @param {string} type - Type: 'info', 'success', 'warning', 'error'
     * @param {number} duration - Duration in ms (default 3000)
     */
    show(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container') || this.createContainer();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };

        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        container.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto-remove after duration
        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    /**
     * Create toast container if it doesn't exist
     */
    createContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
        return container;
    },

    /**
     * Show success toast
     */
    success(message, duration = 3000) {
        this.show(message, 'success', duration);
    },

    /**
     * Show error toast
     */
    error(message, duration = 4000) {
        this.show(message, 'error', duration);
    },

    /**
     * Show warning toast
     */
    warning(message, duration = 3500) {
        this.show(message, 'warning', duration);
    },

    /**
     * Show info toast
     */
    info(message, duration = 3000) {
        this.show(message, 'info', duration);
    }
};

export default ToastManager;
