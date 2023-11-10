import { MantineProvider } from '@mantine/core';
import Home from './pages/Home';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/Admin/Login';
import React, { useState } from 'react';
import { AuthContext } from './contexts/AuthContext';
import AdminHome from './pages/Admin/Home';
import AdminTables from './pages/Admin/Tables';
import AdminSettings from './pages/Admin/Settings';
import { PrivateRouteAdmin, PrivateRouteUser } from './utils/PrivateRoute';
import NotQr from './pages/NotQr';
import UserOrder from './pages/Order';
import { DishesPage } from './pages/DishesPage.jsx';
import './App.css';
import AdminDishes from './pages/Admin/Dishes';
import AdminCategories from './pages/Admin/Categories';
import { Notifications } from '@mantine/notifications';
import { DevSupport } from '@react-buddy/ide-toolbox';
import { ComponentPreviews, useInitial } from './dev/index.js';
import Orders from './pages/Orders';
import Payment from './pages/Payment';
import AdminBanks from './pages/Admin/Banks';
import AdminVerifyPayments from './pages/Admin/VerifyPayments';
import AdminOrders from './pages/Admin/Orders';
import AdminPayments from './pages/Admin/Payments';
import Payments from './pages/Payments';
import { ModalsProvider } from '@mantine/modals';
import Support from './pages/Support';
import AdminVerifyOrders from './pages/Admin/VerifyOrders.jsx';
import AdminCustomers from './pages/Admin/Customers.jsx';

export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [authTokens, setAuthTokens] = useState(JSON.parse(localStorage.getItem('tokens')) || null);

  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        // Override any other properties from default theme
        fontFamily: 'Open Sans, sans serif',
        spacing: { xs: '1rem', sm: '1.2rem', md: '1.8rem', lg: '2.2rem', xl: '2.8rem' },
        primaryColor: 'orange',
        headings: { fontFamily: 'Architects Daughter, sans serif' },
      }}
    >
      <Notifications position="top-center" zIndex={5000} />
      <ModalsProvider>
        <AuthContext.Provider value={{ user, setUser, authTokens, setAuthTokens }}>
          <BrowserRouter>
            <DevSupport ComponentPreviews={ComponentPreviews} useInitialHook={useInitial}>
              <Routes>
                <Route path="/" element={<NotQr />} />
                <Route
                  path="/:tableId"
                  element={
                    <PrivateRouteUser>
                      <Home />
                    </PrivateRouteUser>
                  }
                />
                <Route path="/not-qr" element={<NotQr />} />
                <Route
                  path="/support/:tableId"
                  element={
                    <PrivateRouteUser support>
                      <Support />
                    </PrivateRouteUser>
                  }
                />
                <Route path="/login" element={<NotQr />} />
                <Route path="/register" element={<NotQr />} />
                <Route
                  path="/login/:tableId"
                  element={
                    <PrivateRouteUser loginOrRegister>
                      <Login />
                    </PrivateRouteUser>
                  }
                />
                <Route
                  path="/register/:tableId"
                  element={
                    <PrivateRouteUser loginOrRegister>
                      <Register />
                    </PrivateRouteUser>
                  }
                />
                <Route
                  path="/dishes/:tableId"
                  element={
                    <PrivateRouteUser>
                      <DishesPage />
                    </PrivateRouteUser>
                  }
                />
                <Route
                  path="/order/:tableId"
                  element={
                    <PrivateRouteUser>
                      <UserOrder />
                    </PrivateRouteUser>
                  }
                />
                <Route
                  path="/orders/:tableId"
                  element={
                    <PrivateRouteUser>
                      <Orders />
                    </PrivateRouteUser>
                  }
                />
                <Route
                  path="/payment/:tableId"
                  element={
                    <PrivateRouteUser>
                      <Payment />
                    </PrivateRouteUser>
                  }
                />
                <Route
                  path="/payments/:tableId"
                  element={
                    <PrivateRouteUser>
                      <Payments />
                    </PrivateRouteUser>
                  }
                />
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
                <Route
                  path="/admin/dishes"
                  element={
                    <PrivateRouteAdmin>
                      <AdminDishes />
                    </PrivateRouteAdmin>
                  }
                />
                <Route
                  path="/admin/categories"
                  element={
                    <PrivateRouteAdmin>
                      <AdminCategories />
                    </PrivateRouteAdmin>
                  }
                />
                <Route
                  path="/admin/customers"
                  element={
                    <PrivateRouteAdmin>
                      <AdminCustomers />
                    </PrivateRouteAdmin>
                  }
                />
                <Route
                  path="/admin/banks"
                  element={
                    <PrivateRouteAdmin>
                      <AdminBanks />
                    </PrivateRouteAdmin>
                  }
                />
                <Route
                  path="/admin/verify-payments"
                  element={
                    <PrivateRouteAdmin>
                      <AdminVerifyPayments />
                    </PrivateRouteAdmin>
                  }
                />
                <Route
                  path="/admin/verify-orders"
                  element={
                    <PrivateRouteAdmin>
                      <AdminVerifyOrders />
                    </PrivateRouteAdmin>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <PrivateRouteAdmin>
                      <AdminOrders />
                    </PrivateRouteAdmin>
                  }
                />
                <Route
                  path="/admin/payments"
                  element={
                    <PrivateRouteAdmin>
                      <AdminPayments />
                    </PrivateRouteAdmin>
                  }
                />
              </Routes>
            </DevSupport>
          </BrowserRouter>
        </AuthContext.Provider>
      </ModalsProvider>
    </MantineProvider>
  );
}
