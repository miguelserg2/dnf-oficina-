import React, { useState, useEffect, useCallback } from 'react';
import { CalendarEvent } from '../../types';
import { fileToBase64 } from '../../utils/fileUtils';
import { PaperClipIcon, XIcon, PencilIcon, TrashIcon } from '../Icons';
import { useAppContext } from '../../context/AppContext';
import { useAutosave } from '../../hooks/useAutosave';
import AutosaveIndicator from '../common/AutosaveIndicator';

type FormMode = 'create' | 'edit' | 'view';

interface EventFormProps {
    event: CalendarEvent | null;
    mode: FormMode;
    onSave: (event: Omit<CalendarEvent, 'id'> | CalendarEvent) => void;
    onCancel: () => void;
    onDelete: (eventId: string) => void;
    onSetMode: (mode: FormMode) => void;
}

const EventForm: React.FC<EventFormProps> = ({ event, mode, onSave, onCancel, onDelete, onSetMode }) => {
    const { addEvent, updateEvent } = useAppContext();
    const [formData, setFormData] = useState<Partial<CalendarEvent> & { participantsString?: string }>({});

    useEffect(() => {
        const initialData = event ? { ...event, participantsString: event.participants?.join(', ') || '' } : { title: '', name: '', description: '', documentNumber: '', location: '', participantsString: '' };
        setFormData(initialData);
    }, [event, mode]);
    
    const handleSaveCallback = useCallback(async (dataToSave: Partial<CalendarEvent> & { participantsString?: string }) => {
        if (!dataToSave.title || !dataToSave.name || !dataToSave.description || !dataToSave.start || !dataToSave.end) {
            return;
        }

        const eventData = { ...dataToSave, participants: dataToSave.participantsString?.split(',').map(p => p.trim()).filter(Boolean) || [] };
        delete eventData.participantsString;
        
        if (eventData.id) {
            updateEvent(eventData as CalendarEvent);
        } else {
            const newEvent = addEvent(eventData as Omit<CalendarEvent, 'id'>);
            setFormData(prev => ({ ...prev, id: newEvent.id }));
        }
    }, [addEvent, updateEvent]);
    
    const [saveStatus, saveNow] = useAutosave({ data: formData, onSave: handleSaveCallback, interval: 2000 });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    if (mode === 'view' && event) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h3 className="text-sm text-gray-500">Responsable</h3>
                        <p>{event.name}</p>
                    </div>
                     <div>
                        <h3 className="text-sm text-gray-500">Ubicación</h3>
                        <p>{event.location || 'No especificada'}</p>
                    </div>
                </div>
                <div>
                    <h3 className="text-sm text-gray-500">Fechas</h3>
                    <p>{new Date(event.start).toLocaleString()} - {new Date(event.end).toLocaleString()}</p>
                </div>
                {event.documentNumber && <div><h3 className="text-sm text-gray-500">Nro. Documento</h3><p>{event.documentNumber}</p></div>}
                 {event.participants && event.participants.length > 0 && (
                    <div>
                        <h3 className="text-sm text-gray-500">Participantes</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {event.participants.map(p => <span key={p} className="bg-gray-200 dark:bg-gray-700 text-sm px-2 py-1 rounded">{p}</span>)}
                        </div>
                    </div>
                )}
                <div>
                    <h3 className="text-sm text-gray-500">Descripción</h3>
                    <p className="whitespace-pre-wrap">{event.description}</p>
                </div>
                {event.attachment && (
                    <div>
                        <h3 className="text-sm text-gray-500">Adjunto</h3>
                        <a href={event.attachment.content} download={event.attachment.name} className="flex items-center gap-2 text-indigo-600 hover:underline">
                            <PaperClipIcon className="w-5 h-5"/>{event.attachment.name}
                        </a>
                    </div>
                )}
                 <div className="flex gap-2 pt-4 border-t dark:border-gray-700">
                    <button onClick={() => onSetMode('edit')} className="p-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"><PencilIcon className="w-4 h-4"/>Editar</button>
                    <button onClick={() => onDelete(event.id)} className="p-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"><TrashIcon className="w-4 h-4"/>Eliminar</button>
                    <button onClick={onCancel} className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600">Cerrar</button>
                </div>
            </div>
        )
    }

    return (
        <form onSubmit={(e) => { e.preventDefault(); saveNow().then(() => onCancel()); }} className="space-y-4">
            <input type="text" name="title" placeholder="Título del evento" value={formData.title || ''} onChange={handleChange} className="w-full p-2 input-field" required />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="name" placeholder="Nombre del responsable" value={formData.name || ''} onChange={handleChange} className="w-full p-2 input-field" required />
                 <input type="text" name="location" placeholder="Ubicación (ej. Sala 1, Online)" value={formData.location || ''} onChange={handleChange} className="w-full p-2 input-field" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Hora (de - hasta)</label>
                <div className="grid grid-cols-2 gap-4">
                    <input type="datetime-local" name="start" value={formData.start ? formData.start.substring(0,16) : ''} onChange={handleChange} className="w-full p-2 input-field" required/>
                    <input type="datetime-local" name="end" value={formData.end ? formData.end.substring(0,16) : ''} onChange={handleChange} className="w-full p-2 input-field" required/>
                </div>
            </div>
            <input type="text" name="documentNumber" placeholder="Número de Documento (Opcional)" value={formData.documentNumber || ''} onChange={handleChange} className="w-full p-2 input-field" />
            <input type="text" name="participantsString" placeholder="Participantes (separados por coma)" value={formData.participantsString || ''} onChange={handleChange} className="w-full p-2 input-field" />
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

export default EventForm;