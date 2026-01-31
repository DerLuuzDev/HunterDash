/**
 * Formatting Utilities
 * 
 * Common number, date, and time formatting functions.
 */

/**
 * Format a number with German locale (dots as thousands separator)
 * @param {number} num - The number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export function formatNumber(num, decimals = 0) {
    if (num === null || num === undefined || isNaN(num)) return '-';
    return num.toLocaleString('de-DE', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

/**
 * Format a percentage value
 * @param {number} value - The value (0-100 or 0-1)
 * @param {boolean} isDecimal - If true, value is 0-1 and needs *100
 * @returns {string} Formatted percentage string
 */
export function formatPercent(value, isDecimal = false) {
    if (value === null || value === undefined || isNaN(value)) return '-';
    const pct = isDecimal ? value * 100 : value;
    return `${formatNumber(pct, 2)}%`;
}

/**
 * Format time in hours as HH:MM string
 * @param {number} hours - Time in hours (e.g., 14.5 = 14:30)
 * @returns {string} Formatted time string
 */
export function formatTime(hours) {
    if (hours === null || hours === undefined || isNaN(hours)) return '--:--';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Format a time range
 * @param {number} start - Start time in hours
 * @param {number} end - End time in hours
 * @returns {string} Formatted time range
 */
export function formatTimeRange(start, end) {
    return `${formatTime(start)} - ${formatTime(end)}`;
}

/**
 * Format a date for display
 * @param {Date|string|number} date - The date to format
 * @param {string} format - 'short', 'long', or 'iso'
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = 'short') {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';

    switch (format) {
        case 'iso':
            return d.toISOString().split('T')[0];
        case 'long':
            return d.toLocaleDateString('de-DE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        case 'short':
        default:
            return d.toLocaleDateString('de-DE');
    }
}

/**
 * Format duration in seconds to human-readable string
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration (e.g., "1h 23m 45s")
 */
export function formatDuration(seconds) {
    if (!seconds || seconds < 0) return '0s';

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);

    return parts.join(' ');
}

/**
 * Format a ratio as "1:X" string
 * @param {number} probability - Probability value (e.g., 0.001)
 * @returns {string} Formatted ratio string
 */
export function formatRatio(probability) {
    if (!probability || probability <= 0) return '1:∞';
    const ratio = Math.round(1 / probability);
    return `1:${formatNumber(ratio)}`;
}

export default {
    formatNumber,
    formatPercent,
    formatTime,
    formatTimeRange,
    formatDate,
    formatDuration,
    formatRatio
};
