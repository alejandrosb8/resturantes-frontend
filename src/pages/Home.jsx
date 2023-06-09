import React from 'react';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

function Home() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div>
      <h1>Home</h1>
      <button
        onClick={() => {
          logout();
          navigate('/login');
        }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}

export default Home;
