import { toast } from 'react-toastify';

export const showToastSuccess = (message) => {
    
  toast.dismiss();
    toast.success(message, {
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

export const showToastInfo = (message) => {
  toast.dismiss();
    toast.info(message, {
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
