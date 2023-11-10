import { useContext } from 'react';
import { TableContext } from '../contexts/TableContext';

function useUserTable() {
  const context = useContext(TableContext);

  if (!context) {
    throw new Error('useUserTable must be used within a TableProvider');
  }

  return context;
}

export default useUserTable;
