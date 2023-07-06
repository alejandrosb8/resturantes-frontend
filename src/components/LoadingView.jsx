import { Loader, Center } from '@mantine/core';

function LoadingView() {
  return (
    <Center
      style={{
        height: '100svh',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 1000,
      }}
    >
      <Loader />
    </Center>
  );
}

export default LoadingView;
