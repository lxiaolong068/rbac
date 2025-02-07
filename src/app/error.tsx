'use client';

import { useEffect } from 'react';
import { Alert, Button, Container, Paper, Typography, Box } from '@mui/material';
import { createErrorLogger } from '@/lib/logger';

const logger = createErrorLogger('error-page');

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error({
      error,
      location: window?.location?.href,
    });
  }, [error]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper 
        elevation={3}
        sx={{
          p: 4,
          m: 2,
          maxWidth: 600,
          mx: 'auto',
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          出错了
        </Typography>

        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          抱歉，页面加载过程中发生了错误
        </Typography>
        
        <Alert severity="error" sx={{ my: 3 }}>
          {error.message || '发生了未知错误'}
        </Alert>

        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ mt: 2, mb: 3, textAlign: 'left' }}>
            <Typography variant="subtitle2" color="error" component="pre" sx={{ 
              p: 2,
              bgcolor: 'grey.100',
              borderRadius: 1,
              overflow: 'auto'
            }}>
              {error.stack}
            </Typography>
          </Box>
        )}

        <Button 
          variant="contained" 
          onClick={reset}
          sx={{ mr: 2 }}
        >
          重试
        </Button>
        
        <Button 
          variant="outlined"
          onClick={() => window.location.href = '/'}
        >
          返回首页
        </Button>
      </Paper>
    </Container>
  );
} 