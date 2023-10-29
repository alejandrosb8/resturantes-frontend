import Layout from '../../layouts/Default';
import { Title, Container, Text, Stack, Box, Flex } from '@mantine/core';
import Chart from 'react-apexcharts';
import { axiosPrivate } from '../../utils/axios';
import { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';

function AdminHome() {
  const [data, setData] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false);
  const { authTokens, setAuthTokens, setUser } = useAuth();

  useEffect(() => {
    axiosPrivate(authTokens, setAuthTokens, setUser)
      .get(`/admin/statitics`)
      .then((response) => {
        console.log(response.data.data);
        setData(response.data.data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response.status === 404) {
          setLoading(false);
        } else {
          setData([]);
        }
      });
  }, []);

  return (
    <Layout navbar="admin" navbarActive="admin-home" header>
      <Container>
        <Stack align="flex-start">
          <Box>
            <Title order={1}>Bienvenido</Title>
            <Text>Esta es la página de inicio del administrador</Text>
          </Box>
          {data && Object.keys(data).length > 0 && (
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                columnGap: '4rem',
                marginTop: '2rem',
                flexWrap: 'wrap',
                rowGap: '2rem',
              }}
            >
              <Flex direction="column" align="flex-start" h="100%">
                <Text weight={600}>Número de ordenes</Text>
                <Chart
                  options={{
                    chart: {
                      id: 'basic-bar',
                    },
                    xaxis: {
                      categories: data?.numberOrders?.labels,
                    },
                  }}
                  series={[
                    {
                      name: 'Número de ordenes',
                      data: data?.numberOrders?.data,
                    },
                  ]}
                  type="bar"
                  width="380"
                />
              </Flex>
              <Flex direction="column" align="flex-start" h="100%">
                <Text weight={600}>Platos más pedidos</Text>
                <Chart
                  type="pie"
                  width="380"
                  series={data?.popularDishes.data}
                  options={{
                    labels: data?.popularDishes.labels,
                    legend: {
                      width: '180',
                    },
                  }}
                />
              </Flex>
              <Flex direction="column" align="flex-start">
                <Text weight={600}>Mesas más frecuentadas</Text>
                <Chart
                  type="pie"
                  width="380"
                  series={data.frequentTables.data}
                  options={{
                    labels: data.frequentTables.labels,
                  }}
                />
              </Flex>
              <Flex direction="column" align="flex-start">
                <Text weight={600}>Total de ordenes</Text>
                <Chart
                  options={{
                    chart: {
                      id: 'basic-bar',
                    },
                    xaxis: {
                      categories: data.totalOrders.labels,
                    },
                  }}
                  series={[
                    {
                      name: 'Total de ordenes',
                      data: data.totalOrders.data,
                    },
                  ]}
                  type="bar"
                  width="380"
                />
              </Flex>
            </div>
          )}
        </Stack>
      </Container>
    </Layout>
  );
}

export default AdminHome;
