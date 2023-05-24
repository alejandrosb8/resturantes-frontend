import React from 'react';
import Layout from '../../layouts/Default';
import { Button, TextInput, Container, Title, Stack, PasswordInput, Text } from '@mantine/core';
//import { Link } from 'react-router-dom';

function Login() {
  return (
    <>
      <Container
        style={{
          minWidth: '100%',
          maxWidth: '1320px',
          padding: '0',
          backgroundColor: 'transparent',
          position: 'absolute',
          top: '0',
          left: '0',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" style={{ backgroundColor: 'transparent' }}>
          <path
            fill="#FD7E14"
            fillOpacity="1"
            d="M0,64L80,101.3C160,139,320,213,480,213.3C640,213,800,139,960,128C1120,117,1280,171,1360,197.3L1440,224L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
            max
          ></path>
        </svg>
      </Container>
      <Layout>
        <Container
          mt={50}
          size="xs"
          p={40}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            minWidth: '340px',
            width: '100%',
            maxWidth: 'min(90%, 540px)',
            transform: 'translate(-50%, min(-40vh, -200px))',
            backgroundColor: 'white',
            borderRadius: '0.25rem',
            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.25)',
          }}
        >
          <Title order={1} color="gray.8">
            Inicia sesión
          </Title>
          <Text color="gray.6" mt={5} mb={20}>
            Ingrese sus credenciales para iniciar sesión como administrador.
          </Text>
          <form>
            <Stack spacing="xs" mt={20}>
              <TextInput label="Nombre de usuario" type="text" required placeholder="Ingrese su nombre de usuario..." />
              <PasswordInput label="Contraseña" required placeholder="Ingrese su contraseña..." />
            </Stack>
            <Stack spacing="xs" mt={15}>
              <Button type="submit" fullWidth>
                Iniciar sesión
              </Button>
            </Stack>
          </form>
        </Container>
      </Layout>
    </>
  );
}

export default Login;
