import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { axiosPrivate } from '../utils/axios';
import Layout from '../layouts/Default';
import LoadingView from '../components/LoadingView';
import { useShopping } from '../contexts/ShoppingContext';
import { IconShoppingCart, IconTrash } from '@tabler/icons-react';
import useUserTable from '../hooks/useTable';
import { AnimatedLink } from '../components/AnimatedLink.jsx';
import {
  Box,
  Title,
  Button,
  Grid,
  Divider,
  Flex,
  rem,
  Container,
  Affix,
  Transition,
  BackgroundImage,
  Text,
} from '@mantine/core';

const EXAMPLE_IMAGE_URL =
  'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80';

const animationDishPage = [
  [
    { transform: 'translateY(100%)' },
    { transform: 'translateY(66%)' },
    { transform: 'translateY(33%)' },
    { transform: 'translateY(0px)' },
    { transform: 'translateY(10px)' },
    { transform: 'translateY(0px)' },
    { transform: 'translateY(5px)' },
    { transform: 'translateY(0)' },
  ],
  {
    duration: 500,
    easing: 'ease-in',
    pseudoElement: '::view-transition-new(root)',
  },
];

function Home() {
  const { authTokens, setAuthTokens, setUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const { shoppingCart, removeAllFromCart } = useShopping();

  const { table } = useUserTable();

  useEffect(() => {
    setLoading(true);
    axiosPrivate(authTokens, setAuthTokens, setUser, 'customer')
      .get('/categories')
      .then((response) => {
        setCategories(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        if (error.response.status === 404) {
          setLoading(false);
        } else {
          navigate(`/login/${table}`);
        }
      });
  }, [authTokens, setAuthTokens, setUser, navigate, table]);

  return (
    <>
      {loading && <LoadingView />}

      <Layout navbar="user" header>
        <Container size="xl" p={0} mb={80}>
          <Title order={1} color="dark.4">
            Menú
          </Title>
          <Divider mt={10} mb={10} />
          <Grid mt={10}>
            {categories.length === 0 && !loading && (
              <Text align="center" size="xl">
                No hay platos disponibles
              </Text>
            )}
            {categories.map((category) => (
              <Grid.Col key={category.id} span={12} xs={6} lg={4} style={{ maxWidth: '470px' }}>
                <Box
                  shadow="sm"
                  component={AnimatedLink}
                  to={`/dishes/${table}?category=${category.id}&name=${category.name}`}
                  animation={animationDishPage}
                  sx={{
                    textDecoration: 'none',
                  }}
                >
                  <BackgroundImage
                    src={EXAMPLE_IMAGE_URL}
                    sx={{
                      height: '200px',
                      position: 'relative',
                      '&:hover': {
                        cursor: 'pointer',
                      },
                    }}
                    p={10}
                    radius="xs"
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0, 0, 0, 0.5)',
                        zIndex: '1',
                      }}
                    ></div>

                    <Title
                      order={2}
                      sx={{
                        color: 'white',
                        zIndex: '2',
                        position: 'relative',
                        textDecoration: 'none',
                      }}
                    >
                      {category.name}
                    </Title>
                  </BackgroundImage>
                </Box>
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
}

export default Home;
