import useAuth from '../hooks/useAuth.js';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useShopping } from '../contexts/ShoppingContext.jsx';
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
  NumberInput,
  rem,
  Text,
  Title,
  Transition,
  Image,
} from '@mantine/core';
import { useInputState } from '@mantine/hooks';
import Layout from '../layouts/Default.jsx';
import { IconShoppingCart, IconTrash, IconArrowLeft } from '@tabler/icons-react';
import { AnimatedLink } from '../components/AnimatedLink.jsx';

const EXAMPLE_IMAGE_URL =
  'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80';

export const DishesPage = () => {
  const { authTokens, setAuthTokens, setUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pcategory = searchParams.get('category');
  const categoryNameParam = searchParams.get('name');
  const [category, setCategory] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { shoppingCart, addToCart, removeFromCart, removeAllFromCart } = useShopping();
  const [dishId, setDishId] = useState(null);
  const [dishQuantity, setDishQuantity] = useInputState(() => {
    const quantity = shoppingCart.filter((dish) => dish.id === dishId).map((dish) => dish.quantity);
    return quantity.length > 0 ? quantity[0] : 1;
  });

  const { table } = useUserTable();

  const animationHomePage = [
    {
      transform: ['translateY(0%)', 'translateY(100%)'],
      zIndex: [1, 1],
    },
    {
      duration: 200,
      easing: 'ease-out',
      pseudoElement: '::view-transition-old(root)',
    },
  ];

  const handleOpenDetailsClick = (dish) => {
    /*if (document.startViewTransition) {
      document.startViewTransition(() => {
        flushSync(() => {
          setDishId(dish);
          setDishQuantity(() => {
            const quantity = shoppingCart.filter((qdish) => qdish.id === dish).map((qdish) => qdish.quantity);
            return quantity.length > 0 ? quantity[0] : 1;
          });
        });
      });
    } else {*/
    setDishId(dish);
    setDishQuantity(() => {
      const quantity = shoppingCart.filter((qdish) => qdish.id === dish).map((qdish) => qdish.quantity);
      return quantity.length > 0 ? quantity[0] : 1;
    });
  };

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

  return (
    <>
      <Layout navbar="user" header>
        <Container size="xl" p={0} mb={80}>
          {!dishId && (
            <Flex justify="flex-start" align="center" gap={10}>
              <ActionIcon
                component={AnimatedLink}
                animation={animationHomePage}
                to={`/${table}`}
                variant="subtle"
                color="orange"
                inlineStyles={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconArrowLeft color="#FD7E14" />
              </ActionIcon>
              <Title order={1} color="dark.4">
                {categoryNameParam ? categoryNameParam : category?.name}
              </Title>
            </Flex>
          )}
          {loading ? (
            <LoadingView />
          ) : (
            <>
              {dishId ? (
                <>
                  {/*Dish detail*/}

                  <Transition transition="slide-up" mounted={dishId}>
                    {(transitionStyles) => (
                      <Container
                        style={transitionStyles}
                        size="xs"
                        p={0}
                        sx={{
                          backgroundColor: 'white',
                        }}
                      >
                        <Flex justify="center" align="center" direction="column">
                          <Image
                            src={EXAMPLE_IMAGE_URL}
                            alt={dishes.filter((dish) => dish.id === dishId).map((dish) => dish.name)}
                            style={{
                              viewTransitionName: `${dishId}`,
                              maxWidth: '400px',
                              ...transitionStyles,
                            }}
                          />
                          <Container
                            size="xs"
                            p={10}
                            sx={{
                              margin: 'auto',
                              marginTop: '10px',
                            }}
                          >
                            <Title
                              order={1}
                              color="dark.4"
                              weight={600}
                              size={rem(26)}
                              align="center"
                              mt={20}
                              sx={{
                                minHeight: '30px',
                              }}
                            >
                              {dishes.filter((dish) => dish.id === dishId).map((dish) => dish.name)}
                            </Title>
                            <Text size={rem(18)} align="center" color="dark.4">
                              $ {dishes.filter((dish) => dish.id === dishId).map((dish) => dish.price)}
                            </Text>
                            <NumberInput
                              value={dishQuantity}
                              onChange={setDishQuantity}
                              min={0}
                              max={1000}
                              label="Cantidad"
                              mt={20}
                              mb={20}
                              size="lg"
                              stepHoldDelay={500}
                              stepHoldInterval={100}
                              sx={{
                                width: '100%',
                                maxWidth: '300px',
                              }}
                            />
                            <Text size={rem(16)} align="center" color="dark.4">
                              Precio por la cantidad seleccionada
                            </Text>
                            <Text size={rem(22)} align="center" color="dark.5">
                              ${' '}
                              {(
                                dishes.filter((dish) => dish.id === dishId).map((dish) => dish.price) * dishQuantity
                              ).toFixed(2)}
                            </Text>

                            <Flex justify="center" align="center" direction="column" gap={10} mt={20}>
                              <Button
                                color="orange"
                                size="lg"
                                fullWidth
                                onClick={() => {
                                  addToCart(dishId, dishQuantity);
                                  setDishId(null);
                                }}
                              >
                                Agregar al pedido
                              </Button>
                              <Button
                                variant="outline"
                                color="red"
                                size="lg"
                                fullWidth
                                onClick={() => {
                                  setDishId(null);
                                  setDishQuantity(0);
                                }}
                              >
                                Borrar del pedido
                              </Button>
                            </Flex>
                          </Container>
                        </Flex>
                      </Container>
                    )}
                  </Transition>
                </>
              ) : (
                <>
                  {/*Dishes list*/}

                  <Divider mt={10} mb={10} />

                  {(!dishes || dishes.length < 1) && (
                    <Title order={2} color="dark.4">
                      No hay platos en esta categoría
                    </Title>
                  )}

                  <Grid mt={10} sx={{ width: '100%', margin: '0' }}>
                    {dishes.map((dish) => (
                      <Grid.Col key={dish.id} span={12} xs={6} lg={4} style={{ maxWidth: '520px' }}>
                        <Card
                          shadow="sm"
                          style={{ height: '100%', width: '100%', maxWidth: '520px', position: 'relative' }}
                          p={10}
                        >
                          {shoppingCart.filter((cartDish) => cartDish.id === dish.id)[0]?.quantity && (
                            <Flex
                              justify="center"
                              align="center"
                              direction="column"
                              p={14}
                              style={{
                                position: 'absolute',
                                top: '0',
                                left: '0',
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                zIndex: '100',
                              }}
                            >
                              <Text color="gray.7" size="xl" weight={600} align="center">
                                {dish.name}
                              </Text>
                              <Text color="gray.7" size="lg" weight={600} align="center" mt={5}>
                                Cantidad: {shoppingCart.filter((cartDish) => cartDish.id === dish.id)[0].quantity}
                              </Text>
                              <Flex justify="center" align="center" direction="column" gap={5} mt={10}>
                                <Button
                                  fullWidth
                                  color="orange"
                                  mt={10}
                                  onClick={() => {
                                    handleOpenDetailsClick(dish.id);
                                  }}
                                >
                                  Agregar más
                                </Button>
                                <Button
                                  fullWidth
                                  color="red"
                                  variant="light"
                                  mt={10}
                                  onClick={() => {
                                    removeFromCart(dish.id);
                                  }}
                                >
                                  Quitar
                                </Button>
                              </Flex>
                            </Flex>
                          )}
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
                              {dish?.name}
                            </Title>
                          </Flex>
                          <Divider mt={10} mb={10} />
                          <Flex justify="space-between" align="center">
                            <Text color="gray.8">$ {dish.price}</Text>
                            <Button
                              color="orange"
                              variant="light"
                              onClick={() => {
                                handleOpenDetailsClick(dish.id);
                              }}
                            >
                              Agregar al pedido
                            </Button>
                          </Flex>
                        </Card>
                      </Grid.Col>
                    ))}
                  </Grid>
                </>
              )}
            </>
          )}
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
