import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [credentials, setCredentials] = useState({
    username: localStorage.getItem('am_username') || '',
    password: localStorage.getItem('am_password') || ''
  });
  
  const [selectedInstance, setSelectedInstance] = useState(
    localStorage.getItem('am_selectedInstance') || ''
  );
  
  const [instances, setInstances] = useState([]);

  useEffect(() => {
    // Fetch available instances when component mounts
    fetch('/api/instances')
      .then(res => res.json())
      .then(data => {
        setInstances(data);
        // Set the first instance as selected if none is selected yet
        if (!selectedInstance && data.length > 0) {
          setSelectedInstance(data[0]);
          localStorage.setItem('am_selectedInstance', data[0]);
        }
      })
      .catch(err => console.error('Error fetching instances:', err));
  }, [selectedInstance]);

  const updateCredentials = (username, password) => {
    setCredentials({ username, password });
    localStorage.setItem('am_username', username);
    localStorage.setItem('am_password', password);
  };

  const updateSelectedInstance = (instance) => {
    setSelectedInstance(instance);
    localStorage.setItem('am_selectedInstance', instance);
  };

  const value = {
    credentials,
    updateCredentials,
    selectedInstance,
    updateSelectedInstance,
    instances
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}