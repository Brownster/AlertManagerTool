import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Box,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useAuth } from '../hooks/useAuth';

const Header = ({ toggleDarkMode, darkMode, toggleDrawer }) => {
  const { 
    credentials, 
    updateCredentials, 
    selectedInstance,
    updateSelectedInstance,
    instances
  } = useAuth();

  const [anchorEl, setAnchorEl] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tempUsername, setTempUsername] = useState(credentials.username);
  const [tempPassword, setTempPassword] = useState(credentials.password);
  const [tempInstance, setTempInstance] = useState(selectedInstance);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDialog = () => {
    setTempUsername(credentials.username);
    setTempPassword(credentials.password);
    setTempInstance(selectedInstance);
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSaveSettings = () => {
    updateCredentials(tempUsername, tempPassword);
    updateSelectedInstance(tempInstance);
    setDialogOpen(false);
  };

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Alertmanager Silence Manager
          </Typography>

          <IconButton color="inherit" onClick={toggleDarkMode}>
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          <IconButton
            color="inherit"
            aria-label="account settings"
            aria-controls="account-menu"
            aria-haspopup="true"
            onClick={handleMenuOpen}
          >
            <AccountCircleIcon />
          </IconButton>
          <Menu
            id="account-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleOpenDialog}>Settings</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Connection Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="instance-select-label">Alertmanager Instance</InputLabel>
              <Select
                labelId="instance-select-label"
                value={tempInstance}
                label="Alertmanager Instance"
                onChange={(e) => setTempInstance(e.target.value)}
              >
                {instances.map((instance) => (
                  <MenuItem key={instance} value={instance}>
                    {instance}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              autoFocus
              margin="dense"
              id="username"
              label="Username"
              type="text"
              fullWidth
              variant="outlined"
              value={tempUsername}
              onChange={(e) => setTempUsername(e.target.value)}
            />
            
            <TextField
              margin="dense"
              id="password"
              label="Password"
              type="password"
              fullWidth
              variant="outlined"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveSettings}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Header;