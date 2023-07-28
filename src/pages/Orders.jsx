import { Table, Title } from '@mantine/core';
import useUserTable from '../hooks/useTable';
import { axiosPrivate } from '../utils/axios';
import { useEffect, useState } from 'react';
import Layout from '../layouts/Default';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import LoadingView from '../components/LoadingView';

function Orders() {
  const { table } = useUserTable();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const { authTokens, setAuthTokens, setUser, user } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (!table) {
      return;
    }

    setLoading(true);
    axiosPrivate(authTokens, setAuthTokens, setUser, 'customer')
      .get(`/customers/${user.sub}/orders`)
      .then((response) => {
        setOrders(response.data.status);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        if (error.response.status === 404) {
          setLoading(false);
        } else if (error.response.status === 401) {
          navigate(`/login/${table}`);
        }
      });

    return () => {
      setOrders([]);
    };
  }, [table]);

  if (loading) {
    return <LoadingView />;
  }

  return (
    <Layout navbarActive="orders" navbar="user" header>
      <Title>Ordenes</Title>
      <Table mt={20}>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {orders?.map((order) => (
            <tr key={order.id}>
              <td>{formatDate(order.createdAt)}</td>
              <td>$ {Number(order.total).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Layout>
  );
}

function formatDate(date) {
  const newDate = new Date(date);
  const day = newDate.getDate();
  const month = newDate.getMonth() + 1;
  const year = newDate.getFullYear();
  return `${day}-${month}-${year}`;
}

export default Orders;
