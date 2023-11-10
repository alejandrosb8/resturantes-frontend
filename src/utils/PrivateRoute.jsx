import { Navigate, useParams } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useCallback, useEffect, useState } from 'react';
import axios from './axios';
import { TableContext } from '../contexts/TableContext';
import LoadingView from '../components/LoadingView';
import { ShoppingProvider } from '../contexts/ShoppingContext';

const GET_TABLE_URL = '/tables';

export const PrivateRouteUser = ({ children, loginOrRegister, support }) => {
  let { user } = useAuth();

  const [table, setTable] = useState('loading');

  const { tableId } = useParams();

  const evaluateTable = useCallback(async () => {
    let response;
    try {
      response = await axios.get(GET_TABLE_URL + '/' + tableId);

      if (response.status === 200) {
        setTable(tableId);
      } else {
        setTable(null);
      }
    } catch (error) {
      setTable(null);
    }

    console.log(user);
  }, [tableId]);

  useEffect(() => {
    if (tableId) {
      evaluateTable();
    } else {
      setTable(null);
    }
  }, [evaluateTable, tableId]);

  if (support) {
    return <TableContext.Provider value={{ table, setTable }}>{children}</TableContext.Provider>;
  }

  if (!table) {
    return <Navigate to="/not-qr" />;
  }

  if (table === 'loading') {
    return <LoadingView />;
  }

  if (!user && !loginOrRegister) {
    return <Navigate to={`/login/${table}`} />;
  }

  if (user?.role !== 'customer' && !loginOrRegister) {
    return <Navigate to={`/login/${table}`} />;
  }

  return (
    <TableContext.Provider value={{ table, setTable }}>
      <ShoppingProvider>{children}</ShoppingProvider>
    </TableContext.Provider>
  );
};

export const PrivateRouteAdmin = ({ children }) => {
  let { user } = useAuth();

  if (!user || user?.role !== 'admin') {
    return <Navigate to="/admin/login" />;
  }

  return children;
};
