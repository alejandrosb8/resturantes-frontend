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
  let role = null;
  try {
    role = JSON.parse(user);
  } catch (error) {
    console.log(error);
  }

  if (role) {
    role = role.role;
  } else {
    role = null;
  }

  if (role !== 'admin' || !user) {
    return <Navigate to="/admin/login" />;
  }

  return children;
};
