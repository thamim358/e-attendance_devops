import { toast } from 'react-toastify';

export const showsToastError = (message) => {
    toast.dismiss();
      toast.error(message, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: 0,
        progressStyle: { background: '#FF5733' },
        className: 'fixed top-0 w-80 mt-3 bg-white font-sans',
      });
  };
  
