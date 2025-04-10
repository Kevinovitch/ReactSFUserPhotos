import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Layout from './components/common/Layout';
import HomePage from './components/common/HomePage';
import RegisterForm from './components/auth/RegisterForm';
import LoginForm from './components/auth/LoginForm';
import ProfilePage from './components/profile/ProfilePage';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<HomePage />} />
                            <Route path="register" element={<RegisterForm />} />
                            <Route path="login" element={<LoginForm />} />
                            <Route path="profile" element={
                                <ProtectedRoute>
                                    <ProfilePage />
                                </ProtectedRoute>
                            } />
                        </Route>
                    </Routes>
                    <ToastContainer position="bottom-right" />
                </AuthProvider>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;