import { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';
import { Box, Container, Paper, Typography } from '@mui/material';

export const metadata: Metadata = {
  title: '登录 - RBAC权限管理系统',
  description: '使用用户名和密码登录系统',
};

export default function LoginPage() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5" gutterBottom>
            登录
          </Typography>
          <LoginForm />
        </Paper>
      </Box>
    </Container>
  );
} 