import {
  Title,
  Select,
  Container,
  TextInput,
  Button,
  Flex,
  Modal,
  Text,
  ActionIcon,
  NumberInput,
  FileInput,
} from '@mantine/core';
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
  const [paymentType, setPaymentType] = useState('cash');
  const [currentOrder, setCurrentOrder] = useState(null);
  const [banks, setBanks] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (!table) {
      return;
    }

    setLoading(true);
    axiosPrivate(authTokens, setAuthTokens, setUser, 'customer')
      .get(`/customers/${user.sub}/orders?inDebt=true`)
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

    axiosPrivate(authTokens, setAuthTokens, setUser, 'customer')
      .get(`/banks`)
      .then((response) => {
        setBanks(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });

    return () => {
      setOrders([]);
    };
  }, [table, authTokens, setAuthTokens, setUser, user.sub, navigate]);

  const form = useForm({
    initialValues: {
      amount: '',
      dni: '',
      bankId: '',
      reference: '',
      voucherImg: '',
    },

    validate: {
      dni: (value) => (value.trim().match(/^[0-9]+$/) ? null : 'Ingresa un número de DNI válido'),
      amount: (value) => (/\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?/.test(value) ? null : 'Ingresa un monto válido'),
      reference: (value) =>
        paymentType === 'transfer'
          ? value.trim().match(/^[0-9]+$/)
            ? null
            : 'Ingresa un número de referencia válido'
          : null,

      voucherImg: (value) =>
        paymentType === 'transfer'
          ? value.toString().trim().length > 0
            ? null
            : 'Debe ingresar la imagen de la transacción'
          : null,

      bankId: (value) => (paymentType === 'transfer' ? (value.trim().length > 0 ? null : 'Ingresa el banco') : null),
    },
  });

  const handleForm = async (values) => {
    setData(values);
    open();
  };

  const handleSubmit = async () => {
    setButtonLoading(true);
    const formData = new FormData();

    const values = data;

    formData.append('orderId', currentOrder?.id);
    formData.append('type', paymentType);
    formData.append('dni', values.dni);
    formData.append('amount', values.amount);

    if (paymentType === 'transfer') {
      formData.append('reference', values.reference);
      formData.append('voucher', values.voucherImg);
      formData.append('bankId', values.bankId);
    }

    console.log(formData.values);

    axiosPrivate(authTokens, setAuthTokens, setUser, 'customer')
      .post(`/payments`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(() => {
        setButtonLoading(false);
        setPaymentType('cash');

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
            <ActionIcon component={Link} to={`/${table}`} variant="subtle" color="orange">
              <IconArrowLeft color="#FD7E14" />
            </ActionIcon>
            <Title order={1} color="dark.4">
              Pago
            </Title>
          </Flex>
          <form onSubmit={form.onSubmit((values) => handleForm(values))} style={{ marginTop: '20px' }}>
            <Flex direction="column" gap={15}>
              {/* Select with a preview of the first three dishes, if there are more then ... is show */}
              <Select
                data={orders.map((order) => ({
                  value: order.id,
                  label: order.dishes_orders.map((dish) => dish.dish.name).join(', '),
                }))}
                label="Orden"
                placeholder="Selecciona la orden a pagar"
                required
                value={currentOrder?.id}
                onChange={(value) => {
                  setCurrentOrder(orders.find((order) => order.id === value));
                }}
              />

              {currentOrder && (
                <>
                  <Text size="sm" mt={0} mb={20}>
                    Total a pagar: $ {Number.parseFloat(currentOrder?.total).toFixed(2)}
                  </Text>

                  <Select
                    data={[
                      { value: 'cash', label: 'Efectivo' },
                      { value: 'transfer', label: 'Transferencia' },
                      { value: 'card', label: 'Tarjeta' },
                    ]}
                    label="Tipo de pago"
                    placeholder="Selecciona el tipo de pago"
                    required
                    value={paymentType}
                    onChange={setPaymentType}
                  />
                  <NumberInput
                    label="Monto"
                    placeholder="Ingresa el monto a pagar"
                    required
                    min={0.01}
                    precision={2}
                    {...form.getInputProps('amount')}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    formatter={(value) =>
                      !Number.isNaN(parseFloat(value))
                        ? `$ ${value}`.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')
                        : '$ '
                    }
                  />
                  <TextInput
                    label="DNI"
                    placeholder="Ingresa el número de DNI"
                    required
                    {...form.getInputProps('dni')}
                  />
                  {paymentType === 'transfer' && (
                    <>
                      <Select
                        data={banks.map((bank) => ({
                          value: bank.id,
                          label: bank.name,
                        }))}
                        label="Banco"
                        placeholder="Selecciona el banco"
                        required
                        {...form.getInputProps('bankId')}
                      />

                      <TextInput
                        label="Referencia"
                        placeholder="Ingresa el número referencia"
                        required
                        {...form.getInputProps('reference')}
                      />

                      <FileInput
                        placeholder="Ingresa la imagen de la transacción"
                        label="Imagen de la transacción"
                        required
                        accept="image/*"
                        {...form.getInputProps('voucherImg')}
                      />
                    </>
                  )}
                  <Flex justify="flex-end" gap={10}>
                    <Button color="red" variant="outline" component={Link} to={`/${table}`}>
                      Cancelar
                    </Button>
                    <Button type="submit" color="orange">
                      Pagar
                    </Button>
                  </Flex>
                </>
              )}
            </Flex>
          </form>
        </Container>
      </Layout>
    </>
  );
}

export default Payment;
