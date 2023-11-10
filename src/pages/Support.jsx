import { Title, Text, Container, Anchor, Center } from '@mantine/core';
import { Link } from 'react-router-dom';
import useUserTable from '../hooks/useTable';

function Support() {
  const { table } = useUserTable();
  return (
    <Container size="sm" sx={{ minWidth: '320px', padding: '15px', textWrap: 'balance' }}>
      <Title align="center" order={1} mt={40}>
        Soporte
      </Title>
      <Text align="center" mt={10} sx={{ textWrap: 'balance' }}>
        Si tienes algún problema con la aplicación o pedido, puedes contactarnos a través de nuestro número de teléfono:
        +58 0412-6630737
      </Text>
      <Center>
        <Anchor component={Link} to={`/${table}`} align="center" mt={10} sx={{ textWrap: 'balance' }}>
          Volver al inicio
        </Anchor>
      </Center>
    </Container>
  );
}

export default Support;
