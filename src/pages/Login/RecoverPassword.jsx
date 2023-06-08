import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { useForm } from '@mantine/form';
import { Button, TextInput, Title, Stack, Text, PasswordInput } from '@mantine/core';
import { useSearchParams } from 'react-router-dom';

function RecoverPassword({ setShowRecoverPassword }) {
  const [tokenValid, setTokenValid] = useState('');
  const [tokenSent, setTokenSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recoverSuccess, setRecoverSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [searchParams, setSearchParams] = useSearchParams();

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      setTokenValid(token);
      setSearchParams({ recoverPassword: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const { recoverPassword, changePassword } = useAuth();
  const emailForm = useForm({
    initialValues: {
      email: '',
    },

    validate: {
      email: (value) =>
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value) ? null : 'El correo electrónico no es válido',
    },
  });
  const newPasswordForm = useForm({
    initialValues: {
      password: '',
      password_confirmation: '',
    },

    validate: {
      password: (value) => (/^[\s\S]{8,}$/.test(value) ? null : 'La contraseña debe contener al menos 8 caracteres'),
      password_confirmation: (value) =>
        value === newPasswordForm.values.password
          ? value !== ''
            ? null
            : 'La contraseña debe contener al menos 8 caracteres'
          : 'Las contraseñas no coinciden',
    },
  });

  const handleSubmitEmail = async (values) => {
    setLoading(true);
    const { email } = values;
    const response = await recoverPassword(email);

    if (response.status === 200) {
      setTokenSent(true);
    } else {
      setErrorMsg('Ha ocurrido un al enviar el correo electrónico');
    }

    setLoading(false);
  };

  const handleSubmitNewPassword = async (values) => {
    setLoading(true);
    const { password } = values;
    const response = await changePassword(tokenValid, password);

    console.log(tokenValid, password);

    if (response.status === 200) {
      setRecoverSuccess(true);
    } else {
      setErrorMsg('Ha ocurrido un error al recuperar la contraseña');
    }

    setLoading(false);
  };

  if (recoverSuccess) {
    return (
      <>
        <Title order={1}>Contraseña recuperada</Title>
        <Text mt={10}>Tu contraseña ha sido recuperada exitosamente</Text>
        <Button fullWidth variant="outline" mt={25} onClick={() => setShowRecoverPassword(false)}>
          Iniciar sesión
        </Button>
      </>
    );
  }

  if (tokenSent) {
    return (
      <>
        <Title order={1}>Correo enviado</Title>
        <Text mt={10}>
          Se ha enviado un correo electrónico a la dirección {emailForm.email}. Sigue las instrucciones para recuperar
          tu contraseña.
        </Text>
      </>
    );
  }

  if (tokenValid) {
    return (
      <form onSubmit={newPasswordForm.onSubmit((values) => handleSubmitNewPassword(values))}>
        <Title order={1}>Recuperar contraseña</Title>
        <Text mt={10}>Ingresa tu nueva contraseña</Text>
        <Stack spacing="xs" mt={20}>
          <PasswordInput label="Contraseña" placeholder="Contraseña" {...newPasswordForm.getInputProps('password')} />
          <PasswordInput
            label="Confirmar contraseña"
            placeholder="Confirmar contraseña"
            {...newPasswordForm.getInputProps('password_confirmation')}
          />
        </Stack>
        <Button type="submit" loading={loading} mt={25} fullWidth>
          Confirmar
        </Button>
        {errorMsg && (
          <Text color="red" mt={10}>
            {errorMsg}
          </Text>
        )}
      </form>
    );
  }

  return (
    <form onSubmit={emailForm.onSubmit((values) => handleSubmitEmail(values))}>
      <Title order={1}>Recuperar contraseña</Title>
      <Text mt={10}>Ingresa tu correo electrónico para recuperar tu contraseña</Text>
      <Stack spacing="md" mt={20}>
        <TextInput label="Correo electrónico" placeholder="Correo electrónico" {...emailForm.getInputProps('email')} />
        <Button type="submit" loading={loading} fullWidth>
          Enviar
        </Button>
        {errorMsg && (
          <Text color="red" mt={10}>
            {errorMsg}
          </Text>
        )}
      </Stack>
    </form>
  );
}

export default RecoverPassword;
