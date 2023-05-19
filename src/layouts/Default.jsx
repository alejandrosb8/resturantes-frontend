import { useState } from 'react';
import { AppShell, Navbar, Header, Footer, Text, MediaQuery, Burger, useMantineTheme } from '@mantine/core';
import colors from '../utils/colors';

export default function Layout({ children, header, footer, navbar }) {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  return (
    <AppShell
      styles={{
        main: {
          background: colors.background,
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      navbar={
        navbar && (
          <Navbar p="md" hiddenBreakpoint="sm" hidden={!opened} width={{ sm: 200, lg: 300 }}>
            <Text>Application navbar</Text>
          </Navbar>
        )
      }
      footer={
        footer && (
          <Footer height={60} p="md">
            Application footer
          </Footer>
        )
      }
      header={
        header && (
          <Header height={{ base: 50, md: 70 }} p="md">
            <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              {navbar && (
                <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                  <Burger
                    opened={opened}
                    onClick={() => setOpened((o) => !o)}
                    size="sm"
                    color={theme.colors.gray[6]}
                    mr="xl"
                  />
                </MediaQuery>
              )}

              <Text>Application header</Text>
            </div>
          </Header>
        )
      }
    >
      {children}
    </AppShell>
  );
}
