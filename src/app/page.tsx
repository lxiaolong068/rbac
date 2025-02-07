import { redirect } from 'next/navigation';
import { Box, Container, Typography } from '@mui/material';
import { isInitRequired } from '@/lib/init';

export default function Home() {
  if (isInitRequired()) {
    redirect('/setup');
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          RBAC 权限管理系统
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          基于 Next.js 14 + Fastify 的现代化权限管理系统
        </Typography>
      </Box>
    </Container>
  );
} 