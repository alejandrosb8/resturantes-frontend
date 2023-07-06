import { useState } from 'react';
import { AppShell, Header, Footer, Text, MediaQuery, Burger, useMantineTheme, rem } from '@mantine/core';
import foodbg from './../assets/foodbg.svg';
import AdminNavbar from '../components/NavBars/AdminNavbar';
import UserNavbar from '../components/NavBars/UserNavbar';
import { useHeadroom, useMediaQuery } from '@mantine/hooks';

export default function Layout({ children, header, footer, navbar, navbarActive }) {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);

  const isMobile = useMediaQuery('(max-width: 768px)');

  const pinned = useHeadroom({ fixedAt: '80px' });

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
      navbar={
        navbar === 'admin' ? (
          <AdminNavbar opened={opened} currentActive={navbarActive} />
        ) : navbar === 'user' ? (
          <UserNavbar opened={opened} currentActive={navbarActive} />
        ) : null
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
          <Header
            height={{ base: 50 }}
            p="md"
            sx={{
              backgroundColor: theme.colors.orange[6],
              transform: `translate3d(0, ${isMobile ? (pinned ? 0 : rem(-60)) : 0}, 0)`,
              transition: 'transform 300ms ease',
            }}
            zIndex={500}
          >
            <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              {navbar && (
                <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                  <Burger
                    opened={opened}
                    onClick={() => setOpened((o) => !o)}
                    size="sm"
                    color={theme.colors.orange[0]}
                    mr="xl"
                  />
                </MediaQuery>
              )}

              <Text size="xl" color="white" weight="bold">
                Resturantes
              </Text>
            </div>
          </Header>
        )
      }
    >
      {children}
    </AppShell>
  );
}
