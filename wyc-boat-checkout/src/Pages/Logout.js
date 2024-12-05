import React, { useState, useContext, useEffect } from 'react';
import { useNavigate} from 'react-router-dom';
import { AuthContext } from '../AuthContext';

function Logout() {
    const { local_logout } = useContext(AuthContext); 
    const navigate = useNavigate();
    
    useEffect(() => {
        local_logout();
        navigate('/', { replace: true });
    });
    
    return (
        <div>
            Logout Page
        </div>
    )
}

export default Logout;