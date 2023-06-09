import React, { useState } from 'react';
import Layout from '../../layouts/Default';
import { Button, TextInput, Container, Title, Stack, PasswordInput, Text, Divider } from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useForm } from '@mantine/form';

function Login() {
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const { adminLogin } = useAuth();

  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },

    validate: {
      username: (value) => (/^[a-zA-Z0-9_]{3,16}$/.test(value) ? null : 'El nombre de usuario no es válido'),
      password: (value) => (/^[\s\S]{5,}$/.test(value) ? null : 'La contraseña debe contener al menos 8 caracteres'),
    },
  });

  const handleSubmit = async (values) => {
    setLoading(true);

    const { username, password } = values;
    const responseRaw = await adminLogin(username, password);
    const response = responseRaw.response;

    if (responseRaw.status === 200) {
      navigate('/admin');
    } else if (response.data.message === 'USERNAME_NOT_FOUND') {
      setErrorMsg('El nombre de usuario no existe');
    } else if (response.data.message === 'WRONG_PASSWORD') {
      setErrorMsg('La contraseña es incorrecta');
    } else {
      setErrorMsg(response.data.message);
    }

    setLoading(false);

    return response;
  };

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
          <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
            <Stack spacing="xs" mt={20}>
              <TextInput
                label="Nombre de usuario"
                type="text"
                placeholder="Ingrese su nombre de usuario..."
                {...form.getInputProps('username')}
              />
              <PasswordInput
                label="Contraseña"
                placeholder="Ingrese su contraseña..."
                {...form.getInputProps('password')}
              />
            </Stack>
            {errorMsg && (
              <Text color="red" mt={15}>
                {errorMsg}
              </Text>
            )}
            <Stack spacing="xs" mt={15}>
              <Button type="submit" fullWidth loading={loading}>
                Iniciar sesión
              </Button>
              <Divider
                label={
                  <Text size={12} color="gray.6">
                    O
                  </Text>
                }
                labelPosition="center"
              />
              <Button component={Link} to="/login" fullWidth variant="outline">
                Iniciar sesión como usuario
              </Button>
            </Stack>
          </form>
        </Container>
      </Layout>
    </>
  );
}

export default Login;
