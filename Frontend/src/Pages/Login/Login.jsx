import React, { useState } from "react";
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import { FaSpotify, FaFacebook } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

const AuthForm = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });
    const [confirmEmail, setConfirmEmail] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const { name, email, password } = formData;

    const onChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError("");
    };

    const onSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!isLogin && formData.email !== confirmEmail) {
            setError("Email addresses don't match.");
            setLoading(false);
            return;
        }

        const endpoint = isLogin 
            ? 'http://localhost:5000/api/auth/login' 
            : 'http://localhost:5000/api/auth/register';

        try {
            const payload = { 
                name: formData.name, 
                email: formData.email, 
                password: formData.password 
            };
            
            const res = await axios.post(endpoint, payload);
            localStorage.setItem('token', res.data.token);
            //idhu vandhu browser history la store aaitu varu when we click back it go to the recent viewed page
            navigate('/home',{replace:true});
        } catch (err) {
            const errorMsg = err.response?.data?.message || "An error occurred. Please try again.";
            setError(errorMsg);
            console.error('Auth error:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <header className="auth-header">
                <div className="auth-logo" onClick={() => navigate('/')}>
                    <FaSpotify size={36} color="#1db954" />
                    <span>Spotify</span>
                </div>
            </header>

            <div className="auth-container">
                <div className="auth-box">
                    <h1>{isLogin ? 'Log in to Spotify' : 'Sign up for free to start listening.'}</h1>
                    
                    <div className="social-login">
                        <button className="btn btn-facebook">
                            <FaFacebook className="social-icon" />
                            Continue with Facebook
                        </button>
                        <button className="btn btn-google">
                            <FcGoogle className="social-icon" />
                            Continue with Google
                        </button>
                    </div>
                    
                    <div className="divider">or</div>
                    
                    {error && <div className="error-message">{error}</div>}
                    
                    <form onSubmit={onSubmit}>
                        {!isLogin && (
                            <div className="form-group">
                                <label>What should we call you?</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={name}
                                    onChange={onChange}
                                    placeholder="Enter your name"
                                    required
                                    className="form-input"
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label>Email address or username</label>
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={onChange}
                                placeholder="name@domain.com"
                                required
                                className="form-input"
                            />
                        </div>

                        {!isLogin && (
                            <div className="form-group">
                                <label>Confirm email address</label>
                                <input
                                    type="email"
                                    name="confirmEmail"
                                    value={confirmEmail}
                                    onChange={(e) => setConfirmEmail(e.target.value)}
                                    placeholder="Enter your email again"
                                    required
                                    className="form-input"
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={onChange}
                                placeholder="Enter your password"
                                required
                                minLength={8}
                                className="form-input"
                            />
                        </div>
                        
                        {isLogin && (
                            <div className="form-options">
                                <label className="checkbox-container">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={() => setRememberMe(!rememberMe)}
                                    />
                                    <span className="checkmark"></span>
                                    Remember me
                                </label>
                                <a href="#forgot" className="forgot-password">Forgot your password?</a>
                            </div>
                        )}
                        
                        <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : isLogin ? 'Log In' : 'Sign Up'}
                        </button>
                        
                        <div className="auth-footer">
                            {isLogin ? "Don't have an account?" : 'Already have an account?'}
                            <button 
                                type="button" 
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError("");
                                }}
                                className="text-button"
                            >
                                {isLogin ? 'Sign up for Spotify' : 'Log in'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            <footer className="auth-page-footer">
                <div className="footer-content">
                    <div className="footer-links">
                        <a href="#terms">Terms and Conditions</a>
                        <a href="#privacy">Privacy Policy</a>
                        <a href="#cookies">Cookies</a>
                    </div>
                    <div className="copyright">
                        {new Date().getFullYear()} Spotify AB
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AuthForm;
