import Layout from '../../layouts/Default';
import { Title, Text, Table } from '@mantine/core';

function AdminTables() {
  return (
    <Layout navbar="admin" navbarActive="admin-tables" header>
      <Title order={1}>Mesas</Title>
      <Text>Lista de mesas</Text>
      <Table striped>
        <thead>
          <tr>
            <th>UID</th>
            <th>Descripción</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Mesa 1</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Mesa 2</td>
          </tr>
        </tbody>
      </Table>
    </Layout>
  );
}

export default AdminTables;
