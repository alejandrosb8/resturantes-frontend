import React from 'react';
import Layout from '../layouts/Default';
import { Button, TextInput, Container, Divider, Anchor, Title, Stack, Text, useMantineTheme, rem } from '@mantine/core';

function Login() {
  const theme = useMantineTheme();

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
            fill="#FA5252"
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
            transform: 'translate(-50%, -70%)',
            backgroundColor: 'white',
            borderRadius: '0.25rem',
            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.25)',
          }}
        >
          <Title order={1} color="gray.8">
            Inicia sesión
          </Title>
          <form>
            <Stack spacing="xs" mt={20}>
              <TextInput
                label="Correo electrónico"
                type="email"
                required
                placeholder="Ingrese su correo electrónico..."
              />
              <TextInput label="Contraseña" type="password" required placeholder="Ingrese su contraseña..." />
            </Stack>
            <Stack spacing="xs" mt={15}>
              <Button type="submit" fullWidth>
                Iniciar sesión
              </Button>
              <Anchor 
                href="/" 
                align="center"
                sx={(style) => ({
                  [style.fn.smallerThan('sm')]: { fontSize: rem(13)}
                })}
              >
                ¿Olvidaste tu contraseña?
              </Anchor>
              <Divider
                orientation="horizontal"
                labelPosition="center"
                label={<Text color="#666">¿No tienes una cuenta?</Text>}
              />
              <Button variant="outline">
                <Anchor href="/register">Regístrate</Anchor>
              </Button>
            </Stack>
          </form>
        </Container>
      </Layout>
    </>
  );
}

export default Login;
