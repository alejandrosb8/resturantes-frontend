import Layout from '../../layouts/Default';
import { Title, Container, Text, Stack, Box, TextInput, PasswordInput, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import useAuth from '../../hooks/useAuth';
import { useState } from 'react';

function AdminSettings() {
  const { adminUpdate } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const adminDataForm = useForm({
    initialValues: {
      username: '',
      password: '',
      confirmPassword: '',
    },

    validate: {
      username: (value) => (/^[a-zA-Z0-9_]{3,16}$/.test(value) ? null : 'El nombre de usuario no es válido'),
      password: (value) => (/^[\s\S]{5,}$/.test(value) ? null : 'La contraseña debe contener al menos 8 caracteres'),
      confirmPassword: (value) => (value === adminDataForm.values.password ? null : 'Las contraseñas no coinciden'),
    },
  });

  const handleAdminDataSubmit = async (values) => {
    setLoading(true);

    const { username, password } = values;
    const responseRaw = await adminUpdate(username, password);
    const response = responseRaw.response;

    if (responseRaw.status === 200) {
      setErrorMsg('Cambios guardados correctamente');
    } else if (response.data.message === 'USER_NOT_FOUND') {
      setErrorMsg('El nombre de usuario no existe');
    } else {
      setErrorMsg('Ha ocurrido un error');
    }

    setLoading(false);
  };

  return (
    <Layout navbar="admin" navbarActive="admin-settings">
      <Container>
        <Stack align="flex-start">
          <Box>
            <Title order={1}>Configuración</Title>
          </Box>
          <Box>
            <Title order={2} mt={20}>
              Cuenta
            </Title>
            <Text color="gray.6" mt={10}>
              Cambia el nombre de usuario o contraseña de la cuenta de administrador.
            </Text>
            <form onSubmit={adminDataForm.onSubmit((values) => handleAdminDataSubmit(values))}>
              <Stack spacing="xs" mt={20}>
                <TextInput label="Nombre de usuario" type="text" {...adminDataForm.getInputProps('username')} />
                <PasswordInput label="Contraseña" {...adminDataForm.getInputProps('password')} />
                <PasswordInput label="Confirmar contraseña" {...adminDataForm.getInputProps('confirmPassword')} />
              </Stack>
              {errorMsg && (
                <Text color="red" mt={15}>
                  {errorMsg}
                </Text>
              )}
              <Stack spacing="xs" mt={15}>
                <Button type="submit" fullWidth loading={loading}>
                  Guardar cambios
                </Button>
              </Stack>
            </form>
          </Box>
        </Stack>
      </Container>
    </Layout>
  );
}

export default AdminSettings;
