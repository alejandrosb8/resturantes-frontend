import { Title, Text, Container, Center } from '@mantine/core';
import Lottie from 'lottie-react';
import animationData from '../assets/lotties/scan-qr-code-lottie.json';
import Layout from '../layouts/Default';

function NotQr() {
  return (
    <Layout>
      <Container size="xs">
        <Title align="center" order={1} mt={40}>
          Escanea un código QR
        </Title>
        <Text align="center" mt={10}>
          Para poder acceder a la carta de un restaurante, debes escanear el código QR que se encuentra en la mesa.
        </Text>
        <Center mt={20}>
          <Lottie animationData={animationData} style={{ width: 300, height: 300 }} loop={true} />
        </Center>
      </Container>
    </Layout>
  );
}

export default NotQr;
