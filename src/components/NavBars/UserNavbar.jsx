import { Navbar, NavLink, Button } from '@mantine/core';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useTable from '../../hooks/useTable.js';

const linksDataRaw = [
  {
    label: 'Inicio',
    to: '/',
    id: 'home',
  },
  {
    label: 'Ordenes',
    to: '/orders',
    id: 'orders',
  },
  {
    label: 'Pagos',
    to: '/payments',
    id: 'payments',
  },
  {
    label: 'Soporte',
    to: '/support',
    id: 'support',
  },
];

const linksData = linksDataRaw.map((link, index) => ({
  ...link,
  idNumber: index,
}));

function UserNavbar({ opened, currentActive }) {
  const [active, setActive] = useState(
    linksData.filter((data) => currentActive === data.id).map((data) => data.idNumber)[0] || 0,
  );

  const { logout } = useAuth();
  const navigate = useNavigate();

  const { table } = useTable();
  if (!table) {
    return null;
  }
  linksData[0].to = `/${table}`;
  linksData[1].to = `/orders/${table}`;
  linksData[2].to = `/payments/${table}`;
  linksData[3].to = `/support/${table}`;

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
          navigate('/');
        }}
      >
        Cerrar sesión
      </Button>
    </Navbar>
  );
}

export default UserNavbar;
