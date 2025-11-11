export enum Section {
  Dashboard = 'dashboard',
  Calendar = 'calendar',
  Documents = 'documents',
  Tasks = 'tasks',
  Reports = 'reports',
}

export enum TaskStatus {
  Pending = 'pending',
  Completed = 'completed',
}

export enum TaskPriority {
    High = 'high',
    Medium = 'medium',
    Low = 'low',
}

export interface Attachment {
    name: string;
    type: string;
    content: string; // base64 encoded content
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  documentNumber?: string;
  attachment?: Attachment;
}

export interface Document {
  id: string;
  title: string;
  author: string;
  content: string;
  createdAt: string;
  documentNumber?: string;
  attachment?: Attachment;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  name: string;
  description: string;
  documentNumber?: string;
  attachment?: Attachment;
}

export interface AppState {
    tasks: Task[];
    documents: Document[];
    events: CalendarEvent[];
}


export interface AppContextType extends AppState {
  addTask: (task: Omit<Task, 'id' | 'status'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  
  addDocument: (doc: Omit<Document, 'id' | 'createdAt'>) => void;
  updateDocument: (doc: Document) => void;
  deleteDocument: (docId: string) => void;
  
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (event: CalendarEvent) => void;
  deleteEvent: (eventId: string) => void;
  
  saveState: () => void;
}
