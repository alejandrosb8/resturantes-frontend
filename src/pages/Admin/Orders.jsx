import Layout from '../../layouts/Default';
import {
  Title,
  Text,
  Table,
  Skeleton,
  Flex,
  Modal,
  Box,
  Badge,
  Popover,
  UnstyledButton,
  ScrollArea,
  Select,
  TextInput,
} from '@mantine/core';
import { axiosPrivate } from '../../utils/axios';
import { useEffect, useState, useCallback } from 'react';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronUp, IconChevronDown } from '@tabler/icons-react';

function formatDate(date) {
  const newDate = new Date(date);
  const day = newDate.getDate();
  const month = newDate.getMonth() + 1;
  const year = newDate.getFullYear();
  return `${day}-${month}-${year}`;
}

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

function formatPayment(debt) {
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

function formatDetails(details) {
  if (details) {
    return details;
  } else {
    return 'Sin detalles';
  }
}

function filterDishes(orders, payment, status) {
  console.log(payment, status);
  if (payment === '' && status === '') {
    return orders;
  }
  if (status !== '' && payment === '') {
    if (status === 'status_pending') {
      return orders.filter((order) => order.status === 'pending');
    }
    if (status === 'status_wait') {
      return orders.filter((order) => order.status === 'wait');
    }
    if (status === 'status_delivered') {
      return orders.filter((order) => order.status === 'delivered');
    }
    if (status === 'status_rejected') {
      return orders.filter((order) => order.status === 'rejected');
    }
  }
  if (payment !== '' && status === '') {
    if (payment === 'payment_pending') {
      return orders.filter((order) => order.debt > 0);
    }
    if (payment === 'payment_paid') {
      return orders.filter((order) => order.debt === 0);
    }
  }
  if (payment !== '' && status !== '') {
    if (payment === 'payment_pending' && status === 'status_pending') {
      return orders.filter((order) => order.debt > 0 && order.status === 'pending');
    }
    if (payment === 'payment_pending' && status === 'status_wait') {
      return orders.filter((order) => order.debt > 0 && order.status === 'wait');
    }
    if (payment === 'payment_pending' && status === 'status_delivered') {
      return orders.filter((order) => order.debt > 0 && order.status === 'delivered');
    }
    if (payment === 'payment_pending' && status === 'status_rejected') {
      return orders.filter((order) => order.debt > 0 && order.status === 'rejected');
    }
    if (payment === 'payment_paid' && status === 'status_pending') {
      return orders.filter((order) => order.debt === 0 && order.status === 'pending');
    }
    if (payment === 'payment_paid' && status === 'status_wait') {
      return orders.filter((order) => order.debt === 0 && order.status === 'wait');
    }
    if (payment === 'payment_paid' && status === 'status_delivered') {
      return orders.filter((order) => order.debt === 0 && order.status === 'delivered');
    }
    if (payment === 'payment_paid' && status === 'status_rejected') {
      return orders.filter((order) => order.debt === 0 && order.status === 'rejected');
    }
  }

  return orders;
}

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [ordersFiltered, setOrdersFiltered] = useState('');
  const [ordersFilteredByStatus, setOrdersFilteredByStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const [orderBy, setOrderBy] = useState('');
  const [orderDirection, setOrderDirection] = useState('asc');
  const [finalOrders, setFinalOrders] = useState([]);
  const [search, setSearch] = useState('');

  const { authTokens, setAuthTokens, setUser } = useAuth();
  const navigate = useNavigate();

  // details modal
  const [openedDetails, { open: openDetails, close: closeDetails }] = useDisclosure(false);

  const [orderData, setOrderData] = useState(null);

  const getOrders = useCallback(
    (payment, status) => {
      setLoading(true);

      axiosPrivate(authTokens, setAuthTokens, setUser)
        .get(`/orders`)
        .then((response) => {
          console.log(response.data.data);
          setOrders(filterDishes(response.data.data, payment, status));
          setLoading(false);
        })
        .catch((err) => {
          if (err.response.status === 404) {
            setLoading(false);
          } else {
            setOrders([]);
          }
        });
    },
    [authTokens, setAuthTokens, setUser, navigate],
  );

  const getOrdersFilteredBySearch = useCallback(
    (search) => {
      setFinalOrders(
        orders.filter(
          (order) =>
            order?.code?.toString()?.toLowerCase().includes(search.toLowerCase()) ||
            order?.customer?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
            order?.customer?.dni?.toLowerCase().includes(search.toLowerCase()) ||
            formatDate(order?.createdAt)?.toLowerCase().includes(search.toLowerCase()) ||
            search === '',
        ),
      );
    },
    [orders],
  );

  useEffect(() => {
    getOrders();
  }, []);

  useEffect(() => {
    getOrdersFilteredBySearch(search);
  }, [orders, search, getOrdersFilteredBySearch]);

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
              <Text weight={600}>ID:</Text>
              <Text>{orderData?.code}</Text>
            </Flex>
            <Flex
              justify="space-between"
              sx={{
                borderBottom: '1px solid #EEE',
              }}
            >
              <Text weight={600}>Mesa:</Text>
              <Text>{orderData?.tableDescription}</Text>
            </Flex>

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
              <Text weight={600}>Pago:</Text>
              <Text>{formatPayment(orderData?.debt).text}</Text>
            </Flex>
            <Flex
              justify="space-between"
              sx={{
                borderBottom: '1px solid #EEE',
              }}
            >
              <Text weight={600}>Estado:</Text>
              <Text>{orderData?.status && formatStatus(orderData?.status).text}</Text>
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

            <Flex justify="space-between" pt={20}>
              <Text weight={600}>Platos:</Text>
            </Flex>
            <ScrollArea pt={30}>
              <Table
                striped
                style={{
                  minWidth: '400px',
                }}
              >
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
            </ScrollArea>
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
          label="Filtrar por pago"
          placeholder="Filtrar por pago"
          value={ordersFiltered}
          data={[
            { value: '', label: 'Todos' },
            { value: 'payment_pending', label: 'Pendiente' },
            { value: 'payment_paid', label: 'Pagado' },
          ]}
          onChange={(value) => {
            setOrdersFiltered(value);
            getOrders(value, ordersFilteredByStatus);
            getOrdersFilteredBySearch(search);
          }}
        />

        <Select
          label="Filtrar por estado"
          placeholder="Filtrar por estado"
          mt={10}
          value={ordersFilteredByStatus}
          data={[
            { value: '', label: 'Todos' },
            { value: 'status_pending', label: 'Pendiente' },
            { value: 'status_wait', label: 'En espera' },
            { value: 'status_delivered', label: 'Entregado' },
            { value: 'status_rejected', label: 'Rechazado' },
          ]}
          onChange={(value) => {
            setOrdersFilteredByStatus(value);
            getOrders(ordersFiltered, value);
            getOrdersFilteredBySearch(search);
          }}
        />

        <TextInput
          label="Buscar"
          placeholder="Buscar"
          mt={10}
          mb={10}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
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
            {finalOrders.length <= 0 ? (
              <Text mt={20}>No hay pedidos</Text>
            ) : (
              <ScrollArea>
                <Table striped>
                  <thead>
                    <tr>
                      <th>
                        <UnstyledButton
                          color="gray"
                          ml={5}
                          px={4}
                          variant="outline"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 'md',

                            '&:hover': {
                              color: 'orange',
                              backgroundColor: '#f6f6f6',
                            },
                          }}
                          onClick={() => {
                            setOrderBy('id');
                            setOrderDirection(orderBy === 'id' && orderDirection === 'asc' ? 'desc' : 'asc');

                            setFinalOrders(
                              finalOrders.sort((a, b) => {
                                if (orderDirection === 'asc' && orderBy === 'id') {
                                  return b.code - a.code;
                                } else {
                                  return a.code - b.code;
                                }
                              }),
                            );
                          }}
                        >
                          <Text weight={600} size="md">
                            ID
                          </Text>
                          {orderBy === 'id' && orderDirection === 'asc' ? <IconChevronUp /> : <IconChevronDown />}
                        </UnstyledButton>
                      </th>
                      <th>
                        <UnstyledButton
                          color="gray"
                          ml={5}
                          px={4}
                          variant="outline"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 'md',

                            '&:hover': {
                              color: 'orange',
                              backgroundColor: '#f6f6f6',
                            },
                          }}
                          onClick={() => {
                            setOrderBy('name');
                            setOrderDirection(orderBy === 'name' && orderDirection === 'asc' ? 'desc' : 'asc');
                            setFinalOrders(
                              finalOrders.sort((a, b) => {
                                if (orderDirection === 'asc' && orderBy === 'name') {
                                  return b.customer.fullName.localeCompare(a.customer.fullName);
                                } else {
                                  return a.customer.fullName.localeCompare(b.customer.fullName);
                                }
                              }),
                            );
                          }}
                        >
                          <Text weight={600} size="md">
                            Usuario
                          </Text>
                          {orderBy === 'name' && orderDirection === 'asc' ? <IconChevronUp /> : <IconChevronDown />}
                        </UnstyledButton>
                      </th>
                      <th>
                        <UnstyledButton
                          color="gray"
                          ml={5}
                          px={4}
                          variant="outline"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 'md',

                            '&:hover': {
                              color: 'orange',
                              backgroundColor: '#f6f6f6',
                            },
                          }}
                          onClick={() => {
                            setOrderBy('dni');
                            setOrderDirection(orderBy === 'dni' && orderDirection === 'asc' ? 'desc' : 'asc');
                            setFinalOrders(
                              finalOrders.sort((a, b) => {
                                if (orderDirection === 'asc' && orderBy === 'dni') {
                                  return b.customer[0].dni - a.customer[0].dni;
                                } else {
                                  return a.customer[0].dni - b.customer[0].dni;
                                }
                              }),
                            );
                          }}
                        >
                          <Text weight={600} size="md">
                            DNI
                          </Text>
                          {orderBy === 'dni' && orderDirection === 'asc' ? <IconChevronUp /> : <IconChevronDown />}
                        </UnstyledButton>
                      </th>
                      <th>
                        <UnstyledButton
                          color="gray"
                          ml={5}
                          px={4}
                          variant="outline"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 'md',

                            '&:hover': {
                              color: 'orange',
                              backgroundColor: '#f6f6f6',
                            },
                          }}
                          onClick={() => {
                            setOrderBy('createdAt');
                            setOrderDirection(orderBy === 'createdAt' && orderDirection === 'asc' ? 'desc' : 'asc');
                            setFinalOrders(
                              finalOrders.sort((a, b) => {
                                if (orderDirection === 'asc' && orderBy === 'createdAt') {
                                  return new Date(a.createdAt) - new Date(b.createdAt);
                                } else {
                                  return new Date(b.createdAt) - new Date(a.createdAt);
                                }
                              }),
                            );
                          }}
                        >
                          <Text weight={600} size="md">
                            Fecha
                          </Text>
                          {orderBy === 'createdAt' && orderDirection === 'asc' ? (
                            <IconChevronUp />
                          ) : (
                            <IconChevronDown />
                          )}
                        </UnstyledButton>
                      </th>
                      <th>
                        <Text align="center">Pago</Text>
                      </th>
                      <th>
                        <Text align="center">Estado</Text>
                      </th>
                      <th>
                        <Text align="center">Detalles</Text>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {finalOrders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.code}</td>
                        <td>{order.customer.fullName}</td>
                        <td>{order.customer.dni}</td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>
                          <Badge color={formatPayment(order.debt).color}>{formatPayment(order.debt).text}</Badge>
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
              </ScrollArea>
            )}
          </>
        )}
      </Layout>
    </>
  );
}

export default AdminOrders;
