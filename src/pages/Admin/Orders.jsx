import Layout from '../../layouts/Default';
import {
  Title,
  Text,
  Table,
  Skeleton,
  Flex,
  Modal,
  Divider,
  Box,
  Badge,
  Popover,
  UnstyledButton,
  ScrollArea,
  Select,
} from '@mantine/core';
import { axiosPrivate } from '../../utils/axios';
import { useEffect, useState, useCallback } from 'react';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';

function formatStatus(debt) {
  if (debt > 0) {
    return {
      color: 'red',
      text: 'Pendiente',
    };
  } else {
    return {
      color: 'green',
      text: 'Pagado',
    };
  }
}

function formatDate(date) {
  const newDate = new Date(date);
  const day = newDate.getDate();
  const month = newDate.getMonth() + 1;
  const year = newDate.getFullYear();
  return `${day}-${month}-${year}`;
}

function formatDetails(details) {
  if (details) {
    return details;
  } else {
    return 'Sin detalles';
  }
}

function filterDishes(orders, status) {
  return orders.filter((order) => {
    if (status === '') {
      return true;
    } else if (status === 'pending') {
      return order.debt > 0;
    } else if (status === 'paid') {
      return order.debt <= 0;
    }
  });
}

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [ordersFiltered, setOrdersFiltered] = useState('');
  const [loading, setLoading] = useState(true);
  const { authTokens, setAuthTokens, setUser } = useAuth();
  const navigate = useNavigate();

  // details modal
  const [openedDetails, { open: openDetails, close: closeDetails }] = useDisclosure(false);

  const [orderData, setOrderData] = useState(null);

  const getOrders = useCallback(
    (status) => {
      setLoading(true);

      axiosPrivate(authTokens, setAuthTokens, setUser)
        .get(`/orders`)
        .then((response) => {
          setOrders(filterDishes(response.data.data, status || ordersFiltered));
          setLoading(false);
        })
        .catch((err) => {
          if (err.response.status === 404) {
            setLoading(false);
          } else {
            navigate('/admin/login');
          }
        });
    },
    [authTokens, setAuthTokens, setUser, navigate],
  );

  useEffect(() => {
    getOrders();
  }, []);

  return (
    <>
      {/* Modals */}

      {/* Details Modal */}

      <Modal
        opened={openedDetails}
        onClose={() => {
          closeDetails();
        }}
        title="Detalles de la orden"
        size="xl"
        zIndex={500}
      >
        <ScrollArea>
          <Flex direction="column" gap={15}>
            <Flex
              justify="space-between"
              sx={{
                borderBottom: '1px solid #EEE',
              }}
            >
              <Text weight={600}>Usuario:</Text>
              <Text>{orderData?.customer?.fullName}</Text>
            </Flex>
            <Flex
              justify="space-between"
              sx={{
                borderBottom: '1px solid #EEE',
              }}
            >
              <Text weight={600}>Fecha:</Text>
              <Text>{formatDate(orderData?.createdAt)}</Text>
            </Flex>
            <Flex
              justify="space-between"
              sx={{
                borderBottom: '1px solid #EEE',
              }}
            >
              <Text weight={600}>Estado:</Text>
              <Text>{formatStatus(orderData?.debt).text}</Text>
            </Flex>
            <Flex
              justify="space-between"
              sx={{
                borderBottom: '1px solid #EEE',
              }}
            >
              <Text weight={600}>Total:</Text>
              <Text>$ {Number(orderData?.total).toFixed(2)}</Text>
            </Flex>
            <Flex
              justify="space-between"
              sx={{
                borderBottom: '1px solid #EEE',
              }}
            >
              <Text weight={600}>Deuda</Text>
              <Text>$ {Number(orderData?.debt).toFixed(2)}</Text>
            </Flex>

            <Flex justify="space-between">
              <Text weight={600}>Platos:</Text>
            </Flex>
            <Table striped>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Notas</th>
                </tr>
              </thead>
              <tbody>
                {orderData?.dishes_orders?.map((dish) => (
                  <tr key={dish.dish.id}>
                    <td>{dish.dish.name}</td>
                    <td>{dish.quantity}</td>
                    <td>$ {Number(dish.dish.price).toFixed(2)}</td>
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
                          <Text size="sm">{formatDetails(dish.details)}</Text>
                        </Popover.Dropdown>
                      </Popover>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Flex>
        </ScrollArea>
      </Modal>

      {/* Main Page */}

      <Layout navbar="admin" navbarActive="admin-orders" header>
        <Title order={1}>Pedidos</Title>
        <Text mt={20} mb={10}>
          Lista de pedidos
        </Text>

        <Select
          label="Filtrar por estado"
          placeholder="Filtrar por estado"
          value={ordersFiltered}
          data={[
            { value: '', label: 'Todos' },
            { value: 'pending', label: 'Pendiente' },
            { value: 'paid', label: 'Pagado' },
          ]}
          onChange={(value) => {
            setOrdersFiltered(value);
            getOrders(value);
          }}
        />

        {loading ? (
          <>
            <Skeleton height={50} mt={15} radius="sm" />
            <Skeleton height={50} mt={6} radius="sm" />
            <Skeleton height={50} mt={6} radius="sm" />
            <Skeleton height={50} mt={6} radius="sm" />
            <Skeleton height={30} mt={6} radius="sm" />
          </>
        ) : (
          <>
            <Divider />
            {orders.length <= 0 ? (
              <Text mt={20}>No hay pedidos</Text>
            ) : (
              <Table striped>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Usuario</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Detalles</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.customer.fullName}</td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>
                        <Badge color={formatStatus(order.debt).color}>{formatStatus(order.debt).text}</Badge>
                      </td>
                      <td>
                        <Box
                          sx={{
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            setOrderData(order);
                            openDetails();
                          }}
                        >
                          <Text color="blue">Ver detalles</Text>
                        </Box>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </>
        )}
      </Layout>
    </>
  );
}

export default AdminOrders;
