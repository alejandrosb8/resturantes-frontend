import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { axiosPrivate } from '../utils/axios';
import Layout from '../layouts/Default';
import LoadingView from '../components/LoadingView';
import { useShopping } from '../contexts/ShoppingContext';
import { IconShoppingCart, IconX, IconTrash } from '@tabler/icons-react';
import { useDisclosure, useInputState } from '@mantine/hooks';
import useUserTable from '../hooks/useTable';
import {
  Card,
  Title,
  Text,
  Button,
  Image,
  Grid,
  Divider,
  Flex,
  rem,
  Container,
  Affix,
  Transition,
  Modal,
  NumberInput,
  ActionIcon,
} from '@mantine/core';

const EXAMPLE_IMAGE_URL =
  'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80';

function Home() {
  const { authTokens, setAuthTokens, setUser } = useAuth();
  const navigate = useNavigate();

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
    axiosPrivate(authTokens, setAuthTokens, setUser, 'customer')
      .get('/dishes')
      .then((response) => {
        setDishes(response.data.data);
        setLoading(false);
      })
      .catch(() => {
        navigate(`/login/${table}`);
      });
  }, [authTokens, setAuthTokens, setUser, navigate, table]);

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
        title="Añadir plato al carrito"
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
            Añadir al carrito
          </Button>
        </Flex>
      </Modal>

      {/*Main page*/}

      <Layout navbar="user" header>
        <Container size="xl" p={0}>
          <Title order={1} color="dark.4">
            Menú del día
          </Title>
          <Text color="dark.4" mt={10} sx={{ textWrap: 'balance' }}>
            Aquí puedes ver todos los platos que tenemos disponibles. Pulsa en realizar pedido cuando hayas terminado de
            agregar platos al carrito.
          </Text>
        </Container>

        <Container size="xl" p={0} mt={40} mb={80}>
          <Title order={2} color="dark.4">
            Platos
          </Title>
          <Divider mt={10} mb={10} />
          <Grid mt={10}>
            {dishes.map((dish) => (
              <Grid.Col key={dish.id} span={12} xs={6} lg={4} style={{ maxWidth: '470px' }}>
                <Card shadow="sm" style={{ height: '100%' }} p={10}>
                  <Card.Section>
                    <Image src={EXAMPLE_IMAGE_URL} height={200} alt={dish.name} />
                  </Card.Section>
                  <Title order={3} color="dark.4" weight={600} mt={10} size={rem(18)}>
                    {dish.name}
                  </Title>
                  <Divider mt={10} mb={10} />
                  <Flex justify="space-between" align="center">
                    <Text color="gray.8">$ {dish.price}</Text>
                    <Flex justify="center" gap={10} align="center">
                      {shoppingCart.filter((cartDish) => cartDish.id === dish.id).length > 0 && (
                        <ActionIcon
                          color="red"
                          variant="light"
                          onClick={() => {
                            removeFromCart(dish.id);
                          }}
                        >
                          <IconX />
                        </ActionIcon>
                      )}
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
                        Agregar al carrito
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
                Vaciar carrito
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
}

export default Home;
