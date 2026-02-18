import React, { createContext, useContext, useState, useCallback } from 'react';

const SnackbarContext = createContext(null);

export function SnackbarProvider({ children }) {
  const [snack, setSnack] = useState({
    visible: false,
    message: '',
    variant: 'success',
  });

  const showSuccess = useCallback((message) => {
    setSnack({
      visible: true,
      message: message || 'Success',
      variant: 'success',
    });
  }, []);

  const showError = useCallback((message) => {
    setSnack({
      visible: true,
      message: message || 'Something went wrong',
      variant: 'error',
    });
  }, []);

  const hideSnackbar = useCallback(() => {
    setSnack(s => ({ ...s, visible: false }));
  }, []);

  return (
    <SnackbarContext.Provider
      value={{ snack, showSuccess, showError, hideSnackbar }}
    >
      {children}
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) {
    throw new Error('useSnackbar must be used inside SnackbarProvider');
  }
  return ctx;
}
