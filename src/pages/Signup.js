import { useState, useEffect, useRef } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db, analytics, logEvent } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ prevent double firing
  const hasLogged = useRef(false);

  // ✅ PAGE LOAD EVENT
  useEffect(() => {
    if (!hasLogged.current && analytics) {
      logEvent(analytics, "signup_started");
      hasLogged.current = true;
    }
  }, []);

  const handleSignup = async () => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", userCred.user.uid), {
        email,
        balance: 10000,
        createdAt: new Date()
      });

      // ✅ SUCCESS EVENT
      if (analytics) {
        logEvent(analytics, "signup_completed", {
          method: "email"
        });
      }

      alert("Signup success");

    } catch (error) {
      // ❌ REMOVED drop_off_stage
      alert(error.message);
    }
  };

  const handleCancel = () => {
    // ❌ REMOVED drop_off_stage
    console.log("Signup cancelled");
  };

  return (
    <div className="app-container">
      <div className="header">
        <h2>Signup</h2>
      </div>

      <div className="card">
        <input
          className="input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="primary-btn" onClick={handleSignup}>
          Signup
        </button>

        <button className="secondary-btn" onClick={handleCancel}>
          Cancel
        </button>

        <p>
          Already have an account? <a href="/">Login</a>
        </p>
      </div>
    </div>
  );
}