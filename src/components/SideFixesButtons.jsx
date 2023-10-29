import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useShopping } from '../contexts/ShoppingContext';
import { IconShoppingCart, IconTrash, IconCreditCard } from '@tabler/icons-react';
import { Affix, Button, Flex, rem, Transition } from '@mantine/core';
import useUserTable from '../hooks/useTable';
import { axiosPrivate } from '../utils/axios';
import useAuth from '../hooks/useAuth';
import { modals } from '@mantine/modals';

function SideFixesButtons() {
  const { shoppingCart, removeAllFromCart } = useShopping();
  const { table } = useUserTable();
  const [inDebt, setInDebt] = useState(false);
  const { authTokens, setAuthTokens, setUser, user } = useAuth();

  useEffect(() => {
    axiosPrivate(authTokens, setAuthTokens, setUser, 'customer')
      .get(`/customers/${user.sub}/orders?inDebt=true`)
      .then((response) => {
        const orders = response.data.status;
        if (orders && orders.length > 0) {
          setInDebt(true);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [authTokens, setAuthTokens, setUser, user.sub]);

  return (
    <Affix position={{ bottom: rem(20), right: rem(20) }}>
      <Transition transition="slide-up" mounted={shoppingCart.length > 0}>
        {(transitionStyles) => (
          <Flex justify="space-evenly" align="center" gap={10} direction="column" mb={10}>
            <Button
              color="red"
              leftIcon={<IconTrash />}
              style={transitionStyles}
              variant="light"
              onClick={() => {
                modals.openConfirmModal({
                  title: 'Vaciar pedido',
                  children: '¿Estás seguro de que quieres vaciar el pedido?',
                  labels: { cancel: 'Cancelar', confirm: 'Vaciar' },
                  centered: true,
                  onConfirm: () => {
                    removeAllFromCart();
                  },
                });
              }}
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
      <Transition transition="slide-up" mounted={inDebt} mt={10}>
        {(transitionStyles) => (
          <Button
            component={Link}
            to={`/payment/${table}`}
            color="blue"
            leftIcon={<IconCreditCard />}
            style={transitionStyles}
            fullWidth
          >
            Pagar
          </Button>
        )}
      </Transition>
    </Affix>
  );
}

export default SideFixesButtons;
