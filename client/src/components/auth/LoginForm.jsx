import React, { useState } from 'react';
import { CORRECT_PASSWORD } from '../../utils/constants'; // Example import

function LoginForm({ onLoginSuccess }) {
  const [accessCode, setAccessCode] = useState("");
  const [message, setMessage] = useState("");

  const handleCodeInputChange = (event) => setAccessCode(event.target.value);

  const handleSubmitAccessCode = (event) => {
    event.preventDefault();
    if (accessCode === CORRECT_PASSWORD) {
      setMessage("Access Granted!");
      onLoginSuccess(); // Call the callback
      if (onLoginSuccess) {
        onLoginSuccess();
        }
    } else {
      setMessage("Incorrect Access Code. Please try again.");
    }
    setAccessCode("");
  };

  return (
    <div style={{ textAlign: 'center' /* Match iphone-container style */ }}>
      <h1 className="main-title" style={{ marginTop: "20%", marginBottom: "20px" }}>
        CCSA<br/>Digital Scoresheet
      </h1>
      <button className="button-ccsa" style={{ marginBottom: "15px" }} onClick={() => alert("Login with Dashboard clicked!")}>
        Login with CCSA Dashboard
      </button>
      <form className="access-code-form" onSubmit={handleSubmitAccessCode} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <p className="or-divider" style={{margin: "10px 0"}}>OR</p>
        <label htmlFor="code" className="form-label">Enter scorekeeper access code<br />
          (Team leaders can access this code from Dashboard)
        </label>
        <input
          type="text"
          id="code"
          className="form-control"
          placeholder="Code"
          value={accessCode}
          onChange={handleCodeInputChange}
          style={{padding: '10px', width: '80%', maxWidth: '250px'}}
        />
        <button className="button-ccsa" type="submit">
          Submit Code
        </button>
        {message && <p className="feedback-message" style={{ marginTop: "10px", color: message === "Access Granted!" ? 'green' : 'red' }}>{message}</p>}
      </form>
    </div>
  );
}
export default LoginForm;