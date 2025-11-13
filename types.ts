
export enum Section {
  Dashboard = 'dashboard',
  Calendar = 'calendar',
  Documents = 'documents',
  Tasks = 'tasks',
  Reports = 'reports',
  Settings = 'settings',
}

export enum TaskStatus {
  Pending = 'pending',
  Completed = 'completed',
}

export enum TaskPriority {
    High = 'high',
    Medium = 'medium',
    Low = 'low',
    Urgent = 'urgent',
}

export type Theme = 'light' | 'dark' | 'system';

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
  startTime?: string;
  endTime?: string;
}

export interface DocumentVersion {
  modifiedAt: string;
  content: string;
}

export interface Document {
  id: string;
  title: string;
  author: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  documentNumber?: string;
  attachment?: Attachment;
  startTime?: string;
  endTime?: string;
  category?: string;
  tags?: string[];
  history?: DocumentVersion[];
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
  location?: string;
  participants?: string[];
}

export interface Report {
    id: string;
    title: string;
    content: string;
    generatedAt: string;
}

export interface AppState {
    tasks: Task[];
    documents: Document[];
    events: CalendarEvent[];
    reports: Report[];
    theme: Theme;
}


export interface AppContextType extends AppState {
  addTask: (task: Omit<Task, 'id' | 'status'>) => Task;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  
  addDocument: (doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => Document;
  updateDocument: (doc: Document) => void;
  deleteDocument: (docId: string) => void;
  
  addEvent: (event: Omit<CalendarEvent, 'id'>) => CalendarEvent;
  updateEvent: (event: CalendarEvent) => void;
  deleteEvent: (eventId: string) => void;

  addReport: (report: Omit<Report, 'id'>) => Report;
  deleteReport: (reportId: string) => void;
  
  setTheme: (theme: Theme) => void;
  loadStateFromFile: (newState: AppState) => void;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  photoURL?: string; // For Google sign-in
}

export interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  signInWithGoogle: () => Promise<void>;
}
