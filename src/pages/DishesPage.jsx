import useAuth from '../hooks/useAuth.js';
import { useNavigate, useSearchParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useShopping } from '../contexts/ShoppingContext.jsx';
import useUserTable from '../hooks/useTable.js';
import { axiosPrivate } from '../utils/axios.js';
import LoadingView from '../components/LoadingView.jsx';
import SideFixesButtons from '../components/SideFixesButtons.jsx';
import {
  ActionIcon,
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
  Image,
  Textarea,
} from '@mantine/core';
import { useInputState } from '@mantine/hooks';
import Layout from '../layouts/Default.jsx';
import { IconArrowLeft } from '@tabler/icons-react';
import { AnimatedLink } from '../components/AnimatedLink.jsx';
import { motion, AnimatePresence } from 'framer-motion';

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
  const { shoppingCart, addToCart, removeFromCart } = useShopping();
  const [dishId, setDishId] = useState(null);
  const [dishQuantity, setDishQuantity] = useInputState(() => {
    const quantity = shoppingCart.filter((dish) => dish.id === dishId).map((dish) => dish.quantity);
    return quantity.length > 0 ? quantity[0] : 1;
  });
  const [dishNote, setDishNote] = useInputState(() => {
    const note = shoppingCart.filter((dish) => dish.id === dishId).map((dish) => dish.note);
    return note.length > 0 ? note[0] : '';
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
    setDishId(dish);
    setDishQuantity(() => {
      const quantity = shoppingCart.filter((qdish) => qdish.id === dish).map((qdish) => qdish.quantity);
      return quantity.length > 0 ? quantity[0] : 1;
    });
    setDishNote(() => {
      const note = shoppingCart.filter((qdish) => qdish.id === dish).map((qdish) => qdish.details);
      return note.length > 0 ? note[0] : '';
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
        <AnimatePresence>
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

                    <motion.div
                      initial={{ opacity: 0, y: 100 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -100 }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Container
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
                            }}
                          />
                          <Container
                            size="xs"
                            p={10}
                            sx={{
                              margin: 'auto',
                              marginTop: '10px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
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
                              ${' '}
                              {Number(dishes.filter((dish) => dish.id === dishId).map((dish) => dish.price)).toFixed(2)}
                            </Text>
                            <NumberInput
                              value={dishQuantity}
                              onChange={setDishQuantity}
                              min={1}
                              max={1000}
                              label="Cantidad"
                              mt={20}
                              mb={20}
                              size="md"
                              stepHoldDelay={500}
                              stepHoldInterval={100}
                              sx={{
                                width: '100%',
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

                            <Textarea
                              label="Nota"
                              placeholder="Agrega una nota para el cocinero sobre tu pedido"
                              autosize
                              minRows={2}
                              maxRows={4}
                              mt={20}
                              size="md"
                              sx={{
                                width: '100%',
                              }}
                              value={dishNote}
                              onChange={(e) => setDishNote(e.target.value)}
                            />

                            <Flex justify="center" align="center" direction="row" wrap="wrap" gap={10} mt={30}>
                              <Button
                                color="orange"
                                size="lg"
                                fullWidth
                                onClick={() => {
                                  addToCart(dishId, dishQuantity, dishNote.trim());
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
                                  setDishNote('');
                                }}
                              >
                                Borrar del pedido
                              </Button>
                            </Flex>
                          </Container>
                        </Flex>
                      </Container>
                    </motion.div>
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
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: '0',
                                    right: '0',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    backgroundColor: '#fff',
                                    zIndex: '100',
                                    borderRadius: '10px',
                                    width: 'auto',
                                  }}
                                >
                                  <Text color="orange" size="md" align="center">
                                    Pedido
                                  </Text>
                                </div>
                                <Text color="gray.7" size="xl" weight={600} align="center">
                                  {dish.name}
                                </Text>
                                <Text color="gray.7" size="md" weight={500} align="center" mt={5}>
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
        </AnimatePresence>
      </Layout>
      <SideFixesButtons />
    </>
  );
};
