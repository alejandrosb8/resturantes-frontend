import Layout from '../../layouts/Default';
import { Title, Text, Table } from '@mantine/core';
import { axiosPrivate } from '../../utils/axios';
import { useEffect, useState, useCallback } from 'react';
import useAuth from '../../hooks/useAuth';

function AdminTables() {
  const [tables, setTables] = useState([]);
  const { authTokens, setAuthTokens, setUser } = useAuth();

  const getTables = useCallback(() => {
    axiosPrivate(authTokens, setAuthTokens, setUser)
      .get('/tables')
      .then((response) => {
        setTables(response.data.data);
        console.log(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [authTokens, setAuthTokens, setUser]);

  useEffect(() => {
    getTables();
  }, [getTables]);

  return (
    <Layout navbar="admin" navbarActive="admin-tables" header>
      <Title order={1}>Mesas</Title>
      <Text mt={20}>Lista de mesas</Text>
      <Table striped>
        <thead>
          <tr>
            <th>ID</th>
            <th>Descripción</th>
          </tr>
        </thead>
        <tbody>
          {tables.map((table) => (
            <tr key={table.id}>
              <td>{table.id}</td>
              <td>{table.description}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Layout>
  );
}

export default AdminTables;
