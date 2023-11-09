import { Table, Title, Badge, Box, Text, Modal, Popover, UnstyledButton, ScrollArea, Flex } from '@mantine/core';
import useUserTable from '../hooks/useTable';
import { axiosPrivate } from '../utils/axios';
import { useEffect, useState } from 'react';
import Layout from '../layouts/Default';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import LoadingView from '../components/LoadingView';
import SideFixesButtons from '../components/SideFixesButtons';
import { useDisclosure } from '@mantine/hooks';

function formatStatus(status) {
  if (status === 'pending') {
    return {
      color: 'orange',
      text: 'Pendiente',
    };
  } else if (status === 'wait') {
    return {
      color: 'yellow',
      text: 'En espera',
    };
  } else if (status === 'delivered') {
    return {
      color: 'green',
      text: 'Entregado',
    };
  } else if (status === 'rejected') {
    return {
      color: 'red',
      text: 'Rechazado',
    };
  }
}

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
        const currentOrders = response.data.status;
        setOrders(currentOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
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
      <Modal opened={opened} onClose={close} size="xl" title="Detalles de la orden" centered>
        <Flex direction="column" gap={15}>
          <Flex
            justify="space-between"
            sx={{
              borderBottom: '1px solid #DDD',
            }}
          >
            <Text weight={600}>Fecha:</Text>
            <Text>{formatDate(order?.createdAt)}</Text>
          </Flex>
          <Flex
            justify="space-between"
            sx={{
              borderBottom: '1px solid #DDD',
            }}
          >
            <Text weight={600}>Total:</Text>
            <Text>Bs. {Number(order?.total).toFixed(2)}</Text>
          </Flex>
          <Flex
            justify="space-between"
            sx={{
              borderBottom: '1px solid #DDD',
            }}
          >
            <Text weight={600}>Pago:</Text>
            <Text>{order?.debt <= 0 ? 'Pagado' : 'Pendiente'}</Text>
          </Flex>
          {order?.debt > 0 && order?.status !== 'rejected' && (
            <Flex
              justify="space-between"
              sx={{
                borderBottom: '1px solid #DDD',
              }}
            >
              <Text weight={600}>Deuda:</Text>
              <Text>Bs. {Number(order?.debt).toFixed(2)}</Text>
            </Flex>
          )}
          <Flex
            justify="space-between"
            sx={{
              borderBottom: '1px solid #DDD',
            }}
          >
            <Text weight={600}>Estado:</Text>
            <Text>{order?.status && formatStatus(order?.status).text}</Text>
          </Flex>
          {order?.status === 'rejected' && (
            <Flex
              justify="space-between"
              sx={{
                borderBottom: '1px solid #DDD',
              }}
            >
              <Text weight={600}>Motivo de rechazo:</Text>
              <Text>{order?.message || 'Ninguno'}</Text>
            </Flex>
          )}
        </Flex>

        <Text mt={20} weight={600}>
          Articulos:
        </Text>
        <ScrollArea pt={30}>
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
                  <td>Bs. {Number(dish.dish.price).toFixed(2)}</td>
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
        <Title>Historial de pedidos</Title>
        <ScrollArea>
          <Table mt={20}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Total</th>
                <th>
                  <p
                    style={{
                      textAlign: 'center',
                    }}
                  >
                    Pago
                  </p>
                </th>
                <th>
                  <p
                    style={{
                      textAlign: 'center',
                    }}
                  >
                    Estado
                  </p>
                </th>
                <th>Detalles</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map((order) => (
                <tr key={order.id}>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>Bs. {Number(order.total).toFixed(2)}</td>
                  <td>
                    {order.debt <= 0 ? <Badge color="green">Pagado</Badge> : <Badge color="red">Pendiente</Badge>}
                  </td>
                  <td>
                    <Badge color={formatStatus(order.status).color}>{formatStatus(order.status).text}</Badge>
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
                      <Text color="blue">Ver detalles</Text>
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
