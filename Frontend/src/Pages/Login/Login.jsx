import React, { useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { FaSpotify } from 'react-icons/fa';
import { FaFacebook } from 'react-icons/fa';
import { FaApple } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

const AuthForm=()=>{
    const[isLogin,setisLogin]=useState(true);// if it is true like user want login then it will show the form to fill the data
    const navigate = useNavigate();

    const[formData,setFormData]=useState({
        name:"",
        email:"",
        password:""
    });
    const [confirmEmail, setConfirmEmail] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    const {name,email,password}=formData;// form data la irrundhu name,email,password ah yeadukurom

    const onChange=e =>{
        setFormData({...formData,[e.target.name]:e.target.value});
    };

    //if user click login or signup button this function is called
    const onSubmit=async e =>{
        e.preventDefault();

        if(!isLogin && formData.email !== confirmEmail){
            alert('Email and confirm email do not match.');
            return;
        }

        const endpoint=isLogin? 'http://localhost:5000/api/auth/login': 'http://localhost:5000/api/auth/register';

        try{
            const payload = { name: formData.name, email: formData.email, password: formData.password };
            const res = await axios.post(endpoint, payload);//axios vechudha nammala request ah backend ku send panna mudiyu.
            //idhula endpoint dha backend url and formData vandhu request body

            localStorage.setItem('token',res.data.token);

            console.log('login/signup success:',res.data.token);
            navigate('/home');

        }
        catch(err){
            alert("Error! " + (err.response?.data?.message || err.message));
            console.error('login/signup error:',err.response?err.response.data : err.message);
        }
    }

    //return component this only will render in the browser
    return(
        
        <div className="login-container">
      <div className="login-box">
        <div className="auth-logo" aria-label="Spotify">
          <FaSpotify size={48} color="#1db954" />
        </div>
        <h1>{isLogin ? 'Log in to Spotify' : 'Sign up for free'}</h1>
        
        <div className="social-login">
          <button type="button" className="social-btn google">
            <FcGoogle size={20} />
            <span>Continue with Google</span>
          </button>
          <button type="button" className="social-btn facebook">
            <FaFacebook color="#1877F2" size={20} />
            <span>Continue with Facebook</span>
          </button>
          <button type="button" className="social-btn apple">
            <FaApple size={20} />
            <span>Continue with Apple</span>
          </button>
        </div>
        
        <div className="divider">
          <span>or</span>
        </div>
        
        <form onSubmit={onSubmit} className="login-form">

                {/* name field only in signup form */}
                {!isLogin && (
                <div className="form-group">
                    <label htmlFor="name">What's your name?</label>
                    <input 
                        type="text"
                        id="name"
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
                    <label htmlFor="email">Email address or username</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        placeholder="name@domain.com"
                        required
                        className="form-input"
                    />
                </div>

                {/* confirm email only for signup */}
                {!isLogin && (
                <div className="form-group">
                    <label htmlFor="confirmEmail">Confirm email address</label>
                    <input
                        type="email"
                        id="confirmEmail"
                        name="confirmEmail"
                        value={confirmEmail}
                        onChange={(e) => setConfirmEmail(e.target.value)}
                        placeholder="name@domain.com"
                        required
                        className="form-input"
                    />
                </div>)}

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={onChange}
                        placeholder="Enter your password"
                        required
                        className="form-input"
                    />
                </div>

                {/* remember me + forgot password only for login */}
                {isLogin && (
                <div className="form-options">
                    <label className="remember-me">
                        <input
                            type="checkbox"
                            id="remember"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <span>Remember me</span>
                    </label>
                    <a href="#" className="forgot-password">
                        Forgot password?
                    </a>
                </div>
                )}

                <button type="submit" className="submit-btn">
                    {isLogin ? 'Log In' : 'Sign Up'}
                </button>
                </form>
                
                <p className="signup-link">
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}
                    <button
                        type="button"
                        className="text-button"
                        onClick={() => setisLogin(!isLogin)}
                    >
                        {isLogin ? 'Sign up for Spotify' : 'Log in'}
                    </button>
                </p>
        </div>
      </div>
    );
};

export default AuthForm;
