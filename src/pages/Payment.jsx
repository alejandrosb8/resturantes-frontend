import { Title, Select, Container, TextInput, Button, Flex, Modal, Text, ActionIcon } from '@mantine/core';
import useUserTable from '../hooks/useTable';
import { axiosPrivate } from '../utils/axios';
import { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import LoadingView from '../components/LoadingView';
import { useForm } from '@mantine/form';
import Layout from '../layouts/Default';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft } from '@tabler/icons-react';

function Payment() {
  const { table } = useUserTable();

  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);

  const [orders, setOrders] = useState([]);

  const { authTokens, setAuthTokens, setUser, user } = useAuth();

  const [opened, { open, close }] = useDisclosure();

  const [data, setData] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    if (!table) {
      return;
    }

    setLoading(true);
    axiosPrivate(authTokens, setAuthTokens, setUser, 'customer')
      .get(`/customers/${user.sub}/orders`)
      .then((response) => {
        setOrders(response.data.status);
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
  }, [table, authTokens, setAuthTokens, setUser, user.sub, navigate]);

  const form = useForm({
    initialValues: {
      orderId: '',
      voucherUrl: '',
      reference: '',
      dni: '',
    },

    validate: {
      orderId: (value) => (value.trim().length > 0 ? null : 'Ingresa la orden'),
      voucherUrl: (value) => (value.trim().length > 0 ? null : 'Ingresa la URL del voucher'),
      reference: (value) => (value.trim().match(/^[0-9]+$/) ? null : 'Ingresa un número de referencia válido'),
      dni: (value) => (value.trim().match(/^[0-9]+$/) ? null : 'Ingresa un número de DNI válido'),
    },
  });

  const handleForm = async (values) => {
    setData(values);
    open();
  };

  const handleSubmit = async () => {
    setButtonLoading(true);

    const values = data;

    axiosPrivate(authTokens, setAuthTokens, setUser, 'customer')
      .post(`/payments`, {
        orderId: values.orderId,
        voucherUrl: values.voucherUrl,
        reference: values.reference,
        dni: values.dni,
      })
      .then(() => {
        setButtonLoading(false);

        notifications.show({
          title: 'Pago confirmado',
          message: 'El pago ha sido confirmado exitosamente',
          color: 'green',
          icon: '$',
        });

        navigate(`/${table}`);
      })
      .catch((error) => {
        console.log(error);

        if (error.response.data.message === 'INVALID_DATA') {
          notifications.show({
            title: 'Error',
            message: 'Los datos ingresados son inválidos',
            color: 'red',
            icon: '$',
          });
        } else {
          notifications.show({
            title: 'Error',
            message: 'Ha ocurrido un error al confirmar el pago',
            color: 'red',
            icon: '$',
          });
        }

        setButtonLoading(false);
      });
  };

  if (loading) {
    return <LoadingView />;
  }

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => {
          close();
          form.reset();
          setData({});
        }}
        title="Confirmar pedido"
        size="sm"
        hideOverlay
        padding="lg"
        transition="rotate-left"
        transitionDuration={500}
        transitionTimingFunction="ease"
        transitionEnded={close}
      >
        <Text size="sm" mt={0} mb={30}>
          ¿Estás seguro de que quieres confirmar el pago?
        </Text>
        <Flex justify="flex-end">
          <Button variant="outline" onClick={close} color="red">
            Cancelar
          </Button>
          <Button color="orange" ml={10} loading={buttonLoading} onClick={handleSubmit}>
            Confirmar
          </Button>
        </Flex>
      </Modal>

      <Layout>
        <Container>
          <Flex justify="flex-start" align="center" gap={10}>
            <ActionIcon
              component={Link}
              to={`/${table}`}
              variant="subtle"
              color="orange"
              inlineStyles={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconArrowLeft color="#FD7E14" />
            </ActionIcon>
            <Title order={1} color="dark.4">
              Pago
            </Title>
          </Flex>
          <form onSubmit={form.onSubmit((values) => handleForm(values))} style={{ marginTop: '20px' }}>
            <Flex direction="column" gap={15}>
              <Select
                data={orders.map((order) => ({
                  value: order.id,
                  label: order.id,
                }))}
                label="Orden"
                placeholder="Selecciona la orden a pagar"
                required
                {...form.getInputProps('orderId')}
              />
              <TextInput
                label="URL del voucher"
                placeholder="Ingresa la URL de la imagen de la transacción"
                required
                {...form.getInputProps('voucherUrl')}
              />
              <TextInput
                label="Referencia"
                placeholder="Ingresa el número referencia"
                hideControls
                required
                {...form.getInputProps('reference')}
              />
              <TextInput
                label="DNI"
                placeholder="Ingresa el número de DNI"
                hideControls
                required
                {...form.getInputProps('dni')}
              />

              <Flex justify="flex-end" gap={10}>
                <Button color="red" variant="outline">
                  Cancelar
                </Button>
                <Button type="submit" color="orange">
                  Pagar
                </Button>
              </Flex>
            </Flex>
          </form>
        </Container>
      </Layout>
    </>
  );
}

export default Payment;
