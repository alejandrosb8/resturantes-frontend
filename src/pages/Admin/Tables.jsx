import Layout from '../../layouts/Default';
import { Title, Text, Table, Button, Skeleton, ActionIcon, Flex, Modal, TextInput, Center } from '@mantine/core';
import { axiosPrivate } from '../../utils/axios';
import { useEffect, useState, useCallback } from 'react';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { IconPencil, IconTrash, IconQrcode } from '@tabler/icons-react';
import { useDisclosure, useInputState } from '@mantine/hooks';
import { QRCode } from 'react-qrcode-logo';

const ENVIRONMENT = import.meta.env.VITE_ENV;

const DOMAIN =
  ENVIRONMENT === 'development' ? 'http://localhost:5173' : 'https://green-stone-04b86be10.3.azurestaticapps.net';

function AdminTables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authTokens, setAuthTokens, setUser } = useAuth();
  const navigate = useNavigate();

  // description modal
  const [description, setDescription] = useInputState('');
  const [openedDescription, { open: openDescription, close: closeDescription }] = useDisclosure(false);

  // qr modal
  const [openedQr, { open: openQr, close: closeQr }] = useDisclosure(false);

  const [tableId, setTableId] = useState(null);

  const [createDescription, setCreateDescription] = useInputState('');

  const [errorCreateTable, setErrorCreateTable] = useState('');
  const [errorDescription, setErrorDescription] = useState('');

  const getTables = useCallback(() => {
    setLoading(true);
    axiosPrivate(authTokens, setAuthTokens, setUser)
      .get('/tables')
      .then((response) => {
        setTables(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        if (error.response.data.message === 'TABLES_NOT_FOUND') {
          setTables([]);
          setLoading(false);
        } else {
          navigate('/admin/login');
        }
      });
  }, [authTokens, setAuthTokens, setUser, navigate]);

  const deleteTable = (id) => {
    setLoading(true);
    axiosPrivate(authTokens, setAuthTokens, setUser)
      .delete(`/tables/${id}`)
      .then(() => {
        getTables();
      })
      .catch(() => {
        navigate('/admin/login');
      });
  };

  const createTable = (description) => {
    axiosPrivate(authTokens, setAuthTokens, setUser)
      .post('/tables', { description: description })
      .then(() => {
        setCreateDescription('');
        getTables();
      })
      .catch((error) => {
        if (error.response.data.message === 'INVALID_DATA') {
          setErrorCreateTable('No se pudo crear la mesa');
        } else {
          navigate('/admin/login');
        }
      });
  };

  useEffect(() => {
    getTables();
  }, [getTables]);

  return (
    <>
      {/* Editar mesa */}
      <Modal
        styles={{ zIndex: 20000 }}
        opened={openedDescription}
        onClose={() => {
          setTableId(null);
          closeDescription();
        }}
        title="Cambiar descripción"
      >
        <TextInput
          value={description}
          onChange={setDescription}
          placeholder="Nueva descripción"
          label="Nueva descripción"
          required
        />

        {errorDescription && (
          <Text mt={10} color="red">
            {errorDescription}
          </Text>
        )}

        <Button
          onClick={() => {
            axiosPrivate(authTokens, setAuthTokens, setUser)
              .patch(`/tables/${tableId}`, { description })
              .then(() => {
                setTableId(null);
                getTables();
                closeDescription();
              })
              .catch((error) => {
                if (error.response.data.message === 'INVALID_DATA') {
                  setErrorDescription('No se pudo actualizar la mesa');
                } else {
                  navigate('/admin/login');
                }
              });
          }}
          color="orange"
          fullWidth
          mt={20}
        >
          Confirmar
        </Button>
      </Modal>

      {/* ver QR */}
      <Modal
        opened={openedQr}
        onClose={() => {
          setTableId(null);
          closeQr();
        }}
        title="Código QR"
      >
        <Center>{tableId && <QRCode value={`${DOMAIN}/login/${tableId}`} size={256} />}</Center>
      </Modal>
      <Layout navbar="admin" navbarActive="admin-tables" header>
        <Title order={1}>Mesas</Title>
        <Text mt={20} mb={10}>
          Lista de mesas
        </Text>
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
            <Table striped>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              {tables.length === 0 && (
                <Text mt={20} mb={10} size="xl">
                  No hay mesas
                </Text>
              )}
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
                            openDescription();
                          }}
                        >
                          <IconPencil />
                        </ActionIcon>
                        <ActionIcon
                          variant="transparent"
                          color="orange"
                          onClick={() => {
                            deleteTable(table.id);
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
            <Flex align="flex-end" mt={20} gap="xs">
              <TextInput
                value={createDescription}
                onChange={setCreateDescription}
                placeholder="Crear nueva mesa"
                label="Crear nueva mesa"
                required
              />
              <Button
                onClick={() => {
                  createTable(createDescription);
                }}
                color="orange"
              >
                Confirmar
              </Button>
            </Flex>
            {errorCreateTable && (
              <Text mt={20} color="red">
                {errorCreateTable}
              </Text>
            )}
          </>
        )}
      </Layout>
    </>
  );
}

export default AdminTables;
