import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export const PrivateRouteUser = ({ children }) => {
  let { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export const PrivateRouteAdmin = ({ children }) => {
  let { user } = useAuth();

  if (!user || user?.role !== 'admin') {
    return <Navigate to="/admin/login" />;
  }

  return children;
};
