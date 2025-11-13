import React, { useState, useEffect, useCallback } from 'react';
import { Task, TaskPriority } from '../../types';
import { fileToBase64 } from '../../utils/fileUtils';
import { PaperClipIcon, XIcon, PencilIcon, TrashIcon } from '../Icons';
import { useAppContext } from '../../context/AppContext';
import { useAutosave } from '../../hooks/useAutosave';
import AutosaveIndicator from '../common/AutosaveIndicator';


type FormMode = 'create' | 'edit' | 'view';

interface TaskFormProps {
    task: Task | null;
    mode: FormMode;
    onSave: (task: Omit<Task, 'id' | 'status'> | Task) => void;
    onCancel: () => void;
    onDelete: (taskId: string) => void;
    onSetMode: (mode: FormMode) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, mode, onSave, onCancel, onDelete, onSetMode }) => {
    const { addTask, updateTask } = useAppContext();
    const [formData, setFormData] = useState<Partial<Task>>({});

    useEffect(() => {
        const initialData = task || { title: '', assignedTo: '', description: '', documentNumber: '', dueDate: '', priority: TaskPriority.Medium, startTime: '', endTime: '' };
        setFormData(initialData);
    }, [task, mode]);

    const handleSaveCallback = useCallback(async (dataToSave: Partial<Task>) => {
        if (!dataToSave.title || !dataToSave.assignedTo || !dataToSave.description || !dataToSave.dueDate || !dataToSave.priority) {
            return;
        }
        
        if (dataToSave.id) {
            updateTask(dataToSave as Task);
        } else {
            const newTask = addTask(dataToSave as Omit<Task, 'id' | 'status'>);
            setFormData(prev => ({...prev, id: newTask.id, status: newTask.status }));
        }
    }, [addTask, updateTask]);

    const [saveStatus, saveNow] = useAutosave({ data: formData, onSave: handleSaveCallback, interval: 2000 });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const content = await fileToBase64(file);
            setFormData(prev => ({ ...prev, attachment: { name: file.name, type: file.type, content } }));
        }
    };
    
    const priorityText = {
        [TaskPriority.Urgent]: 'Urgente',
        [TaskPriority.High]: 'Alta',
        [TaskPriority.Medium]: 'Media',
        [TaskPriority.Low]: 'Baja',
    };
    
    if (mode === 'view' && task) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div><h3 className="text-sm text-gray-500">Asignado a (Nombre)</h3><p>{task.assignedTo}</p></div>
                    <div><h3 className="text-sm text-gray-500">Prioridad</h3><p>{priorityText[task.priority]}</p></div>
                    <div><h3 className="text-sm text-gray-500">Vence</h3><p>{new Date(task.dueDate).toLocaleDateString()}</p></div>
                    {task.documentNumber && <div><h3 className="text-sm text-gray-500">Nro. Documento</h3><p>{task.documentNumber}</p></div>}
                    {task.startTime && task.endTime && <div className="col-span-2"><h3 className="text-sm text-gray-500">Hora</h3><p>{task.startTime} - {task.endTime}</p></div>}
                </div>
                <div><h3 className="text-sm text-gray-500">Descripción</h3><p className="whitespace-pre-wrap">{task.description}</p></div>
                {task.attachment && (
                    <div>
                        <h3 className="text-sm text-gray-500">Adjunto</h3>
                        <a href={task.attachment.content} download={task.attachment.name} className="flex items-center gap-2 text-indigo-600 hover:underline">
                            <PaperClipIcon className="w-5 h-5"/>{task.attachment.name}
                        </a>
                    </div>
                )}
                 <div className="flex gap-2 pt-4 border-t dark:border-gray-700">
                    <button onClick={() => onSetMode('edit')} className="p-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"><PencilIcon className="w-4 h-4"/>Editar</button>
                    <button onClick={() => onDelete(task.id)} className="p-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"><TrashIcon className="w-4 h-4"/>Eliminar</button>
                    <button onClick={onCancel} className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600">Cerrar</button>
                </div>
            </div>
        )
    }

    return (
        <form onSubmit={(e) => { e.preventDefault(); saveNow().then(() => onCancel()); }} className="space-y-4">
            <input type="text" name="title" placeholder="Título de la tarea" value={formData.title || ''} onChange={handleChange} className="w-full p-2 input-field" required />
            <div className="grid grid-cols-2 gap-4">
              <input type="text" name="assignedTo" placeholder="Asignado a (Nombre)" value={formData.assignedTo || ''} onChange={handleChange} className="w-full p-2 input-field" required />
              <input type="date" name="dueDate" value={formData.dueDate ? formData.dueDate.substring(0,10) : ''} onChange={handleChange} className="w-full p-2 input-field" required/>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <input type="text" name="documentNumber" placeholder="Número de Documento (Opcional)" value={formData.documentNumber || ''} onChange={handleChange} className="w-full p-2 input-field" />
                 <div>
                    <label htmlFor="priority" className="sr-only">Prioridad</label>
                    <select id="priority" name="priority" value={formData.priority || TaskPriority.Medium} onChange={handleChange} className="w-full p-2 input-field" required>
                        <option value={TaskPriority.Urgent}>Prioridad Urgente</option>
                        <option value={TaskPriority.High}>Prioridad Alta</option>
                        <option value={TaskPriority.Medium}>Prioridad Media</option>
                        <option value={TaskPriority.Low}>Prioridad Baja</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Hora (de - hasta)</label>
                <div className="grid grid-cols-2 gap-4">
                    <input type="time" name="startTime" value={formData.startTime || ''} onChange={handleChange} className="w-full p-2 input-field"/>
                    <input type="time" name="endTime" value={formData.endTime || ''} onChange={handleChange} className="w-full p-2 input-field"/>
                </div>
            </div>
            <textarea name="description" placeholder="Descripción" value={formData.description || ''} onChange={handleChange} rows={4} className="w-full p-2 input-field" required></textarea>
            <div>
                  <label className="block text-sm font-medium mb-1">Adjuntar archivo</label>
                  {formData.attachment ? (
                     <div className="flex items-center gap-2 text-sm"><PaperClipIcon className="w-5 h-5"/><span>{formData.attachment.name}</span>
                        <button type="button" onClick={() => setFormData({...formData, attachment: undefined})}><XIcon className="w-4 h-4 text-red-500"/></button>
                     </div>
                  ) : (
                     <input type="file" onChange={handleFileChange} className="w-full text-sm file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                  )}
            </div>
            <div className="flex items-center gap-4 pt-2 border-t dark:border-gray-700">
                <button type="button" onClick={saveNow} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Guardar ahora</button>
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Cerrar</button>
                <AutosaveIndicator status={saveStatus} />
            </div>
        </form>
    );
};

export default TaskForm;