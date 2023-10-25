import Layout from '../../layouts/Default';
import { Title, Container, Text, Stack, Box, SimpleGrid } from '@mantine/core';
import Chart from 'react-apexcharts';

function AdminHome() {
  return (
    <Layout navbar="admin" navbarActive="admin-home" header>
      <Container>
        <Stack align="flex-start">
          <Box>
            <Title order={1}>Bienvenido</Title>
            <Text>Esta es la página de inicio del administrador</Text>
          </Box>
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              columnGap: '4rem',
              marginTop: '2rem',
              flexWrap: 'wrap',
              rowGap: '2rem',
            }}
          >
            <Chart
              options={{
                chart: {
                  id: 'basic-bar',
                },
                xaxis: {
                  categories: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
                },
              }}
              series={[
                {
                  name: 'series-1',
                  data: [30, 40, 45, 50, 49, 60],
                },
              ]}
              type="bar"
              width="450"
            />
            <Chart
              type="donut"
              width="380"
              series={[44, 55, 13, 43, 22]}
              options={{
                labels: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'],
              }}
            />
            <Chart
              type="donut"
              width="380"
              series={[44, 55, 13, 43, 22]}
              options={{
                labels: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'],
              }}
            />
            <Chart
              options={{
                chart: {
                  id: 'basic-bar',
                },
                xaxis: {
                  categories: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
                },
              }}
              series={[
                {
                  name: 'series-1',
                  data: [30, 40, 45, 50, 49, 60],
                },
              ]}
              type="bar"
              width="450"
            />
          </div>
        </Stack>
      </Container>
    </Layout>
  );
}

export default AdminHome;
