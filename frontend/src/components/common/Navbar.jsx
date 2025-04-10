import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Navbar() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(() => {
            navigate('/login');
        });
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">PhotoGallery</Link>
                <div className="navbar-nav ms-auto">
                    {currentUser ? (
                        <>
                            <Link className="nav-link" to="/profile">My Profile</Link>
                            <button className="btn btn-light btn-sm ms-2" onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link className="nav-link" to="/login">Sign In</Link>
                            <Link className="nav-link" to="/register">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;