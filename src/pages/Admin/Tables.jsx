import Layout from '../../layouts/Default';
import { Title, Text, Table, Button, Skeleton, ActionIcon, Flex, Modal, TextInput, Center } from '@mantine/core';
import { axiosPrivate } from '../../utils/axios';
import { useEffect, useState, useCallback } from 'react';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { IconPencil, IconTrash, IconQrcode } from '@tabler/icons-react';
import { useDisclosure, useInputState } from '@mantine/hooks';
import { QRCode } from 'react-qrcode-logo';

const ENVIROMENT = import.meta.env.VITE_ENV;

const DOMAIN =
  ENVIROMENT === 'development' ? 'http://localhost:5173' : 'https://green-stone-04b86be10.3.azurestaticapps.net';

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

  const getTables = useCallback(() => {
    setLoading(true);
    axiosPrivate(authTokens, setAuthTokens, setUser)
      .get('/tables')
      .then((response) => {
        setTables(response.data.data);
        setLoading(false);
      })
      .catch(() => {
        navigate('/admin/login');
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
      .catch(() => {
        navigate('/admin/login');
      });
  };

  useEffect(() => {
    getTables();
  }, [getTables]);

  return (
    <>
      <Modal
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

        <Button
          onClick={() => {
            axiosPrivate(authTokens, setAuthTokens, setUser)
              .patch(`/tables/${tableId}`, { description })
              .then(() => {
                setTableId(null);
                getTables();
                closeDescription();
              })
              .catch(() => {
                navigate('/admin/login');
              });
          }}
          color="orange"
          fullWidth
          mt={20}
        >
          Confirmar
        </Button>
      </Modal>
      <Modal
        opened={openedQr}
        onClose={() => {
          setTableId(null);
          closeQr();
        }}
        title="Código QR"
      >
        <Center>{tableId && <QRCode value={`${DOMAIN}/${tableId}`} size={256} />}</Center>
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
          </>
        )}
      </Layout>
    </>
  );
}

export default AdminTables;
