import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Chip,
  IconButton,
  Box,
  Alert,
  CircularProgress,
  TablePagination,
  TextField,
  InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { useAuth } from '../hooks/useAuth';

// Custom hook for handling the table state
const useSilencesTable = () => {
  const [silences, setSilences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const { credentials, selectedInstance } = useAuth();

  const fetchSilences = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        instance: selectedInstance,
      };
      
      if (credentials.username && credentials.password) {
        params.username = credentials.username;
        params.password = credentials.password;
      }
      
      const response = await axios.get('/api/silences', { params });
      setSilences(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching silences:', err);
      setError(err.message || 'Failed to fetch silences');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedInstance) {
      fetchSilences();
    }
  }, [selectedInstance, credentials]);

  const filteredSilences = searchTerm
    ? silences.filter(silence =>
        JSON.stringify(silence).toLowerCase().includes(searchTerm.toLowerCase())
      )
    : silences;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleRefresh = () => {
    fetchSilences();
  };

  return {
    silences: filteredSilences,
    loading,
    error,
    page,
    rowsPerPage,
    searchTerm,
    handleChangePage,
    handleChangeRowsPerPage,
    handleSearch,
    handleRefresh,
    paginatedSilences: filteredSilences.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    ),
    fetchSilences
  };
};

const SilenceStatus = ({ state, endsAt }) => {
  const getColor = () => {
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

  const getTimeLeft = () => {
    if (state === 'expired') return 'Expired';
    if (state === 'pending') return 'Pending';
    
    try {
      const end = parseISO(endsAt);
      return formatDistanceToNow(end, { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <Chip
      label={`${state} - ${getTimeLeft()}`}
      color={getColor()}
      size="small"
      variant="outlined"
    />
  );
};

const SilencesList = () => {
  const navigate = useNavigate();
  const { credentials, selectedInstance } = useAuth();
  const {
    paginatedSilences,
    loading,
    error,
    page,
    rowsPerPage,
    searchTerm,
    handleChangePage,
    handleChangeRowsPerPage,
    handleSearch,
    handleRefresh,
    silences,
    fetchSilences
  } = useSilencesTable();

  const handleViewSilence = (id) => {
    navigate(`/silence/${id}?instance=${selectedInstance}`);
  };

  const handleDeleteSilence = async (id) => {
    if (!window.confirm('Are you sure you want to delete this silence?')) return;
    
    try {
      const params = {
        instance: selectedInstance
      };
      
      if (credentials.username && credentials.password) {
        params.username = credentials.username;
        params.password = credentials.password;
      }
      
      await axios.delete(`/api/silence/${id}`, { params });
      fetchSilences(); // Refresh the list after deletion
    } catch (err) {
      console.error('Error deleting silence:', err);
      alert('Failed to delete silence: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDuplicateSilence = (silence) => {
    // Create a duplicate without the ID and navigate to create form
    const { id, status, ...silenceData } = silence;
    navigate('/create', { state: { silenceData } });
  };

  // Format the matchers for display
  const formatMatchers = (matchers) => {
    if (!matchers || !matchers.length) return 'No matchers';
    
    return matchers.map(m => {
      const op = m.isRegex ? '=~' : '=';
      return `${m.name}${op}"${m.value}"`;
    }).join(', ');
  };

  if (loading && silences.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error && silences.length === 0) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading silences: {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Silences {selectedInstance ? `(${selectedInstance})` : ''}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Search silences..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress size={30} />
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="silences table">
          <TableHead>
            <TableRow>
              <TableCell>Status</TableCell>
              <TableCell>Matchers</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Comment</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedSilences.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No silences found
                </TableCell>
              </TableRow>
            ) : (
              paginatedSilences.map((silence) => (
                <TableRow key={silence.id}>
                  <TableCell>
                    <SilenceStatus state={silence.status?.state} endsAt={silence.endsAt} />
                  </TableCell>
                  <TableCell>{formatMatchers(silence.matchers)}</TableCell>
                  <TableCell>{silence.createdBy}</TableCell>
                  <TableCell>{silence.comment}</TableCell>
                  <TableCell>
                    {silence.createdAt ? format(parseISO(silence.createdAt), 'PPp') : 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => handleViewSilence(silence.id)}
                      aria-label="view"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDuplicateSilence(silence)}
                      aria-label="duplicate"
                    >
                      <ContentCopyIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteSilence(silence.id)}
                      aria-label="delete"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={silences.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default SilencesList;