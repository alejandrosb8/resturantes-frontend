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
            order?.id?.toLowerCase().includes(search.toLowerCase()) ||
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
            <ScrollArea>
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
                                  return b.id.localeCompare(a.id);
                                } else {
                                  return a.id.localeCompare(b.id);
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
                      <th>Estado</th>
                      <th>Detalles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finalOrders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.customer.fullName}</td>
                        <td>{order.customer.dni}</td>
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
              </ScrollArea>
            )}
          </>
        )}
      </Layout>
    </>
  );
}

export default AdminOrders;
