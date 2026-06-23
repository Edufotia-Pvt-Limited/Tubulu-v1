export interface IQTMTopics {
  readonly id?: number;
  readonly name: string;
  readonly description: string;
  readonly logo: string;
  readonly attachements: number[];
  readonly dueSubTasks: number;
  readonly taskCount: number;
  readonly subTaskCount: number;
}

export interface IQTMUserTopics {
  readonly id?: number;
  readonly title: string;
  readonly logo: string;
  readonly userId?: number;
  readonly dueSubTasks?: number;
  readonly taskCount?: number;
}

export interface IQTMTasksv2 {
  readonly id?: number;
  readonly name: string;
  readonly topicId: number;
  readonly description: string;
  readonly attachements: number[];
  readonly createdAt?: string;
  readonly memberIds?: IQTMMemberId[];
  readonly userTasks?: IQTMMemberId[];
  readonly dueSubTasks?: number;
  readonly subTaskCount?: number;
  readonly owner: IQTMUser;
  readonly ownerId: number;
  readonly permissions: string[];
  readonly isPinned?: boolean;
  readonly wattages: {
    readonly cancelled: number;
    readonly completed: number;
    readonly inProgress: number;
  };
}

export interface IQTMMemberId {
  readonly userId: number;
  readonly role: 'MEMBER' | 'OBSERVER' | 'ADMIN' | 'OWNER';
  readonly taskId?: number;
  readonly user?: IQTMContacts;
}

export interface IQTMTasks {
  readonly id?: number;
  readonly task: string;
  readonly topic: string;
  readonly subTask?: number;
  readonly chartData?: QTMChartData[];
  readonly createdAt?: string;
}

export interface IQTMMembers {
  readonly id?: number;
  readonly role: string;
  readonly subTasks?: number;
  readonly overdue?: number;
  readonly chartData: QTMChartData[];
  readonly createdAt: string;
  readonly email: string;
  readonly firstName: string;
  readonly givenName: string;
  readonly lastName: string;
  readonly phoneNumber: string;
  readonly taskId: number;
  readonly updatedAt: string;
  readonly userFirstName: any;
  readonly permissions: string[];
  readonly userId: number;
  readonly userLastName: string;
  readonly userQTMId: number;
  readonly wattages: {
    readonly cancelled: number;
    readonly completed: number;
    readonly inProgress: number;
  };
  readonly subTaskCount: number;
  readonly dueSubTasks: number;
}

export interface QTMChartData {
  readonly name: string;
  readonly value: number;
  // yellow red green
  readonly color: '#FCC419' | '#E03131' | '#00BA07';
}

export interface IUploadFile {
  readonly fileName: string;
  readonly mimeType: string;
  readonly file: string;
}

export interface IUploadFileResponse {
  readonly createdAt: string;
  readonly deletedAt: any;
  readonly fileName: string;
  readonly id: number;
  readonly mimeType: string;
  readonly originalFileName: string;
  readonly updatedAt: string;
  readonly url: string;
  readonly userId: number;
}

export interface IQTMAssignedMember {
  readonly id?: number;
  readonly phoneNumber: string;
  readonly memberName: string;
}

export interface IQTMSubTasks {
  readonly createdAt: string;
  readonly deletedAt: string;
  readonly description: string;
  readonly endDate: string;
  readonly endTime: string;
  readonly id: number;
  readonly memberId: number;
  readonly name: string;
  readonly status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  readonly taskId: number;
  readonly updatedAt: string;
  readonly wattage: number;
  readonly rating?: number;
  readonly permissions: string[];
  readonly subTaskFeedbacks?: IQTMFeedback[];
}

export interface IQTMFeedback {
  readonly id: number;
  readonly rating: number;
  readonly description: string;
  readonly subTaskId: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface IQTMSubTasksRequest {
  readonly id?: number;
  readonly name: string;
  readonly description: string;
  readonly date: string;
  readonly wattage: number;
  readonly attachements: number[];
  readonly taskId: number;
  readonly assignedUserId: number;
  readonly endTime: string;
}

export interface IQTMContactsUploadType {
  readonly firstName: string;
  readonly lastName: string;
  readonly givenName: string;
  readonly phoneNumber: string;
  readonly email: string;
  readonly middleName?: string;
}

export interface IQTMContacts {
  readonly createdAt: string;
  readonly deletedAt: string;
  readonly email: string;
  readonly firstName: string;
  readonly givenName: string;
  readonly middleName?: string;
  readonly id: number;
  readonly lastName: string;
  readonly phoneNumber: string;
  readonly tubuluUserId: string;
  readonly tubuluUserUUID: string;
  readonly updatedAt: string;
  readonly userId: number;
  readonly qtmId: number;
  readonly role?: 'MEMBER' | 'OBSERVER' | 'ADMIN' | 'OWNER';
}

export interface IQTMSubTaskStatusUpdate {
  readonly status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  readonly description: string;
  readonly subTaskId: number;
  readonly rating?: number;
}

export interface IQTMAttachments {
  readonly createdAt: string;
  readonly deletedAt: string;
  readonly fileName: string;
  readonly id: number;
  readonly mimeType: string;
  readonly originalFileName: string;
  readonly topicId: number;
  readonly updatedAt: string;
  readonly url: string;
  readonly userAttachementId: number;
}

export interface IQTMUser {
  readonly createdAt: string;
  readonly deletedAt: any;
  readonly firstName: string;
  readonly id: number;
  readonly lastName: string;
  readonly phoneNumber: string;
  readonly tubuluUserId: string;
  readonly tubuluUserUUID: string;
  readonly updatedAt: string;
}

export interface IQTMChatMessageRequestBody {
  readonly message: string;
  readonly type: string;
  readonly payload: any;
  readonly ownerId?: number;
  readonly owner?: IQTMUser;
}

export interface IQTMGroupChat {
  readonly createdAt: string;
  readonly deletedAt: any;
  readonly id: number;
  readonly message: string;
  readonly owner: IQTMUser;
  readonly ownerId: number;
  readonly payload: any;
  readonly taskId: number;
  readonly type: string;
  readonly updatedAt: string;
}

export interface IQTMSubTaskDERequest {
  readonly subTaskId: number;
  readonly taskId: number;
  readonly extensionReason: string;
  readonly extensionDateTime: string;
  readonly previousDateTime: string;
}

export interface IQTMDERequest {
  readonly id: number;
  readonly extensionDateTime: string;
  readonly previousDateTime: string;
  readonly reason: string;
  readonly requesterId: number;
  readonly requester: IQTMUser;
  readonly subTaskId: number;
  readonly subTask: IQTMSubTasks;
  readonly taskId: number;
  readonly task: IQTMTasksv2;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: any;
}

export type ExtensionType = 'APPROVED' | 'REJECTED';

export interface IQTMUpdateDERequest {
  readonly subTaskExtensionId: number;
  readonly status: ExtensionType;
}

export type IQTMNotificationSubType =
  | 'TASK'
  | 'SUBTASK'
  | 'MEMBER'
  | 'EXTENSION';
