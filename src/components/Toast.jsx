import { useState, useCallback, createContext, useContext } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [visible, setVisible] = useState(false);

  const showToast = useCallback(() => {
    setVisible(true);
    setTimeout(() => setVisible(false), 2000);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="toast-container">
        <div className={`toast ${visible ? 'show' : ''}`}>
          Tersimpan!
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
