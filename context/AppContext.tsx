import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Task, Document, CalendarEvent, AppContextType, TaskStatus, TaskPriority, AppState, Theme, Report, DocumentVersion } from '../types';

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialTasks: Task[] = [
    { id: '1', title: 'Preparar informe trimestral', description: 'Compilar datos de ventas y marketing.', assignedTo: 'Ana Pérez', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), status: TaskStatus.Pending, priority: TaskPriority.High, startTime: '09:00', endTime: '11:00' },
    { id: '2', title: 'Reunión de equipo', description: 'Discutir avances del proyecto "Alpha".', assignedTo: 'Equipo de Desarrollo', dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), status: TaskStatus.Pending, priority: TaskPriority.Medium, startTime: '15:00', endTime: '16:00' },
    { id: '3', title: 'Actualizar base de datos de clientes', description: 'Añadir nuevos contactos del último evento.', assignedTo: 'Carlos Gómez', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), status: TaskStatus.Pending, priority: TaskPriority.Low },
    { id: '4', title: 'Revisar contrato con proveedor', description: 'Verificar cláusulas de renovación y precios.', assignedTo: 'Sofía Rodríguez', dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: TaskStatus.Completed, priority: TaskPriority.Urgent },
];

const initialDocuments: Document[] = [
    { id: '1', title: 'Plan de Marketing Q3', author: 'Ana Pérez', content: 'Estrategias y presupuesto para el tercer trimestre...', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), startTime: '14:00', endTime: '15:30', category: 'Marketing', tags: ['Q3', 'Presupuesto'] },
    { id: '2', title: 'Minuta de Reunión - 15 de Julio', author: 'Carlos Gómez', content: 'Resumen de los puntos tratados y acciones a seguir...', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), category: 'Reuniones', tags: ['Proyecto Alpha'] },
];

const initialEvents: CalendarEvent[] = [
    { id: '1', title: 'Lanzamiento Proyecto "Beta"', start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3600000).toISOString(), name: "Equipo de Producto", description: "Reunión final para el lanzamiento.", location: "Sala de Juntas 1", participants: ['Ana Pérez', 'Carlos Gómez'] },
    { id: '2', title: 'Entrevista Candidato a Diseñador', start: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), end: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 1800000).toISOString(), name: "Recursos Humanos", description: "Entrevista con Juan Martínez.", location: "Online (Google Meet)" },
];

const initialState: Omit<AppState, 'theme'> = {
    tasks: initialTasks,
    documents: initialDocuments,
    events: initialEvents,
    reports: [],
};

const APP_STATE_KEY = 'dnfAppState';

const loadState = (): AppState => {
    try {
        const serializedState = localStorage.getItem(APP_STATE_KEY);
        if (serializedState === null) {
            return { ...initialState, theme: 'system' };
        }
        const parsed = JSON.parse(serializedState);
        // Ensure reports array exists for backward compatibility
        if (!parsed.reports) {
            parsed.reports = [];
        }
        return { ...initialState, ...parsed, theme: parsed.theme || 'system' };
    } catch (error) {
        console.error("Could not load state from local storage", error);
        return { ...initialState, theme: 'system' };
    }
};


export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AppState>(loadState());

    useEffect(() => {
        try {
            const serializedState = JSON.stringify(state);
            localStorage.setItem(APP_STATE_KEY, serializedState);
        } catch (error) {
            console.error("Could not save state to local storage", error);
        }
    }, [state]);

    // Task Management
    const addTask = (taskData: Omit<Task, 'id' | 'status'>): Task => {
        const newTask: Task = {
            id: new Date().toISOString(),
            status: TaskStatus.Pending,
            ...taskData
        };
        setState(prevState => ({ ...prevState, tasks: [...prevState.tasks, newTask] }));
        return newTask;
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
    const addDocument = (docData: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Document => {
        const now = new Date().toISOString();
        const newDoc: Document = {
            id: now,
            createdAt: now,
            updatedAt: now,
            ...docData
        };
        setState(prevState => ({ ...prevState, documents: [...prevState.documents, newDoc] }));
        return newDoc;
    };

    const updateDocument = (updatedDoc: Document) => {
        setState(prevState => {
            const oldDoc = prevState.documents.find(doc => doc.id === updatedDoc.id);
            if (!oldDoc) return prevState;

            // Don't create a history entry if content is the same
            if (oldDoc.content === updatedDoc.content) {
                return {
                    ...prevState,
                    documents: prevState.documents.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc)
                };
            }

            const historyEntry: DocumentVersion = {
                modifiedAt: oldDoc.updatedAt || oldDoc.createdAt,
                content: oldDoc.content
            };
            
            const newHistory = [...(oldDoc.history || []), historyEntry];
            const docWithHistory = { ...updatedDoc, history: newHistory };

            return {
                ...prevState,
                documents: prevState.documents.map(doc => 
                    doc.id === updatedDoc.id 
                        ? docWithHistory
                        : doc
                )
            };
        });
    };

    const deleteDocument = (docId: string) => {
        setState(prevState => ({ ...prevState, documents: prevState.documents.filter(doc => doc.id !== docId) }));
    };
    
    // Event Management
    const addEvent = (eventData: Omit<CalendarEvent, 'id'>): CalendarEvent => {
        const newEvent: CalendarEvent = {
            id: new Date().toISOString(),
            ...eventData
        };
        setState(prevState => ({ ...prevState, events: [...prevState.events, newEvent] }));
        return newEvent;
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

    // Report Management
    const addReport = (reportData: Omit<Report, 'id'>): Report => {
        const newReport: Report = {
            id: new Date().toISOString(),
            ...reportData,
        };
        setState(prevState => ({ ...prevState, reports: [newReport, ...prevState.reports] }));
        return newReport;
    };

    const deleteReport = (reportId: string) => {
        setState(prevState => ({ ...prevState, reports: prevState.reports.filter(report => report.id !== reportId)}));
    };

    // Theme Management
    const setTheme = (theme: Theme) => {
        setState(prevState => ({ ...prevState, theme }));
    };

    // Data Import function
    const loadStateFromFile = (newState: AppState) => {
        // Basic validation
        if (newState && Array.isArray(newState.tasks) && Array.isArray(newState.documents) && Array.isArray(newState.events) && newState.theme) {
            // Ensure reports array exists for backward compatibility with older export files
            if (!newState.reports) {
                newState.reports = [];
            }
            setState(newState);
        } else {
            alert('El archivo de datos no es válido o está corrupto.');
        }
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
        addReport,
        deleteReport,
        setTheme,
        loadStateFromFile,
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