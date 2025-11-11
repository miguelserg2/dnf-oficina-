
import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/sections/Dashboard';
import CalendarView from './components/sections/CalendarView';
import DocumentsView from './components/sections/DocumentsView';
import TasksView from './components/sections/TasksView';
import ReportsView from './components/sections/ReportsView';
import { AppContextProvider, useAppContext } from './context/AppContext';
import { Section } from './types';

const App: React.FC = () => {
  return (
    <AppContextProvider>
      <MainApp />
    </AppContextProvider>
  );
};

const MainApp: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>(Section.Dashboard);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { tasks, documents, events } = useAppContext();

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
      default:
        return <Dashboard setActiveSection={setActiveSection} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans">
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
          {renderSection()}
        </main>
      </div>
    </div>
  );
};


interface SearchResultsProps {
  results: {
    tasks: any[];
    documents: any[];
    events: any[];
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


export default App;
