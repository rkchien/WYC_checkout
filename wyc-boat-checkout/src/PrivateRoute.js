import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const PrivateRoute = ({ element }) => {
  const { isLoggedIn, isLoading } = useContext(AuthContext);
    
    console.log("logged:", isLoggedIn);
    
    if (isLoading) {
        return <div>Loading...</div>;
    }
    
    return isLoggedIn ? element : <Navigate to="/login" />;
};

export default PrivateRoute;
