import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Link,
  Breadcrumbs
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useAuth } from '../hooks/useAuth';

const SilenceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const instanceParam = queryParams.get('instance');
  
  const { credentials, selectedInstance } = useAuth();
  const [silence, setSilence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const instance = instanceParam || selectedInstance;

  useEffect(() => {
    const fetchSilence = async () => {
      if (!id || !instance) {
        setError('Missing silence ID or instance');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const params = {
          instance
        };
        
        if (credentials.username && credentials.password) {
          params.username = credentials.username;
          params.password = credentials.password;
        }
        
        const response = await axios.get(`/api/silence/${id}`, { params });
        setSilence(response.data);
      } catch (err) {
        console.error('Error fetching silence details:', err);
        setError(err.message || 'Failed to fetch silence details');
      } finally {
        setLoading(false);
      }
    };

    fetchSilence();
  }, [id, instance, credentials]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this silence?')) return;
    
    try {
      const params = { instance };
      
      if (credentials.username && credentials.password) {
        params.username = credentials.username;
        params.password = credentials.password;
      }
      
      await axios.delete(`/api/silence/${id}`, { params });
      navigate('/');
    } catch (err) {
      console.error('Error deleting silence:', err);
      alert('Failed to delete silence: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDuplicate = () => {
    if (!silence) return;
    
    // Create a duplicate without the ID and navigate to create form
    const { id: silenceId, status, ...silenceData } = silence;
    navigate('/create', { state: { silenceData } });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading silence: {error}
      </Alert>
    );
  }

  if (!silence) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No silence found with ID: {id}
      </Alert>
    );
  }

  const getStatusColor = (state) => {
    switch (state) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'PPpp');
    } catch (e) {
      return 'Invalid date';
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
        <Typography color="text.primary">Silence Details</Typography>
      </Breadcrumbs>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h5" gutterBottom>
            Silence Details {instance ? `(${instance})` : ''}
          </Typography>
          
          <Box>
            <Chip
              label={silence.status?.state || 'unknown'}
              color={getStatusColor(silence.status?.state)}
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>General Information</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">ID</Typography>
                    <Typography variant="body2">{silence.id}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Created By</Typography>
                    <Typography variant="body2">{silence.createdBy}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Comment</Typography>
                    <Typography variant="body2">{silence.comment}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Timing</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Created At</Typography>
                    <Typography variant="body2">{formatDate(silence.createdAt)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Starts At</Typography>
                    <Typography variant="body2">{formatDate(silence.startsAt)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Ends At</Typography>
                    <Typography variant="body2">{formatDate(silence.endsAt)}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Matchers</Typography>
                {silence.matchers && silence.matchers.length > 0 ? (
                  <Grid container spacing={1}>
                    {silence.matchers.map((matcher, index) => (
                      <Grid item key={index}>
                        <Chip
                          label={`${matcher.name}${matcher.isRegex ? '=~' : '='}"${matcher.value}"`}
                          variant="outlined"
                        />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2">No matchers defined</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={handleDuplicate}
          >
            Duplicate
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SilenceDetail;