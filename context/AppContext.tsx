import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Task, Document, CalendarEvent, AppContextType, TaskStatus, TaskPriority, AppState } from '../types';

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialTasks: Task[] = [
    { id: '1', title: 'Preparar informe trimestral', description: 'Compilar datos de ventas y marketing.', assignedTo: 'Ana Pérez', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), status: TaskStatus.Pending, priority: TaskPriority.High },
    { id: '2', title: 'Reunión de equipo', description: 'Discutir avances del proyecto "Alpha".', assignedTo: 'Equipo de Desarrollo', dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), status: TaskStatus.Pending, priority: TaskPriority.Medium },
    { id: '3', title: 'Actualizar base de datos de clientes', description: 'Añadir nuevos contactos del último evento.', assignedTo: 'Carlos Gómez', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), status: TaskStatus.Pending, priority: TaskPriority.Low },
    { id: '4', title: 'Revisar contrato con proveedor', description: 'Verificar cláusulas de renovación y precios.', assignedTo: 'Sofía Rodríguez', dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: TaskStatus.Completed, priority: TaskPriority.High },
];

const initialDocuments: Document[] = [
    { id: '1', title: 'Plan de Marketing Q3', author: 'Ana Pérez', content: 'Estrategias y presupuesto para el tercer trimestre...', createdAt: new Date().toISOString() },
    { id: '2', title: 'Minuta de Reunión - 15 de Julio', author: 'Carlos Gómez', content: 'Resumen de los puntos tratados y acciones a seguir...', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
];

const initialEvents: CalendarEvent[] = [
    { id: '1', title: 'Lanzamiento Proyecto "Beta"', start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3600000).toISOString(), name: "Equipo de Producto", description: "Reunión final para el lanzamiento." },
    { id: '2', title: 'Entrevista Candidato a Diseñador', start: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), end: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 1800000).toISOString(), name: "Recursos Humanos", description: "Entrevista con Juan Martínez." },
];

const initialState: AppState = {
    tasks: initialTasks,
    documents: initialDocuments,
    events: initialEvents,
};

const APP_STATE_KEY = 'dnfAppState';

const loadState = (): AppState => {
    try {
        const serializedState = localStorage.getItem(APP_STATE_KEY);
        if (serializedState === null) {
            return initialState;
        }
        return JSON.parse(serializedState);
    } catch (error) {
        console.error("Could not load state from local storage", error);
        return initialState;
    }
};


export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AppState>(loadState());

    const saveState = () => {
        try {
            const serializedState = JSON.stringify(state);
            localStorage.setItem(APP_STATE_KEY, serializedState);
        } catch (error) {
            console.error("Could not save state to local storage", error);
        }
    };

    // Task Management
    const addTask = (taskData: Omit<Task, 'id' | 'status'>) => {
        const newTask: Task = {
            id: new Date().toISOString(),
            status: TaskStatus.Pending,
            ...taskData
        };
        setState(prevState => ({ ...prevState, tasks: [...prevState.tasks, newTask] }));
    };

    const updateTask = (updatedTask: Task) => {
        setState(prevState => ({
            ...prevState,
            tasks: prevState.tasks.map(task => task.id === updatedTask.id ? updatedTask : task)
        }));
    };

    const deleteTask = (taskId: string) => {
        setState(prevState => ({ ...prevState, tasks: prevState.tasks.filter(task => task.id !== taskId) }));
    };

    const updateTaskStatus = (taskId: string, status: TaskStatus) => {
        setState(prevState => ({
            ...prevState,
            tasks: prevState.tasks.map(task => task.id === taskId ? { ...task, status } : task)
        }));
    };

    // Document Management
    const addDocument = (docData: Omit<Document, 'id' | 'createdAt'>) => {
        const newDoc: Document = {
            id: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            ...docData
        };
        setState(prevState => ({ ...prevState, documents: [...prevState.documents, newDoc] }));
    };

    const updateDocument = (updatedDoc: Document) => {
        setState(prevState => ({
            ...prevState,
            documents: prevState.documents.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc)
        }));
    };

    const deleteDocument = (docId: string) => {
        setState(prevState => ({ ...prevState, documents: prevState.documents.filter(doc => doc.id !== docId) }));
    };
    
    // Event Management
    const addEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
        const newEvent: CalendarEvent = {
            id: new Date().toISOString(),
            ...eventData
        };
        setState(prevState => ({ ...prevState, events: [...prevState.events, newEvent] }));
    };

    const updateEvent = (updatedEvent: CalendarEvent) => {
        setState(prevState => ({
            ...prevState,
            events: prevState.events.map(event => event.id === updatedEvent.id ? updatedEvent : event)
        }));
    };

    const deleteEvent = (eventId: string) => {
        setState(prevState => ({ ...prevState, events: prevState.events.filter(event => event.id !== eventId) }));
    };

    const value: AppContextType = {
        ...state,
        addTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
        addDocument,
        updateDocument,
        deleteDocument,
        addEvent,
        updateEvent,
        deleteEvent,
        saveState,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppContextProvider');
    }
    return context;
};