import Layout from '../../layouts/Default';
import { Title, Text, Table, Button, Skeleton, ActionIcon, Flex, Modal, TextInput, Center, Image } from '@mantine/core';
import { axiosPrivate } from '../../utils/axios';
import { useEffect, useState, useCallback } from 'react';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { IconPencil, IconTrash, IconPhoto } from '@tabler/icons-react';
import { useDisclosure, useInputState } from '@mantine/hooks';


function AdminDishes() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authTokens, setAuthTokens, setUser } = useAuth();
  const navigate = useNavigate();

  // description modal
  const [description, setDescription] = useInputState('');
  const [openedDescription, { open: openDescription, close: closeDescription }] = useDisclosure(false);

  // qr modal
  const [openedImg, { open: openImg, close: closeImg }] = useDisclosure(false);

  const [imgUrl, setImgUrl] = useState(null);

  const [createDescription, setCreateDescription] = useInputState('');


  const getDishes = useCallback(() => {
    setLoading(true);
    axiosPrivate(authTokens, setAuthTokens, setUser)
      .get('/dishes')
      .then((response) => {
        const data = response.data.data;
        const promises = data.map((item) => {
          // Check if item has a categoryId
          if (item?.categoryId) {
            return axiosPrivate(authTokens, setAuthTokens, setUser)
              .get(`/categories/${item.categoryId}`)
              .then((resp) => {
                // Asignar la categoría al item
                item.category = resp.data.data.name;
                return item;
              })
              .catch(() => {
                navigate('/admin/login');
              });
          } else {
            // Return the item without category
            return Promise.resolve(item);
          }
        });
        Promise.all(promises).then((results) => {
          setDishes(results);
          setLoading(false);
        });
      })
      .catch(() => {
        navigate('/admin/login');
      });
  }, [authTokens, setAuthTokens, setUser, navigate]);

  const deleteDishes = (id) => {
    setLoading(true);
    axiosPrivate(authTokens, setAuthTokens, setUser)
      .delete(`/dishes/${id}`)
      .then(() => {
        getDishes();
      })
      .catch(() => {
        navigate('/admin/login');
      });
  };

  const createDishes = (description) => {
    axiosPrivate(authTokens, setAuthTokens, setUser)
      .post('/dishes', { description: description })
      .then(() => {
        setCreateDescription('');
        getDishes();
      })
      .catch(() => {
        navigate('/admin/login');
      });
  };

  useEffect(() => {
    getDishes();
  }, [getDishes]);

  return (
    <>
      <Modal
        opened={openedDescription}
        onClose={() => {
          setImgUrl(null);
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
              .patch(`/tables/${imgUrl}`, { description })
              .then(() => {
                setImgUrl(null);
                getDishes();
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
          setImgUrl(null);
          closeImg();
        }}
        title="Imagen "
      >
        <Center>{imgUrl && <Image src={imgUrl} alt='Imagen Comida'/>}</Center>
      </Modal>
      <Layout navbar="admin" navbarActive="admin-dishes" header>
        <Title order={1}>Platos</Title>
        <Text mt={20} mb={10}>
          Lista de platos
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
                  <th>Precio</th>
                  <th>Categoría</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {dishes.map((dish) => (
                  <tr key={dish.id}>
                    <td>{dish.id}</td>
                    <td>{dish.name}</td>
                    <td>{dish.price}</td>
                    <td>{dish.category}</td>
                    <td>
                      <Flex align="center" gap="xs">
                        <ActionIcon
                          variant="transparent"
                          color="orange"
                          onClick={() => {
                            setImgUrl(dish.imageUrl);
                            openDescription();
                          }}
                        >
                          <IconPencil />
                        </ActionIcon>
                        <ActionIcon
                          variant="transparent"
                          color="orange"
                          onClick={() => {
                            deleteDishes(dish.id);
                          }}
                        >
                          <IconTrash />
                        </ActionIcon>
                        <ActionIcon
                          variant="transparent"
                          color="orange"
                          onClick={() => {
                            setImgUrl(dish.imageUrl);
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
                  createDishes(createDescription);
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

export default AdminDishes;
