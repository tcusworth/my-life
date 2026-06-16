import type PocketBase from "pocketbase";

export type ProjectStatus = "active" | "archived";
export type GoalStatus = "active" | "completed" | "on_hold";
export type TaskStatus = "inbox" | "active" | "completed" | "cancelled" | "someday";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type ActivityType =
  | "call"
  | "email"
  | "meeting"
  | "message"
  | "note"
  | "follow_up";
export type CalendarSourceType = "eventkit" | "internal" | "google" | "microsoft";
export type OAuthProvider = "google" | "microsoft";
export type CalendarWriteOperation = "create" | "update" | "delete";
export type PendingWriteStatus = "pending" | "processing" | "completed" | "failed";
export type SyncDirection = "inbound" | "outbound";
export type SyncLogStatus = "success" | "error" | "partial";
export type DevicePlatform = "macos";

export interface BaseRecord {
  id: string;
  created: string;
  updated: string;
}

export interface User extends BaseRecord {
  email: string;
  name?: string;
  avatar?: string;
  timezone?: string;
  verified: boolean;
}

export interface Area extends BaseRecord {
  user: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  sortOrder?: number;
}

export interface Device extends BaseRecord {
  user: string;
  name: string;
  platform: DevicePlatform;
  agentVersion?: string;
  lastSeenAt?: string;
  apiKeyHash: string;
  isActive?: boolean;
}

export interface Project extends BaseRecord {
  user: string;
  area?: string;
  name: string;
  color?: string;
  icon?: string;
  status: ProjectStatus;
  sortOrder?: number;
  expand?: {
    area?: Area;
  };
}

export interface Goal extends BaseRecord {
  user: string;
  area?: string;
  title: string;
  description?: string;
  status: GoalStatus;
  targetDate?: string;
  progress?: number;
  sortOrder?: number;
  expand?: {
    area?: Area;
  };
}

export interface Contact extends BaseRecord {
  user: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  followUpAt?: string;
  lastContactedAt?: string;
}

export interface Activity extends BaseRecord {
  user: string;
  contact?: string;
  project?: string;
  goal?: string;
  type: ActivityType;
  title: string;
  notes?: string;
  occurredAt?: string;
  followUpAt?: string;
  expand?: {
    contact?: Contact;
  };
}

export interface DailyBriefing extends BaseRecord {
  user: string;
  briefingDate: string;
  summary: string;
  highlights?: Record<string, unknown>;
  sourceInboxText?: string;
  generatedAt?: string;
}

export interface Task extends BaseRecord {
  user: string;
  project?: string;
  contact?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  dueAt?: string;
  scheduledFor?: string;
  completedAt?: string;
  followUpAt?: string;
  sortOrder?: number;
  expand?: {
    project?: Project;
    contact?: Contact;
  };
}

export interface Note extends BaseRecord {
  user: string;
  project?: string;
  title: string;
  content?: string;
}

export interface CalendarSource extends BaseRecord {
  user: string;
  device?: string;
  externalId?: string;
  name: string;
  color?: string;
  isEnabled?: boolean;
  sourceType: CalendarSourceType;
}

export interface CalendarEvent extends BaseRecord {
  user: string;
  calendarSource: string;
  externalId?: string;
  title: string;
  description?: string;
  location?: string;
  startsAt: string;
  endsAt: string;
  isAllDay?: boolean;
  recurrenceRule?: string;
  lastSyncedAt?: string;
  deletedAt?: string;
}

export interface TimeBlock extends BaseRecord {
  user: string;
  task?: string;
  title: string;
  startsAt: string;
  endsAt: string;
  color?: string;
}

export interface PendingCalendarWrite extends BaseRecord {
  user: string;
  device?: string;
  operation: CalendarWriteOperation;
  payload: Record<string, unknown>;
  status: PendingWriteStatus;
  errorMessage?: string;
}

export interface SyncLog extends BaseRecord {
  user: string;
  device?: string;
  direction: SyncDirection;
  entityType: string;
  status: SyncLogStatus;
  message?: string;
  metadata?: Record<string, unknown>;
}

export interface OAuthConnection extends BaseRecord {
  user: string;
  provider: OAuthProvider;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  providerEmail: string;
  scopes: string;
}

export type CollectionRecords = {
  users: User;
  areas: Area;
  devices: Device;
  projects: Project;
  goals: Goal;
  contacts: Contact;
  activities: Activity;
  daily_briefings: DailyBriefing;
  tasks: Task;
  notes: Note;
  calendar_sources: CalendarSource;
  calendar_events: CalendarEvent;
  time_blocks: TimeBlock;
  pending_calendar_writes: PendingCalendarWrite;
  sync_logs: SyncLog;
  oauth_connections: OAuthConnection;
};

export type TypedPocketBase = PocketBase & {
  collection<K extends keyof CollectionRecords>(
    idOrName: K
  ): ReturnType<PocketBase["collection"]> & {
    getList(
      page?: number,
      perPage?: number,
      options?: object
    ): Promise<{
      page: number;
      perPage: number;
      totalItems: number;
      totalPages: number;
      items: CollectionRecords[K][];
    }>;
    getFullList(options?: object): Promise<CollectionRecords[K][]>;
    getOne(id: string, options?: object): Promise<CollectionRecords[K]>;
    create(
      bodyParams?: Partial<CollectionRecords[K]>,
      options?: object
    ): Promise<CollectionRecords[K]>;
    update(
      id: string,
      bodyParams?: Partial<CollectionRecords[K]>,
      options?: object
    ): Promise<CollectionRecords[K]>;
    delete(id: string, options?: object): Promise<boolean>;
  };
};

export interface InboxProcessingResult {
  tasksCreated: number;
  projectsCreated: number;
  contactsCreated: number;
  followUpsCreated: number;
  areasCreated: number;
}
