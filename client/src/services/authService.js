import api from './api';

const authService = {
    // Register user
    register: (name, email, password) =>
        api.post('/auth/register', { name, email, password }),

    // Login user
    login: (email, password) =>
        api.post('/auth/login', { email, password }),

    // Get current user
    getCurrentUser: () =>
        api.get('/auth/me'),

    // Logout (clear local storage)
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
};

export default authService;
