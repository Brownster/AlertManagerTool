import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Breadcrumbs,
  Link
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useAuth } from '../hooks/useAuth';

const Settings = () => {
  const { credentials, updateCredentials, selectedInstance, updateSelectedInstance } = useAuth();
  
  // State for form
  const [username, setUsername] = useState(credentials.username);
  const [password, setPassword] = useState(credentials.password);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Instance configuration (in a real app, this would be editable)
  const [instances, setInstances] = useState([
    { name: "Instance 1", url: "http://alertmanager-instance1:9093/api/v2" },
    { name: "Instance 2", url: "http://alertmanager-instance2:9093/api/v2" }
  ]);
  
  // Instance dialog
  const [instanceDialogOpen, setInstanceDialogOpen] = useState(false);
  const [editingInstance, setEditingInstance] = useState(null);
  const [instanceName, setInstanceName] = useState('');
  const [instanceUrl, setInstanceUrl] = useState('');
  
  // Theme settings
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  
  const handleCredentialsSave = () => {
    updateCredentials(username, password);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };
  
  const handleThemeChange = (event) => {
    setDarkMode(event.target.checked);
    localStorage.setItem('darkMode', event.target.checked);
    // In a real app, this would update the theme via context
    window.location.reload();
  };
  
  const handleAddInstance = () => {
    setEditingInstance(null);
    setInstanceName('');
    setInstanceUrl('');
    setInstanceDialogOpen(true);
  };
  
  const handleEditInstance = (instance) => {
    setEditingInstance(instance);
    setInstanceName(instance.name);
    setInstanceUrl(instance.url);
    setInstanceDialogOpen(true);
  };
  
  const handleDeleteInstance = (instanceToDelete) => {
    if (window.confirm(`Are you sure you want to delete ${instanceToDelete.name}?`)) {
      const updatedInstances = instances.filter(i => i.name !== instanceToDelete.name);
      setInstances(updatedInstances);
      
      // If the deleted instance was selected, select the first available one
      if (selectedInstance === instanceToDelete.name) {
        updateSelectedInstance(updatedInstances.length > 0 ? updatedInstances[0].name : '');
      }
    }
  };
  
  const handleCloseDialog = () => {
    setInstanceDialogOpen(false);
  };
  
  const handleSaveInstance = () => {
    if (!instanceName || !instanceUrl) {
      alert('Name and URL are required');
      return;
    }
    
    if (editingInstance) {
      // Update existing instance
      const updatedInstances = instances.map(i => 
        i.name === editingInstance.name ? { name: instanceName, url: instanceUrl } : i
      );
      setInstances(updatedInstances);
      
      // Update selected instance if it was renamed
      if (selectedInstance === editingInstance.name && instanceName !== editingInstance.name) {
        updateSelectedInstance(instanceName);
      }
    } else {
      // Add new instance
      // Check for duplicate name
      if (instances.some(i => i.name === instanceName)) {
        alert('An instance with this name already exists');
        return;
      }
      
      setInstances([...instances, { name: instanceName, url: instanceUrl }]);
      
      // If this is the first instance, select it
      if (instances.length === 0) {
        updateSelectedInstance(instanceName);
      }
    }
    
    setInstanceDialogOpen(false);
  };
  
  return (
    <Box>
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 2 }}
      >
        <Link
          underline="hover"
          color="inherit"
          component={RouterLink}
          to="/"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Silences
        </Link>
        <Typography color="text.primary">Settings</Typography>
      </Breadcrumbs>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Authentication Settings
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {saveSuccess && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Settings saved successfully!
              </Alert>
            )}
            
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Alertmanager Credentials</Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Optional"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Optional"
                    />
                  </Grid>
                </Grid>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  These credentials will be used for all Alertmanager instances. Leave blank if authentication is not required.
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCredentialsSave}
                  >
                    Save Credentials
                  </Button>
                </Box>
              </CardContent>
            </Card>
            
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>User Interface</Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={darkMode}
                      onChange={handleThemeChange}
                    />
                  }
                  label="Dark Mode"
                />
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Changes to the theme will take effect immediately.
                </Typography>
              </CardContent>
            </Card>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">
                Alertmanager Instances
              </Typography>
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                color="primary"
                onClick={handleAddInstance}
              >
                Add Instance
              </Button>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Configured Instances</Typography>
                
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="default-instance-label">Default Instance</InputLabel>
                  <Select
                    labelId="default-instance-label"
                    value={selectedInstance}
                    onChange={(e) => updateSelectedInstance(e.target.value)}
                    label="Default Instance"
                  >
                    {instances.map((instance) => (
                      <MenuItem key={instance.name} value={instance.name}>
                        {instance.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <List>
                  {instances.map((instance) => (
                    <ListItem
                      key={instance.name}
                      secondaryAction={
                        <Box>
                          <IconButton edge="end" onClick={() => handleEditInstance(instance)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton edge="end" onClick={() => handleDeleteInstance(instance)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={instance.name}
                        secondary={instance.url}
                      />
                    </ListItem>
                  ))}
                </List>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Note: In this demo, instance configuration changes are not persisted to the server.
                </Typography>
              </CardContent>
            </Card>
          </Paper>
        </Grid>
      </Grid>
      
      <Dialog open={instanceDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{editingInstance ? 'Edit Instance' : 'Add Instance'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Instance Name"
            fullWidth
            value={instanceName}
            onChange={(e) => setInstanceName(e.target.value)}
            required
          />
          <TextField
            margin="dense"
            label="Alertmanager URL"
            fullWidth
            value={instanceUrl}
            onChange={(e) => setInstanceUrl(e.target.value)}
            placeholder="http://alertmanager:9093/api/v2"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveInstance} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;