import { Navbar, NavLink, Button } from '@mantine/core';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const linksDataRaw = [
  {
    label: 'Inicio',
    to: '/admin',
    id: 'admin-home',
  },
  {
    label: 'Verificar pagos',
    to: '/admin/verify-payments',
    id: 'admin-verify-payments',
  },
  {
    label: 'Verificar pedidos',
    to: '/admin/verify-orders',
    id: 'admin-verify-orders',
  },
  {
    label: 'Clientes',
    to: '/admin/customers',
    id: 'admin-customers',
  },
  {
    label: 'Mesas',
    to: '/admin/tables',
    id: 'admin-tables',
  },
  {
    label: 'Categoría',
    to: '/admin/categories',
    id: 'admin-categories',
  },
  {
    label: 'Platos',
    to: '/admin/dishes',
    id: 'admin-dishes',
  },
  {
    label: 'Pedidos',
    to: '/admin/orders',
    id: 'admin-orders',
  },
  {
    label: 'Pagos',
    to: '/admin/payments',
    id: 'admin-payments',
  },
  {
    label: 'Bancos',
    to: '/admin/banks',
    id: 'admin-banks',
  },
  {
    label: 'Configuración',
    to: '/admin/settings',
    id: 'admin-settings',
  },
];

const linksData = linksDataRaw.map((link, index) => ({
  ...link,
  idNumber: index,
}));

function AdminNavbar({ opened, currentActive }) {
  const [active, setActive] = useState(
    linksData.filter((data) => currentActive === data.id).map((data) => data.idNumber)[0] || 0,
  );

  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Navbar p="md" hiddenBreakpoint="sm" hidden={!opened} width={{ sm: 200, lg: 300 }} zIndex={50}>
      {linksData.map((link, index) => (
        <NavLink
          label={link.label}
          key={link.to}
          component={Link}
          to={link.to}
          active={link.idNumber === active}
          onClick={() => setActive(index)}
        />
      ))}
      <Button
        color="red"
        fullWidth
        mt={20}
        onClick={() => {
          logout();
          navigate('/admin/login');
        }}
      >
        Cerrar sesión
      </Button>
    </Navbar>
  );
}

export default AdminNavbar;
