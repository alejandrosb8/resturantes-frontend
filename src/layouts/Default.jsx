import { useState } from 'react';
import { AppShell, Header, Footer, Text, MediaQuery, Burger, useMantineTheme } from '@mantine/core';
import foodbg from './../assets/foodbg.svg';
import AdminNavbar from '../components/NavBars/AdminNavbar';

export default function Layout({ children, header, footer, navbar, navbarActive }) {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  return (
    <AppShell
      styles={{
        main: {
          backgroundImage: `url(${foodbg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      navbar={navbar === 'admin' ? <AdminNavbar opened={opened} currentActive={navbarActive} /> : null}
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
