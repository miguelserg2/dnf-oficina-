import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from '../common/Card';
import { CalendarEvent } from '../../types';
import Modal from '../common/Modal';
import EventForm from '../forms/EventForm';
import { EyeIcon, PencilIcon, TrashIcon, PlusIcon } from '../Icons';

const CalendarView: React.FC = () => {
    const { events, addEvent, updateEvent, deleteEvent } = useAppContext();
    const [viewDate, setViewDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [modalMode, setModalMode] = useState<'create' | 'view' | 'edit'>('create');

    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

    const handleOpenModal = (mode: 'create' | 'view' | 'edit', event: CalendarEvent | null = null) => {
        setModalMode(mode);
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const handleSaveEvent = (event: Omit<CalendarEvent, 'id'> | CalendarEvent) => {
        if ('id' in event) {
            updateEvent(event);
        } else {
            addEvent(event);
        }
        setIsModalOpen(false);
    };
    
    const handleDeleteEvent = (eventId: string) => {
        if(window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
            deleteEvent(eventId);
            setIsModalOpen(false);
        }
    };

    const sortedEvents = [...events].sort((a,b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    
    const getModalTitle = () => {
        if (modalMode === 'create') return 'Crear Nuevo Evento';
        if (modalMode === 'edit') return 'Editar Evento';
        return 'Detalles del Evento';
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="px-3 py-1 rounded bg-indigo-500 text-white hover:bg-indigo-600 transition">&lt;</button>
                        <h2 className="text-xl font-bold">{viewDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</h2>
                        <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="px-3 py-1 rounded bg-indigo-500 text-white hover:bg-indigo-600 transition">&gt;</button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center font-semibold text-sm text-gray-600 dark:text-gray-300">
                        <div>Dom</div><div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mt-2">
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`}></div>)}
                        {Array.from({ length: daysInMonth }).map((_, day) => {
                            const date = day + 1;
                            const isToday = new Date().getDate() === date && new Date().getMonth() === viewDate.getMonth() && new Date().getFullYear() === viewDate.getFullYear();
                            const eventsOnDay = events.filter(e => {
                                const eventDate = new Date(e.start);
                                return eventDate.getDate() === date && eventDate.getMonth() === viewDate.getMonth() && eventDate.getFullYear() === viewDate.getFullYear();
                            });
                            return (
                                <div key={date} className={`h-24 p-1 border border-gray-200 dark:border-gray-700 rounded-lg ${isToday ? 'bg-indigo-50 dark:bg-indigo-900/50' : ''}`}>
                                    <div className={`font-bold text-sm ${isToday ? 'text-indigo-600' : ''}`}>{date}</div>
                                    <div className="text-xs overflow-y-auto max-h-16 space-y-1">
                                        {eventsOnDay.map(e => <div key={e.id} className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded px-1 truncate text-left">{e.title}</div>)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>
            <div>
                 <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Agenda</h2>
                        <button onClick={() => handleOpenModal('create')} className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition">
                            <PlusIcon className="w-5 h-5"/>
                        </button>
                    </div>
                    <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
                        {sortedEvents.map(event => (
                             <li key={event.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <p className="font-semibold">{event.title}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(event.start).toLocaleString('es-ES')}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <button onClick={() => handleOpenModal('view', event)} className="text-gray-500 hover:text-indigo-600"><EyeIcon className="w-5 h-5"/></button>
                                    <button onClick={() => handleOpenModal('edit', event)} className="text-gray-500 hover:text-green-600"><PencilIcon className="w-5 h-5"/></button>
                                    <button onClick={() => handleDeleteEvent(event.id)} className="text-gray-500 hover:text-red-600"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            </li>
                        ))}
                         {sortedEvents.length === 0 && <p className="text-center text-gray-400 py-4">No hay eventos en la agenda.</p>}
                    </ul>
                </Card>
            </div>
            {isModalOpen && (
                <Modal title={getModalTitle()} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <EventForm 
                        event={selectedEvent} 
                        mode={modalMode}
                        onSave={handleSaveEvent}
                        onCancel={() => setIsModalOpen(false)}
                        onDelete={handleDeleteEvent}
                        onSetMode={setModalMode}
                    />
                </Modal>
            )}
        </div>
    );
};

export default CalendarView;
