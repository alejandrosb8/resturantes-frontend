import Layout from '../../layouts/Default';
import {
  Title,
  Text,
  Table,
  Button,
  Skeleton,
  ActionIcon,
  Flex,
  Modal,
  TextInput,
  Divider,
  UnstyledButton,
  ScrollArea,
} from '@mantine/core';
import { axiosPrivate } from '../../utils/axios';
import { useEffect, useState, useCallback } from 'react';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconChevronUp, IconChevronDown } from '@tabler/icons-react';

function AdminBanks() {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const { authTokens, setAuthTokens, setUser } = useAuth();
  const navigate = useNavigate();

  // edit modal
  const [openedEdit, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  // create modal
  const [openedCreate, { open: openCreate, close: closeCreate }] = useDisclosure(false);

  // delete modal
  const [openedDelete, { open: openDelete, close: closeDelete }] = useDisclosure(false);

  const [bankId, setBankId] = useState(null);

  const [orderBy, setOrderBy] = useState('');
  const [orderDirection, setOrderDirection] = useState('asc');
  const [finalOrders, setFinalOrders] = useState([]);
  const [search, setSearch] = useState('');

  const bankCreateForm = useForm({
    initialValues: {
      name: '',
      dni: '',
      number: '',
    },

    validate: {
      name: (value) => {
        if (!value) {
          return 'El nombre es requerida';
        }
      },
      dni: (value) => {
        if (!value) {
          return 'El DNI es requerido';
        }
      },
      number: (value) => {
        if (!value) {
          return 'El número de cuenta es requerido';
        }
      },
    },
  });

  const bankEditForm = useForm({
    initialValues: {
      name: '',
      dni: '',
      number: '',
    },
  });

  const getBanks = useCallback(() => {
    setLoading(true);

    axiosPrivate(authTokens, setAuthTokens, setUser)
      .get(`/banks`)
      .then((response) => {
        console.log(response.data.data);
        setBanks(response.data.data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response.status === 404) {
          setLoading(false);
        } else {
          setBanks([]);
        }
      });
  }, [authTokens, setAuthTokens, setUser, navigate]);

  const deleteBank = (id) => {
    setLoading(true);
    setModalLoading(true);
    axiosPrivate(authTokens, setAuthTokens, setUser)
      .delete(`/banks/${id}`)
      .then(() => {
        setModalLoading(false);
        getBanks();
        notifications.show({
          title: 'Banco eliminado',
          message: 'El banco se eliminó correctamente',
          color: 'teal',
        });
      })
      .catch(() => {
        setModalLoading(false);
        closeDelete();
        notifications.show({
          title: 'Error',
          message: 'Ocurrió un error al eliminar el banco',
          color: 'red',
        });
      });
  };

  const createBank = (values) => {
    setModalLoading(true);

    console.log(values);

    axiosPrivate(authTokens, setAuthTokens, setUser)
      .post('/banks', { name: values.name, dni: values.dni, number: values.number })
      .then(() => {
        getBanks();
        closeCreate();
        setModalLoading(false);
        bankCreateForm.reset();
        notifications.show({
          title: 'Banco creado',
          message: 'El banco se creó correctamente',
          color: 'teal',
        });
      })
      .catch(() => {
        closeCreate();
        setModalLoading(false);
        notifications.show({
          title: 'Error',
          message: 'Ocurrió un error al crear el banco',
          color: 'red',
        });
      });
  };
  const editBank = (values) => {
    setModalLoading(true);

    if (!values.name) {
      values.name = banks.filter((bank) => bank.id === bankId)[0].name;
    }

    if (!values.dni) {
      values.dni = banks.filter((bank) => bank.id === bankId)[0].dni;
    }

    if (!values.number) {
      values.number = banks.filter((bank) => bank.id === bankId)[0].number;
    }

    if (!values.name && !values.dni && !values.number) {
      closeEdit();
      setModalLoading(false);
      bankEditForm.reset();
      return;
    }

    console.log(values);

    axiosPrivate(authTokens, setAuthTokens, setUser)
      .patch(`/banks/${bankId}`, { name: values.name, dni: values.dni, number: values.number })
      .then(() => {
        getBanks();
        closeEdit();
        setModalLoading(false);
        bankEditForm.reset();
        notifications.show({
          title: 'Banco editado',
          message: 'El banco se editó correctamente',
          color: 'teal',
        });
      })
      .catch(() => {
        closeEdit();
        setModalLoading(false);
        notifications.show({
          title: 'Error',
          message: 'Ocurrió un error al editar el banco',
          color: 'red',
        });
      });
  };

  useEffect(() => {
    setFinalOrders(
      banks
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
                return b.name.localeCompare(a.name);
              } else {
                return a.name.localeCompare(b.name);
              }
            }
            if (orderBy === 'dni') {
              if (orderDirection === 'asc') {
                return b.dni.localeCompare(a.dni);
              } else {
                return a.dni.localeCompare(b.dni);
              }
            }
            if (orderBy === 'number') {
              if (orderDirection === 'asc') {
                return b.number.localeCompare(a.number);
              } else {
                return a.number.localeCompare(b.number);
              }
            }
          } else {
            return;
          }
        })
        .filter(
          (order) =>
            order?.code?.toString().includes(search) ||
            order?.name?.toLowerCase().includes(search.toLowerCase()) ||
            search === '',
        ),
    );
  }, [banks, orderBy, orderDirection, search]);

  useEffect(() => {
    getBanks();
  }, []);

  return (
    <>
      {/* Modals */}

      {/* Create Modal */}

      <Modal
        opened={openedCreate}
        onClose={() => {
          closeCreate();
          bankCreateForm.reset();
        }}
        title="Crear banco"
      >
        <form onSubmit={bankCreateForm.onSubmit((values) => createBank(values))}>
          <TextInput placeholder="Nombre" label="Nombre" required {...bankCreateForm.getInputProps('name')} />
          <TextInput mt={10} placeholder="DNI" label="DNI" required {...bankCreateForm.getInputProps('dni')} />
          <TextInput
            mt={10}
            placeholder="Número de cuenta"
            label="Número de cuenta"
            required
            {...bankCreateForm.getInputProps('number')}
          />
          <Button type="submit" color="orange" fullWidth mt={20} loading={modalLoading}>
            Confirmar
          </Button>
        </form>
      </Modal>

      {/* Edit Modal */}

      <Modal
        opened={openedEdit}
        onClose={() => {
          setBankId(null);
          closeEdit();
          bankEditForm.reset();
        }}
        title="Editar banco"
      >
        <form onSubmit={bankEditForm.onSubmit((values) => editBank(values))}>
          <TextInput
            placeholder="Nombre"
            label="Nuevo nombre"
            name="Si no ingresa un nombre, se mantendrá el actual"
            {...bankEditForm.getInputProps('name')}
          />

          <TextInput
            placeholder="DNI"
            label="Nuevo DNI"
            name="Si no ingresa un DNI, se mantendrá el actual"
            mt={10}
            {...bankEditForm.getInputProps('dni')}
          />

          <TextInput
            placeholder="Número de cuenta"
            label="Nuevo número de cuenta"
            name="Si no ingresa un número de cuenta, se mantendrá el actual"
            mt={10}
            {...bankEditForm.getInputProps('number')}
          />

          <Button type="submit" color="orange" fullWidth mt={20} loading={modalLoading}>
            Confirmar
          </Button>
        </form>
      </Modal>

      {/* Delete Modal */}

      <Modal
        opened={openedDelete}
        onClose={() => {
          setBankId(null);
          closeDelete();
        }}
        title="Eliminar banco"
      >
        <Text>¿Está seguro que desea eliminar la categoría?</Text>
        <Flex mt={20} justify="end" gap="xs">
          <Button
            onClick={() => {
              setBankId(null);
              closeDelete();
            }}
            color="orange"
            variant="outline"
            loading={modalLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              deleteBank(bankId);
              setBankId(null);
              closeDelete();
            }}
            color="red"
            loading={modalLoading}
          >
            Eliminar
          </Button>
        </Flex>
      </Modal>

      {/* Main Page */}

      <Layout navbar="admin" navbarActive="admin-banks" header>
        <Title order={1}>Bancos</Title>
        <Text mt={20} mb={10}>
          Lista de bancos
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
            <Flex align="center" justify="start" mb={15} mt={20}>
              <Button
                onClick={() => {
                  openCreate();
                }}
                color="orange"
                leftIcon={'+'}
                variant="outline"
              >
                Crear banco
              </Button>
            </Flex>
            <Divider />
            {finalOrders.length <= 0 ? (
              <Text mt={20}>No hay bancos</Text>
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
                            setOrderBy('number');
                            setOrderDirection(orderBy === 'number' && orderDirection === 'asc' ? 'desc' : 'asc');
                          }}
                        >
                          <Text weight={600} size="md">
                            Número de cuenta
                          </Text>
                          {orderBy === 'number' && orderDirection === 'asc' ? <IconChevronUp /> : <IconChevronDown />}
                        </UnstyledButton>
                      </th>

                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finalOrders.map((bank) => (
                      <tr key={bank.id}>
                        <td>{bank.code}</td>
                        <td>{bank.name}</td>
                        <td>{bank.dni}</td>
                        <td>{bank.number}</td>
                        <td>
                          <Flex align="center" gap="xs">
                            <ActionIcon
                              variant="transparent"
                              color="orange"
                              onClick={() => {
                                setBankId(bank.id);
                                openEdit();
                              }}
                            >
                              <IconPencil />
                            </ActionIcon>
                            <ActionIcon
                              variant="transparent"
                              color="orange"
                              onClick={() => {
                                setBankId(bank.id);
                                openDelete();
                              }}
                            >
                              <IconTrash />
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

export default AdminBanks;
