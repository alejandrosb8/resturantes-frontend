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
  FileInput,
  Image,
  Divider,
  ScrollArea,
  UnstyledButton,
} from '@mantine/core';
import { axiosPrivate } from '../../utils/axios';
import { useEffect, useState, useCallback } from 'react';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { IconPencil, IconTrash, IconPhoto } from '@tabler/icons-react';
import { useDisclosure, useInputState } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { IconChevronUp, IconChevronDown } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const { authTokens, setAuthTokens, setUser } = useAuth();
  const navigate = useNavigate();

  const [orderBy, setOrderBy] = useState('');
  const [orderDirection, setOrderDirection] = useState('asc');
  const [finalOrders, setFinalOrders] = useState([]);
  const [search, setSearch] = useState('');

  // edit modal
  const [openedEdit, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  // image modal
  const [openedImg, { open: openImg, close: closeImg }] = useDisclosure(false);

  // create modal
  const [openedCreate, { open: openCreate, close: closeCreate }] = useDisclosure(false);

  // delete modal
  const [openedDelete, { open: openDelete, close: closeDelete }] = useDisclosure(false);

  const [categoryId, setCategoryId] = useState(null);
  const [categoryData, setCategoryData] = useInputState(null);

  const categoryCreateForm = useForm({
    initialValues: {
      name: '',
      image: '',
    },

    validate: {
      name: (value) => (value.toString().trim().length > 0 ? null : 'Debe ingresar un nombre'),
      image: (value) => (value.toString().trim().length > 0 ? null : 'Debe ingresar una imagen'),
    },
  });

  const categoryEditForm = useForm({
    initialValues: {
      name: '',
      image: '',
    },
  });

  const getCategories = useCallback(() => {
    setLoading(true);
    axiosPrivate(authTokens, setAuthTokens, setUser)
      .get('/categories')
      .then((response) => {
        setCategories(response.data.data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response.status === 404) {
          setLoading(false);
        } else {
          setCategories([]);
        }
      });
  }, [authTokens, setAuthTokens, setUser, navigate]);

  const deleteCategories = (id) => {
    setLoading(true);
    setModalLoading(true);
    axiosPrivate(authTokens, setAuthTokens, setUser)
      .delete(`/categories/${id}`)
      .then(() => {
        setModalLoading(false);
        getCategories();
        notifications.show({
          title: 'Categoría eliminada',
          message: 'La categoría se eliminó correctamente',
          color: 'teal',
        });
      })
      .catch(() => {
        setModalLoading(false);
        closeDelete();
        notifications.show({
          title: 'Error',
          message: 'Ocurrió un error al eliminar la categoría',
          color: 'red',
        });
      });
  };

  const createCategories = (values) => {
    setModalLoading(true);
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('image', values.image);

    axiosPrivate(authTokens, setAuthTokens, setUser)
      .post('/categories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(() => {
        setCategoryData(null);
        getCategories();
        closeCreate();
        setModalLoading(false);
        categoryCreateForm.reset();
        notifications.show({
          title: 'Categoría creada',
          message: 'La categoría se creó correctamente',
          color: 'teal',
        });
      })
      .catch(() => {
        setCategoryData(null);
        closeCreate();
        setModalLoading(false);
        notifications.show({
          title: 'Error',
          message: 'Ocurrió un error al crear la categoría',
          color: 'red',
        });
      });
  };
  const editCategories = (values) => {
    setModalLoading(true);
    const formData = new FormData();

    if (values.name) {
      formData.append('name', values.name);
    }

    if (values.image) {
      formData.append('image', values.image);
    }

    if (!values.name && !values.image) {
      setCategoryData(null);
      closeEdit();
      setModalLoading(false);
      categoryEditForm.reset();
      return;
    }

    axiosPrivate(authTokens, setAuthTokens, setUser)
      .patch(`/categories/${categoryId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(() => {
        setCategoryData(null);
        getCategories();
        closeEdit();
        setModalLoading(false);
        categoryEditForm.reset();
        notifications.show({
          title: 'Categoría editada',
          message: 'La categoría se editó correctamente',
          color: 'teal',
        });
      })
      .catch(() => {
        setCategoryData(null);
        closeEdit();
        setModalLoading(false);
        notifications.show({
          title: 'Error',
          message: 'Ocurrió un error al editar la categoría',
          color: 'red',
        });
      });
  };

  useEffect(() => {
    setFinalOrders(
      categories
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
  }, [categories, orderBy, orderDirection, search]);

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  return (
    <>
      {/* Modals */}

      {/* Create Modal */}

      <Modal
        opened={openedCreate}
        onClose={() => {
          setCategoryId(null);
          closeCreate();
          categoryCreateForm.reset();
        }}
        title="Crear categoría"
      >
        <form onSubmit={categoryCreateForm.onSubmit((values) => createCategories(values))}>
          <TextInput placeholder="Nombre" label="Nombre" required {...categoryCreateForm.getInputProps('name')} />
          <FileInput
            mt={15}
            placeholder="Imagen"
            label="Imagen"
            required
            accept="image/*"
            {...categoryCreateForm.getInputProps('image')}
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
          setCategoryId(null);
          closeEdit();
          categoryEditForm.reset();
        }}
        title="Editar categoría"
      >
        <form onSubmit={categoryEditForm.onSubmit((values) => editCategories(values))}>
          <TextInput
            placeholder="Nombre"
            label="Nuevo nombre"
            description="Si no ingresa un nombre, se mantendrá el actual"
            {...categoryEditForm.getInputProps('name')}
          />
          <FileInput
            mt={15}
            label="Nueva imagen"
            placeholder="Selecciona imagen"
            description="Si no selecciona una imagen, se mantendrá la actual"
            accept="image/*"
            {...categoryEditForm.getInputProps('image')}
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
          setCategoryId(null);
          closeDelete();
        }}
        title="Eliminar categoría"
      >
        <Text>¿Está seguro que desea eliminar la categoría?</Text>
        <Flex mt={20} justify="end" gap="xs">
          <Button
            onClick={() => {
              setCategoryId(null);
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
              deleteCategories(categoryId);
              setCategoryId(null);
              closeDelete();
            }}
            color="red"
            loading={modalLoading}
          >
            Eliminar
          </Button>
        </Flex>
      </Modal>

      {/* Image Modal */}

      <Modal
        opened={openedImg}
        onClose={() => {
          setCategoryId(null);
          closeImg();
        }}
        title="Imagen"
      >
        <Image src={categoryData?.image} alt="Imagen Categoría" />
      </Modal>

      {/* Main Page */}

      <Layout navbar="admin" navbarActive="admin-categories" header>
        <Title order={1}>Categorías</Title>
        <Text mt={20} mb={10}>
          Lista de categorías
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
            <Flex align="center" justify="start" mb={15} mt={20}>
              <Button
                onClick={() => {
                  openCreate();
                }}
                color="orange"
                leftIcon={'+'}
                variant="outline"
              >
                Crear categoría
              </Button>
            </Flex>
            <Divider />
            {categories.length <= 0 ? (
              <Text mt={20}>No hay categorías</Text>
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
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finalOrders.map((category) => (
                      <tr key={category.id}>
                        <td>{category.code}</td>
                        <td>{category.name}</td>
                        <td>
                          <Flex align="center" gap="xs">
                            <ActionIcon
                              variant="transparent"
                              color="orange"
                              onClick={() => {
                                setCategoryId(category.id);
                                setCategoryData({ name: category.name });
                                categoryEditForm.setValues({ name: category.name });
                                openEdit();
                              }}
                            >
                              <IconPencil />
                            </ActionIcon>
                            <ActionIcon
                              variant="transparent"
                              color="orange"
                              onClick={() => {
                                setCategoryId(category.id);
                                openDelete();
                              }}
                            >
                              <IconTrash />
                            </ActionIcon>
                            <ActionIcon
                              variant="transparent"
                              color="orange"
                              onClick={() => {
                                setCategoryId(category.id);
                                setCategoryData((prev) => ({ ...prev, image: category.imageUrl }));
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
              </ScrollArea>
            )}
          </>
        )}
      </Layout>
    </>
  );
}

export default AdminCategories;
