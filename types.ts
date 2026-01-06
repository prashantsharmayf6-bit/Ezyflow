
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  REVIEW = 'review',
  DONE = 'done'
}

export interface WorkflowTask {
  id: string;
  title: string;
  assignee: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'email' | 'tel';
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select type
}

export interface WorkflowModule {
  id: string;
  type: 'start' | 'end' | 'user_task' | 'approval' | 'integration' | 'notification';
  label: string;
  description: string;
  config?: {
    formFields?: FormField[];
    approvalOptions?: ('approve' | 'reject' | 'send_back')[];
    notificationType?: 'in_app' | 'push';
    instruction?: string;
    actionLabel?: string;
    assigneeId?: string; // New: Who is responsible for this node
  };
}

export interface LiveRequest {
  id: string;
  appId: string;
  data: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  currentModuleId: string; // New: Tracks current stage in the workflow
  createdAt: string;
  history: { moduleId: string; action: string; timestamp: string; actorId: string }[];
}

export interface WorkflowSetup {
  id: string;
  name: string;
  department: string;
  isPublished: boolean;
  requests: LiveRequest[];
  modules: WorkflowModule[];
  access: {
    owners: string[]; 
    managers: string[];
    members: string[];
  };
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  activeTasks: number;
}

export type ViewType = 'dashboard' | 'workflow' | 'administration' | 'applications';
