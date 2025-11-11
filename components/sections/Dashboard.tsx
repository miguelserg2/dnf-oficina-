
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from '../common/Card';
import { Section, TaskStatus } from '../../types';
import { ArrowRightIcon } from '../Icons';

interface DashboardProps {
  setActiveSection: (section: Section) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveSection }) => {
  const { tasks, documents, events } = useAppContext();

  const pendingTasks = tasks.filter(task => task.status === TaskStatus.Pending);
  const upcomingEvents = events
    .filter(event => new Date(event.start) > new Date())
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Un resumen de la actividad de tu oficina.</p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold mb-4">Tareas Pendientes Urgentes</h2>
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
          <h2 className="text-xl font-semibold mb-4">Próximos Eventos en la Agenda</h2>
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
      </div>
    </div>
  );
};

export default Dashboard;
