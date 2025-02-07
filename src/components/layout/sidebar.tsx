import { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  useTheme,
} from '@mui/material';
import {
  Dashboard,
  People,
  Security,
  Settings,
  ExpandLess,
  ExpandMore,
  VpnKey,
  MenuBook,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';

const DRAWER_WIDTH = 240;

interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    title: '仪表板',
    path: '/dashboard',
    icon: <Dashboard />,
  },
  {
    title: '用户管理',
    path: '/users',
    icon: <People />,
  },
  {
    title: '权限管理',
    path: '/auth',
    icon: <Security />,
    children: [
      {
        title: '角色管理',
        path: '/auth/roles',
        icon: <VpnKey />,
      },
      {
        title: '权限配置',
        path: '/auth/permissions',
        icon: <MenuBook />,
      },
    ],
  },
  {
    title: '系统设置',
    path: '/settings',
    icon: <Settings />,
  },
];

export function Sidebar() {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [openItems, setOpenItems] = useState<string[]>([]);

  const handleClick = (path: string) => {
    setOpenItems((prev) =>
      prev.includes(path)
        ? prev.filter((item) => item !== path)
        : [...prev, path]
    );
  };

  const renderMenuItem = (item: MenuItem) => {
    const isSelected = pathname === item.path;
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openItems.includes(item.path);

    return (
      <Box key={item.path}>
        <ListItem disablePadding>
          <ListItemButton
            selected={isSelected}
            onClick={() => {
              if (hasChildren) {
                handleClick(item.path);
              } else {
                router.push(item.path);
              }
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.title} />
            {hasChildren && (isOpen ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </ListItem>

        {hasChildren && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((child) => (
                <ListItemButton
                  key={child.path}
                  sx={{ pl: 4 }}
                  selected={pathname === child.path}
                  onClick={() => router.push(child.path)}
                >
                  <ListItemIcon>{child.icon}</ListItemIcon>
                  <ListItemText primary={child.title} />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.default,
        },
      }}
    >
      <Box sx={{ overflow: 'auto', mt: 8 }}>
        <List>{menuItems.map(renderMenuItem)}</List>
      </Box>
    </Drawer>
  );
} 