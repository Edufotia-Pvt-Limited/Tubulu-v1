import {ActionType, getType} from 'typesafe-actions';
import * as QTMActions from './qtm.actions';
import {IQTMState, defaultQTMState} from './qtm.state';

const {
  getAllTopicAsync,
  addNewTopicAsync,
  addNewTaskAsync,
  getTasksByTopicIdAsync,
  assignedMembersAsync,
  syncContactsAsync,
  getAllContactsAsync,
  addNewSubTaskAsync,
  getSubTasksByTaskIdAsync,
  getMembersByTaskIdAsync,
  getSubTasksByMemberIdAndTaskIdAsync,
  selectedTopicAsync,
  selectedTaskAsync,
  selectedMemberAsync,
  selectedSubTaskAsync,
  updateSubTaskStatusAsync,
  getTopicAttachmentsAsync,
  getTaskAttachmentsAsync,
  getSubTaskAttachmentsAsync,
  getAllTasksV2Async,
  getOwnerDetailsAsync,
  getTaskDetailsByTaskIdAsync,
  getSubTaskDetailsBySubTaskIdAsync,
  getAllUserTopicAsync,
  createUserTopicAsync,
  selectedUserTopicAsync,
  getTasksFromUserTopicAsync,
  getChatMessageAsync,
  sendChatMessageAsync,
  getChatMessageDetailsByIdAsync,
  addChatMessageToQueueAsync,
  clearChatMessageQueueAsync,
  getAllDERequestsAsync,
  requestDEAsync,
  resetQTMState,
  addNewSubTaskInQueueForTaskAsync,
  clearSubTaskQueueAsync,
  removeSubTaskInQueueForTaskAsync,
} = QTMActions;

type IQTMAction = ActionType<typeof QTMActions>;

