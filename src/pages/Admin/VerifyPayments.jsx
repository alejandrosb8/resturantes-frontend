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
} from '@mantine/core';
import { axiosPrivate } from '../../utils/axios';
import { useEffect, useState, useCallback } from 'react';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

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
            navigate('/admin/login');
          }
        });
    },
    [authTokens, setAuthTokens, setUser, navigate],
  );

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
            navigate('/admin/login');
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
            navigate('/admin/login');
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
              <Text mt={20}>No hay pagos pendientes</Text>
            ) : (
              <Table striped>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Usuario</th>
                    <th>Monto</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{formatDate(payment.createdAt)}</td>
                      <td>{payment.customer[0].fullName}</td>
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
            )}
          </>
        )}
      </Layout>
    </>
  );
}

export default AdminVerifyPayments;
