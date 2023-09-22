import { Table, Title, Badge, Box, Text, Modal, Popover, UnstyledButton, ScrollArea } from '@mantine/core';
import useUserTable from '../hooks/useTable';
import { axiosPrivate } from '../utils/axios';
import { useEffect, useState } from 'react';
import Layout from '../layouts/Default';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import LoadingView from '../components/LoadingView';
import SideFixesButtons from '../components/SideFixesButtons';
import { useDisclosure } from '@mantine/hooks';

function Orders() {
  const { table } = useUserTable();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [order, setOrder] = useState(null);
  const [opened, { open, close }] = useDisclosure(false);

  const { authTokens, setAuthTokens, setUser, user } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (!table) {
      return;
    }

    setLoading(true);
    axiosPrivate(authTokens, setAuthTokens, setUser, 'customer')
      .get(`/customers/${user.sub}/orders`)
      .then((response) => {
        setOrders(response.data.status);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        if (error.response.status === 404) {
          setLoading(false);
        } else if (error.response.status === 401) {
          navigate(`/login/${table}`);
        }
      });

    return () => {
      setOrders([]);
    };
  }, [table]);

  if (loading) {
    return <LoadingView />;
  }

  return (
    <>
      {/* Details Modal */}
      <Modal opened={opened} onClose={close} size="xl" title="Platos de la orden" centered>
        <ScrollArea>
          <Table>
            <thead>
              <tr>
                <th>Articulo</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Notas</th>
              </tr>
            </thead>
            <tbody>
              {order?.dishes_orders.map((dish) => (
                <tr key={dish.id}>
                  <td>{dish.dish.name}</td>
                  <td>$ {Number(dish.dish.price).toFixed(2)}</td>
                  <td>
                    <Text>{dish.quantity}</Text>
                  </td>
                  <td>
                    <Popover width={200} position="bottom" withArrow shadow="md">
                      <Popover.Target>
                        <UnstyledButton>
                          <Text size="sm" color="blue">
                            Ver detalles
                          </Text>
                        </UnstyledButton>
                      </Popover.Target>
                      <Popover.Dropdown>
                        <Text size="sm">{dish.details ? dish.details : 'Sin notas'}</Text>
                      </Popover.Dropdown>
                    </Popover>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ScrollArea>
      </Modal>

      <Layout navbarActive="orders" navbar="user" header>
        <Title>Historial de ordenes</Title>
        <ScrollArea>
          <Table mt={20}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Platos</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map((order) => (
                <tr key={order.id}>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>$ {Number(order.total).toFixed(2)}</td>
                  <td>
                    {order.debt <= 0 ? <Badge color="green">Pagado</Badge> : <Badge color="red">Pendiente</Badge>}
                  </td>
                  <td>
                    <Box
                      sx={{
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        console.log(order);
                        setOrder(order);
                        open();
                      }}
                    >
                      <Text color="blue">Ver platos</Text>
                    </Box>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ScrollArea>
      </Layout>
      <SideFixesButtons />
    </>
  );
}

function formatDate(date) {
  const newDate = new Date(date);
  const day = newDate.getDate();
  const month = newDate.getMonth() + 1;
  const year = newDate.getFullYear();
  return `${day}-${month}-${year}`;
}

export default Orders;
