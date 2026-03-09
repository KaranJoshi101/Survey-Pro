import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav
            style={{
                backgroundColor: '#003594',
                color: 'white',
                padding: '0 20px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
        >
            <div className="flex align-center gap-3">
                <Link
                    to="/dashboard"
                    style={{
                        color: 'white',
                        textDecoration: 'none',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        fontFamily: "'Merriweather', serif",
                    }}
                >
                    📋 Survey App
                </Link>
            </div>

            <div className="flex align-center gap-3">
                <Link
                    to="/surveys"
                    style={{ color: 'white', textDecoration: 'none', fontSize: '0.95rem' }}
                >
                    Surveys
                </Link>
                <Link
                    to="/articles"
                    style={{ color: 'white', textDecoration: 'none', fontSize: '0.95rem' }}
                >
                    Articles
                </Link>
                {isAdmin && (
                    <Link
                        to="/admin"
                        style={{ color: 'white', textDecoration: 'none', fontSize: '0.95rem' }}
                    >
                        Admin
                    </Link>
                )}
            </div>

            <div style={{ position: 'relative' }}>
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    style={{
                        background: 'rgba(255,184,28,0.2)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 15px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                    }}
                >
                    👤 {user?.name}
                </button>

                {showMenu && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '45px',
                            right: 0,
                            backgroundColor: 'white',
                            color: '#333',
                            borderRadius: '4px',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            minWidth: '200px',
                            zIndex: 1000,
                            overflow: 'hidden',
                        }}
                    >
                        <div
                            style={{
                                padding: '12px 16px',
                                borderBottom: '1px solid #eee',
                                fontSize: '0.9rem',
                            }}
                        >
                            <p style={{ margin: 0 }}>
                                <strong>{user?.name}</strong>
                            </p>
                            <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '0.85rem' }}>
                                {user?.email}
                            </p>
                            <p
                                style={{
                                    margin: '4px 0 0 0',
                                    color: '#003594',
                                    fontSize: '0.85rem',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                }}
                            >
                                {user?.role}
                            </p>
                        </div>
                        <Link
                            to="/profile"
                            onClick={() => setShowMenu(false)}
                            style={{
                                display: 'block',
                                padding: '12px 16px',
                                borderBottom: '1px solid #eee',
                                textDecoration: 'none',
                                color: '#003594',
                                fontSize: '0.95rem',
                                fontWeight: '500',
                            }}
                        >
                            My Profile
                        </Link>
                        <button
                            onClick={handleLogout}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontSize: '0.95rem',
                                color: '#dc3545',
                                fontWeight: '500',
                            }}
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
