import Layout from '../../layouts/Default';
import { Title, Text, Table, Button, Skeleton, ActionIcon, Flex, Modal, TextInput } from '@mantine/core';
import { axiosPrivate } from '../../utils/axios';
import { useEffect, useState, useCallback } from 'react';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { IconPencil, IconTrash, IconPhoto } from '@tabler/icons-react';
import { useDisclosure, useInputState } from '@mantine/hooks';


function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authTokens, setAuthTokens, setUser } = useAuth();
  const navigate = useNavigate();

  // description modal
  const [description, setDescription] = useInputState('');
  const [openedDescription, { open: openDescription, close: closeDescription }] = useDisclosure(false);

  // qr modal
  const [openedImg, { open: openImg, close: closeImg }] = useDisclosure(false);

  const [categoriesId, setCategoriesId] = useState(null);

  const [createDescription, setCreateDescription] = useInputState('');


  const getCategories = useCallback(() => {
    setLoading(true);
    axiosPrivate(authTokens, setAuthTokens, setUser)
      .get('/categories')
      .then((response) => {
        setCategories(response.data.data);
        setLoading(false);
      })
      .catch(() => {
        navigate('/admin/login');
      });
  }, [authTokens, setAuthTokens, setUser, navigate]);

  const deleteCategories = (id) => {
    setLoading(true);
    axiosPrivate(authTokens, setAuthTokens, setUser)
      .delete(`/categories/${id}`)
      .then(() => {
        getCategories();
      })
      .catch(() => {
        navigate('/admin/login');
      });
  };

  const createCategories = (description) => {
    axiosPrivate(authTokens, setAuthTokens, setUser)
      .post('/dishes', { description: description })
      .then(() => {
        setCreateDescription('');
        getCategories();
      })
      .catch(() => {
        navigate('/admin/login');
      });
  };

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  return (
    <>
      <Modal
        opened={openedDescription}
        onClose={() => {
          setCategoriesId(null);
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
              .patch(`/tables/${categoriesId}`, { description })
              .then(() => {
                setCategoriesId(null);
                getCategories();
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
        opened={openedImg}
        onClose={() => {
          setCategoriesId(null);
          closeImg();
        }}
        title="Imagen"
      >
      </Modal>
      <Layout navbar="admin" navbarActive="admin-categories" header>
        <Title order={1}>Categorias</Title>
        <Text mt={20} mb={10}>
          Lista de categorias
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
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.id}</td>
                    <td>{category.name}</td>
                    <td>{category.description}</td>
                    <td>
                      <Flex align="center" gap="xs">
                        <ActionIcon
                          variant="transparent"
                          color="orange"
                          onClick={() => {
                            setCategoriesId(category.id);
                            openDescription();
                          }}
                        >
                          <IconPencil />
                        </ActionIcon>
                        <ActionIcon
                          variant="transparent"
                          color="orange"
                          onClick={() => {
                            deleteCategories(category.id);
                          }}
                        >
                          <IconTrash />
                        </ActionIcon>
                        <ActionIcon
                          variant="transparent"
                          color="orange"
                          onClick={() => {
                            setCategoriesId(category.id);
                            openImg();
                          }}
                        >
                          <IconPhoto />
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
                  createCategories(createDescription);
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

export default AdminCategories;
