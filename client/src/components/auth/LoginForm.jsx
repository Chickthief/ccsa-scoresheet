import React, { useState } from 'react';

function LoginForm({ onLoginSuccess }) {
  const [gameCode, setGameCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // No longer check for a correct password here.
    // Instead, just pass the entered gameCode up to the parent component.
    if (onLoginSuccess) {
        if (gameCode.trim() === "") {
            setError("Please enter a game code.");
        } else {
            setError(""); // Clear previous errors
            onLoginSuccess(gameCode); // Pass the code to App.jsx to handle the API call
        }
    } else {
        console.error("LoginForm Error: onLoginSuccess function not provided.");
    }
  };

  return (
    <div style={{ textAlign: 'center' /* Match iphone-container style */ }}>
      <h1 className="main-title" style={{ marginTop: "20%", marginBottom: "20px" }}>
        CCSA<br/>Digital Scoresheet
      </h1>
      <button className="button-ccsa" style={{ marginBottom: "15px" }} onClick={() => alert("Login with Dashboard clicked!")}>
        Login with CCSA Dashboard
      </button>
      <form className="access-code-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <p className="or-divider" style={{margin: "10px 0"}}>OR</p>
        <label htmlFor="code" className="form-label">Enter scorekeeper access code<br />
          (Team leaders can access this code from Dashboard)
        </label>
        <input
          type="text"
          id="code"
          className="form-control"
          placeholder="Code"
          value={gameCode}
          onChange={(e) => setGameCode(e.target.value.toUpperCase())}
          style={{padding: '10px', width: '80%', maxWidth: '250px'}}
        />
        <button className="button-ccsa" type="submit">
          Submit Code
        </button>
        {error && <p className="feedback-message" style={{ marginTop: "10px", color: error === "Access Granted!" ? 'green' : 'red' }}>{error}</p>}
      </form>
    </div>
  );
}
export default LoginForm;