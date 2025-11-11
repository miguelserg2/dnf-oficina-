
import React, { useState } from 'react';
import { SearchIcon, UserCircleIcon, CloudArrowUpIcon, MenuIcon } from './Icons';
import { useAppContext } from '../context/AppContext';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ searchTerm, setSearchTerm, onMenuClick }) => {
  const { saveState } = useAppContext();
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const handleSave = () => {
    saveState();
    setShowSaveConfirm(true);
    setTimeout(() => {
        setShowSaveConfirm(false);
    }, 2500);
  };
  
  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 gap-4">
      <div className="flex items-center flex-1 min-w-0">
        <button onClick={onMenuClick} aria-label="Abrir menú" className="md:hidden mr-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
          <MenuIcon className="w-6 h-6"/>
        </button>
        <div className="relative w-full max-w-md">
          <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Búsqueda general..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative">
            <button 
                onClick={handleSave}
                title="Guardar Cambios"
                className="flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300"
            >
                <CloudArrowUpIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Guardar</span>
            </button>
            {showSaveConfirm && (
                <div className="absolute top-full mt-2 right-0 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg animate-pulse">
                    ¡Guardado!
                </div>
            )}
        </div>

        <button title="Perfil de Usuario" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <UserCircleIcon className="w-6 h-6 text-gray-500" />
        </button>
      </div>
    </header>
  );
};

export default Header;
