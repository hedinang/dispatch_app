import React, {useEffect} from 'react';
import { ToastProvider, useToasts } from 'react-toast-notifications';

const ToastContainer = () => ({ appearance, children }) => (
  <div style={{ background: appearance === 'error' ? 'red' : 'green' }}>
    {`asdasd`}
  </div>
);

export const ToastComponent = () => () => {
  const { addToast } = useToasts()
  return (
    <button onClick={() => addToast('1223', {
      appearance: 'success',
      autoDismiss: true,
    })}>
      Add Toast
    </button>
  )
};
