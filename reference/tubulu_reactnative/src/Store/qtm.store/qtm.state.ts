import {
  IQTMAttachments,
  IQTMChatMessageRequestBody,
  IQTMContacts,
  IQTMDERequest,
  IQTMGroupChat,
  IQTMMembers,
  IQTMSubTaskDERequest,
  IQTMSubTasks,
  IQTMSubTasksRequest,
  IQTMTasksv2,
  IQTMTopics,
  IQTMUser,
  IQTMUserTopics,
} from '../../models/IQTM';

export interface IQTMState {
  topics: IQTMTopics[];
  topicsLoading: boolean;
  topicsFailure?: string;
  addNewTopic?: IQTMTopics;
  taskLoading: boolean;
  taskFailure?: string;
  addNewTask?: IQTMTasksv2;
  tasks: IQTMTasksv2[];
  assignedMembers: IQTMContacts[];
  subTasksByTopicId: any[];
  contactsLoading: boolean;
  contactsFailure?: string;
  syncedContacts: IQTMContacts[];
  addNewSubTask?: IQTMSubTasksRequest;
  subTaskLoading: boolean;
  subTaskFailure?: string;
  subTasks: IQTMSubTasks[];
  selectedTaskMembers: IQTMMembers[];
  selectedTaskMembersLoading: boolean;
  selectedTaskMembersFailure?: string;
  // ATTACHMENTS
  topicAttachments: IQTMAttachments[];
  taskAttachments: IQTMAttachments[];
  subTaskAttachments: IQTMAttachments[];
  // SINGLE SELECTED OBJECTS - TOPIC, TASK, MEMBER, SUBTASK
  selectedTopic?: IQTMTopics;
  selectedTask?: IQTMTasksv2;
  selectedMember?: IQTMMembers;
  selectedSubTask?: IQTMSubTasks;
  // User state
  userDetails: IQTMUser;
  userTopics: IQTMUserTopics[];
  selectedUserTopic?: IQTMUserTopics;
  // User tasks
  topicTasks: IQTMTasksv2[];
  // Group Chats
  chatLoading: boolean;
  chats: IQTMGroupChat[];
  chatFailure?: string;
  chatMessageQueue: IQTMChatMessageRequestBody[];
  // Date Extension Request :
  allDERequests: IQTMDERequest[];
  DERequestLoading: boolean;
  DERequestFailure: string;

  newDERequest?: IQTMSubTaskDERequest;
  // Create Sub task for Member while creating Task :
  draftedSubTasksForMember: IQTMSubTasksRequest[];
}

export const defaultQTMState: IQTMState = {
  topics: [],
  topicsLoading: false,
  topicsFailure: '',
  addNewTopic: undefined,
  addNewTask: undefined,
  taskLoading: false,
  taskFailure: '',
  tasks: [],
  assignedMembers: [],
  subTasksByTopicId: [],
  syncedContacts: [],
  contactsLoading: false,
  contactsFailure: '',
  addNewSubTask: undefined,
  subTaskLoading: false,
  subTaskFailure: '',
  selectedTaskMembers: [],
  selectedTaskMembersLoading: false,
  selectedTaskMembersFailure: '',
  subTasks: [],
  topicAttachments: [],
  taskAttachments: [],
  subTaskAttachments: [],
  selectedTopic: undefined,
  selectedTask: undefined,
  selectedSubTask: undefined,
  selectedMember: undefined,
  userDetails: {} as IQTMUser,
  userTopics: [],
  selectedUserTopic: undefined,
  topicTasks: [],
  chats: [],
  chatLoading: false,
  chatFailure: undefined,
  chatMessageQueue: [],
  allDERequests: [],
  DERequestLoading: false,
  DERequestFailure: '',
  newDERequest: undefined,
  draftedSubTasksForMember: [],
};
