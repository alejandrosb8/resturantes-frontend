import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import Home from './pages/Home';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/Admin/Login';
import { useState } from 'react';
import { AuthContext } from './contexts/AuthContext';
import AdminHome from './pages/Admin/Home';
import AdminTables from './pages/Admin/Tables';
import AdminSettings from './pages/Admin/Settings';
import { PrivateRouteAdmin, PrivateRouteUser } from './utils/PrivateRoute';

export default function App() {
  const [user, setUser] = useState(localStorage.getItem('user') || null);
  const [authTokens, setAuthTokens] = useState(localStorage.getItem('tokens') || null);

  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        // Override any other properties from default theme
        fontFamily: 'Open Sans, sans serif',
        spacing: { xs: '1rem', sm: '1.2rem', md: '1.8rem', lg: '2.2rem', xl: '2.8rem' },
        primaryColor: 'orange',
      }}
    >
      <AuthContext.Provider value={{ user, setUser, authTokens, setAuthTokens }}>
        <ModalsProvider>
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRouteUser>
                  <Home />
                </PrivateRouteUser>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/admin"
              element={
                <PrivateRouteAdmin>
                  <AdminHome />
                </PrivateRouteAdmin>
              }
            />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/tables"
              element={
                <PrivateRouteAdmin>
                  <AdminTables />
                </PrivateRouteAdmin>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <PrivateRouteAdmin>
                  <AdminSettings />
                </PrivateRouteAdmin>
              }
            />
          </Routes>
        </ModalsProvider>
      </AuthContext.Provider>
    </MantineProvider>
  );
}
