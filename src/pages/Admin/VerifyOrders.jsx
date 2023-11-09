import Layout from '../../layouts/Default';
import {
  Title,
  Text,
  Table,
  Button,
  Skeleton,
  Flex,
  Modal,
  Select,
  Box,
  ScrollArea,
  Popover,
  UnstyledButton,
  TextInput,
  Badge,
} from '@mantine/core';
import { axiosPrivate } from '../../utils/axios';
import { useEffect, useState, useCallback } from 'react';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';

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

function AdminVerifyOrders() {
  const [modalLoading, setModalLoading] = useState(false);
  const { authTokens, setAuthTokens, setUser } = useAuth();
  const navigate = useNavigate();

  // details modal
  const [openedDetails, { open: openDetails, close: closeDetails }] = useDisclosure(false);

  // confirm modal
  const [openedConfirm, { open: openConfirm, close: closeConfirm }] = useDisclosure(false);

  const [orders, setOrders] = useState([]);
  const [ordersFiltered, setOrdersFiltered] = useState('');
  const [loading, setLoading] = useState(true);

  const [orderBy, setOrderBy] = useState('');
  const [orderDirection, setOrderDirection] = useState('asc');
  const [finalOrders, setFinalOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [currentAction, setCurrentAction] = useState(null);

  const getOrders = useCallback(
    (query, withoutLoading) => {
      if (!withoutLoading) {
        setLoading(true);
      }

      axiosPrivate(authTokens, setAuthTokens, setUser)
        .get('/orders')
        .then((response) => {
          setOrders(response.data.data);
          console.log(response.data.data);

          setLoading(false);
        })
        .catch((err) => {
          if (err?.response?.status === 404) {
            setLoading(false);
          } else {
            setOrders([]);
          }
        });
    },
    [authTokens, setAuthTokens, setUser, navigate],
  );

  const getOrdersFilteredBySearch = useCallback(() => {
    console.log(orders);
    setFinalOrders(
      orders
        .filter((order) => order.status === ordersFiltered || ordersFiltered === '' || !ordersFiltered)
        .filter((order) => order.status !== 'delivered' && order.status !== 'rejected')
        .sort((a, b) => {
          if (orderBy) {
            if (orderBy === 'createdAt') {
              if (orderDirection === 'asc') {
                return new Date(a.createdAt) - new Date(b.createdAt);
              } else {
                return new Date(b.createdAt) - new Date(a.createdAt);
              }
            }
            if (orderBy === 'id') {
              if (orderDirection === 'asc') {
                return b.code - a.code;
              } else {
                return a.code - b.code;
              }
            }
            if (orderBy === 'table') {
              if (orderDirection === 'asc') {
                return b.tableDescription.localeCompare(a.tableDescription);
              } else {
                return a.tableDescription.localeCompare(b.tableDescription);
              }
            }

            if (orderBy === 'name') {
              if (orderDirection === 'asc') {
                return b.customer.fullName.localeCompare(a.customer.fullName);
              } else {
                return a.customer.fullName.localeCompare(b.customer.fullName);
              }
            }
            if (orderBy === 'dni') {
              if (orderDirection === 'asc') {
                return b.customer.dni - a.customer.dni;
              } else {
                return a.customer.dni - b.customer.dni;
              }
            }
            if (orderBy === 'amount') {
              if (orderDirection === 'asc') {
                return b.amount - a.amount;
              } else {
                return a.amount - b.amount;
              }
            }
          } else {
            return;
          }
        })
        .filter(
          (order) =>
            order?.id?.toLowerCase().includes(search.toLowerCase()) ||
            order?.customer?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
            order?.customer?.dni?.toLowerCase().includes(search.toLowerCase()) ||
            order?.amount?.toString()?.toLowerCase().includes(search.toLowerCase()) ||
            formatDate(order?.createdAt)?.toLowerCase().includes(search.toLowerCase()) ||
            search === '',
        ),
    );
  }, [orders, orderBy, orderDirection, search]);

  useEffect(() => {
    getOrdersFilteredBySearch(search);
  }, [orders, search, getOrdersFilteredBySearch]);

  const verifyPayment = (id, action) => {
    setLoading(true);
    setModalLoading(true);

    console.log(id, action);

    axiosPrivate(authTokens, setAuthTokens, setUser)
      .patch(`/orders/${id}`, {
        status: action,
      })
      .then(() => {
        setModalLoading(false);
        getOrders('pending');
        closeConfirm();
        closeDetails();

        if (action === 'rejected') {
          notifications.show({
            title: 'Pedido rechazado',
            message: 'El pedido fue rechazado',
            color: 'red',
          });
        }
        if (action === 'wait') {
          notifications.show({
            title: 'Pedido aceptado',
            message: 'El pedido fue aceptado',
            color: 'green',
          });
        }
        if (action === 'delivered') {
          notifications.show({
            title: 'Pedido entregado',
            message: 'El pedido fue entregado',
            color: 'green',
          });
        }
      })
      .catch(() => {
        setModalLoading(false);
        closeDetails();
        notifications.show({
          title: 'Error',
          message: 'Ocurrió un error con el pago',
          color: 'red',
        });
      });
  };

  useEffect(() => {
    getOrders('pending');

    //create interval to get new payments every 5 seconds
    const interval = setInterval(() => {
      console.log('Getting new payments...');
      getOrders('pending', true);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {/* Modals */}

      {/* Details Modal */}

      <Modal
        opened={openedDetails}
        onClose={() => {
          setOrderDetails(null);

          closeDetails();
        }}
        title="Detalles del pago"
        size="lg"
      >
        <ScrollArea>
          <Flex direction="column" gap={15}>
            <Flex
              direction="column"
              gap={15}
              sx={{
                width: '100%',
              }}
            >
              <Flex
                justify="space-between"
                sx={{
                  borderBottom: '1px solid #DDD',
                }}
              >
                <Text weight={600}>Fecha:</Text>
                <Text>{formatDate(orderDetails?.createdAt)}</Text>
              </Flex>
              <Flex
                justify="space-between"
                sx={{
                  borderBottom: '1px solid #DDD',
                }}
              >
                <Text weight={600}>Total:</Text>
                <Text>$ {Number(orderDetails?.total).toFixed(2)}</Text>
              </Flex>
              <Flex
                justify="space-between"
                sx={{
                  borderBottom: '1px solid #DDD',
                }}
              >
                <Text weight={600}>Deuda:</Text>
                <Text>{orderDetails?.debt}</Text>
              </Flex>
              <Text pt={20}>
                <Text weight={600}>Platos:</Text>
              </Text>
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
                    <th>Detalles</th>
                  </tr>
                </thead>
                <tbody>
                  {orderDetails?.dishes_orders?.map((dish) => (
                    <tr key={dish.id}>
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
                            <Text size="sm">{dish.details ? dish.details : 'Sin detalles'}</Text>
                          </Popover.Dropdown>
                        </Popover>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </ScrollArea>

            <Flex justify="flex-end">
              <Button
                color="red"
                variant="outline"
                onClick={() => {
                  setCurrentAction('rejected');
                  openConfirm();
                }}
                loading={modalLoading}
              >
                Rechazar
              </Button>
              <Button
                color="green"
                ml={10}
                onClick={() => {
                  setCurrentAction(() => {
                    console.log(orderDetails);
                    if (orderDetails.status === 'pending') {
                      return 'wait';
                    } else {
                      return 'delivered';
                    }
                  });
                  openConfirm();
                }}
                loading={modalLoading}
              >
                {orderDetails?.status === 'pending' ? 'Aceptar pedido' : 'Marcar como entregado'}
              </Button>
            </Flex>
          </Flex>
        </ScrollArea>
      </Modal>

      {/* Confirm Modal */}
      <Modal
        opened={openedConfirm}
        onClose={() => {
          closeConfirm();
        }}
        title="Confirmar acción"
      >
        <Text size="sm" mt={0} mb={30}>
          {currentAction === 'rejected'
            ? '¿Está seguro que desea rechazar el pedido?'
            : currentAction === 'wait'
            ? '¿Está seguro que desea aceptar el pedido?'
            : currentAction === 'delivered'
            ? '¿Está seguro que desea marcar el pedido como entregado?'
            : ''}
        </Text>

        <Flex justify="flex-end">
          <Button variant="outline" onClick={closeConfirm} color="red">
            Cancelar
          </Button>
          <Button
            color="orange"
            ml={10}
            loading={modalLoading}
            onClick={() => verifyPayment(orderDetails?.id, currentAction)}
          >
            Confirmar
          </Button>
        </Flex>
      </Modal>

      {/* Main Page */}

      <Layout navbar="admin" navbarActive="admin-verify-orders" header>
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
            { value: 'wait', label: 'En espera' },
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
                            setOrderBy('table');
                            setOrderDirection(orderBy === 'table' && orderDirection === 'asc' ? 'desc' : 'asc');
                            setFinalOrders(
                              finalOrders.sort((a, b) => {
                                if (orderDirection === 'asc' && orderBy === 'table') {
                                  return b.amount - a.amount;
                                } else {
                                  return a.amount - b.amount;
                                }
                              }),
                            );
                          }}
                        >
                          <Text weight={600} size="md">
                            Mesa
                          </Text>
                          {orderBy === 'table' && orderDirection === 'asc' ? <IconChevronUp /> : <IconChevronDown />}
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
                        <td>{order.tableDescription}</td>
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
                              console.log(order);
                              setOrderDetails(order);
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

export default AdminVerifyOrders;
