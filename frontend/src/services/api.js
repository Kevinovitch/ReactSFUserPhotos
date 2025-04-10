import axios from 'axios';

// Using relative URL for API endpoints
// This will be proxied through Vite's development server
const API_URL = '/api';

// Create an axios instance with base configuration
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add JWT token to each request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Authentication service
export const authService = {
    // Register a new user with local storage
    // Using relative URL that will be proxied to the backend
    register: (userData) => {
        const formData = new FormData();

        // Add text fields
        formData.append('firstName', userData.firstName);
        formData.append('lastName', userData.lastName);
        formData.append('email', userData.email);
        formData.append('password', userData.password);

        // Add avatar if it exists
        if (userData.avatar) {
            formData.append('avatar', userData.avatar);
        }

        // Add photos
        if (userData.photos && userData.photos.length) {
            userData.photos.forEach((photo) => {
                formData.append('photos[]', photo);
            });
        }

        // Using relative URL - Vite proxy will handle redirecting to the actual backend
        return axios.post(`/api/users/register`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Register a new user with AWS storage
    // Using relative URL that will be proxied to the backend
    registerWithAWS: (userData) => {
        const formData = new FormData();

        // Add text fields
        formData.append('firstName', userData.firstName);
        formData.append('lastName', userData.lastName);
        formData.append('email', userData.email);
        formData.append('password', userData.password);

        // Add avatar if it exists
        if (userData.avatar) {
            formData.append('avatar', userData.avatar);
        }

        // Add photos
        if (userData.photos && userData.photos.length) {
            userData.photos.forEach((photo) => {
                formData.append('photos[]', photo);
            });
        }

        // Using relative URL - Vite proxy will handle redirecting to the actual backend
        return axios.post(`/api/users/register/aws`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Login a user
    login: (credentials) => {
        return api.post('/users/login', credentials);
    },
};

// User service
export const userService = {
    // Get current logged-in user
    getCurrentUser: () => {
        return api.get('/users/me');
    },
};

export default api;