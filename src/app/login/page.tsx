import { Metadata } from 'next';
import LoginForm from '@/components/auth/login-form';
import { Box, Container, Paper, Typography } from '@mui/material';

export const metadata: Metadata = {
  title: '登录 - RBAC系统',
  description: '登录到RBAC权限管理系统',
};

export default function LoginPage() {
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5">
            登录
          </Typography>
          <LoginForm />
        </Paper>
      </Box>
    </Container>
  );
} 