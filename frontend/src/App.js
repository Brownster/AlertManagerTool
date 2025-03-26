import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container } from '@mui/material';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SilencesList from './components/SilencesList';
import SilenceDetail from './components/SilenceDetail';
import CreateSilence from './components/CreateSilence';
import ImportExport from './components/ImportExport';
import Settings from './components/Settings';

// Context
import { AuthProvider } from './hooks/useAuth';

// Create a theme instance
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

function App() {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [drawerOpen, setDrawerOpen] = useState(true);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', !darkMode);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Box sx={{ display: 'flex', height: '100vh' }}>
            <Header toggleDarkMode={toggleDarkMode} darkMode={darkMode} toggleDrawer={toggleDrawer} />
            <Sidebar open={drawerOpen} onClose={toggleDrawer} />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 3,
                mt: 8,
                ml: drawerOpen ? { sm: 30 } : 0,
                transition: theme => theme.transitions.create('margin', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.leavingScreen,
                }),
                overflow: 'auto',
              }}
            >
              <Container maxWidth="xl">
                <Routes>
                  <Route path="/" element={<SilencesList />} />
                  <Route path="/silence/:id" element={<SilenceDetail />} />
                  <Route path="/create" element={<CreateSilence />} />
                  <Route path="/import-export" element={<ImportExport />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </Container>
            </Box>
          </Box>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;