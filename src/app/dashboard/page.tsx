'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  People,
  Security,
  VpnKey,
  Timeline,
} from '@mui/icons-material';

interface UserInfo {
  id: string
  email: string
  username: string
  roles: Array<{
    id: string
    name: string
    permissions: Array<{
      id: string
      name: string
    }>
  }>
}

interface StatCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

export default function DashboardPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const { user, token } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRoles: 0,
    totalPermissions: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch user info')
        }

        const data = await response.json()
        setUserInfo(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (!user) {
      router.push('/login')
    } else {
      fetchUserInfo()
    }
  }, [user, token, router])

  useEffect(() => {
    // 模拟加载数据
    const timer = setTimeout(() => {
      setStats({
        totalUsers: 156,
        totalRoles: 8,
        totalPermissions: 24,
        activeUsers: 89,
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const statCards: StatCard[] = [
    {
      title: '总用户数',
      value: stats.totalUsers,
      icon: <People />,
      color: '#1976d2',
    },
    {
      title: '角色数量',
      value: stats.totalRoles,
      icon: <VpnKey />,
      color: '#2e7d32',
    },
    {
      title: '权限数量',
      value: stats.totalPermissions,
      icon: <Security />,
      color: '#ed6c02',
    },
    {
      title: '活跃用户',
      value: stats.activeUsers,
      icon: <Timeline />,
      color: '#9c27b0',
    },
  ];

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        仪表板
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      backgroundColor: `${card.color}20`,
                      color: card.color,
                      mr: 2,
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{ color: 'text.secondary' }}
                  >
                    {card.title}
                  </Typography>
                </Box>
                <Typography variant="h4" component="div">
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
 