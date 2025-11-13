
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from '../common/Card';
import { Section, TaskStatus } from '../../types';
import { ArrowRightIcon } from '../Icons';

interface DashboardProps {
  setActiveSection: (section: Section) => void;
}

const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
};

const Dashboard: React.FC<DashboardProps> = ({ setActiveSection }) => {
  const { tasks, documents, events } = useAppContext();

  const pendingTasks = tasks.filter(task => task.status === TaskStatus.Pending);
  const upcomingEvents = events
    .filter(event => new Date(event.start) > new Date())
    .slice(0, 3);
  
  const recentDocuments = [...documents]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const tasksToday = tasks.filter(task => isToday(task.dueDate));
  const completedTasksToday = tasksToday.filter(task => task.status === TaskStatus.Completed);
  const pendingTasksTodayCount = tasksToday.length - completedTasksToday.length;
  const completionPercentage = tasksToday.length > 0 ? (completedTasksToday.length / tasksToday.length) * 100 : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">INICIO</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Bienvenido a tu oficina virtual. Aquí tienes un resumen de tu actividad.</p>
      </div>
      
      <Card>
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-gray-700 dark:text-gray-300">Progreso del Día</h2>
            <span className="text-sm font-medium text-red-500">{pendingTasksTodayCount} Tareas Pendientes para Hoy</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
              <div 
                  className="bg-green-500 h-4 rounded-full text-center text-white text-xs font-bold leading-4"
                  style={{ width: `${completionPercentage}%` }}
              >
                  {completionPercentage > 10 ? `${completionPercentage.toFixed(0)}%` : ''}
              </div>
          </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex items-center justify-between bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
          <div>
            <p className="text-4xl font-bold">{pendingTasks.length}</p>
            <p>Tareas Pendientes</p>
          </div>
          <button onClick={() => setActiveSection(Section.Tasks)} className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition">
             <ArrowRightIcon className="w-5 h-5"/>
          </button>
        </Card>
        <Card className="flex items-center justify-between bg-gradient-to-br from-blue-400 to-indigo-500 text-white">
          <div>
            <p className="text-4xl font-bold">{documents.length}</p>
            <p>Documentos</p>
          </div>
           <button onClick={() => setActiveSection(Section.Documents)} className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition">
             <ArrowRightIcon className="w-5 h-5"/>
          </button>
        </Card>
        <Card className="flex items-center justify-between bg-gradient-to-br from-green-400 to-teal-500 text-white">
           <div>
            <p className="text-4xl font-bold">{events.length}</p>
            <p>Eventos Totales</p>
          </div>
           <button onClick={() => setActiveSection(Section.Calendar)} className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition">
             <ArrowRightIcon className="w-5 h-5"/>
          </button>
        </Card>
        <Card className="flex items-center justify-between bg-gradient-to-br from-purple-400 to-pink-500 text-white">
           <div>
            <p className="text-xl font-bold">Generar</p>
            <p>Informe</p>
          </div>
           <button onClick={() => setActiveSection(Section.Reports)} className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition">
             <ArrowRightIcon className="w-5 h-5"/>
          </button>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <h2 className="text-xl font-semibold mb-4">Tareas Pendientes</h2>
          <ul className="space-y-3">
            {pendingTasks.slice(0, 5).map(task => (
              <li key={task.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-gray-500">Vence: {new Date(task.dueDate).toLocaleDateString()}</p>
                </div>
                <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">{task.assignedTo}</span>
              </li>
            ))}
             {pendingTasks.length === 0 && <p className="text-center text-gray-400 py-4">¡Sin tareas pendientes!</p>}
          </ul>
        </Card>
        
        <Card>
          <h2 className="text-xl font-semibold mb-4">Próximos Eventos</h2>
          <ul className="space-y-3">
            {upcomingEvents.map(event => (
              <li key={event.id} className="flex items-start p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                 <div className="flex-shrink-0 w-12 text-center mr-4">
                    <p className="text-indigo-600 dark:text-indigo-400 text-sm font-bold">{new Date(event.start).toLocaleString('es-ES', { month: 'short' })}</p>
                    <p className="text-xl font-bold">{new Date(event.start).getDate()}</p>
                 </div>
                <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-gray-500">{new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </li>
            ))}
            {upcomingEvents.length === 0 && <p className="text-center text-gray-400 py-4">No hay eventos próximos.</p>}
          </ul>
        </Card>
        
        <Card>
          <h2 className="text-xl font-semibold mb-4">Documentos Recientes</h2>
          <ul className="space-y-3">
            {recentDocuments.map(doc => (
              <li key={doc.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                <div>
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-sm text-gray-500">Por: {doc.author}</p>
                </div>
              </li>
            ))}
            {recentDocuments.length === 0 && <p className="text-center text-gray-400 py-4">No hay documentos recientes.</p>}
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
