import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../layouts/Default';
import LoadingView from '../components/LoadingView';
import { useShopping } from '../contexts/ShoppingContext';
import { axiosPrivate } from '../utils/axios';
import useAuth from '../hooks/useAuth';
import useUserTable from '../hooks/useTable';
import { Title, Text, Button, Divider, Flex, Container, Table } from '@mantine/core';

function OrderPage() {
  const { shoppingCart } = useShopping();
  const { authTokens, setAuthTokens, setUser } = useAuth();
  const [orderDishes, setOrderDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const { table } = useUserTable();

  useEffect(() => {
    setLoading(true);
    if (shoppingCart.length === 0) {
      navigate('/');
    }

    axiosPrivate(authTokens, setAuthTokens, setUser, 'customer')
      .get('/dishes')
      .then((response) => {
        const dishes = response.data.data;

        const orderDishesToSet = shoppingCart.map((dish) => {
          const dishData = dishes.find((d) => d.id === dish.id);
          return {
            ...dishData,
            quantity: dish.quantity,
          };
        });

        setOrderDishes(orderDishesToSet);

        setLoading(false);
      })
      .catch(() => {
        navigate('/');
      });
  }, [shoppingCart, navigate, authTokens, setAuthTokens, setUser]);

  if (loading) {
    return <LoadingView />;
  }

  return (
    <Layout>
      <Container p={0}>
        <Title order={1}>Ordenar pedido</Title>
        <Text mt={10}>Revisa el pedido con los platos que has agregado y confírmelo</Text>

        <Table mt={30}>
          <thead>
            <tr>
              <th>Articulo</th>
              <th>Cantidad</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            {orderDishes.map((dish) => (
              <tr key={dish.id}>
                <td>{dish.name}</td>
                <td>{dish.quantity}</td>
                <td>$ {dish.price}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Flex justify="space-between" align="center" gap={10} mt={20}>
          <Text size="lg" weight={500} sx={{ flexShrink: 0 }}>
            Total
          </Text>
          <Divider sx={{ width: '100%' }} variant="dashed" size="sm" />
          <Text size="lg" weight={500} sx={{ flexShrink: 0 }}>
            $ {orderDishes.reduce((acc, dish) => acc + dish.price * dish.quantity, 0)}
          </Text>
        </Flex>
        <Flex justify="flex-end" mt={30} gap={20}>
          <Button color="red" variant="outline" component={Link} to={`/${table}`}>
            Cancelar
          </Button>
          <Button color="orange">Confirmar pedido</Button>
        </Flex>
      </Container>
    </Layout>
  );
}

export default OrderPage;
