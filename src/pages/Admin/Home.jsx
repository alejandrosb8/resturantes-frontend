import Layout from '../../layouts/Default';
import { Title, Container, Text, Stack, Box } from '@mantine/core';

function AdminHome() {
  return (
    <Layout navbar="admin" navbarActive="admin-home" header>
      <Container>
        <Stack align="flex-start">
          <Box>
            <Title order={1}>Bienvenido</Title>
            <Text>Esta es la página de inicio del administrador</Text>
          </Box>
          <Text>
            Usa el menú de la izquierda para navegar (si estás en un dispositivo móvil, presiona el botón de la esquina
            superior izquierda para abrir el menú)
          </Text>
        </Stack>
      </Container>
    </Layout>
  );
}

export default AdminHome;
