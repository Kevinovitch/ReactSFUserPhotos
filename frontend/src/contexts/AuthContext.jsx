import { createContext, useContext, useState, useEffect } from 'react';
import { authService, userService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is already logged in (JWT token present)
    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await userService.getCurrentUser();
                    setCurrentUser(response.data[0]);
                } catch (err) {
                    console.error('Error fetching user data:', err);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };

        checkUser();
    }, []);

    // Registration function with local storage
    const register = async (userData, callback) => {
        try {
            setError(null);
            const response = await authService.register(userData);
            if (callback) callback();
            return response;
        } catch (err) {
            setError(err.response?.data?.errors || 'An error occurred during registration');
            throw err;
        }
    };

    // Registration function with AWS storage
    const registerWithAWS = async (userData, callback) => {
        try {
            setError(null);
            const response = await authService.registerWithAWS(userData);
            if (callback) callback();
            return response;
        } catch (err) {
            setError(err.response?.data?.errors || 'An error occurred during registration with AWS');
            throw err;
        }
    };

    // Login function
    const login = async (credentials, callback) => {
        try {
            setError(null);
            const response = await authService.login(credentials);
            localStorage.setItem('token', response.data.token);

            // Get user info after login
            const userResponse = await userService.getCurrentUser();
            setCurrentUser(userResponse.data[0]);

            if (callback) callback();
            return response;
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials');
            throw err;
        }
    };

    // Logout function
    const logout = (callback) => {
        localStorage.removeItem('token');
        setCurrentUser(null);
        if (callback) callback();
    };

    const value = {
        currentUser,
        loading,
        error,
        register,
        registerWithAWS,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};