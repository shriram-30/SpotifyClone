import React from "react";
import { useNavigate } from "react-router-dom";
import "./Mainpage.css"; // import css file

const Mainpage = () => {
  const navigate = useNavigate();

  const handleEnter = () => {
    navigate("/login"); // redirect to login page
  };

  return (
    <div className="mainpage">
      <div className="overlay">
        <h1 className="title">Listen to your favourite music uninterruptedly</h1>
        <button className="enter-btn" onClick={handleEnter}>Enter</button>
      </div>
    </div>
  );
};

export default Mainpage;
