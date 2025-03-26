import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  Box, 
  Toolbar
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import SettingsIcon from '@mui/icons-material/Settings';

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Silences List', icon: <ListAltIcon />, path: '/' },
    { text: 'Create Silence', icon: <AddCircleOutlineIcon />, path: '/create' },
    { text: 'Import/Export', icon: <ImportExportIcon />, path: '/import-export' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    if (window.innerWidth < 900) {
      onClose();
    }
  };

  const drawerWidth = 240;

  return (
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem 
              button 
              key={item.text} 
              onClick={() => handleNavigate(item.path)}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        <Divider />
      </Box>
    </Drawer>
  );
};

export default Sidebar;