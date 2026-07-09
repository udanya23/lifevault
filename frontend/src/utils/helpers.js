/**
 * utils/helpers.js — Frontend Utility Functions
 *
 * Pure functions — no side effects, no imports from our own modules.
 * These are safe to use anywhere without circular dependency risk.
 */

/**
 * Format a date string to a human-readable format.
 * @param {string|Date} date
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string}
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '—';
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  return new Intl.DateTimeFormat('en-US', defaultOptions).format(new Date(date));
};

/**
 * Format a date to a relative time string.
 * e.g. "3 hours ago", "Yesterday", "2 days ago"
 *
 * @param {string|Date} date
 * @returns {string}
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(date);
};

/**
 * Calculate age from a date of birth string.
 * @param {string} dob - ISO date string
 * @returns {number} age in years
 */
export const calcAge = (dob) => {
  if (!dob) return null;
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

/**
 * Get user initials from a full name for avatar display.
 * "John Doe" → "JD"
 * "Alice" → "A"
 *
 * @param {string} name
 * @returns {string}
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
};

/**
 * Capitalize the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Truncate a string to a max length and add ellipsis.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export const truncate = (str, maxLength = 50) => {
  if (!str) return '';
  return str.length > maxLength ? `${str.slice(0, maxLength)}…` : str;
};

/**
 * Format file size from bytes to human-readable string.
 * @param {number} bytes
 * @returns {string}
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Validate file before upload.
 * @param {File} file
 * @param {string[]} allowedTypes - MIME types array
 * @param {number} maxSizeBytes
 * @returns {{ valid: boolean, error: string | null }}
 */
export const validateFile = (file, allowedTypes, maxSizeBytes) => {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
    };
  }
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File too large. Maximum: ${formatFileSize(maxSizeBytes)}`,
    };
  }
  return { valid: true, error: null };
};

/**
 * Get color class for blood group badges.
 * @param {string} bloodGroup
 * @returns {string} Tailwind class
 */
export const getBloodGroupColor = (bloodGroup) => {
  const colors = {
    'A+': 'bg-red-100 text-red-700',
    'A-': 'bg-red-50 text-red-600',
    'B+': 'bg-orange-100 text-orange-700',
    'B-': 'bg-orange-50 text-orange-600',
    'AB+': 'bg-purple-100 text-purple-700',
    'AB-': 'bg-purple-50 text-purple-600',
    'O+': 'bg-green-100 text-green-700',
    'O-': 'bg-green-50 text-green-600',
  };
  return colors[bloodGroup] || 'bg-gray-100 text-gray-700';
};

/**
 * Deep merge two objects (non-destructive).
 * Used for merging partial form updates into existing state.
 *
 * @param {object} target
 * @param {object} source
 * @returns {object}
 */
export const deepMerge = (target, source) => {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key])
    ) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
};

/**
 * Debounce a function — prevents rapid successive calls.
 * Useful for search inputs, window resize handlers.
 *
 * @param {Function} fn
 * @param {number} delay ms
 * @returns {Function}
 */
export const debounce = (fn, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};
