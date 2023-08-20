import Layout from '../../layouts/Default';
import { Title, Text, Table, Button, Skeleton, ActionIcon, Flex, Modal, TextInput, Divider } from '@mantine/core';
import { axiosPrivate } from '../../utils/axios';
import { useEffect, useState, useCallback } from 'react';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

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

  const bankCreateForm = useForm({
    initialValues: {
      name: '',
    },

    validate: {
      name: (value) => {
        if (!value) {
          return 'El nombre es requerida';
        }
      },
    },
  });

  const bankEditForm = useForm({
    initialValues: {
      name: '',
    },
  });

  const getBanks = useCallback(() => {
    setLoading(true);

    axiosPrivate(authTokens, setAuthTokens, setUser)
      .get(`/banks`)
      .then((response) => {
        setBanks(response.data.data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response.status === 404) {
          setLoading(false);
        } else {
          navigate('/admin/login');
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

    axiosPrivate(authTokens, setAuthTokens, setUser)
      .post('/banks', { name: values.name })
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
      closeEdit();
      setModalLoading(false);
      bankEditForm.reset();
      return;
    }

    axiosPrivate(authTokens, setAuthTokens, setUser)
      .patch(`/banks/${bankId}`, { name: values.name })
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
        }}
        title="Crear banco"
      >
        <form onSubmit={bankCreateForm.onSubmit((values) => createBank(values))}>
          <TextInput placeholder="Nombre" label="Nombre" required {...bankCreateForm.getInputProps('name')} />
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
            {banks.length <= 0 ? (
              <Text mt={20}>No hay bancos</Text>
            ) : (
              <Table striped>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {banks.map((bank) => (
                    <tr key={bank.id}>
                      <td>{bank.id}</td>
                      <td>{bank.name}</td>
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
            )}
          </>
        )}
      </Layout>
    </>
  );
}

export default AdminBanks;
