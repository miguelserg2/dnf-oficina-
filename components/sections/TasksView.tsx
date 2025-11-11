import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { TaskStatus, Task, TaskPriority } from '../../types';
import Card from '../common/Card';
import Modal from '../common/Modal';
import TaskForm from '../forms/TaskForm';
import { EyeIcon, PencilIcon, PlusIcon, TrashIcon, PaperClipIcon } from '../Icons';

const PriorityBadge: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
    const priorityStyles = {
        [TaskPriority.High]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        [TaskPriority.Medium]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        [TaskPriority.Low]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    };
    const priorityText = {
        [TaskPriority.High]: 'Alta',
        [TaskPriority.Medium]: 'Media',
        [TaskPriority.Low]: 'Baja',
    };
    return (
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${priorityStyles[priority]}`}>
            {priorityText[priority]}
        </span>
    );
};

const TasksView: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, updateTaskStatus } = useAppContext();
  const [view, setView] = useState<TaskStatus>(TaskStatus.Pending);
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'view' | 'edit'>('create');

  const handleOpenModal = (mode: 'create' | 'view' | 'edit', task: Task | null = null) => {
    setModalMode(mode);
    setSelectedTask(task);
    setIsModalOpen(true);
  };
  
  const handleSaveTask = (task: Omit<Task, 'id' | 'status'> | Task) => {
    if ('id' in task) {
        updateTask(task as Task);
    } else {
        addTask(task);
    }
    setIsModalOpen(false);
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
        deleteTask(taskId);
        setIsModalOpen(false);
    }
  };

  const filteredTasks = tasks
    .filter(task => task.status === view)
    .filter(task => priorityFilter === 'all' || task.priority === priorityFilter);
  
  const getModalTitle = () => {
    if (modalMode === 'create') return 'Crear Nueva Tarea';
    if (modalMode === 'edit') return 'Editar Tarea';
    return 'Detalles de la Tarea';
  }

  const FilterButton: React.FC<{onClick: () => void; isActive: boolean; children: React.ReactNode}> = ({onClick, isActive, children}) => (
      <button onClick={onClick} className={`px-3 py-1 text-sm rounded-full transition ${isActive ? 'bg-indigo-600 text-white font-semibold' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
          {children}
      </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestión de Tareas</h1>
        <button onClick={() => handleOpenModal('create')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <PlusIcon className="w-5 h-5"/>
          Nueva Tarea
        </button>
      </div>

      <div>
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button onClick={() => setView(TaskStatus.Pending)} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${view === TaskStatus.Pending ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Tareas Pendientes ({tasks.filter(t => t.status === TaskStatus.Pending).length})</button>
            <button onClick={() => setView(TaskStatus.Completed)} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${view === TaskStatus.Completed ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Tareas Completadas ({tasks.filter(t => t.status === TaskStatus.Completed).length})</button>
          </nav>
        </div>
        <div className="flex items-center gap-2 mt-4 flex-wrap">
            <span className="text-sm font-medium text-gray-500 mr-2">Prioridad:</span>
            <FilterButton onClick={() => setPriorityFilter('all')} isActive={priorityFilter === 'all'}>Todas</FilterButton>
            <FilterButton onClick={() => setPriorityFilter(TaskPriority.High)} isActive={priorityFilter === TaskPriority.High}>Alta</FilterButton>
            <FilterButton onClick={() => setPriorityFilter(TaskPriority.Medium)} isActive={priorityFilter === TaskPriority.Medium}>Media</FilterButton>
            <FilterButton onClick={() => setPriorityFilter(TaskPriority.Low)} isActive={priorityFilter === TaskPriority.Low}>Baja</FilterButton>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map(task => (
            <Card key={task.id} className="flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2">
                      <h3 className="text-lg font-bold pr-4">{task.title}</h3>
                      <PriorityBadge priority={task.priority} />
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 my-2 text-sm truncate">{task.description}</p>
                  <div className="flex items-center gap-4">
                    {task.attachment && <PaperClipIcon className="w-5 h-5 text-gray-400" />}
                    <input
                        type="checkbox"
                        checked={task.status === TaskStatus.Completed}
                        onChange={() => updateTaskStatus(task.id, task.status === TaskStatus.Pending ? TaskStatus.Completed : TaskStatus.Pending)}
                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 ml-auto"
                        aria-label={`Marcar como ${task.status === TaskStatus.Completed ? 'pendiente' : 'completada'}`}
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-4 border-t dark:border-gray-700 pt-3">
                    <p><strong>Asignado a:</strong> {task.assignedTo}</p>
                    <p><strong>Vence:</strong> {new Date(task.dueDate).toLocaleDateString()}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <button onClick={() => handleOpenModal('view', task)} className="text-gray-500 hover:text-indigo-600 p-1"><EyeIcon className="w-5 h-5"/></button>
                       <button onClick={() => handleOpenModal('edit', task)} className="text-gray-500 hover:text-green-600 p-1"><PencilIcon className="w-5 h-5"/></button>
                       <button onClick={() => handleDeleteTask(task.id)} className="text-gray-500 hover:text-red-600 p-1"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                </div>
            </Card>
        ))}
        {filteredTasks.length === 0 && <p className="text-gray-500 col-span-full text-center py-8">No hay tareas que coincidan con los filtros seleccionados.</p>}
      </div>
      
      {isModalOpen && (
        <Modal title={getModalTitle()} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <TaskForm 
                task={selectedTask}
                mode={modalMode}
                onSave={handleSaveTask}
                onCancel={() => setIsModalOpen(false)}
                onDelete={handleDeleteTask}
                onSetMode={setModalMode}
            />
        </Modal>
      )}

    </div>
  );
};

export default TasksView;