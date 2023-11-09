import Layout from '../../layouts/Default';
import {
  Title,
  Text,
  Table,
  Skeleton,
  ActionIcon,
  Flex,
  TextInput,
  Divider,
  ScrollArea,
  UnstyledButton,
} from '@mantine/core';
import { axiosPrivate } from '../../utils/axios';
import { useEffect, useState, useCallback } from 'react';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { IconPencil, IconTrash, IconPhoto } from '@tabler/icons-react';
import { IconChevronUp, IconChevronDown } from '@tabler/icons-react';

function AdminCustomers() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authTokens, setAuthTokens, setUser } = useAuth();
  const navigate = useNavigate();

  const [orderBy, setOrderBy] = useState('');
  const [orderDirection, setOrderDirection] = useState('asc');
  const [finalOrders, setFinalOrders] = useState([]);
  const [search, setSearch] = useState('');

  // eslint-disable-next-line no-unused-vars
  const [categoryId, setCategoryId] = useState(null);
  // eslint-disable-next-line no-unused-vars, no-undef
  const [categoryData, setCategoryData] = useInputState(null);

  const getCategories = useCallback(() => {
    setLoading(true);
    axiosPrivate(authTokens, setAuthTokens, setUser)
      .get('/customers')
      .then((response) => {
        setCategories(response.data.data);
        console.log(response.data.data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response.status === 404) {
          setLoading(false);
        } else {
          setCategories([]);
        }
      });
  }, [authTokens, setAuthTokens, setUser, navigate]);

  useEffect(() => {
    setFinalOrders(
      categories
        .sort((a, b) => {
          if (orderBy) {
            if (orderBy === 'id') {
              if (orderDirection === 'asc') {
                return b.code - a.code;
              } else {
                return a.code - b.code;
              }
            }
            if (orderBy === 'name') {
              if (orderDirection === 'asc') {
                return b.name.localeCompare(a.name);
              } else {
                return a.name.localeCompare(b.name);
              }
            }
          } else {
            return;
          }
        })
        .filter(
          (order) =>
            order?.code?.toString().includes(search) ||
            order?.name?.toLowerCase().includes(search.toLowerCase()) ||
            search === '',
        ),
    );
  }, [categories, orderBy, orderDirection, search]);

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  return (
    <>
      {/* Main Page */}

      <Layout navbar="admin" navbarActive="admin-customers" header>
        <Title order={1}>Categorías</Title>
        <Text mt={20} mb={10}>
          Lista de categorías
        </Text>
        <TextInput
          label="Buscar"
          placeholder="Buscar"
          mt={10}
          mb={10}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
          }}
        />
        {loading ? (
          <>
            <Skeleton height={50} radius="sm" />
            <Skeleton height={50} mt={6} radius="sm" />
            <Skeleton height={50} mt={6} radius="sm" />
            <Skeleton height={50} mt={6} radius="sm" />
            <Skeleton height={30} mt={6} radius="sm" />
          </>
        ) : (
          <>
            <Divider />
            {categories.length <= 0 ? (
              <Text mt={20}>No hay clientes</Text>
            ) : (
              <ScrollArea>
                <Table striped>
                  <thead>
                    <tr>
                      <th>
                        <UnstyledButton
                          color="gray"
                          ml={5}
                          px={4}
                          variant="outline"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 'md',

                            '&:hover': {
                              color: 'orange',
                              backgroundColor: '#f6f6f6',
                            },
                          }}
                          onClick={() => {
                            setOrderBy('id');
                            setOrderDirection(orderBy === 'id' && orderDirection === 'asc' ? 'desc' : 'asc');
                          }}
                        >
                          <Text weight={600} size="md">
                            ID
                          </Text>
                          {orderBy === 'id' && orderDirection === 'asc' ? <IconChevronUp /> : <IconChevronDown />}
                        </UnstyledButton>
                      </th>
                      <th>
                        <UnstyledButton
                          color="gray"
                          ml={5}
                          px={4}
                          variant="outline"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 'md',

                            '&:hover': {
                              color: 'orange',
                              backgroundColor: '#f6f6f6',
                            },
                          }}
                          onClick={() => {
                            setOrderBy('name');
                            setOrderDirection(orderBy === 'name' && orderDirection === 'asc' ? 'desc' : 'asc');
                          }}
                        >
                          <Text weight={600} size="md">
                            Nombre
                          </Text>
                          {orderBy === 'name' && orderDirection === 'asc' ? <IconChevronUp /> : <IconChevronDown />}
                        </UnstyledButton>
                      </th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finalOrders.map((category) => (
                      <tr key={category.id}>
                        <td>{category.code}</td>
                        <td>{category.name}</td>
                        <td>
                          <Flex align="center" gap="xs">
                            <ActionIcon
                              variant="transparent"
                              color="orange"
                              onClick={() => {
                                setCategoryId(category.id);
                                setCategoryData({ name: category.name });
                              }}
                            >
                              <IconPencil />
                            </ActionIcon>
                            <ActionIcon
                              variant="transparent"
                              color="orange"
                              onClick={() => {
                                setCategoryId(category.id);
                              }}
                            >
                              <IconTrash />
                            </ActionIcon>
                            <ActionIcon
                              variant="transparent"
                              color="orange"
                              onClick={() => {
                                setCategoryId(category.id);
                                setCategoryData((prev) => ({ ...prev, image: category.imageUrl }));
                              }}
                            >
                              <IconPhoto />
                            </ActionIcon>
                          </Flex>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </ScrollArea>
            )}
          </>
        )}
      </Layout>
    </>
  );
}

export default AdminCustomers;
