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
  Image,
  Center,
  Accordion,
  Divider,
  TextInput,
} from '@mantine/core';
import { axiosPrivate } from '../../utils/axios';
import { useEffect, useState, useCallback } from 'react';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronUp, IconChevronDown } from '@tabler/icons-react';

function formatStatus(status) {
  if (status === 'pending') {
    return {
      color: 'yellow',
      text: 'Pendiente',
    };
  }
  if (status === 'approved') {
    return {
      color: 'green',
      text: 'Aprobado',
    };
  }
  if (status === 'rejected') {
    return {
      color: 'red',
      text: 'Rechazado',
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

function filterDishes(payments, status) {
  return payments.filter((payment) => {
    if (status === '') {
      return true;
    } else {
      return payment.status === status;
    }
  });
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

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [paymentsFiltered, setPaymentsFiltered] = useState('');
  const [loading, setLoading] = useState(true);
  const { authTokens, setAuthTokens, setUser } = useAuth();
  const navigate = useNavigate();

  const [orderBy, setOrderBy] = useState('');
  const [orderDirection, setOrderDirection] = useState('asc');
  const [finalOrders, setFinalOrders] = useState([]);
  const [search, setSearch] = useState('');

  // details modal
  const [openedDetails, { open: openDetails, close: closeDetails }] = useDisclosure(false);

  const [paymentData, setPaymentData] = useState(null);
  const [bank, setBank] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);

  const getPayments = useCallback(
    (status) => {
      setLoading(true);

      axiosPrivate(authTokens, setAuthTokens, setUser)
        .get(`/payments`)
        .then((response) => {
          setPayments(filterDishes(response.data.data, status || paymentsFiltered));
          setLoading(false);
        })
        .catch((err) => {
          if (err.response.status === 404) {
            setLoading(false);
          } else {
            setPayments([]);
          }
        });
    },
    [authTokens, setAuthTokens, setUser, navigate],
  );

  const getPaymentsFilteredBySearch = useCallback(
    (search) => {
      setFinalOrders(
        payments.filter(
          (order) =>
            order?.code?.toString().includes(search) ||
            order?.customer[0]?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
            order?.customer?.dni?.toLowerCase().includes(search.toLowerCase()) ||
            formatDate(order?.createdAt)?.toLowerCase().includes(search.toLowerCase()) ||
            search === '',
        ),
      );
    },
    [payments],
  );

  useEffect(() => {
    getPaymentsFilteredBySearch(search);
  }, [payments, search, getPaymentsFilteredBySearch]);

  const getBank = useCallback(
    (id) => {
      if (!id) {
        return;
      }

      axiosPrivate(authTokens, setAuthTokens, setUser)
        .get(`/banks/${id}`)
        .then((response) => {
          setBank(response.data.data);
        })
        .catch((err) => {
          if (err.response.status === 404) {
            return;
          } else {
            setBank(null);
          }
        });
    },
    [authTokens, setAuthTokens, setUser, navigate],
  );

  const getOrder = useCallback(
    (id) => {
      if (!id) {
        return;
      }

      axiosPrivate(authTokens, setAuthTokens, setUser)
        .get(`/orders/${id}`)
        .then((response) => {
          setCurrentOrder(response.data.data);
        })
        .catch((err) => {
          if (err.response.status === 404) {
            return;
          } else {
            setCurrentOrder(null);
          }
        });
    },
    [authTokens, setAuthTokens, setUser, navigate],
  );

  useEffect(() => {
    getPayments();
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
                borderBottom: '1px solid #DDD',
              }}
            >
              <Text weight={600}>Fecha:</Text>
              <Text>{formatDate(paymentData?.createdAt)}</Text>
            </Flex>
            <Flex
              justify="space-between"
              sx={{
                borderBottom: '1px solid #DDD',
              }}
            >
              <Text weight={600}>Usuario:</Text>
              <Text>{paymentData?.customer[0].fullName}</Text>
            </Flex>
            <Flex
              justify="space-between"
              sx={{
                borderBottom: '1px solid #DDD',
              }}
            >
              <Text weight={600}>Monto:</Text>
              <Text>$ {Number(paymentData?.amount).toFixed(2)}</Text>
            </Flex>
            <Flex
              justify="space-between"
              sx={{
                borderBottom: '1px solid #DDD',
              }}
            >
              <Text weight={600}>DNI:</Text>
              <Text>{paymentData?.dni}</Text>
            </Flex>
            <Flex
              justify="space-between"
              sx={{
                borderBottom: '1px solid #DDD',
              }}
            >
              <Text weight={600}>Tipo de pago:</Text>
              <Text>{formatPaymentType(paymentData?.type)}</Text>
            </Flex>
            {paymentData?.type === 'transfer' && (
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
                  <Text>{paymentData?.reference}</Text>
                </Flex>
                <Text>
                  <Text weight={600}>Imagen de la transacción:</Text>
                </Text>
                <Center>
                  <Image
                    src={paymentData?.voucherUrl}
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
                      <Text weight={600}>ID:</Text>
                      <Text>{currentOrder?.code}</Text>
                    </Flex>
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
                      <Text weight={600}>Deuda actual:</Text>
                      <Text>$ {Number(currentOrder?.debt).toFixed(2)}</Text>
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
          </Flex>
        </ScrollArea>
      </Modal>

      {/* Main Page */}

      <Layout navbar="admin" navbarActive="admin-payments" header>
        <Title payment={1}>Pagos</Title>
        <Text mt={20} mb={10}>
          Lista de pagos
        </Text>

        <Select
          label="Filtrar por estado"
          placeholder="Filtrar por estado"
          value={paymentsFiltered}
          data={[
            { value: '', label: 'Todos' },
            { value: 'pending', label: 'Pendiente' },
            { value: 'approved', label: 'Aprobado' },
            { value: 'rejected', label: 'Rechazado' },
          ]}
          onChange={(value) => {
            setPaymentsFiltered(value);
            getPayments(value);
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
              <Text mt={20}>No hay pagos</Text>
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
                            setOrderBy('createdAt');
                            setOrderDirection(orderBy === 'createdAt' && orderDirection === 'asc' ? 'desc' : 'asc');

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
                    {finalOrders.map((payment) => (
                      <tr key={payment.id}>
                        <td>{payment.code}</td>
                        <td>{payment.customer[0].fullName}</td>
                        <td>{payment.customer[0].dni}</td>
                        <td>{formatDate(payment.createdAt)}</td>
                        <td>
                          <Badge color={formatStatus(payment.status).color}>{formatStatus(payment.status).text}</Badge>
                        </td>
                        <td>
                          <Box
                            sx={{
                              cursor: 'pointer',
                            }}
                            onClick={() => {
                              setPaymentData(payment);
                              openDetails();

                              getBank(payment.bankId);
                              getOrder(payment.orderId);
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

export default AdminPayments;
