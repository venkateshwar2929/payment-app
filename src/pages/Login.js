import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, analytics, logEvent } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/initiate");
    } catch (error) {
      if (analytics) {
        logEvent(analytics, "drop_off_stage", {
          stage: "login_failed"
        });
      }
    }
  };

  const handleCancel = () => {
    if (analytics) {
      logEvent(analytics, "drop_off_stage", {
        stage: "login_cancelled"
      });
    }
  };

  return (
  <div className="app-container">
    <div className="header">
      <h2>PayApp 💜</h2>
    </div>

    <div className="card">
      <input className="input" placeholder="Email"
        onChange={(e)=>setEmail(e.target.value)} />

      <input className="input" type="password" placeholder="Password"
        onChange={(e)=>setPassword(e.target.value)} />

      <button className="primary-btn" onClick={handleLogin}>
        Login
      </button>

      <button className="secondary-btn" onClick={handleCancel}>
        Cancel
      </button>

      <p>
        Don't have an account? <a href="/signup">Signup</a>
      </p>
    </div>
  </div>
);
}