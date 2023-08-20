import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { axiosPrivate } from '../utils/axios';
import Layout from '../layouts/Default';
import LoadingView from '../components/LoadingView';
import useUserTable from '../hooks/useTable';
import { AnimatedLink } from '../components/AnimatedLink.jsx';
import SideFixesButtons from '../components/SideFixesButtons';
import { Box, Title, Grid, Divider, Container, BackgroundImage, Text } from '@mantine/core';

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
                    src={category.imageUrl}
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
      <SideFixesButtons />
    </>
  );
}

export default Home;