export function qtmReducer(
  state: IQTMState = defaultQTMState,
  action: IQTMAction,
): IQTMState {
  switch (action.type) {
    case getType(getAllTopicAsync.request):
      return {
        ...state,
        topicsLoading: true,
      };
    case getType(getAllTopicAsync.success):
      return {
        ...state,
        topicsLoading: false,
        topics: action.payload,
      };
    case getType(getAllTopicAsync.failure):
      return {
        ...state,
        topicsLoading: false,
        topicsFailure: action.payload,
      };
    case getType(addNewTopicAsync.request):
      return {
        ...state,
        topicsLoading: true,
      };
    case getType(addNewTopicAsync.success):
      return {
        ...state,
        topicsLoading: false,
        topics: action.payload
          ? [...state.topics, action.payload]
          : [...state.topics],
      };
    case getType(addNewTopicAsync.failure):
      return {
        ...state,
        topicsLoading: false,
        topicsFailure: action.payload,
      };
    case getType(addNewTaskAsync.request):
      return {
        ...state,
        taskLoading: true,
      };
    case getType(addNewTaskAsync.success):
      return {
        ...state,
        taskLoading: false,
        tasks: action.payload
          ? [...state.tasks, action.payload]
          : [...state.tasks],
      };
    case getType(addNewTaskAsync.failure):
      return {
        ...state,
        taskLoading: false,
        taskFailure: action.payload,
      };
    case getType(getTasksByTopicIdAsync.request):
      return {
        ...state,
        taskLoading: true,
      };
    case getType(getTasksByTopicIdAsync.success):
      return {
        ...state,
        taskLoading: false,
        tasks: action.payload,
      };
    case getType(getTasksByTopicIdAsync.failure):
      return {
        ...state,
        taskLoading: false,
        taskFailure: action.payload,
      };
    case getType(assignedMembersAsync.request):
      return {
        ...state,
        assignedMembers: [],
      };
    case getType(assignedMembersAsync.success):
      return {
        ...state,
        assignedMembers: action.payload,
      };
    case getType(assignedMembersAsync.failure):
      return {
        ...state,
        assignedMembers: [],
      };
    case getType(syncContactsAsync.request):
      return {
        ...state,
        contactsLoading: true,
      };
    case getType(syncContactsAsync.success):
      return {
        ...state,
        contactsLoading: false,
      };
    case getType(syncContactsAsync.failure):
      return {
        ...state,
        contactsLoading: false,
        contactsFailure: action.payload,
      };
    case getType(getAllContactsAsync.request):
      return {
        ...state,
        contactsLoading: true,
      };
    case getType(getAllContactsAsync.success):
      return {
        ...state,
        contactsLoading: false,
        syncedContacts: action.payload,
      };
    case getType(getAllContactsAsync.failure):
      return {
        ...state,
        contactsLoading: false,
        contactsFailure: action.payload,
      };
    case getType(addNewSubTaskAsync.request):
      return {
        ...state,
        subTaskLoading: true,
      };
    case getType(addNewSubTaskAsync.success):
      return {
        ...state,
        subTaskLoading: false,
      };
    case getType(addNewSubTaskAsync.failure):
      return {
        ...state,
        subTaskLoading: false,
        subTaskFailure: action.payload,
      };
    case getType(getSubTasksByTaskIdAsync.request):
      return {
        ...state,
        subTaskLoading: true,
      };
    case getType(getSubTasksByTaskIdAsync.success):
      return {
        ...state,
        subTaskLoading: false,
        subTasksByTopicId: action.payload,
      };
    case getType(getSubTasksByTaskIdAsync.failure):
      return {
        ...state,
        subTaskLoading: false,
        subTaskFailure: action.payload,
      };
    case getType(getMembersByTaskIdAsync.request):
      return {
        ...state,
        selectedTaskMembersLoading: true,
      };
    case getType(getMembersByTaskIdAsync.success):
      return {
        ...state,
        selectedTaskMembersLoading: false,
        selectedTaskMembers: action.payload,
      };
    case getType(getMembersByTaskIdAsync.failure):
      return {
        ...state,
        selectedTaskMembersLoading: false,
        selectedTaskMembersFailure: action.payload,
      };
    case getType(getSubTasksByMemberIdAndTaskIdAsync.request):
      return {
        ...state,
        subTaskLoading: true,
      };
    case getType(getSubTasksByMemberIdAndTaskIdAsync.success):
      return {
        ...state,
        subTaskLoading: false,
        subTasks: action.payload,
      };
    case getType(getSubTasksByMemberIdAndTaskIdAsync.failure):
      return {
        ...state,
        subTaskLoading: false,
        subTaskFailure: action.payload,
      };
    case getType(selectedTopicAsync):
      return {
        ...state,
        selectedTopic: action.payload,
      };
    case getType(selectedTaskAsync):
      return {
        ...state,
        selectedTask: action.payload,
      };
    case getType(selectedMemberAsync):
      return {
        ...state,
        selectedMember: action.payload,
      };
    case getType(selectedSubTaskAsync):
      return {
        ...state,
        selectedSubTask: action.payload,
      };
    case getType(updateSubTaskStatusAsync):
      return {
        ...state,
      };
    case getType(getTopicAttachmentsAsync):
      return {
        ...state,
        topicAttachments: action.payload,
      };
    case getType(getTaskAttachmentsAsync):
      return {
        ...state,
        taskAttachments: action.payload,
      };
    case getType(getSubTaskAttachmentsAsync):
      return {
        ...state,
        subTaskAttachments: action.payload,
      };
    case getType(getAllTasksV2Async.request):
      return {
        ...state,
        taskLoading: true,
      };
    case getType(getAllTasksV2Async.success):
      return {
        ...state,
        taskLoading: false,
        tasks: action.payload,
      };
    case getType(getAllTasksV2Async.failure):
      return {
        ...state,
        taskLoading: false,
        taskFailure: action.payload,
      };
    case getType(getOwnerDetailsAsync):
      return {
        ...state,
        userDetails: action.payload,
      };
    case getType(getTaskDetailsByTaskIdAsync.request):
      return {
        ...state,
        taskLoading: true,
      };
    case getType(getTaskDetailsByTaskIdAsync.success):
      return {
        ...state,
        taskLoading: false,
        selectedTask: action.payload,
      };
    case getType(getTaskDetailsByTaskIdAsync.failure):
      return {
        ...state,
        taskLoading: false,
        taskFailure: action.payload,
      };
    case getType(getSubTaskDetailsBySubTaskIdAsync.request):
      return {
        ...state,
        subTaskLoading: true,
      };
    case getType(getSubTaskDetailsBySubTaskIdAsync.success):
      return {
        ...state,
        subTaskLoading: false,
        selectedSubTask: action.payload,
      };
    case getType(getSubTaskDetailsBySubTaskIdAsync.failure):
      return {
        ...state,
        subTaskLoading: false,
        subTaskFailure: action.payload,
      };
    case getType(getAllUserTopicAsync.request):
      return {
        ...state,
        topicsLoading: true,
      };
    case getType(getAllUserTopicAsync.success):
      return {
        ...state,
        topicsLoading: false,
        userTopics: action.payload,
      };
    case getType(getAllUserTopicAsync.failure):
      return {
        ...state,
        topicsLoading: false,
        topicsFailure: action.payload,
      };
    case getType(createUserTopicAsync.request):
      return {
        ...state,
        topicsLoading: true,
      };
    case getType(createUserTopicAsync.success):
      return {
        ...state,
        topicsLoading: false,
        userTopics: action.payload
          ? [...state.userTopics, action.payload]
          : [...state.userTopics],
      };
    case getType(createUserTopicAsync.failure):
      return {
        ...state,
        topicsLoading: false,
        topicsFailure: action.payload,
      };
    case getType(selectedUserTopicAsync):
      return {
        ...state,
        selectedUserTopic: action.payload,
      };
    case getType(getTasksFromUserTopicAsync.request):
      return {
        ...state,
        taskLoading: true,
      };
    case getType(getTasksFromUserTopicAsync.success):
      return {
        ...state,
        taskLoading: false,
        topicTasks: action.payload,
      };
    case getType(getTasksFromUserTopicAsync.failure):
      return {
        ...state,
        taskLoading: false,
        taskFailure: action.payload,
      };
    case getType(getChatMessageAsync.request):
      return {
        ...state,
        chatLoading: true,
      };
    case getType(getChatMessageAsync.success):
      return {
        ...state,
        chatLoading: false,
        chats: action.payload,
      };
    case getType(getChatMessageAsync.failure):
      return {
        ...state,
        chatLoading: false,
        chatFailure: action.payload,
      };
    case getType(sendChatMessageAsync.request):
      return {
        ...state,
        chatLoading: true,
      };
    case getType(sendChatMessageAsync.success):
      return {
        ...state,
        chatLoading: false,
      };
    case getType(sendChatMessageAsync.failure):
      return {
        ...state,
        chatLoading: false,
        chatFailure: action.payload,
      };
    case getType(getChatMessageDetailsByIdAsync.request):
      return {
        ...state,
        chatLoading: true,
      };
    case getType(getChatMessageDetailsByIdAsync.success):
      return {
        ...state,
        chatLoading: false,
        chats: action.payload
          ? [...state.chats, action.payload]
          : [...state.chats],
      };
    case getType(getChatMessageDetailsByIdAsync.failure):
      return {
        ...state,
        chatLoading: false,
        chatFailure: action.payload,
      };
    case getType(addChatMessageToQueueAsync):
      return {
        ...state,
        chatMessageQueue: action.payload,
        chats: action.payload
          ? [...state.chats, ...action.payload]
          : [...state.chats],
      };
    case getType(clearChatMessageQueueAsync):
      return {
        ...state,
        chatMessageQueue: [],
      };
    case getType(getAllDERequestsAsync.request):
      return {
        ...state,
        DERequestLoading: true,
      };
    case getType(getAllDERequestsAsync.success):
      return {
        ...state,
        DERequestLoading: false,
        allDERequests: action.payload,
      };
    case getType(getAllDERequestsAsync.failure):
      return {
        ...state,
        DERequestLoading: false,
        DERequestFailure: action.payload,
      };
    case getType(requestDEAsync.request):
      return {
        ...state,
        DERequestLoading: true,
      };
    case getType(requestDEAsync.success):
      return {
        ...state,
        DERequestLoading: false,
      };
    case getType(requestDEAsync.failure):
      return {
        ...state,
        DERequestLoading: false,
        DERequestFailure: action.payload,
      };
    case getType(resetQTMState):
      return defaultQTMState;
    case getType(addNewSubTaskInQueueForTaskAsync):
      return {
        ...state,
        draftedSubTasksForMember: state?.draftedSubTasksForMember?.length
          ? [...state?.draftedSubTasksForMember, action.payload]
          : [action.payload],
      };
    case getType(clearSubTaskQueueAsync):
      return {
        ...state,
        draftedSubTasksForMember: [],
      };
    case getType(removeSubTaskInQueueForTaskAsync):
      return {
        ...state,
        draftedSubTasksForMember: action.payload,
      };
    default:
      return state;
  }
}
