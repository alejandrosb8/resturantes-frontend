import React from 'react';
import Layout from '../layouts/Default';
import { Button, Input, Container, Group, Anchor, Title } from '@mantine/core';
import colors from '../utils/colors';

function Login() {
  return (
    <Layout>
      <Container
        mt={50}
        size="xs"
        p={40}
        sx={{
          backgroundColor: colors.primary,
          borderRadius: '0.25rem',
          boxShadow: '0 0 10px rgba(66, 31, 18, 0.1)',
        }}
      >
        <Title order={1}>Inicia sesión</Title>
        <form>
          <Input
            label="Correo electrónico"
            type="email"
            required
            mt={20}
            placeholder="Ingrese su correo electrónico..."
          />
          <Input label="Contraseña" type="password" required mt={15} placeholder="Ingrese su contraseña..." />
          <Group>
            <Button type="submit" mt={15} color="orange">
              Iniciar sesión
            </Button>
            <Anchor href="/register" mt={15} color="orange">
              ¿No tienes cuenta? Regístrate
            </Anchor>
          </Group>
        </form>
      </Container>
    </Layout>
  );
}

export default Login;
