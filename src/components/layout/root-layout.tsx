import { ReactNode } from 'react';
import { Box, Container, CssBaseline } from '@mui/material';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { ErrorBoundary } from '../error-boundary';

interface RootLayoutProps {
  children: ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <ErrorBoundary>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <CssBaseline />
        <Header />
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            py: 3,
            px: 2,
            mt: 8,
            backgroundColor: 'background.default',
          }}
        >
          <Container maxWidth="lg">
            {children}
          </Container>
        </Box>
      </Box>
    </ErrorBoundary>
  );
} 