// API Configuration
const API_URL = 'https://literacy-cafe-production.up.railway.app/api/v1';

// Global configuration
const CONFIG = {
    API_URL: API_URL,
    TOKEN_KEY: 'token',
    AUTH_HEADER: 'Bearer',
    DEFAULT_ERROR_MESSAGE: 'An error occurred. Please try again.',
    ANIMATION_DURATION: 300, // in milliseconds
    DEBOUNCE_DELAY: 500, // in milliseconds
};

// API Endpoints
const ENDPOINTS = {
    LOGIN: `${API_URL}/auth/login`,
    REGISTER: `${API_URL}/auth/register`,
    RECOMMENDATIONS: `${API_URL}/recommendations/books`,
    USER_PROFILE: `${API_URL}/auth/me`,
};

// Export configurations
window.APP_CONFIG = {
    ...CONFIG,
    ENDPOINTS
};