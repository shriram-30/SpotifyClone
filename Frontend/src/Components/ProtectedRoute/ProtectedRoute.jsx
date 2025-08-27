import { Children } from 'react';
import {Navigate,Outlet} from 'react-router-dom';

const ProtectedRoute = ({children}) => {
    //check if a token exists in localstorage
    const token = localStorage.getItem('token');
    console.log("token",token);
    const isAuthenticated=!!token;
    if (!isAuthenticated) {
        // if not authenticated redirect to login
        return <Navigate to="/login" />;
    }

    return  children?children: <Outlet />;
};

export default ProtectedRoute;
