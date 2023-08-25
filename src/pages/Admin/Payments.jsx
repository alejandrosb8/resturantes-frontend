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
  Image,
  Center,
  Accordion,
} from '@mantine/core';
import { axiosPrivate } from '../../utils/axios';
import { useEffect, useState, useCallback } from 'react';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';

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
            navigate('/admin/login');
          }
        });
    },
    [authTokens, setAuthTokens, setUser, navigate],
  );

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
            navigate('/admin/login');
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
            navigate('/admin/login');
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
                      <Text>{currentOrder?.id}</Text>
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
                      <Text weight={600}>Deuda:</Text>
                      <Text>$ {Number(currentOrder?.debt).toFixed(2)}</Text>
                    </Flex>

                    <Text>
                      <Text weight={600}>Platos:</Text>
                    </Text>
                  </Flex>
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
            {payments.length <= 0 ? (
              <Text mt={20}>No hay pagos</Text>
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
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{payment.id}</td>
                      <td>Alejandro Sánchez</td>
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
            )}
          </>
        )}
      </Layout>
    </>
  );
}

export default AdminPayments;
