import React, { useEffect, useState } from 'react';
import Layout from '../layouts/Default';
import { Button, TextInput, Container, Divider, Anchor, Title, Stack, Text, PasswordInput } from '@mantine/core';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useForm } from '@mantine/form';

function Login() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isToken, setIsToken] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { verifyAccount, login } = useAuth();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      setIsToken(true);
      setTokenLoading(true);
      setSearchParams({});

      verifyAccount(token).then((response) => {
        if (response.status === 200) {
          setTokenLoading(false);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },

    validate: {
      email: (value) => (value !== '' ? null : 'El correo electrónico es requerido'),
      password: (value) => (value !== '' ? null : 'La contraseña es requerida'),
    },
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    const { email, password } = values;

    const responseRaw = await login(email, password);
    const response = responseRaw.response;

    console.log(response);

    if (response.status === 200) {
      navigate('/');
    } else if (response.status === 400) {
      setErrorMsg('Correo o contraseña incorrectos');
    } else {
      setErrorMsg(response.message);
    }
    setLoading(false);
  };

  if (isToken) {
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
              {tokenLoading ? 'Verificando cuenta...' : '¡Cuenta verificada!'}
            </Title>
            <Text color="gray.6" mt={10}>
              {tokenLoading ? 'Estamos verificando tu cuenta, espera un momento...' : 'Ya puedes iniciar sesión.'}
            </Text>
            <Stack mt={20} direction="row" justify="flex-end">
              <Button
                variant="outline"
                color="gray"
                size="sm"
                style={{ marginRight: '10px' }}
                loading={tokenLoading}
                onClick={() => {
                  setIsToken(false);
                }}
              >
                Iniciar sesión
              </Button>
            </Stack>
          </Container>
        </Layout>
      </>
    );
  }

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
          <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
            <Stack spacing="xs" mt={20}>
              <TextInput
                label="Correo electrónico"
                type="email"
                placeholder="Ingrese su correo electrónico..."
                {...form.getInputProps('email')}
              />
              <PasswordInput
                label="Contraseña"
                placeholder="Ingrese su contraseña..."
                {...form.getInputProps('password')}
              />
            </Stack>
            <Stack spacing="xs" mt={15}>
              {errorMsg && (
                <Text color="red" size="sm">
                  {errorMsg}
                </Text>
              )}
              <Button type="submit" fullWidth loading={loading}>
                Iniciar sesión
              </Button>
              <Anchor href="/" align="center" size="sm">
                ¿Olvidaste tu contraseña?
              </Anchor>
              <Divider
                orientation="horizontal"
                labelPosition="center"
                label={<Text color="#666">¿No tienes una cuenta?</Text>}
              />

              <Button component={Link} to="/register" variant="outline" fullWidth>
                Regístrate
              </Button>
            </Stack>
          </form>
        </Container>
      </Layout>
    </>
  );
}

export default Login;
