import { useState, useEffect } from "react";
import { db, auth, analytics, logEvent } from "../firebase";
import {
  addDoc,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";

export default function SendMoney() {
  const [amount, setAmount] = useState("");
  const [to, setTo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = async () => {
    const user = auth.currentUser;

    const sentQuery = query(
      collection(db, "transactions"),
      where("from", "==", user.uid)
    );

    const receivedQuery = query(
      collection(db, "transactions"),
      where("to", "==", user.uid)
    );

    const [sentSnap, receivedSnap] = await Promise.all([
      getDocs(sentQuery),
      getDocs(receivedQuery)
    ]);

    const sent = sentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const received = receivedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const all = [...sent, ...received].sort(
      (a, b) => b.createdAt.seconds - a.createdAt.seconds
    );

    setTransactions(all);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handlePay = async () => {
    const user = auth.currentUser;

    if (!user) {
      alert("User not logged in");
      return;
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert("Enter valid amount");
      return;
    }

    if (!to) {
      alert("Enter receiver email");
      return;
    }

    if (!paymentMethod) {
      if (analytics) {
        logEvent(analytics, "payment_failed", {
          reason: "payment_method_not_selected"
        });
      }

      await addDoc(collection(db, "transactions"), {
        from: user.uid,
        fromEmail: user.email,
        toEmail: to,
        amount: Number(amount),
        paymentMethod: "not_selected",
        status: "failed",
        createdAt: new Date()
      });

      alert("Please select payment method");
      return;
    }

    if (analytics) {
      logEvent(analytics, "payment_initiated", {
        amount: Number(amount),
        method: paymentMethod
      });
    }

    try {
      const userQuery = query(
        collection(db, "users"),
        where("email", "==", to)
      );

      const userSnap = await getDocs(userQuery);

      if (userSnap.empty) {
        alert("Receiver not registered");
        return;
      }

      const receiverId = userSnap.docs[0].id;

      await addDoc(collection(db, "transactions"), {
        from: user.uid,
        fromEmail: user.email,
        to: receiverId,
        toEmail: to,
        amount: Number(amount),
        paymentMethod,
        status: "success",
        createdAt: new Date()
      });

      if (analytics) {
        logEvent(analytics, "payment_success", {
          amount: Number(amount),
          method: paymentMethod
        });
      }

      alert("Payment done");

      fetchTransactions();

      setAmount("");
      setTo("");
      setPaymentMethod("");

    } catch (error) {
      console.error(error);

      if (analytics) {
        logEvent(analytics, "payment_failed", {
          error: error.message
        });
      }

      await addDoc(collection(db, "transactions"), {
        from: user.uid,
        fromEmail: user.email,
        toEmail: to,
        amount: Number(amount),
        paymentMethod: paymentMethod || "unknown",
        status: "failed",
        createdAt: new Date()
      });

      alert(error.message);
    }
  };

  // 🔥 UPDATED CANCEL LOGIC (MAIN CHANGE)
       const handleCancel = async () => {
  const user = auth.currentUser;

  const isEmailValid = to && to.trim() !== "";
  const isAmountValid = amount && Number(amount) > 0;
  const isMethodSelected = paymentMethod && paymentMethod !== "";

  // ✅ DROP OFF CASE
  if (isEmailValid && isAmountValid && isMethodSelected) {
    if (analytics) {
      logEvent(analytics, "drop_off_stage", {
        stage: "payment_cancelled_after_complete_input"
      });
    }
    return;
  }

  // ❌ PAYMENT FAILED CASE
  if (analytics) {
    logEvent(analytics, "payment_failed", {
      reason: "cancel_with_incomplete_input"
    });
  }

  if (user) {
    await addDoc(collection(db, "transactions"), {
      from: user.uid,
      fromEmail: user.email,
      toEmail: to || "not_entered",
      amount: Number(amount) || 0,
      paymentMethod: paymentMethod || "not_selected",
      status: "failed",
      createdAt: new Date()
    });
  }

  // 🔥 THIS LINE WAS MISSING
  fetchTransactions();

  // optional: clear inputs
  setAmount("");
  setTo("");
  setPaymentMethod("");
};

  return (
  <div className="app-container">

    <div className="header">
      <h2>Send Money</h2>
    </div>

    <div className="card">

      <input
        className="input"
        placeholder="Receiver Email"
        value={to}
        onChange={(e)=>setTo(e.target.value)}
      />

      <input
        className="input"
        placeholder="Amount"
        value={amount}
        onChange={(e)=>setAmount(e.target.value)}
      />

      <h4>Select Payment Method</h4>

      <div
        className={`payment-option ${paymentMethod==="credit" ? "active" : ""}`}
        onClick={()=>setPaymentMethod("credit")}
      >
        💳 Credit Card
      </div>

      <div
        className={`payment-option ${paymentMethod==="debit" ? "active" : ""}`}
        onClick={()=>setPaymentMethod("debit")}
      >
        💳 Debit Card
      </div>

      <div
        className={`payment-option ${paymentMethod==="upi" ? "active" : ""}`}
        onClick={()=>setPaymentMethod("upi")}
      >
        📱 UPI
      </div>

      <button className="primary-btn" onClick={handlePay}>
        Pay Now
      </button>

      <button className="secondary-btn" onClick={handleCancel}>
        Cancel
      </button>
    </div>

    <div className="card">
      <h3>Transactions</h3>

      <table className="table">
        <thead>
          <tr>
            <th>Type</th>
            <th>User</th>
            <th>Amt</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((txn) => {
            const isSent = txn.from === auth.currentUser.uid;

            return (
              <tr key={txn.id}>
                <td>{isSent ? "Sent" : "Recv"}</td>
                <td>{isSent ? txn.toEmail : txn.fromEmail}</td>
                <td>₹{txn.amount}</td>
                <td>{txn.status}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

  </div>
);
}