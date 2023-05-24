import React from 'react';
import Layout from '../../layouts/Default';
import { Button, TextInput, Container, Divider, Title, Stack, Text, PasswordInput, SimpleGrid } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Link } from 'react-router-dom';
import { size } from '../../utils/breakpoints';

function Register() {
  const isMobile = useMediaQuery(`(max-width: ${size.mobileL})`);
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
            transform: 'translate(-50%, -45vh)',
            backgroundColor: 'white',
            borderRadius: '0.25rem',
            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.25)',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          <Title order={1} color="gray.8">
            Regístrate
          </Title>
          <form>
            <Stack spacing="xs" mt={20}>
              <SimpleGrid cols={isMobile ? 1 : 2}>
                <TextInput label="Nombre" type="text" required placeholder="Ingrese su nombre..." />
                <TextInput label="Apellido" type="text" required placeholder="Ingrese su apellido..." />
              </SimpleGrid>

              <TextInput
                label="Correo electrónico"
                type="email"
                required
                placeholder="Ingrese su correo electrónico..."
              />
              <TextInput label="DNI" type="number" required placeholder="Ingrese su DNI..." />
              <TextInput label="Número telefónico" type="tel" required placeholder="Ingrese su número telefónico..." />
              <PasswordInput label="Contraseña" required placeholder="Ingrese su contraseña..." />
              <PasswordInput label="Confirmar contraseña" required placeholder="Ingrese su contraseña..." />
            </Stack>
            <Stack spacing="xs" mt={15}>
              <Button type="submit" fullWidth>
                Regístrate
              </Button>
              <Divider
                orientation="horizontal"
                labelPosition="center"
                label={<Text color="#666">¿Ya tienes una cuenta?</Text>}
              />
              <Button component={Link} to="/login" variant="outline" fullWidth>
                Inicia sesión
              </Button>
            </Stack>
          </form>
        </Container>
      </Layout>
    </>
  );
}

export default Register;
