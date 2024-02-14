import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginButton() {
  let navigate = useNavigate();
  const handleClick = () => {
    navigate('/setup');
  };
  return (
    <button className='button-ccsa' id='LoginButton' onClick={handleClick}>Login With CCSA Dashboard</button>
  );
}

function AccessCode() {
    const [name, setName] = useState('');
    const handleInputChange = (event) => {
      setName(event.target.value);
    };
    const handleSubmit = (event) => {
      event.preventDefault();
      console.log('Submitted name:', name);
      // Call API to get login code
    };
  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="name"></label>
      <input
        type="text"
        id="name"
        value={name}
        onChange={handleInputChange}
        placeholder="Enter your name"
      />
      <button type="submit">Submit</button>
    </form>
  );
}

export default function Login() {
  return (
    <div className='scoresheet-default'>
      <h1>CCSA Digital Scoresheet</h1>
      <LoginButton />
      <p>
        OR <br/><br/>
        Enter scorekeeper access code <br/>
        (Team leaders can access this code from Dashboard)
      </p>
      <AccessCode />
    </div>
  )
};
