import { Navbar, NavLink, Button } from '@mantine/core';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const linksData = [
  {
    label: 'Inicio',
    to: '/admin',
    id: 'admin-home',
    idNumber: 0,
  },
  {
    label: 'Mesas',
    to: '/admin/tables',
    id: 'admin-tables',
    idNumber: 1,
  },
  {
    label:'Categoría',
    to:'/admin/categories',
    id:'admin-categories',
    idNumber:2,
  },

  {
    label: 'Platos',
    to: '/admin/dishes',
    id: 'admin-dishes',
    idNumber: 3,
  },
  {
    label: 'Configuración',
    to: '/admin/settings',
    id: 'admin-settings',
    idNumber: 4,
  },
];

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
