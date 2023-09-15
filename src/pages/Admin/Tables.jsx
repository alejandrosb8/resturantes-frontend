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
  Center,
  Divider,
} from '@mantine/core';
import { axiosPrivate } from '../../utils/axios';
import { useEffect, useState, useCallback } from 'react';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { IconPencil, IconTrash, IconQrcode } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { QRCode } from 'react-qrcode-logo';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

const ENVIRONMENT = import.meta.env.VITE_ENV;

const DOMAIN =
  ENVIRONMENT === 'development' ? 'http://localhost:5173' : 'https://green-stone-04b86be10.3.azurestaticapps.net';

function AdminTables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const { authTokens, setAuthTokens, setUser } = useAuth();
  const navigate = useNavigate();

  // edit modal
  const [openedEdit, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  // qr modal
  const [openedQr, { open: openQr, close: closeQr }] = useDisclosure(false);

  // create modal
  const [openedCreate, { open: openCreate, close: closeCreate }] = useDisclosure(false);

  // delete modal
  const [openedDelete, { open: openDelete, close: closeDelete }] = useDisclosure(false);

  const [tableId, setTableId] = useState(null);

  const tableCreateForm = useForm({
    initialValues: {
      description: '',
    },

    validate: {
      description: (value) => {
        if (!value) {
          return 'La descripción es requerida';
        }
      },
    },
  });

  const tableEditForm = useForm({
    initialValues: {
      description: '',
    },
  });

  const getTables = useCallback(() => {
    setLoading(true);

    axiosPrivate(authTokens, setAuthTokens, setUser)
      .get(`/tables`)
      .then((response) => {
        setTables(response.data.data);
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

  const deleteTable = (id) => {
    setLoading(true);
    setModalLoading(true);
    axiosPrivate(authTokens, setAuthTokens, setUser)
      .delete(`/tables/${id}`)
      .then(() => {
        setModalLoading(false);
        getTables();
        notifications.show({
          title: 'Mesa eliminada',
          message: 'La mesa se eliminó correctamente',
          color: 'teal',
        });
      })
      .catch(() => {
        setModalLoading(false);
        closeDelete();
        notifications.show({
          title: 'Error',
          message: 'Ocurrió un error al eliminar la mesa',
          color: 'red',
        });
      });
  };

  const createTable = (values) => {
    setModalLoading(true);

    axiosPrivate(authTokens, setAuthTokens, setUser)
      .post('/tables', { description: values.description })
      .then(() => {
        getTables();
        closeCreate();
        setModalLoading(false);
        tableCreateForm.reset();
        notifications.show({
          title: 'Mesa creada',
          message: 'La mesa se creó correctamente',
          color: 'teal',
        });
      })
      .catch(() => {
        closeCreate();
        setModalLoading(false);
        notifications.show({
          title: 'Error',
          message: 'Ocurrió un error al crear la mesa',
          color: 'red',
        });
      });
  };
  const editTable = (values) => {
    setModalLoading(true);

    if (!values.description) {
      closeEdit();
      setModalLoading(false);
      tableEditForm.reset();
      return;
    }

    axiosPrivate(authTokens, setAuthTokens, setUser)
      .patch(`/tables/${tableId}`, { description: values.description })
      .then(() => {
        getTables();
        closeEdit();
        setModalLoading(false);
        tableEditForm.reset();
        notifications.show({
          title: 'Mesa editada',
          message: 'La mesa se editó correctamente',
          color: 'teal',
        });
      })
      .catch(() => {
        closeEdit();
        setModalLoading(false);
        notifications.show({
          title: 'Error',
          message: 'Ocurrió un error al editar la mesa',
          color: 'red',
        });
      });
  };

  useEffect(() => {
    getTables();
  }, []);

  return (
    <>
      {/* Modals */}

      {/* Create Modal */}

      <Modal
        opened={openedCreate}
        onClose={() => {
          closeCreate();
          tableCreateForm.reset();
        }}
        title="Crear mesa"
      >
        <form onSubmit={tableCreateForm.onSubmit((values) => createTable(values))}>
          <TextInput placeholder="Nombre" label="Nombre" required {...tableCreateForm.getInputProps('description')} />
          <Button type="submit" color="orange" fullWidth mt={20} loading={modalLoading}>
            Confirmar
          </Button>
        </form>
      </Modal>

      {/* Edit Modal */}

      <Modal
        opened={openedEdit}
        onClose={() => {
          setTableId(null);
          closeEdit();
          tableEditForm.reset();
        }}
        title="Editar mesa"
      >
        <form onSubmit={tableEditForm.onSubmit((values) => editTable(values))}>
          <TextInput
            placeholder="Nombre"
            label="Nuevo nombre"
            description="Si no ingresa un nombre, se mantendrá el actual"
            {...tableEditForm.getInputProps('description')}
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
          setTableId(null);
          closeDelete();
        }}
        title="Eliminar mesa"
      >
        <Text>¿Está seguro que desea eliminar la categoría?</Text>
        <Flex mt={20} justify="end" gap="xs">
          <Button
            onClick={() => {
              setTableId(null);
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
              deleteTable(tableId);
              setTableId(null);
              closeDelete();
            }}
            color="red"
            loading={modalLoading}
          >
            Eliminar
          </Button>
        </Flex>
      </Modal>

      {/* Qr Modal */}

      <Modal
        opened={openedQr}
        onClose={() => {
          setTableId(null);
          closeQr();
        }}
        title="Imagen"
      >
        <Center>{tableId && <QRCode value={`${DOMAIN}/login/${tableId}`} size={256} />}</Center>
      </Modal>

      {/* Main Page */}

      <Layout navbar="admin" navbarActive="admin-tables" header>
        <Title order={1}>Mesas</Title>
        <Text mt={20} mb={10}>
          Lista de mesas
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
                Crear mesa
              </Button>
            </Flex>
            <Divider />
            {tables.length <= 0 ? (
              <Text mt={20}>No hay mesas</Text>
            ) : (
              <Table striped>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Descripción</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tables.map((table) => (
                    <tr key={table.id}>
                      <td>{table.id}</td>
                      <td>{table.description}</td>
                      <td>
                        <Flex align="center" gap="xs">
                          <ActionIcon
                            variant="transparent"
                            color="orange"
                            onClick={() => {
                              setTableId(table.id);
                              openEdit();
                            }}
                          >
                            <IconPencil />
                          </ActionIcon>
                          <ActionIcon
                            variant="transparent"
                            color="orange"
                            onClick={() => {
                              setTableId(table.id);
                              openDelete();
                            }}
                          >
                            <IconTrash />
                          </ActionIcon>
                          <ActionIcon
                            variant="transparent"
                            color="orange"
                            onClick={() => {
                              setTableId(table.id);
                              openQr();
                            }}
                          >
                            <IconQrcode />
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

export default AdminTables;
