import { create } from 'zustand';

export type JobStatus = 'idle' | 'queued' | 'processing' | 'done' | 'error';
export type ViewType = 'list' | 'create' | 'output' | 'home' | 'groups' | 'toolkit' | 'library' | 'settings' | 'group-detail';

export interface Assignment {
  _id?: string;
  title: string;
  subject: string;
  className: string;
  dueDate: string;
  questionTypes: any[];
  additionalInfo?: string;
  fileText?: string;
  jobStatus?: string;
  generatedPaper?: any;
  createdAt?: string;
}

export interface Group {
    _id?: string;
    name: string;
    emoji: string;
    color: string;
    membersCount: number;
    assignmentsCount: number;
    members: string[];
    createdAt?: string;
}

interface AppState {
  view: ViewType;
  assignments: Assignment[];
  groups: Group[];
  selectedGroup: Group | null;
  currentAssignment: Assignment | null;
  generatedPaper: any;
  jobStatus: JobStatus;
  jobProgress: number;
  jobMessage: string;
  isSidebarOpen: boolean;
  setView: (view: ViewType) => void;
  setSidebarOpen: (open: boolean) => void;
  setAssignments: (assignments: Assignment[]) => void;
  setGroups: (groups: Group[]) => void;
  setSelectedGroup: (group: Group | null) => void;
  setCurrentAssignment: (assignment: Assignment | null) => void;
  setGeneratedPaper: (paper: any) => void;
  setJobInfo: (status: JobStatus, progress: number, message: string) => void;
}

export const useStore = create<AppState>((set) => ({
  view: 'home',
  assignments: [],
  groups: [],
  selectedGroup: null,
  currentAssignment: null,
  generatedPaper: null,
  jobStatus: 'idle',
  jobProgress: 0,
  jobMessage: '',
  isSidebarOpen: false,
  setView: (view) => set({ view, isSidebarOpen: false }),
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  setAssignments: (assignments) => set({ assignments }),
  setGroups: (groups) => set({ groups }),
  setSelectedGroup: (selectedGroup) => set({ selectedGroup }),
  setCurrentAssignment: (currentAssignment) => set({ currentAssignment }),
  setGeneratedPaper: (generatedPaper) => set({ generatedPaper }),
  setJobInfo: (jobStatus, jobProgress, jobMessage) => set({ jobStatus, jobProgress, jobMessage }),
}));
