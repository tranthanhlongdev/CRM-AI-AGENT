import { useState, useCallback } from "react";

const useNotification = () => {
  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
    autoClose: true,
    duration: 3000,
  });

  const showNotification = useCallback(
    ({
      type = "success",
      title = "",
      message = "",
      autoClose = true,
      duration = 3000,
    }) => {
      setNotification({
        show: true,
        type,
        title,
        message,
        autoClose,
        duration,
      });
    },
    []
  );

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({
      ...prev,
      show: false,
    }));
  }, []);

  // Helper methods for different notification types
  const showSuccess = useCallback(
    (title, message, options = {}) => {
      showNotification({
        type: "success",
        title,
        message,
        ...options,
      });
    },
    [showNotification]
  );

  const showError = useCallback(
    (title, message, options = {}) => {
      showNotification({
        type: "error",
        title,
        message,
        autoClose: false, // Errors should be manually dismissed
        ...options,
      });
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (title, message, options = {}) => {
      showNotification({
        type: "warning",
        title,
        message,
        ...options,
      });
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (title, message, options = {}) => {
      showNotification({
        type: "info",
        title,
        message,
        ...options,
      });
    },
    [showNotification]
  );

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

export default useNotification;
