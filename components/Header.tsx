
import React from 'react';
import { SearchIcon, MenuIcon, ArrowLeftOnRectangleIcon } from './Icons';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ searchTerm, setSearchTerm, onMenuClick }) => {
  const { currentUser, logout } = useAuth();

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
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300 hidden sm:block truncate" title={currentUser?.email}>
            {currentUser?.email}
        </span>
        <button 
            onClick={logout}
            title="Cerrar Sesión"
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500 dark:hover:text-red-400"
        >
          <ArrowLeftOnRectangleIcon className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;
