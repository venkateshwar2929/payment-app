import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SendMoney from "./pages/SendMoney";
import { useEffect } from "react";
import { analytics, logEvent } from "./firebase";
import InitiatePayment from "./pages/InitiatePayment";
import "./styles/phonepe.css";

function App() {
  useEffect(() => {
    if (analytics) {
      logEvent(analytics, "app_open");
      logEvent(analytics, "landing_page_view");

      // 🔥 ad_click
      const params = new URLSearchParams(window.location.search);
      const gclid = params.get("gclid");

      if (gclid) {
        logEvent(analytics, "ad_click", { gclid });
      }
    }
  }, []);

  return (
    <BrowserRouter>
        <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

    
              <Route path="/initiate" element={<InitiatePayment />} />

              <Route path="/send" element={<SendMoney />} />
        </Routes>
    </BrowserRouter>
  );
}

export default App;