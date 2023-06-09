import React, { useState } from 'react';
import Layout from '../../layouts/Default';
import { Button, TextInput, Container, Divider, Title, Stack, Text, PasswordInput, Anchor } from '@mantine/core';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useForm } from '@mantine/form';
//import { useNavigate } from 'react-router-dom';

function Register() {
  const form = useForm({
    initialValues: {
      fullName: '',
      email: '',
      dni: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },

    validate: {
      fullName: (value) => (/^[A-Za-zÀ-ÿ\s']+$/.test(value) ? null : 'El nombre solo debe contener letras'),
      email: (value) =>
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value) ? null : 'El correo electrónico no es válido',
      dni: (value) => (/^[0-9]{7,}$/.test(value) ? null : 'El DNI debe contener al menos 7 dígitos'),
      phone: (value) =>
        /^\+?\d{1,3}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}$/.test(value)
          ? null
          : 'El número telefónico no es válido',
      password: (value) => (/^[\s\S]{8,}$/.test(value) ? null : 'La contraseña debe contener al menos 8 caracteres'),
      confirmPassword: (value) =>
        value === form.values.password
          ? value !== ''
            ? null
            : 'La contraseña debe contener al menos 8 caracteres'
          : 'Las contraseñas no coinciden',
    },
  });

  const { register } = useAuth();

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState(false);

  //const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    const { fullName, email, dni, phone, password } = values;

    const responseRaw = await register(fullName, email, dni, phone, password);
    const response = responseRaw.response;

    if (responseRaw.status === 201) {
      setConfirmEmail(true);
    } else if (response.data.message === 'EMAIL_IN_USE') {
      form.setFieldError('email', 'El correo electrónico ya está en uso');
    } else if (response.data.message === 'DNI_IN_USE') {
      form.setFieldError('dni', 'El DNI ya está en uso');
    } else {
      setErrorMsg('Ha ocurrido un error al registrar el usuario');
    }

    setLoading(false);

    console.log(response); // eslint-disable-line
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
            transform: 'translate(-50%, -45vh)',
            backgroundColor: 'white',
            borderRadius: '0.25rem',
            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.25)',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          {confirmEmail ? (
            <>
              <Stack>
                <Title order={2} align="center">
                  Confirma tu correo electrónico
                </Title>
                <Text align="center">
                  Te hemos enviado un correo electrónico a <b>{form.values.email}</b> con un enlace para confirmar tu
                  cuenta. Cuando lo hayas hecho, podrás iniciar sesión.
                </Text>
                <Anchor component={Link} to="/login" align="center" size="lg">
                  Inicia sesión
                </Anchor>{' '}
              </Stack>
            </>
          ) : (
            <>
              <Title order={1} color="gray.8">
                Regístrate
              </Title>
              <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
                <Stack spacing="xs" mt={20}>
                  <TextInput
                    label="Nombre"
                    type="text"
                    placeholder="Ingrese su nombre completo..."
                    {...form.getInputProps('fullName')}
                  />

                  <TextInput
                    label="Correo electrónico"
                    type="email"
                    placeholder="Ingrese su correo electrónico..."
                    {...form.getInputProps('email')}
                  />
                  <TextInput label="DNI" type="number" placeholder="Ingrese su DNI..." {...form.getInputProps('dni')} />
                  <TextInput
                    label="Número telefónico"
                    type="tel"
                    placeholder="Ingrese su número telefónico..."
                    {...form.getInputProps('phone')}
                  />
                  <PasswordInput
                    label="Contraseña"
                    placeholder="Ingrese su contraseña..."
                    {...form.getInputProps('password')}
                  />
                  <PasswordInput
                    label="Confirmar contraseña"
                    placeholder="Ingrese su contraseña..."
                    {...form.getInputProps('confirmPassword')}
                  />
                </Stack>
                <Stack spacing="xs" mt={15}>
                  {errorMsg && (
                    <Text color="red" size="xs">
                      {errorMsg}
                    </Text>
                  )}
                  <Button type="submit" fullWidth loading={loading}>
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
            </>
          )}
        </Container>
      </Layout>
    </>
  );
}

export default Register;
