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
  NumberInput,
  Select,
  Textarea,
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
import { notifications } from '@mantine/notifications';
import { IconChevronUp, IconChevronDown } from '@tabler/icons-react';

function AdminDishes() {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const { authTokens, setAuthTokens, setUser } = useAuth();
  const navigate = useNavigate();

  const [categoryFilter, setCategoryFilter] = useState('');

  // edit modal
  const [openedEdit, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  // image modal
  const [openedImg, { open: openImg, close: closeImg }] = useDisclosure(false);

  // create modal
  const [openedCreate, { open: openCreate, close: closeCreate }] = useDisclosure(false);

  // delete modal
  const [openedDelete, { open: openDelete, close: closeDelete }] = useDisclosure(false);

  const [dishId, setDishId] = useState(null);
  const [dishData, setDishData] = useInputState(null);

  const [orderBy, setOrderBy] = useState('');
  const [orderDirection, setOrderDirection] = useState('asc');
  const [finalOrders, setFinalOrders] = useState([]);
  const [search, setSearch] = useState('');

  const dishCreateForm = useForm({
    initialValues: {
      name: '',
      description: '',
      price: '',
      categoryId: '',
      image: '',
    },

    validate: {
      name: (value) => (value.toString().trim().length > 0 ? null : 'Debe ingresar un nombre'),
      price: (value) => (/\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?/.test(value) ? null : 'Debe ingresar un precio'),
      categoryId: (value) => (value.toString().trim().length > 0 ? null : 'Debe seleccionar una categoría'),
      image: (value) => (value.toString().trim().length > 0 ? null : 'Debe ingresar una imagen'),
    },
  });

  const dishEditForm = useForm({
    initialValues: {
      name: '',
      description: '',
      price: '',
      categoryId: '',
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
          navigate('/admin/login');
        }
      });
  }, [authTokens, setAuthTokens, setUser, navigate]);

  const getDishes = useCallback(
    (haveCategory) => {
      setLoading(true);

      let haveCategoryQuery;

      if (haveCategory === 'withCategory') {
        haveCategoryQuery = 'true';
      } else if (haveCategory === 'withoutCategory') {
        haveCategoryQuery = 'false';
      } else {
        haveCategoryQuery = '';
      }

      axiosPrivate(authTokens, setAuthTokens, setUser)
        .get(`/dishes?haveCategory=${haveCategoryQuery}`)
        .then((response) => {
          setDishes(response.data.data);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          if (err?.response?.status === 404) {
            setDishes([]);
            setLoading(false);
          } else {
            setDishes([]);
          }
        });
    },
    [authTokens, setAuthTokens, setUser, navigate],
  );

  const getDishesByCategory = useCallback(
    (categoryId) => {
      setLoading(true);
      axiosPrivate(authTokens, setAuthTokens, setUser)
        .get(`/categories/${categoryId}/dishes`)
        .then((response) => {
          console.log(response.data.data);
          setDishes(response.data.data);
          setLoading(false);
        })
        .catch((err) => {
          if (err.response.status === 404) {
            setDishes([]);
            setLoading(false);
          } else {
            navigate('/admin/login');
          }
        });
    },
    [authTokens, setAuthTokens, setUser, navigate],
  );

  const deleteDish = (id) => {
    setLoading(true);
    setModalLoading(true);
    axiosPrivate(authTokens, setAuthTokens, setUser)
      .delete(`/dishes/${id}`)
      .then(() => {
        setModalLoading(false);
        filterDishes(categoryFilter);
        notifications.show({
          title: 'Plato eliminado',
          message: 'El plato se eliminó correctamente',
          color: 'teal',
        });
      })
      .catch(() => {
        setModalLoading(false);
        closeDelete();
        notifications.show({
          title: 'Error',
          message: 'Ocurrió un error al eliminar el plato',
          color: 'red',
        });
      });
  };

  const createDish = (values) => {
    setModalLoading(true);
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('description', values.description);
    formData.append('price', values.price);
    formData.append('image', values.image);
    formData.append('categoryId', values.categoryId);

    console.log(values);

    axiosPrivate(authTokens, setAuthTokens, setUser)
      .post('/dishes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(() => {
        setDishData(null);
        filterDishes(categoryFilter);
        closeCreate();
        setModalLoading(false);
        dishCreateForm.reset();
        notifications.show({
          title: 'Plato creado',
          message: 'El plato se creó correctamente',
          color: 'teal',
        });
      })
      .catch((err) => {
        console.log(err);
        setDishData(null);
        closeCreate();
        setModalLoading(false);
        notifications.show({
          title: 'Error',
          message: 'Ocurrió un error al crear el plato',
          color: 'red',
        });
      });
  };
  const editDish = (values) => {
    setModalLoading(true);
    const formData = new FormData();

    if (values.name) {
      formData.append('name', values.name);
    }

    if (values.description) {
      formData.append('description', values.description);
    }

    if (values.price) {
      formData.append('price', values.price);
    }

    if (values.categoryId) {
      formData.append('categoryId', values.categoryId);
    }

    if (values.image) {
      formData.append('image', values.image);
    }

    if (!values.name && !values.description && !values.image && !values.price && !values.categoryId) {
      setDishData(null);
      closeEdit();
      setModalLoading(false);
      dishEditForm.reset();
      return;
    }

    axiosPrivate(authTokens, setAuthTokens, setUser)
      .patch(`/dishes/${dishId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(() => {
        setDishData(null);
        filterDishes(categoryFilter);
        closeEdit();
        setModalLoading(false);
        dishEditForm.reset();
        notifications.show({
          title: 'Plato editado',
          message: 'El plato se editó correctamente',
          color: 'teal',
        });
      })
      .catch(() => {
        setDishData(null);
        closeEdit();
        setModalLoading(false);
        notifications.show({
          title: 'Error',
          message: 'Ocurrió un error al editar el plato',
          color: 'red',
        });
      });
  };

  const filterDishes = (categoryId) => {
    if (categoryId === '') {
      getDishes();
    } else if (categoryId === 'withCategory') {
      getDishes('withCategory');
    } else if (categoryId === 'withoutCategory') {
      getDishes('withoutCategory');
    } else {
      getDishesByCategory(categoryId);
    }
  };

  useEffect(() => {
    filterDishes(categoryFilter);
    getCategories();
  }, []);

  useEffect(() => {
    setFinalOrders(
      dishes
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
            if (orderBy === 'description') {
              if (orderDirection === 'asc') {
                return b.description.localeCompare(a.description);
              } else {
                return a.description.localeCompare(b.description);
              }
            }
            if (orderBy === 'price') {
              if (orderDirection === 'asc') {
                return b.price - a.price;
              } else {
                return a.price - b.price;
              }
            }
            if (orderBy === 'category') {
              if (orderDirection === 'asc') {
                return b.categoryName.localeCompare(a.categoryName);
              } else {
                return a.categoryName.localeCompare(b.categoryName);
              }
            }
          } else {
            return;
          }
        })
        .filter(
          (order) =>
            order?.code?.toString().includes(search) ||
            search === '' ||
            order?.name?.toLowerCase().includes(search.toLowerCase()) ||
            search === '' ||
            order?.description?.toLowerCase().includes(search.toLowerCase()) ||
            search === '' ||
            order?.price?.toString().includes(search) ||
            search === '' ||
            order?.categoryName?.toLowerCase().includes(search.toLowerCase()) ||
            search === '',
        ),
    );
  }, [dishes, orderBy, orderDirection, search]);

  return (
    <>
      {/* Modals */}

      {/* Create Modal */}

      <Modal
        opened={openedCreate}
        onClose={() => {
          setDishData(null);
          closeCreate();
          dishCreateForm.reset();
        }}
        title="Crear plato"
      >
        <form onSubmit={dishCreateForm.onSubmit((values) => createDish(values))}>
          <TextInput placeholder="Nombre" label="Nombre" required {...dishCreateForm.getInputProps('name')} />
          <Textarea
            mt={15}
            placeholder="Descripción"
            label="Descripción"
            {...dishCreateForm.getInputProps('description')}
          />
          <NumberInput
            mt={15}
            placeholder="Precio"
            label="Precio"
            min={0.01}
            precision={2}
            required
            {...dishCreateForm.getInputProps('price')}
            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
            formatter={(value) =>
              !Number.isNaN(parseFloat(value)) ? `Bs. ${value}`.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',') : 'Bs. '
            }
          />
          <Select
            mt={15}
            label="Categoría"
            placeholder="Categoría"
            required
            data={[
              { value: '', label: 'Sin categoría' },
              ...categories.map((category) => ({ value: category.id, label: category.name })),
            ]}
            {...dishCreateForm.getInputProps('categoryId')}
          />
          <FileInput
            mt={15}
            placeholder="Imagen"
            label="Imagen"
            required
            accept="image/*"
            {...dishCreateForm.getInputProps('image')}
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
          setDishId(null);
          closeEdit();
          dishEditForm.reset();
        }}
        title="Editar plato"
      >
        <form onSubmit={dishEditForm.onSubmit((values) => editDish(values))}>
          <TextInput
            placeholder="Nombre"
            label="Nuevo nombre"
            description="Si no ingresa un nombre, se mantendrá el actual"
            {...dishEditForm.getInputProps('name')}
          />
          <Textarea
            mt={15}
            placeholder="Descripción"
            label="Nueva descripción"
            description="Si no ingresa una descripción, se mantendrá la actual"
            {...dishEditForm.getInputProps('description')}
          />
          <NumberInput
            mt={15}
            placeholder="Precio"
            label="Nuevo precio"
            description="Si no ingresa un precio, se mantendrá el actual"
            precision={2}
            min={0.01}
            {...dishEditForm.getInputProps('price')}
            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
            formatter={(value) =>
              !Number.isNaN(parseFloat(value)) ? `Bs. ${value}`.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',') : 'Bs. '
            }
          />
          <Select
            mt={15}
            label="Nueva categoría"
            placeholder="Nueva categoría"
            description="Si no selecciona una categoría, se mantendrá la actual"
            data={[
              { value: 'null', label: 'Sin categoría' },
              ...categories.map((category) => ({ value: category.id, label: category.name })),
            ]}
            {...dishEditForm.getInputProps('categoryId')}
          />
          <FileInput
            mt={15}
            label="Nueva imagen"
            placeholder="Selecciona imagen"
            description="Si no selecciona una imagen, se mantendrá la actual"
            accept="image/*"
            {...dishEditForm.getInputProps('image')}
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
          setDishId(null);
          closeDelete();
        }}
        title="Eliminar plato"
      >
        <Text>¿Está seguro que desea eliminar este plato?</Text>
        <Flex mt={20} justify="end" gap="xs">
          <Button
            onClick={() => {
              setDishId(null);
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
              deleteDish(dishId);
              setDishId(null);
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
          setDishId(null);
          closeImg();
        }}
        title="Imagen"
      >
        <Image src={dishData?.image} alt="Imagen Plato" />
      </Modal>

      {/* Main Page */}

      <Layout navbar="admin" navbarActive="admin-dishes" header>
        <Title order={1}>Platos</Title>
        <Text mt={20} mb={10}>
          Lista de platos
        </Text>
        <Select
          label="Filtrar por categoría"
          placeholder="Filtrar por categoría"
          value={categoryFilter}
          data={[
            { value: '', label: 'Todos' },
            { value: 'withCategory', label: 'Con categoría' },
            ...categories.map((category) => ({ value: category.id, label: category.name })),
            { value: 'withoutCategory', label: 'Sin categoría' },
          ]}
          onChange={(value) => {
            setCategoryFilter(value);
            filterDishes(value);
          }}
        />

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
                Crear plato
              </Button>
            </Flex>
            <Divider />
            {dishes.length <= 0 ? (
              <Text mt={20}>No hay platos</Text>
            ) : (
              <ScrollArea>
                <Table striped>
                  <thead>
                    <tr>
                      <th>
                        {' '}
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
                            setOrderBy('description');
                            setOrderDirection(orderBy === 'description' && orderDirection === 'asc' ? 'desc' : 'asc');
                          }}
                        >
                          <Text weight={600} size="md">
                            Descripción
                          </Text>
                          {orderBy === 'description' && orderDirection === 'asc' ? (
                            <IconChevronUp />
                          ) : (
                            <IconChevronDown />
                          )}
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
                            setOrderBy('price');
                            setOrderDirection(orderBy === 'price' && orderDirection === 'asc' ? 'desc' : 'asc');
                          }}
                        >
                          <Text weight={600} size="md">
                            Precio
                          </Text>
                          {orderBy === 'price' && orderDirection === 'asc' ? <IconChevronUp /> : <IconChevronDown />}
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
                            setOrderBy('category');
                            setOrderDirection(orderBy === 'category' && orderDirection === 'asc' ? 'desc' : 'asc');
                          }}
                        >
                          <Text weight={600} size="md">
                            Categoría
                          </Text>
                          {orderBy === 'category' && orderDirection === 'asc' ? <IconChevronUp /> : <IconChevronDown />}
                        </UnstyledButton>
                      </th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finalOrders.map((dish) => (
                      <tr key={dish.id}>
                        <td>{dish.code}</td>
                        <td>{dish.name}</td>
                        <td>{dish.description ? dish.description : 'Sin descripción'}</td>
                        <td>Bs. {Number(dish.price).toFixed(2)}</td>
                        <td>{dish.categoryName ? dish.categoryName : 'Sin categoría'}</td>
                        <td>
                          <Flex align="center" gap="xs">
                            <ActionIcon
                              variant="transparent"
                              color="orange"
                              onClick={() => {
                                setDishId(dish.id);
                                setDishData({ name: dish.name, price: dish.price });
                                console.log(dish.description);
                                dishEditForm.setValues({
                                  name: dish.name,
                                  description: dish.description,
                                  price: dish.price,
                                  categoryId: dish.categoryId,
                                });
                                openEdit();
                              }}
                            >
                              <IconPencil />
                            </ActionIcon>
                            <ActionIcon
                              variant="transparent"
                              color="orange"
                              onClick={() => {
                                setDishId(dish.id);
                                openDelete();
                              }}
                            >
                              <IconTrash />
                            </ActionIcon>
                            <ActionIcon
                              variant="transparent"
                              color="orange"
                              onClick={() => {
                                setDishId(dish.id);
                                setDishData((prev) => ({ ...prev, image: dish.imageUrl }));
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

export default AdminDishes;
