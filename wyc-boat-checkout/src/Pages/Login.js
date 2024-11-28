import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

import '../css/login.css'

const Login = () => {
  const [enteredWYCNumber, enterWycNumber] = useState('');
  const [enteredPassword, enterPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/checkouts';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading

  const login = (enteredWYCNumber,enteredPassword) => {
    axios.post(`http://localhost:3000/auth/login`, {wycnumber: enteredWYCNumber,password: enteredPassword})
      .then(response => {
        console.log('Response:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

    try {
      setError(null);
      if (!enteredWYCNumber.trim()) {
        const errorMessage = 'Whoops, you missed your WYC Number. Try again!';
        setError(errorMessage);
        setIsLoading(false); // Stop loading on error
        throw new Error(errorMessage);
      }
      if (!enteredPassword) {
        const errorMessage = 'Whoops, you missed your password. Try again!';
        setError(errorMessage);
        setIsLoading(false); // Stop loading on error
        throw new Error(errorMessage);
      }
      
      const response = login(enteredWYCNumber,enteredPassword);

      if (response && response.status === 200) {
        setError('Login success! Please wait while you are redirected.');
        const { WYCNumber, First, Last, Phone1, Email, Category, image_name } = response.data.user;

        navigate(from, { replace: true });
        window.location.reload();
      } else {
        setError('Login failed. Please try again.');
        setIsLoading(false); // Stop loading on error
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      }
      console.error('Error during login:', error.message);
    }   
  };
  return (
    <div>
      <div className="header">
      <h1>WYC Boat Checkout Form</h1>
      <a href="/" >Return to the main page</a>
      </div>
        <form onSubmit={handleSubmit}>
          <div>
            <label>WYC Number: </label>
            <input
              type="text"
              value={enteredWYCNumber}
              onChange={(e) => enterWycNumber(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <label>Password: </label>
            <input
              type="password"
              value={enteredPassword}
              onChange={(e) => enterPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          {error && <div style={{ color: 'red' }}>{error}</div>}
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
    </div>
    )
}

export default Login;