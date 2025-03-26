import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
  Chip,
  Breadcrumbs,
  Link,
  FormHelperText,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useAuth } from '../hooks/useAuth';

// Duration options in seconds
const DURATION_OPTIONS = [
  { value: 1800, label: '30 minutes' },
  { value: 3600, label: '1 hour' },
  { value: 7200, label: '2 hours' },
  { value: 14400, label: '4 hours' },
  { value: 28800, label: '8 hours' },
  { value: 86400, label: '1 day' },
  { value: 172800, label: '2 days' },
  { value: 604800, label: '1 week' },
  { value: 1209600, label: '2 weeks' },
  { value: 2592000, label: '30 days' }
];

const CreateSilence = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { credentials, selectedInstance, instances } = useAuth();
  
  // Extract silence data if duplicating
  const initialData = location.state?.silenceData || null;
  
  // State for form
  const [formState, setFormState] = useState({
    comment: initialData?.comment || '',
    createdBy: initialData?.createdBy || '',
    startsAt: initialData?.startsAt ? new Date(initialData.startsAt) : new Date(),
    endsAt: initialData?.endsAt ? new Date(initialData.endsAt) : new Date(Date.now() + 3600000), // 1 hour default
    matchers: initialData?.matchers || [{ name: '', value: '', isRegex: false }],
    targetInstances: [selectedInstance],
    error: null,
    durationSeconds: 3600, // Default 1 hour
    useDuration: true
  });
  
  // Update endsAt when duration changes
  useEffect(() => {
    if (formState.useDuration) {
      const newEndsAt = new Date(formState.startsAt.getTime() + formState.durationSeconds * 1000);
      setFormState(prev => ({ ...prev, endsAt: newEndsAt }));
    }
  }, [formState.startsAt, formState.durationSeconds, formState.useDuration]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (name, value) => {
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDurationChange = (e) => {
    setFormState(prev => ({ 
      ...prev, 
      durationSeconds: Number(e.target.value)
    }));
  };
  
  const handleUseDurationChange = (e) => {
    setFormState(prev => ({ 
      ...prev, 
      useDuration: e.target.checked
    }));
  };
  
  const handleMatcherChange = (index, field, value) => {
    const updatedMatchers = [...formState.matchers];
    updatedMatchers[index] = { ...updatedMatchers[index], [field]: value };
    setFormState(prev => ({ ...prev, matchers: updatedMatchers }));
  };
  
  const handleAddMatcher = () => {
    setFormState(prev => ({
      ...prev,
      matchers: [...prev.matchers, { name: '', value: '', isRegex: false }]
    }));
  };
  
  const handleRemoveMatcher = (index) => {
    const updatedMatchers = [...formState.matchers];
    updatedMatchers.splice(index, 1);
    setFormState(prev => ({ ...prev, matchers: updatedMatchers }));
  };
  
  const handleInstanceChange = (e) => {
    setFormState(prev => ({ ...prev, targetInstances: e.target.value }));
  };
  
  const validateForm = () => {
    // Basic validation
    if (!formState.comment.trim()) return 'Comment is required';
    if (!formState.createdBy.trim()) return 'Created By is required';
    if (formState.matchers.length === 0) return 'At least one matcher is required';
    
    // Validate matchers
    for (const matcher of formState.matchers) {
      if (!matcher.name.trim()) return 'Matcher name is required';
      if (!matcher.value.trim()) return 'Matcher value is required';
    }
    
    // Validate dates
    if (formState.endsAt <= formState.startsAt) {
      return 'End time must be after start time';
    }
    
    // Validate instances
    if (formState.targetInstances.length === 0) {
      return 'At least one target instance is required';
    }
    
    return null;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setFormState(prev => ({ ...prev, error: validationError }));
      return;
    }
    
    // Prepare the silence payload
    const silencePayload = {
      comment: formState.comment,
      createdBy: formState.createdBy,
      startsAt: formState.startsAt.toISOString(),
      endsAt: formState.endsAt.toISOString(),
      matchers: formState.matchers
    };
    
    try {
      const params = {
        instance: formState.targetInstances.join(',')
      };
      
      if (credentials.username && credentials.password) {
        params.username = credentials.username;
        params.password = credentials.password;
      }
      
      const response = await axios.post('/api/silence', silencePayload, { params });
      
      // Check if any instances failed
      const hasErrors = Object.values(response.data).some(
        inst => inst.status === 'error'
      );
      
      if (hasErrors) {
        const errorMessages = Object.entries(response.data)
          .filter(([_, data]) => data.status === 'error')
          .map(([instance, data]) => `${instance}: ${data.error}`)
          .join('; ');
        
        setFormState(prev => ({ 
          ...prev, 
          error: `Some instances failed: ${errorMessages}`
        }));
      } else {
        // All successful, navigate to home
        navigate('/');
      }
    } catch (err) {
      console.error('Error creating silence:', err);
      setFormState(prev => ({ 
        ...prev, 
        error: err.response?.data?.error || err.message || 'Failed to create silence'
      }));
    }
  };
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
          <Typography color="text.primary">Create Silence</Typography>
        </Breadcrumbs>
        
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            {initialData ? 'Duplicate Silence' : 'Create New Silence'}
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          {formState.error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {formState.error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Basic Information</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Comment"
                          name="comment"
                          value={formState.comment}
                          onChange={handleInputChange}
                          required
                          helperText="Describe the purpose of this silence"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Created By"
                          name="createdBy"
                          value={formState.createdBy}
                          onChange={handleInputChange}
                          required
                          helperText="Your name or identifier"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Target Instances</Typography>
                    <FormControl fullWidth>
                      <InputLabel id="instances-select-label">Target Instances</InputLabel>
                      <Select
                        labelId="instances-select-label"
                        multiple
                        value={formState.targetInstances}
                        onChange={handleInstanceChange}
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
                      <FormHelperText>
                        Select the instances where this silence should be created
                      </FormHelperText>
                    </FormControl>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">Matchers</Typography>
                      <Button
                        startIcon={<AddIcon />}
                        onClick={handleAddMatcher}
                        color="primary"
                      >
                        Add Matcher
                      </Button>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Matchers define which alerts should be silenced
                    </Typography>
                    
                    {formState.matchers.map((matcher, index) => (
                      <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                        <Grid item xs={5}>
                          <TextField
                            fullWidth
                            label="Name"
                            value={matcher.name}
                            onChange={(e) => handleMatcherChange(index, 'name', e.target.value)}
                            placeholder="e.g., severity"
                            required
                          />
                        </Grid>
                        <Grid item xs={5}>
                          <TextField
                            fullWidth
                            label="Value"
                            value={matcher.value}
                            onChange={(e) => handleMatcherChange(index, 'value', e.target.value)}
                            placeholder="e.g., critical"
                            required
                          />
                        </Grid>
                        <Grid item xs={1}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={matcher.isRegex}
                                onChange={(e) => handleMatcherChange(index, 'isRegex', e.target.checked)}
                              />
                            }
                            label="Regex"
                          />
                        </Grid>
                        <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveMatcher(index)}
                            disabled={formState.matchers.length <= 1}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Duration</Typography>
                    
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={4}>
                        <DateTimePicker
                          label="Start Time"
                          value={formState.startsAt}
                          onChange={(newValue) => handleDateChange('startsAt', newValue)}
                          slotProps={{ textField: { fullWidth: true } }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={8}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formState.useDuration}
                              onChange={handleUseDurationChange}
                            />
                          }
                          label="Use duration instead of end time"
                        />
                        
                        {formState.useDuration ? (
                          <FormControl fullWidth sx={{ mt: 1 }}>
                            <InputLabel id="duration-select-label">Duration</InputLabel>
                            <Select
                              labelId="duration-select-label"
                              value={formState.durationSeconds}
                              onChange={handleDurationChange}
                            >
                              {DURATION_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : (
                          <DateTimePicker
                            label="End Time"
                            value={formState.endsAt}
                            onChange={(newValue) => handleDateChange('endsAt', newValue)}
                            slotProps={{ 
                              textField: { 
                                fullWidth: true,
                                sx: { mt: 1 }
                              } 
                            }}
                          />
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                component={RouterLink}
                to="/"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                type="submit"
              >
                Create Silence
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default CreateSilence;