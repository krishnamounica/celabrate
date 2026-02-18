import { useState, useCallback } from 'react';

export default function useSnackbar() {
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

  return { snack, showSuccess, showError, hideSnackbar };
}
