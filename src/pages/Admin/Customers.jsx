import Layout from '../../layouts/Default';
import {
  Title,
  Text,
  Table,
  Skeleton,
  ActionIcon,
  Flex,
  TextInput,
  Divider,
  ScrollArea,
  UnstyledButton,
  Modal,
  Button,
  Checkbox,
} from '@mantine/core';
import { axiosPrivate } from '../../utils/axios';
import { useEffect, useState, useCallback } from 'react';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { IconPencil } from '@tabler/icons-react';
import { IconChevronUp, IconChevronDown } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authTokens, setAuthTokens, setUser } = useAuth();
  const navigate = useNavigate();

  const [orderBy, setOrderBy] = useState('');
  const [orderDirection, setOrderDirection] = useState('asc');
  const [finalOrders, setFinalOrders] = useState([]);
  const [search, setSearch] = useState('');

  const [modalLoading, setModalLoading] = useState(false);

  const [openedEdit, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  // eslint-disable-next-line no-unused-vars
  const [customerId, setCustomerId] = useState(null);
  // eslint-disable-next-line no-unused-vars, no-undef
  const [customerData, setCustomerData] = useState(null);

  const getCustomers = useCallback(() => {
    setLoading(true);
    axiosPrivate(authTokens, setAuthTokens, setUser)
      .get('/customers')
      .then((response) => {
        setCustomers(response.data.status);
        console.log(response.data.status);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response.status === 404) {
          setLoading(false);
        } else {
          setCustomers([]);
        }
      });
  }, [authTokens, setAuthTokens, setUser, navigate]);

  const customerEditForm = useForm({
    initialValues: {
      fullName: '',
      dni: '',
      email: '',
      phone: '',
      isDeleted: undefined,
    },
  });

  const editCustomer = (values) => {
    setModalLoading(true);

    console.log(values);

    let dataToSend = {};

    if (values?.fullName) {
      dataToSend.fullName = values.fullName;
    }

    if (values?.dni) {
      dataToSend.dni = values.dni;
    }

    if (values?.email) {
      dataToSend.email = values.email;
    }

    if (values?.phone) {
      dataToSend.phone = values.phone;
    }

    if (values?.isDeleted !== undefined) {
      dataToSend.isDeleted = values.isDeleted;
    } else {
      dataToSend.isDeleted = customerData?.isDeleted;
    }

    if (!values?.fullName && !values?.dni && !values?.email && !values?.phone && values?.isDeleted === undefined) {
      setCustomerData(null);
      console.log('No changes');
      closeEdit();
      setModalLoading(false);
      customerEditForm.reset();
      return;
    }

    axiosPrivate(authTokens, setAuthTokens, setUser)
      .patch(`/customers/${customerId}`, dataToSend)
      .then(() => {
        getCustomers();
        closeEdit();
        setModalLoading(false);
        customerEditForm.reset();
        notifications.show({
          title: 'Cliente editado',
          message: 'El cliente se editó correctamente',
          color: 'teal',
        });
      })
      .catch((err) => {
        console.log(err);
        closeEdit();
        setModalLoading(false);
        notifications.show({
          title: 'Error',
          message: 'Ocurrió un error al editar el cliente',
          color: 'red',
        });
      });
  };

  useEffect(() => {
    setFinalOrders(
      customers
        .sort((a, b) => {
          if (orderBy) {
            if (orderBy === 'id') {
              if (orderDirection === 'asc') {
                return b.code - a.code;
              } else {
                return a.code - b.code;
              }
            }
            if (orderBy === 'name') {
              if (orderDirection === 'asc') {
                return b.fullName.localeCompare(a.fullName);
              } else {
                return a.fullName.localeCompare(b.fullName);
              }
            }
            if (orderBy === 'dni') {
              if (orderDirection === 'asc') {
                return b.dni.localeCompare(a.dni);
              } else {
                return a.dni.localeCompare(b.dni);
              }
            }
            if (orderBy === 'email') {
              if (orderDirection === 'asc') {
                return b.email.localeCompare(a.email);
              } else {
                return a.email.localeCompare(b.email);
              }
            }
            if (orderBy === 'phone') {
              if (orderDirection === 'asc') {
                return b.phone.localeCompare(a.phone);
              } else {
                return a.phone.localeCompare(b.phone);
              }
            }
          } else {
            return;
          }
        })
        .filter(
          (order) =>
            order?.code?.toString().includes(search) ||
            order?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
            order?.dni?.toLowerCase().includes(search.toLowerCase()) ||
            order?.email?.toLowerCase().includes(search.toLowerCase()) ||
            order?.phone?.toLowerCase().includes(search.toLowerCase()) ||
            search === '',
        ),
    );
  }, [customers, orderBy, orderDirection, search]);

  useEffect(() => {
    getCustomers();
  }, [getCustomers]);

  return (
    <>
      {/* Modal */}

      {/* Edit Modal */}

      <Modal
        opened={openedEdit}
        onClose={() => {
          setCustomerId(null);
          setCustomerData(null);
          closeEdit();
          customerEditForm.reset({
            fullName: '',
            dni: '',
            email: '',
            phone: '',
            isDeleted: undefined,
          });
          setModalLoading(false);
        }}
        title="Editar categoría"
      >
        <form onSubmit={customerEditForm.onSubmit((values) => editCustomer(values))}>
          <TextInput
            placeholder="Nombre"
            label="Nuevo nombre"
            description="Si no ingresa un nombre, se mantendrá el actual"
            {...customerEditForm.getInputProps('fullName')}
          />

          <TextInput
            mt={10}
            placeholder="DNI"
            label="Nuevo DNI"
            description="Si no ingresa un DNI, se mantendrá el actual"
            {...customerEditForm.getInputProps('dni')}
          />

          <TextInput
            mt={10}
            placeholder="Correo"
            label="Nuevo correo"
            description="Si no ingresa un correo, se mantendrá el actual"
            {...customerEditForm.getInputProps('email')}
          />

          <TextInput
            mt={10}
            placeholder="Teléfono"
            label="Nuevo teléfono"
            description="Si no ingresa un teléfono, se mantendrá el actual"
            {...customerEditForm.getInputProps('phone')}
          />

          <Checkbox
            mt={10}
            {...customerEditForm.getInputProps('isDeleted', { type: 'checkbox' })}
            label="Bloquear cliente"
          />

          <Button type="submit" color="orange" fullWidth mt={20} loading={modalLoading}>
            Confirmar
          </Button>
        </form>
      </Modal>

      {/* Main Page */}

      <Layout navbar="admin" navbarActive="admin-customers" header>
        <Title order={1}>Clientes</Title>
        <Text mt={20} mb={10}>
          Lista de clientes
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
            <Skeleton height={50} radius="sm" />
            <Skeleton height={50} mt={6} radius="sm" />
            <Skeleton height={50} mt={6} radius="sm" />
            <Skeleton height={50} mt={6} radius="sm" />
            <Skeleton height={30} mt={6} radius="sm" />
          </>
        ) : (
          <>
            <Divider />
            {customers.length <= 0 ? (
              <Text mt={20}>No hay clientes</Text>
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
                          }}
                        >
                          <Text weight={600} size="md">
                            Nombre
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
                            setOrderBy('email');
                            setOrderDirection(orderBy === 'email' && orderDirection === 'asc' ? 'desc' : 'asc');
                          }}
                        >
                          <Text weight={600} size="md">
                            Correo
                          </Text>
                          {orderBy === 'email' && orderDirection === 'asc' ? <IconChevronUp /> : <IconChevronDown />}
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
                            setOrderBy('phone');
                            setOrderDirection(orderBy === 'phone' && orderDirection === 'asc' ? 'desc' : 'asc');
                          }}
                        >
                          <Text weight={600} size="md">
                            Teléfono
                          </Text>
                          {orderBy === 'phone' && orderDirection === 'asc' ? <IconChevronUp /> : <IconChevronDown />}
                        </UnstyledButton>
                      </th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finalOrders.map((customer) => (
                      <tr key={customer.id}>
                        <td>{customer.code}</td>
                        <td>{customer.fullName}</td>
                        <td>{customer.dni}</td>
                        <td>{customer.email}</td>
                        <td>{customer.phone}</td>
                        <td>
                          <Flex align="center" gap="xs">
                            <ActionIcon
                              variant="transparent"
                              color="orange"
                              onClick={() => {
                                setCustomerId(customer.id);
                                setCustomerData(customer);
                                customerEditForm.setValues({
                                  fullName: customer.fullName,
                                  dni: customer.dni,
                                  email: customer.email,
                                  phone: customer.phone,
                                  isDeleted: customer.isDeleted,
                                });
                                openEdit();
                              }}
                            >
                              <IconPencil />
                            </ActionIcon>
                          </Flex>
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

export default AdminCustomers;
