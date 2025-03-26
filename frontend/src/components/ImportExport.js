import React, { useState } from 'react';
import axios from 'axios';
import {
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  Breadcrumbs,
  Link,
  Chip,
  CircularProgress
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useAuth } from '../hooks/useAuth';

const ImportExport = () => {
  const { credentials, selectedInstance, instances } = useAuth();
  
  // Export state
  const [exportInstance, setExportInstance] = useState(selectedInstance);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState(null);
  
  // Import state
  const [importInstance, setImportInstance] = useState([selectedInstance]);
  const [jsonContent, setJsonContent] = useState('');
  const [removeIds, setRemoveIds] = useState(true);
  const [importStatus, setImportStatus] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState(null);
  
  const handleExportChange = (e) => {
    setExportInstance(e.target.value);
  };
  
  const handleImportInstanceChange = (e) => {
    setImportInstance(e.target.value);
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setJsonContent(e.target.result);
      };
      reader.readAsText(file);
    }
  };
  
  const handleExport = async () => {
    if (!exportInstance) {
      setExportError('Please select an instance to export from');
      return;
    }
    
    setExportLoading(true);
    setExportError(null);
    
    try {
      const params = {
        instance: exportInstance
      };
      
      if (credentials.username && credentials.password) {
        params.username = credentials.username;
        params.password = credentials.password;
      }
      
      const response = await axios.get('/api/silences/download', {
        params,
        responseType: 'blob'
      });
      
      // Create a blob and trigger download
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      a.download = `silences-${exportInstance}-${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Error exporting silences:', err);
      setExportError('Failed to export silences: ' + err.message);
    } finally {
      setExportLoading(false);
    }
  };
  
  const handleImport = async () => {
    if (importInstance.length === 0) {
      setImportError('Please select at least one instance to import to');
      return;
    }
    
    if (!jsonContent) {
      setImportError('Please upload or enter JSON content');
      return;
    }
    
    setImportLoading(true);
    setImportError(null);
    setImportStatus(null);
    
    try {
      // Parse JSON to validate it first
      let parsedJson;
      try {
        parsedJson = JSON.parse(jsonContent);
      } catch (e) {
        throw new Error('Invalid JSON content: ' + e.message);
      }
      
      const params = {
        instance: importInstance.join(','),
        remove_id: removeIds
      };
      
      if (credentials.username && credentials.password) {
        params.username = credentials.username;
        params.password = credentials.password;
      }
      
      const response = await axios.post('/api/silences/upload', parsedJson, { params });
      
      // Count successes and failures
      let successCount = 0;
      let failureCount = 0;
      
      Object.values(response.data).forEach(instanceResults => {
        if (Array.isArray(instanceResults)) {
          instanceResults.forEach(result => {
            if (result.status === 'success') {
              successCount++;
            } else {
              failureCount++;
            }
          });
        }
      });
      
      setImportStatus({
        successful: successCount,
        failed: failureCount
      });
    } catch (err) {
      console.error('Error importing silences:', err);
      setImportError('Failed to import silences: ' + 
        (err.response?.data?.error || err.message));
    } finally {
      setImportLoading(false);
    }
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
        <Typography color="text.primary">Import/Export</Typography>
      </Breadcrumbs>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Export Silences
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {exportError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {exportError}
              </Alert>
            )}
            
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Export Options</Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="export-instance-label">Source Instance</InputLabel>
                  <Select
                    labelId="export-instance-label"
                    value={exportInstance}
                    onChange={handleExportChange}
                    label="Source Instance"
                  >
                    {instances.map((instance) => (
                      <MenuItem key={instance} value={instance}>
                        {instance}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  This will download all silences from the selected instance as a JSON file.
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={exportLoading ? <CircularProgress size={20} color="inherit" /> : <FileDownloadIcon />}
                    onClick={handleExport}
                    disabled={exportLoading || !exportInstance}
                  >
                    {exportLoading ? 'Exporting...' : 'Export Silences'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Import Silences
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {importError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {importError}
              </Alert>
            )}
            
            {importStatus && (
              <Alert 
                severity={importStatus.failed > 0 ? "warning" : "success"} 
                sx={{ mb: 3 }}
              >
                <Typography variant="body1">
                  Import completed with {importStatus.successful} successful and {importStatus.failed} failed silences.
                </Typography>
              </Alert>
            )}
            
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Import Options</Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="import-instance-label">Target Instances</InputLabel>
                  <Select
                    labelId="import-instance-label"
                    multiple
                    value={importInstance}
                    onChange={handleImportInstanceChange}
                    label="Target Instances"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                  >
                    {instances.map((instance) => (
                      <MenuItem key={instance} value={instance}>
                        {instance}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={removeIds}
                      onChange={(e) => setRemoveIds(e.target.checked)}
                    />
                  }
                  label="Remove IDs from imported silences"
                />
                
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<FileUploadIcon />}
                    sx={{ mb: 2 }}
                  >
                    Upload JSON File
                    <input
                      type="file"
                      accept="application/json"
                      hidden
                      onChange={handleFileChange}
                    />
                  </Button>
                  
                  <TextField
                    label="JSON Content"
                    multiline
                    rows={10}
                    value={jsonContent}
                    onChange={(e) => setJsonContent(e.target.value)}
                    fullWidth
                    placeholder="Paste JSON content here or upload a file"
                  />
                </Box>
              </CardContent>
            </Card>
            
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={importLoading ? <CircularProgress size={20} color="inherit" /> : <FileUploadIcon />}
                onClick={handleImport}
                disabled={importLoading || !jsonContent || importInstance.length === 0}
              >
                {importLoading ? 'Importing...' : 'Import Silences'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ImportExport;