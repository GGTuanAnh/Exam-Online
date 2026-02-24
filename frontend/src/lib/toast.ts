import toast from 'react-hot-toast';

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#10b981',
        color: '#fff',
        fontWeight: '500',
        borderRadius: '10px',
        padding: '12px 16px',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#10b981',
      },
    });
  },

  error: (message: string) => {
    toast.error(message, {
      duration: 8000,
      position: 'top-right',
      style: {
        background: '#ef4444',
        color: '#fff',
        fontWeight: '500',
        borderRadius: '10px',
        padding: '12px 16px',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#ef4444',
      },
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        background: '#3b82f6',
        color: '#fff',
        fontWeight: '500',
        borderRadius: '10px',
        padding: '12px 16px',
      },
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        position: 'top-right',
        style: {
          fontWeight: '500',
        },
      }
    );
  },

  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },
};
