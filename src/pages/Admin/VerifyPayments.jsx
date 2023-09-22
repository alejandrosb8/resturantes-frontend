import Layout from '../../layouts/Default';
import {
  Title,
  Text,
  Table,
  Button,
  Skeleton,
  Flex,
  Modal,
  Image,
  Divider,
  Box,
  ScrollArea,
  Accordion,
  Center,
  Popover,
  UnstyledButton,
  TextInput,
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

function formatPaymentType(type) {
  switch (type) {
    case 'cash':
      return 'Efectivo';
    case 'card':
      return 'Tarjeta';
    case 'transfer':
      return 'Transferencia';
    default:
      return 'Desconocido';
  }
}

function AdminVerifyPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const { authTokens, setAuthTokens, setUser } = useAuth();
  const navigate = useNavigate();

  // details modal
  const [openedDetails, { open: openDetails, close: closeDetails }] = useDisclosure(false);

  // confirm modal
  const [openedConfirm, { open: openConfirm, close: closeConfirm }] = useDisclosure(false);

  const [paymentId, setPaymentId] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [bank, setBank] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [currentAction, setCurrentAction] = useState(null);

  const [orderBy, setOrderBy] = useState('');
  const [orderDirection, setOrderDirection] = useState('asc');
  const [finalOrders, setFinalOrders] = useState([]);
  const [search, setSearch] = useState('');

  const getPayments = useCallback(
    (query, withoutLoading) => {
      if (!withoutLoading) {
        setLoading(true);
      }

      const requestUrl = query ? `/payments?status=${query}` : '/payments';

      axiosPrivate(authTokens, setAuthTokens, setUser)
        .get(requestUrl)
        .then((response) => {
          setPayments(response.data.data);

          setLoading(false);
        })
        .catch((err) => {
          if (err?.response?.status === 404) {
            setLoading(false);
          } else {
            setPayments([]);
          }
        });
    },
    [authTokens, setAuthTokens, setUser, navigate],
  );

  const getPaymentsFilteredBySearch = useCallback(() => {
    console.log('Getting payments filtered by search...');
    setFinalOrders(
      payments
        .sort((a, b) => {
          if (orderBy) {
            if (orderBy === 'createdAt') {
              if (orderDirection === 'asc') {
                return new Date(a.createdAt) - new Date(b.createdAt);
              } else {
                return new Date(b.createdAt) - new Date(a.createdAt);
              }
            }
            if (orderBy === 'name') {
              if (orderDirection === 'asc') {
                return b.customer[0].fullName.localeCompare(a.customer[0].fullName);
              } else {
                return a.customer[0].fullName.localeCompare(b.customer[0].fullName);
              }
            }
            if (orderBy === 'dni') {
              if (orderDirection === 'asc') {
                return b.customer[0].dni - a.customer[0].dni;
              } else {
                return a.customer[0].dni - b.customer[0].dni;
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
            order?.customer[0]?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
            order?.customer?.dni?.toLowerCase().includes(search.toLowerCase()) ||
            order?.amount?.toString()?.toLowerCase().includes(search.toLowerCase()) ||
            formatDate(order?.createdAt)?.toLowerCase().includes(search.toLowerCase()) ||
            search === '',
        ),
    );
  }, [payments, orderBy, orderDirection, search]);

  useEffect(() => {
    getPaymentsFilteredBySearch(search);
  }, [payments, search, getPaymentsFilteredBySearch]);

  const getBank = useCallback(
    (id) => {
      setModalLoading(true);
      if (!id) {
        setModalLoading(false);
        return;
      }

      axiosPrivate(authTokens, setAuthTokens, setUser)
        .get(`/banks/${id}`)
        .then((response) => {
          setBank(response.data.data);
        })
        .catch((err) => {
          if (err.response.status === 404) {
            setModalLoading(false);
          } else {
            setBank(null);
          }
        });
    },
    [authTokens, setAuthTokens, setUser, navigate],
  );

  const getOrder = useCallback(
    (id) => {
      setModalLoading(true);
      if (!id) {
        setModalLoading(false);
        return;
      }

      axiosPrivate(authTokens, setAuthTokens, setUser)
        .get(`/orders/${id}`)
        .then((response) => {
          setCurrentOrder(response.data.data);
          setModalLoading(false);
        })
        .catch((err) => {
          if (err.response.status === 404) {
            setModalLoading(false);
          } else {
            setCurrentOrder(null);
          }
        });
    },
    [authTokens, setAuthTokens, setUser, navigate],
  );

  const verifyPayment = (id, action) => {
    setLoading(true);
    setModalLoading(true);

    axiosPrivate(authTokens, setAuthTokens, setUser)
      .patch(`/payments/${id}`, {
        status: action,
      })
      .then(() => {
        setModalLoading(false);
        getPayments('pending');
        closeConfirm();
        closeDetails();

        if (action === 'approved') {
          notifications.show({
            title: 'Pago aprobado',
            message: 'El pago se aprobó correctamente',
            color: 'teal',
          });
        } else {
          notifications.show({
            title: 'Pago rechazado',
            message: 'El pago se rechazó correctamente',
            color: 'orange',
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
    getPayments('pending');

    //create interval to get new payments every 5 seconds
    const interval = setInterval(() => {
      console.log('Getting new payments...');
      getPayments('pending', true);
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
          setPaymentId(null);
          setPaymentDetails(null);
          setBank(null);
          setCurrentOrder(null);
          setCurrentAction(null);

          closeDetails();
        }}
        title="Detalles del pago"
        size="lg"
      >
        <ScrollArea>
          <Flex direction="column" gap={15}>
            <Flex
              justify="space-between"
              sx={{
                borderBottom: '1px solid #DDD',
              }}
            >
              <Text weight={600}>Fecha:</Text>
              <Text>{formatDate(paymentDetails?.createdAt)}</Text>
            </Flex>
            <Flex
              justify="space-between"
              sx={{
                borderBottom: '1px solid #DDD',
              }}
            >
              <Text weight={600}>Usuario:</Text>
              <Text>{paymentDetails?.customer[0].fullName}</Text>
            </Flex>
            <Flex
              justify="space-between"
              sx={{
                borderBottom: '1px solid #DDD',
              }}
            >
              <Text weight={600}>Monto:</Text>
              <Text>$ {Number(paymentDetails?.amount).toFixed(2)}</Text>
            </Flex>
            <Flex
              justify="space-between"
              sx={{
                borderBottom: '1px solid #DDD',
              }}
            >
              <Text weight={600}>DNI:</Text>
              <Text>{paymentDetails?.dni}</Text>
            </Flex>
            <Flex
              justify="space-between"
              sx={{
                borderBottom: '1px solid #DDD',
              }}
            >
              <Text weight={600}>Tipo de pago:</Text>
              <Text>{formatPaymentType(paymentDetails?.type)}</Text>
            </Flex>
            {paymentDetails?.type === 'transfer' && (
              <>
                <Flex
                  justify="space-between"
                  sx={{
                    borderBottom: '1px solid #DDD',
                  }}
                >
                  <Text weight={600}>Banco:</Text>
                  <Text>{bank?.name}</Text>
                </Flex>
                <Flex
                  justify="space-between"
                  sx={{
                    borderBottom: '1px solid #DDD',
                  }}
                >
                  <Text weight={600}>Número de referencia:</Text>
                  <Text>{paymentDetails?.reference}</Text>
                </Flex>
                <Text>
                  <Text weight={600}>Imagen de la transacción:</Text>
                </Text>
                <Center>
                  <Image
                    src={paymentDetails?.voucherUrl}
                    alt="Imagen de la transacción"
                    sx={{
                      maxWidth: '400px',
                    }}
                  />
                </Center>
              </>
            )}

            <Divider />

            <Accordion defaultValue={null}>
              <Accordion.Item value="orderDetails">
                <Accordion.Control>Detalles de la orden</Accordion.Control>
                <Accordion.Panel
                  sx={{
                    padding: '0px',
                    width: '100%',
                  }}
                >
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
                      <Text>{formatDate(currentOrder?.createdAt)}</Text>
                    </Flex>
                    <Flex
                      justify="space-between"
                      sx={{
                        borderBottom: '1px solid #DDD',
                      }}
                    >
                      <Text weight={600}>Total:</Text>
                      <Text>$ {Number(currentOrder?.total).toFixed(2)}</Text>
                    </Flex>
                    <Flex
                      justify="space-between"
                      sx={{
                        borderBottom: '1px solid #DDD',
                      }}
                    >
                      <Text weight={600}>Deuda:</Text>
                      <Text>{currentOrder?.debt}</Text>
                    </Flex>
                    <Text>
                      <Text weight={600}>Platos:</Text>
                    </Text>
                  </Flex>
                  <ScrollArea>
                    <Table striped>
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Cantidad</th>
                          <th>Precio</th>
                          <th>Detalles</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentOrder?.dishes_orders?.map((dish) => (
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
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>

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
                  setCurrentAction('approved');
                  openConfirm();
                }}
                loading={modalLoading}
              >
                Validar
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
        {currentAction === 'approved' ? (
          <Text size="sm" mt={0} mb={30}>
            ¿Estás seguro de que quieres aprobar el pago?
          </Text>
        ) : (
          <Text size="sm" mt={0} mb={30}>
            ¿Estás seguro de que quieres rechazar el pago?
          </Text>
        )}

        <Flex justify="flex-end">
          <Button variant="outline" onClick={closeConfirm} color="red">
            Cancelar
          </Button>
          <Button color="orange" ml={10} loading={modalLoading} onClick={() => verifyPayment(paymentId, currentAction)}>
            Confirmar
          </Button>
        </Flex>
      </Modal>

      {/* Main Page */}

      <Layout navbar="admin" navbarActive="admin-verify-payments" header>
        <Title order={1}>Verificar pagos</Title>
        <Text mt={20} mb={10}>
          Lista de pagos pendientes
        </Text>

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
            {payments.length <= 0 ? (
              <Text mt={20}>No hay pagos pendientes</Text>
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
                                  return b.customer[0].fullName.localeCompare(a.customer[0].fullName);
                                } else {
                                  return a.customer[0].fullName.localeCompare(b.customer[0].fullName);
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
                                  return b.customer[0].dni.localeCompare(a.customer[0].dni);
                                } else {
                                  return a.customer[0].dni.localeCompare(b.customer[0].dni);
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
                            setOrderBy('amount');
                            setOrderDirection(orderBy === 'amount' && orderDirection === 'asc' ? 'desc' : 'asc');

                            setFinalOrders(
                              finalOrders.sort((a, b) => {
                                if (orderDirection === 'asc' && orderBy === 'amount') {
                                  return b.amount - a.amount;
                                } else {
                                  return a.amount - b.amount;
                                }
                              }),
                            );
                          }}
                        >
                          <Text weight={600} size="md">
                            Monto
                          </Text>
                          {orderBy === 'amount' && orderDirection === 'asc' ? <IconChevronUp /> : <IconChevronDown />}
                        </UnstyledButton>
                      </th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finalOrders?.map((payment) => (
                      <tr key={payment.id}>
                        <td>{formatDate(payment.createdAt)}</td>
                        <td>{payment.customer[0].fullName}</td>
                        <td>{payment.customer[0].dni}</td>
                        <td>$ {Number(payment.amount).toFixed(2)}</td>
                        <td>
                          <Box
                            sx={{
                              cursor: 'pointer',
                            }}
                            onClick={() => {
                              setPaymentId(payment.id);
                              setPaymentDetails(payment);
                              getBank(payment.bankId);
                              getOrder(payment.orderId);
                              openDetails();
                            }}
                          >
                            <Text color="blue">Verificar</Text>
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

export default AdminVerifyPayments;
