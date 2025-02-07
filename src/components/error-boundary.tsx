'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button, Paper, Typography, Box } from '@mui/material';
import { createErrorLogger } from '@/lib/logger';

const logger = createErrorLogger('error-boundary');

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error({
      error,
      errorInfo,
      location: window.location.href,
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
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
          <Typography variant="h5" component="h2" gutterBottom>
            页面出现错误
          </Typography>
          
          <Alert severity="error" sx={{ my: 2 }}>
            {this.state.error?.message || '发生了未知错误'}
          </Alert>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <Box sx={{ mt: 2, mb: 3, textAlign: 'left' }}>
              <Typography variant="subtitle2" color="error" component="pre" sx={{ 
                p: 2,
                bgcolor: 'grey.100',
                borderRadius: 1,
                overflow: 'auto'
              }}>
                {this.state.error.stack}
              </Typography>
            </Box>
          )}

          <Button 
            variant="contained" 
            onClick={this.handleReset}
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
      );
    }

    return this.props.children;
  }
} 