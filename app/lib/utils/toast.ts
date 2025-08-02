import toast from 'react-hot-toast'

// Configuration par défaut pour les toasts
const defaultOptions = {
  duration: 4000,
  style: {
    background: '#18181b',
    color: '#f4f4f5',
    border: '1px solid #3f3f46',
  },
}

export const showToast = {
  success: (message: string) => 
    toast.success(message, {
      ...defaultOptions,
      iconTheme: {
        primary: '#22c55e',
        secondary: '#18181b',
      },
    }),

  error: (message: string) => 
    toast.error(message, {
      ...defaultOptions,
      iconTheme: {
        primary: '#ef4444',
        secondary: '#18181b',
      },
    }),

  loading: (message: string) => 
    toast.loading(message, defaultOptions),

  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    }
  ) => 
    toast.promise(promise, messages, {
      loading: defaultOptions,
      success: {
        ...defaultOptions,
        iconTheme: {
          primary: '#22c55e',
          secondary: '#18181b',
        },
      },
      error: {
        ...defaultOptions,
        iconTheme: {
          primary: '#ef4444',
          secondary: '#18181b',
        },
      },
    }),
}