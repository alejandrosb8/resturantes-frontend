import { Loader, Center } from '@mantine/core';

function LoadingView() {
  return (
    <Center
      style={{
        height: '100svh',
      }}
    >
      <Loader />
    </Center>
  );
}

export default LoadingView;
