import { toast } from 'react-toastify';

export const showToastError = (message) => {
    toast.dismiss();
      toast.error(message, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: 0,
        className: 'fixed top-0 w-80 mt-3 bg-white font-sans',
      });
  };
  
