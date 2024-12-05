import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import './css/wyc.css';
import './css/styles.css';

import { AuthProvider } from './AuthContext';
import PrivateRoute from './PrivateRoute';

import CheckoutForm from './Pages/CheckoutForm';
import Main from './Pages/Main';
import Login from './Pages/Login';
import Logout from './Pages/Logout';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route
            path="/checkout"
            element={<PrivateRoute element=<CheckoutForm /> />}/>
        </Routes>
      </Router>
    </AuthProvider>
  </React.StrictMode>
);
