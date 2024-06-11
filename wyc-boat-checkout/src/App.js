import React from 'react';
import { Link } from 'react-router-dom';

const App = () => {
  return (
    <div>
      <h1>Welcome to the WYC Checkout System</h1>
      <nav>
        <Link to="/checkout">Go to Checkout Form</Link>
      </nav>
    </div>
  );
};

export default App;