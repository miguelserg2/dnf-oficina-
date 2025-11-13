import React from 'react';
import Modal from './Modal';
import { ExclamationTriangleIcon } from '../Icons';

interface IdleTimeoutModalProps {
  isOpen: boolean;
  onStayActive: () => void;
  onLogout: () => void;
  remainingTime: number;
}

const IdleTimeoutModal: React.FC<IdleTimeoutModalProps> = ({ isOpen, onStayActive, onLogout, remainingTime }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" 
        aria-labelledby="modal-title" 
        role="dialog" 
        aria-modal="true"
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 text-center"
      >
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-300" aria-hidden="true" />
        </div>
        <h2 id="modal-title" className="text-2xl font-bold mt-4">¿Sigues ahí?</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Tu sesión está a punto de cerrarse por inactividad.
        </p>
        <p className="text-4xl font-bold my-4 text-indigo-600 dark:text-indigo-400">
            {remainingTime}
        </p>
        <p className="text-sm text-gray-500">
          Para proteger tu cuenta, cerraremos tu sesión si no hay actividad.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
             <button 
                onClick={onStayActive}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Permanecer conectado
            </button>
            <button 
                onClick={onLogout}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none"
            >
                Cerrar sesión
            </button>
        </div>
      </div>
    </div>
  );
};

export default IdleTimeoutModal;