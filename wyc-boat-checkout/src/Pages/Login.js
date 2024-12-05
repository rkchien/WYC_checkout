import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import axios from 'axios';

import '../css/login.css'

const Login = () => {
  const [enteredWYCNumber, enterWycNumber] = useState('');
  const [enteredPassword, enterPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { local_login } = useContext(AuthContext); 
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading

  const login = async(enteredWYCNumber,enteredPassword) => {
    try {
      const response = await axios.post(`http://localhost:3000/auth/login`, {wycnumber: enteredWYCNumber,password: enteredPassword})
      return response;
    } catch(error) {
        console.error('Error:', error);
      };
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
      
      const response = await login(enteredWYCNumber,enteredPassword);

      if (response && response.status === 200) {
        setError('Login success! Please wait while you are redirected.');
        const user = response.data.user;
        local_login(user);
        navigate(from, { replace: true });
      } else if (response){
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
      <div className="container">
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
    </div>
    )
}

export default Login;