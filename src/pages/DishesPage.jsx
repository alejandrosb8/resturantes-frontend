import useAuth from '../hooks/useAuth.js';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useShopping } from '../contexts/ShoppingContext.jsx';
import { useDisclosure, useInputState } from '@mantine/hooks';
import useUserTable from '../hooks/useTable.js';
import { axiosPrivate } from '../utils/axios.js';
import LoadingView from '../components/LoadingView.jsx';
import {
  ActionIcon,
  Affix,
  Button,
  Card,
  Container,
  Divider,
  Flex,
  Grid,
  Image,
  Modal,
  NumberInput,
  rem,
  Text,
  Title,
  Transition,
} from '@mantine/core';
import Layout from '../layouts/Default.jsx';
import { IconShoppingCart, IconTrash, IconX, IconArrowBackUp } from '@tabler/icons-react';

const EXAMPLE_IMAGE_URL =
  'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80';

export const DishesPage = () => {
  const { authTokens, setAuthTokens, setUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pcategory = searchParams.get('category');

  const [category, setCategory] = useState(null);

  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  const { shoppingCart, addToCart, removeFromCart, removeAllFromCart } = useShopping();

  const [openedAddDish, { open: openDish, close: closeDish }] = useDisclosure(false);

  const [dishId, setDishId] = useState(null);
  const [dishQuantity, setDishQuantity] = useInputState(() => {
    const quantity = shoppingCart.filter((dish) => dish.id === dishId).map((dish) => dish.quantity);
    return quantity.length > 0 ? quantity[0] : 1;
  });

  const { table } = useUserTable();

  useEffect(() => {
    setLoading(true);

    if (pcategory) {
      axiosPrivate(authTokens, setAuthTokens, setUser, 'customer')
        .get(`/categories/${pcategory}`)
        .then((response) => {
          setCategory(response.data.data);

          axiosPrivate(authTokens, setAuthTokens, setUser, 'customer')
            .get(`/categories/${pcategory}/dishes`)
            .then((c_response) => {
              setDishes(c_response.data.data);
              setLoading(false);
            })
            .catch((error) => {
              if (error.response.status === 404) {
                setLoading(false);
              } else {
                navigate(`/login/${table}`);
              }
            });
        })
        .catch(() => {
          navigate(`/login/${table}`);
        });
    }
  }, [authTokens, setAuthTokens, setUser, navigate, table, pcategory]);

  if (loading) {
    return <LoadingView />;
  }

  return (
    <>
      {/*Dish Modal*/}

      <Modal
        opened={openedAddDish}
        onClose={() => {
          setDishQuantity(1);
          closeDish();
        }}
        title="Añadir plato al pedido"
      >
        <NumberInput
          defaultValue={1}
          min={0}
          max={100}
          style={{ width: '100%' }}
          placeholder="Cantidad"
          variant="filled"
          size="lg"
          value={dishQuantity}
          onChange={setDishQuantity}
          label={
            <Text size="sm">
              ¿Cuantos platos de {dishes.filter((dish) => dish.id === dishId).map((dish) => dish.name)} quieres?
            </Text>
          }
        />
        <Flex justify="space-between" align="center" mt={20}>
          <Button variant="light" color="red" onClick={closeDish}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              if (dishQuantity <= 0) {
                removeFromCart(dishId);
              } else {
                addToCart(dishId, dishQuantity);
              }
              closeDish();
            }}
          >
            Agregar al pedido
          </Button>
        </Flex>
      </Modal>

      {/*Main page*/}

      <Layout navbar="user" header>
        <Container size="xl" p={0} mb={80}>
          <Flex justify="flex-start" align="center" gap={10}>
            <Title order={1} color="dark.4">
              {category.name}
            </Title>
            <Button component={Link} to={`/${table}`} variant="subtle" color="orange">
              Volver a categorias <IconArrowBackUp />
            </Button>
          </Flex>

          <Divider mt={10} mb={10} />

          {(!dishes || dishes.length < 1) && (
            <Title order={2} color="dark.4">
              No hay platos en esta categoría
            </Title>
          )}

          <Grid mt={10} sx={{ width: '100%', margin: '0' }}>
            {dishes.map((dish) => (
              <Grid.Col key={dish.id} span={12} xs={6} lg={4} style={{ maxWidth: '520px' }}>
                <Card shadow="sm" style={{ height: '100%', width: '100%', maxWidth: '520px' }} p={10}>
                  <Card.Section>
                    <Image src={EXAMPLE_IMAGE_URL} height={200} alt={dish.name} />
                  </Card.Section>
                  <Flex justify={'space-between'} align="center" mt={10}>
                    <Title
                      order={3}
                      color="dark.4"
                      weight={600}
                      size={rem(18)}
                      sx={{
                        minHeight: '30px',
                      }}
                    >
                      {dish.name}
                    </Title>
                    {shoppingCart.filter((cartDish) => cartDish.id === dish.id).length > 0 && (
                      <Flex justify="center" gap={5} align="center">
                        <Text color="gray.7" size="sm">
                          {shoppingCart
                            .filter((cartDish) => cartDish.id === dish.id)
                            .map((cartDish) => cartDish.quantity)}
                        </Text>
                        <ActionIcon
                          color="red"
                          variant="light"
                          onClick={() => {
                            removeFromCart(dish.id);
                          }}
                        >
                          <IconX />
                        </ActionIcon>
                      </Flex>
                    )}
                  </Flex>
                  <Divider mt={10} mb={10} />
                  <Flex justify="space-between" align="center">
                    <Text color="gray.8">$ {dish.price}</Text>
                    <Flex justify="center" gap={10} align="center">
                      <Button
                        color="orange"
                        variant="light"
                        onClick={() => {
                          setDishId(dish.id);
                          setDishQuantity(() => {
                            const quantity = shoppingCart
                              .filter((qdish) => qdish.id === dish.id)
                              .map((qdish) => qdish.quantity);
                            return quantity.length > 0 ? quantity[0] : 1;
                          });
                          openDish();
                        }}
                      >
                        Agregar al pedido
                      </Button>
                    </Flex>
                  </Flex>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </Container>
      </Layout>
      <Affix position={{ bottom: rem(20), right: rem(20) }}>
        <Transition transition="slide-up" mounted={shoppingCart.length > 0}>
          {(transitionStyles) => (
            <Flex justify="space-evenly" align="center" gap={10} direction="column">
              <Button
                color="red"
                leftIcon={<IconTrash />}
                style={transitionStyles}
                variant="light"
                onClick={removeAllFromCart}
                fullWidth
              >
                Vaciar pedido
              </Button>

              <Button
                component={Link}
                to={`/order/${table}`}
                color="green.8"
                leftIcon={<IconShoppingCart />}
                style={transitionStyles}
                fullWidth
              >
                Realizar pedido
              </Button>
            </Flex>
          )}
        </Transition>
      </Affix>
    </>
  );
};
