
import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from './sections/Dashboard';
import CalendarView from './sections/CalendarView';
import DocumentsView from './sections/DocumentsView';
import TasksView from './sections/TasksView';
import ReportsView from './sections/ReportsView';
import SettingsView from './sections/SettingsView';
import { useAppContext } from '../context/AppContext';
import { Section, Task, Document, CalendarEvent } from '../types';
import { useAuth } from '../context/AuthContext';
import { useIdleTimeout } from '../hooks/useIdleTimeout';
import IdleTimeoutModal from './common/IdleTimeoutModal';


const MainLayout: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>(Section.Dashboard);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { tasks, documents, events, theme } = useAppContext();
  const { logout } = useAuth();

  // Auto-logout after 15 minutes of inactivity, with a 60-second warning.
  const { isIdle, remainingTime, stayActive } = useIdleTimeout({ 
    onIdle: logout, 
    idleTime: 15 * 60, // 15 minutes
    warningTime: 60 // 1 minute
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    root.classList.toggle('dark', isDark);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        root.classList.toggle('dark', mediaQuery.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return null;

    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    const foundTasks = tasks.filter(task => 
      task.title.toLowerCase().includes(lowerCaseSearchTerm) ||
      task.description.toLowerCase().includes(lowerCaseSearchTerm)
    );

    const foundDocuments = documents.filter(doc => 
      doc.title.toLowerCase().includes(lowerCaseSearchTerm) ||
      doc.content.toLowerCase().includes(lowerCaseSearchTerm)
    );

    const foundEvents = events.filter(event => 
      event.title.toLowerCase().includes(lowerCaseSearchTerm)
    );

    return { tasks: foundTasks, documents: foundDocuments, events: foundEvents };
  }, [searchTerm, tasks, documents, events]);

  const renderSection = () => {
    if (searchResults) {
      return <SearchResults results={searchResults} />;
    }

    switch (activeSection) {
      case Section.Dashboard:
        return <Dashboard setActiveSection={setActiveSection} />;
      case Section.Calendar:
        return <CalendarView />;
      case Section.Documents:
        return <DocumentsView />;
      case Section.Tasks:
        return <TasksView />;
      case Section.Reports:
        return <ReportsView />;
      case Section.Settings:
        return <SettingsView />;
      default:
        return <Dashboard setActiveSection={setActiveSection} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      <IdleTimeoutModal
        isOpen={isIdle}
        onStayActive={stayActive}
        onLogout={logout}
        remainingTime={remainingTime}
      />
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 md:p-8">
           <div key={activeSection} className="animate-fadeIn">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
};


interface SearchResultsProps {
  results: {
    tasks: Task[];
    documents: Document[];
    events: CalendarEvent[];
  };
}

const SearchResults: React.FC<SearchResultsProps> = ({ results }) => {
  const totalResults = results.tasks.length + results.documents.length + results.events.length;
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
        Resultados de la Búsqueda ({totalResults})
      </h2>
      
      {results.tasks.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-4 text-indigo-600 dark:text-indigo-400">Tareas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.tasks.map(task => (
              <div key={task.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <p className="font-bold">{task.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{task.description}</p>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${task.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'}`}>{task.status}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {results.documents.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-4 text-indigo-600 dark:text-indigo-400">Documentos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.documents.map(doc => (
              <div key={doc.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <p className="font-bold">{doc.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{doc.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {results.events.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-4 text-indigo-600 dark:text-indigo-400">Eventos del Calendario/Agenda</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.events.map(event => (
              <div key={event.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <p className="font-bold">{event.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{new Date(event.start).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {totalResults === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">No se encontraron resultados.</p>
        </div>
      )}
    </div>
  );
};

export default MainLayout;