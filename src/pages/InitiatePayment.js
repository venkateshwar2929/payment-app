// src/pages/InitiatePayment.js

import { useNavigate } from "react-router-dom";
import { analytics, logEvent } from "../firebase";
import { useEffect } from "react";
import { auth } from "../firebase";


export default function InitiatePayment() {
  const navigate = useNavigate();


 useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((user) => {
    if (!user) {
      navigate("/");
    }
  });

  return () => unsubscribe();
}, [navigate]);

  const handleInitiate = () => {
    if (analytics) {
      logEvent(analytics, "payment_initiated");
    }

    navigate("/send");
  };

 return (
  <div className="app-container">
    <div className="header">
      <h2>Welcome 💸</h2>
    </div>

    <div className="card">
      <button className="primary-btn" onClick={handleInitiate}>
        🚀 Initiate Payment
      </button>
    </div>
  </div>
);
}