import {
  Table,
  Title,
  Badge,
  Box,
  Text,
  Modal,
  Popover,
  UnstyledButton,
  ScrollArea,
  Flex,
  Center,
  Image,
  Divider,
  Accordion,
} from '@mantine/core';
import useUserTable from '../hooks/useTable';
import { axiosPrivate } from '../utils/axios';
import { useEffect, useState, useCallback } from 'react';
import Layout from '../layouts/Default';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import LoadingView from '../components/LoadingView';
import SideFixesButtons from '../components/SideFixesButtons';
import { useDisclosure } from '@mantine/hooks';

function Payments() {
  const { table } = useUserTable();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [paymentData, setPaymentData] = useState(null);
  const [opened, { open, close }] = useDisclosure(false);

  const [currentOrder, setCurrentOrder] = useState(null);

  const [bank, setBank] = useState(null);

  const { authTokens, setAuthTokens, setUser, user } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (!table) {
      return;
    }

    setLoading(true);
    axiosPrivate(authTokens, setAuthTokens, setUser, 'customer')
      .get(`/customers/${user.sub}/payments`)
      .then((response) => {
        setPayments(response.data.status);
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
      setPayments([]);
    };
  }, [table]);

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

  if (loading) {
    return <LoadingView />;
  }

  return (
    <>
      {/* Details Modal */}
      <Modal opened={opened} onClose={close} size="xl" title="Platos de la orden" centered zIndex={500}>
        <ScrollArea pt={30}>
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
          </Flex>
        </ScrollArea>
      </Modal>

      <Layout navbarActive="payments" navbar="user" header>
        <Title>Historial de pagos</Title>
        <ScrollArea>
          <Table mt={20}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Detalles</th>
              </tr>
            </thead>
            <tbody>
              {payments?.map((payment) => (
                <tr key={payment.id}>
                  <td>{formatDate(payment.createdAt)}</td>
                  <td>$ {Number(payment.amount).toFixed(2)}</td>
                  <td>
                    <Badge color={formatStatus(payment.status).color} variant="light">
                      {formatStatus(payment.status).text}
                    </Badge>
                  </td>
                  <td>
                    <Box
                      sx={{
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        setPaymentData(payment);
                        open();

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

export default Payments;
