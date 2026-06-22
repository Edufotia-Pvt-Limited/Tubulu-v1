import {Dispatch} from 'redux';
import {createAction, createAsyncAction} from 'typesafe-actions';
import {requestContactPermission} from '../../Utils/Helper';
import {
  AddNewSubTask,
  AddNewTask,
  AddNewTopic,
  createUserTopic,
  fetchContacts,
  getAllDERequests,
  getAllTasksV2,
  getAllTopics,
  getChatsForTask,
  getMembersByTaskId,
  getQTMChatMessageDetailById,
  getQTMUserDetails,
  getSubTaskAttachments,
  getSubTaskDetailsBySubTaskId,
  getSubTasksByMemberIdAndTaskId,
  getSubTasksByTaskId,
  getTaskAttachments,
  getTaskDetailsByTaskId,
  getTasksByTopicId,
  getTasksFromTopic,
  getTopicAttachments,
  getUserContacts,
  getUserTopics,
  moveTaskToTopic,
  pinTaskToHome,
  registerQTMUser,
  removeQTMSubTaskBySubTaskId,
  removeQTMTaskByTaskId,
  removeTaskFromTopic,
  removeTaskMembersByTaskIdAndMemberId,
  removeTaskPin,
  removeUserTopic,
  requestDERequest,
  sendChatMessageForTask,
  syncContacts,
  updateDERequest,
  updateMemberRole,
  updateSubTaskDetails,
  updateSubTaskStatus,
  updateTaskDetails,
  updateUserTopic,
} from '../../Utils/QTM.ApiActions';
import {
  ExtensionType,
  IQTMAttachments,
  IQTMChatMessageRequestBody,
  IQTMContacts,
  IQTMContactsUploadType,
  IQTMDERequest,
  IQTMGroupChat,
  IQTMMembers,
  IQTMNotificationSubType,
  IQTMSubTaskDERequest,
  IQTMSubTaskStatusUpdate,
  IQTMSubTasks,
  IQTMSubTasksRequest,
  IQTMTasksv2,
  IQTMTopics,
  IQTMUpdateDERequest,
  IQTMUser,
  IQTMUserTopics,
} from '../../models/IQTM';
import {Store} from '../Store';

function getOwnerDetailsAction() {
  return async (dispatch: Dispatch) => {
    try {
      const response: any = await getQTMUserDetails();
      dispatch(getOwnerDetailsAsync(response));
    } catch (error) {
      console.log(error);
      console.log('Unable to get the User details at the moment');
    }
  };
}

const getOwnerDetailsAsync = createAction(
  'GET_LOGGED_USER_DETAILS',
)<IQTMUser>();

function getAllTopicsAction() {
  return async (dispatch: Dispatch) => {
    try {
      const response: any = await getAllTopics();
      if (response) {
        dispatch(getAllTopicAsync.success(response));
      } else {
        dispatch(
          getAllTopicAsync.failure('Unable to get all topics at the moment'),
        );
      }
    } catch (error) {
      console.log(error);
      dispatch(
        getAllTopicAsync.failure('Unable to get all topics at the moment'),
      );
    }
  };
}

const getAllTopicAsync = createAsyncAction(
  'QTM_GET_ALL_TOPICS',
  'QTM_GET_ALL_TOPICS_SUCCESS',
  'QTM_GET_ALL_TOPICS_FAILURE',
)<void, IQTMTopics[], string>();

function addNewTopicActions(topicData: IQTMTopics) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(addNewTopicAsync.request());
      const response: any = await AddNewTopic(topicData);
      if (response) {
        dispatch(addNewTopicAsync.success(response));
      } else {
        dispatch(
          addNewTopicAsync.failure(
            'Unable to create a new topic at the moment',
          ),
        );
      }
    } catch (error) {
      dispatch(
        addNewTopicAsync.failure('Unable to create a new topic at the moment'),
      );
    }
  };
}

const addNewTopicAsync = createAsyncAction(
  'QTM_CREATE_NEW_TOPIC',
  'QTM_CREATE_NEW_TOPIC_SUCCESS',
  'QTM_CREATE_NEW_TOPIC_FAILURE',
)<void, IQTMTopics, string>();

function getTasksByTopicIdAction(topicId: number) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(getTasksByTopicIdAsync.request());
      const response: any = await getTasksByTopicId(topicId);
      if (response) {
        dispatch(getTasksByTopicIdAsync.success(response));
      } else {
        dispatch(
          getTasksByTopicIdAsync.failure('Unable to get tasks at the moment'),
        );
      }
    } catch (error) {
      console.log(error);
      dispatch(
        getTasksByTopicIdAsync.failure('Unable to get tasks at the moment'),
      );
    }
  };
}

const getTasksByTopicIdAsync = createAsyncAction(
  'QTM_GET_TASKS_BY_TOPIC_ID',
  'QTM_GET_TASKS_BY_TOPIC_ID_SUCCESS',
  'QTM_GET_TASKS_BY_TOPIC_ID_FAILURE',
)<void, IQTMTasksv2[], string>();

function addNewTaskActions(taskData: IQTMTasksv2) {
  return async (dispatch: any) => {
    try {
      dispatch(addNewTaskAsync.request());
      const _allSubTasks = Store.getState().qtmState.draftedSubTasksForMember;
      const response: any = await AddNewTask(taskData);
      if (response?.id) {
        if (_allSubTasks?.length) {
          await dispatch(createSubTaskAfterCreatingTaskAction(response.id));
        }
        await dispatch(addNewTaskAsync.success(response));
        await dispatch(getMembersByTaskIdAction(response.id));
        await dispatch(getTaskDetailsByTaskIdAction(response.id));
      } else {
        dispatch(
          addNewTaskAsync.failure('Unable to create a new task at the moment'),
        );
      }
    } catch (error) {
      dispatch(
        addNewTaskAsync.failure('Unable to create a new task at the moment'),
      );
    }
  };
}

const addNewTaskAsync = createAsyncAction(
  'QTM_CREATE_NEW_TASK',
  'QTM_CREATE_NEW_TASK_SUCCESS',
  'QTM_CREATE_NEW_TASK_FAILURE',
)<void, IQTMTasksv2, string>();

function assignedMembersAction(members: IQTMContacts[]) {
  return async (dispatch: Dispatch) => {
    dispatch(assignedMembersAsync.request());
    try {
      dispatch(assignedMembersAsync.success(members));
    } catch (error) {
      console.log(error);
      dispatch(
        assignedMembersAsync.failure(
          'Unable to assign task to the members at the moment',
        ),
      );
    }
  };
}

const assignedMembersAsync = createAsyncAction(
  'QTM_ASSIGNED_MEMBERS',
  'QTM_ASSIGNED_MEMBERS_SUCCESS',
  'QTM_ASSIGNED_MEMBERS_FAILURE',
)<void, IQTMContacts[], string>();

function syncContactsAction() {
  return async (dispatch: Dispatch) => {
    const response = await requestContactPermission();
    if (response) {
      dispatch(syncContactsAsync.request());
      try {
        const contacts = await fetchContacts();
        if (contacts?.length) {
          let _contacts: IQTMContactsUploadType[] = [];
          contacts?.forEach(contact => {
            if (
              contact.givenName &&
              contact.familyName &&
              contact.phoneNumbers?.[0]?.number
            ) {
              _contacts.push({
                firstName: contact.givenName,
                lastName: contact.familyName,
                givenName: contact.givenName,
                phoneNumber: contact?.phoneNumbers?.[0]?.number?.replace(
                  /\s/g,
                  '',
                ),
                email: contact?.emailAddresses?.[0]?.email,
                middleName: contact?.middleName,
              });
            }
          });
          const length = _contacts.length;
          const numOfBatches = Math.ceil(length / 100);
          // let assumed length be 500, so batches are 5.
          // We will be sending 5 batches of 100 each.
          let batch: IQTMContactsUploadType[] = [];
          let chunk = 100;
          for (let index = 0; index < numOfBatches; index++) {
            batch = _contacts.slice(chunk * index, chunk * (index + 1));
            if (batch?.length) {
              await syncContacts(batch);
            }
          }
          dispatch(syncContactsAsync.success(_contacts));
        } else {
          dispatch(
            syncContactsAsync.failure(
              'Unable to sync the contacts at the moment',
            ),
          );
        }
      } catch (error) {
        console.log(error);
        dispatch(
          syncContactsAsync.failure(
            'Unable to sync the contacts at the moment',
          ),
        );
      }
    } else {
      console.log('Permission is not granted for contacts.');
    }
  };
}

const syncContactsAsync = createAsyncAction(
  'QTM_SYNC_CONTACTS',
  'QTM_SYNC_CONTACTS_SUCCESS',
  'QTM_SYNC_CONTACTS_FAILURE',
)<void, IQTMContactsUploadType[], string>();

function getAllContactsAction() {
  return async (dispatch: Dispatch) => {
    dispatch(getAllContactsAsync.request());
    try {
      const response = await getUserContacts();
      if (response) {
        dispatch(getAllContactsAsync.success(response));
      } else {
        dispatch(
          getAllContactsAsync.failure(
            'Unable to fetch the contacts at the moment',
          ),
        );
      }
    } catch (error) {
      console.log(error);
      dispatch(
        getAllContactsAsync.failure(
          'Unable to fetch the contacts at the moment',
        ),
      );
    }
  };
}

const getAllContactsAsync = createAsyncAction(
  'QTM_GET_USER_CONTACTS',
  'QTM_GET_USER_CONTACTS_SUCCESS',
  'QTM_GET_USER_CONTACTS_FAILURE',
)<void, IQTMContacts[], string>();

function addNewSubTaskAction(subTaskDetails: IQTMSubTasksRequest) {
  return async (disptach: Dispatch) => {
    disptach(addNewSubTaskAsync.request());
    try {
      const response = await AddNewSubTask(subTaskDetails);
      if (response) {
        disptach(addNewSubTaskAsync.success(response));
      } else {
        disptach(
          addNewSubTaskAsync.failure('Unable to add new subtask at the moment'),
        );
      }
    } catch (error) {
      disptach(
        addNewSubTaskAsync.failure('Unable to add new subtask at the moment'),
      );
    }
  };
}

const addNewSubTaskAsync = createAsyncAction(
  'QTM_NEW_SUBTASK',
  'QTM_NEW_SUBTASK_SUCCESS',
  'QTM_NEW_SUBTASK_FAILURE',
)<void, IQTMSubTasksRequest, string>();

function getSubTasksByTaskIdAction(taskId: number) {
  return async (disptach: Dispatch) => {
    disptach(getSubTasksByTaskIdAsync.request());
    try {
      const response = await getSubTasksByTaskId(taskId);
      if (response) {
        disptach(getSubTasksByTaskIdAsync.success(response));
      } else {
        disptach(
          getSubTasksByTaskIdAsync.failure(
            'Unable to get the subtasks at the moment',
          ),
        );
      }
    } catch (error) {
      disptach(
        getSubTasksByTaskIdAsync.failure(
          'Unable to get the subtasks for the member at the moment',
        ),
      );
    }
  };
}

const getSubTasksByTaskIdAsync = createAsyncAction(
  'QTM_GET_SUBTASKS_BY_TASK_ID',
  'QTM_GET_SUBTASKS_BY_TASK_ID_SUCCESS',
  'QTM_GET_SUBTASKS_BY_TASK_ID_FAILURE',
)<void, any, string>();

function getMembersByTaskIdAction(taskId: number) {
  return async (dispatch: Dispatch) => {
    dispatch(getMembersByTaskIdAsync.request());
    try {
      const response = await getMembersByTaskId(taskId);
      if (response) {
        dispatch(getMembersByTaskIdAsync.success(response));
      } else {
        dispatch(
          getMembersByTaskIdAsync.failure(
            'Unable to get the members at the moment',
          ),
        );
      }
    } catch (error) {
      dispatch(
        getMembersByTaskIdAsync.failure(
          'Unable to get the members at the moment',
        ),
      );
    }
  };
}

const getMembersByTaskIdAsync = createAsyncAction(
  'QTM_GET_MEMBERS_BY_TASK_ID',
  'QTM_GET_MEMBERS_BY_TASK_ID_SUCCESS',
  'QTM_GET_MEMBERS_BY_TASK_ID_FAILURE',
)<void, IQTMMembers[], string>();

function getSubTasksByMemberIdAndTaskIdAction(
  memberId: number,
  taskId: number,
) {
  return async (dispatch: Dispatch) => {
    dispatch(getSubTasksByMemberIdAndTaskIdAsync.request());
    try {
      const response = await getSubTasksByMemberIdAndTaskId(memberId, taskId);
      if (response) {
        dispatch(getSubTasksByMemberIdAndTaskIdAsync.success(response));
      } else {
        dispatch(
          getSubTasksByMemberIdAndTaskIdAsync.failure(
            'Unable to get the subtasks at the moment',
          ),
        );
      }
    } catch (error) {
      dispatch(
        getSubTasksByMemberIdAndTaskIdAsync.failure(
          'Unable to get the subtasks at the moment',
        ),
      );
    }
  };
}

const getSubTasksByMemberIdAndTaskIdAsync = createAsyncAction(
  'QTM_GET_SUBTASKS_BY_MEMBER_ID',
  'QTM_GET_SUBTASKS_BY_MEMBER_ID_SUCCESS',
  'QTM_GET_SUBTASKS_BY_MEMBER_ID_FAILURE',
)<void, IQTMSubTasks[], string>();

function selectedTopicAction(topic: IQTMTopics) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(selectedTopicAsync(topic));
    } catch (error) {
      console.log(error);
      console.log('Unable to get the topic at the moment');
    }
  };
}

const selectedTopicAsync = createAction('QTM_SELECTED_TOPIC')<IQTMTopics>();

function selectedUserTopicAction(topic: IQTMUserTopics) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(selectedUserTopicAsync(topic));
    } catch (error) {
      console.log(error);
      console.log('Unable to get the topic at the moment');
    }
  };
}

const selectedUserTopicAsync = createAction(
  'QTM_SELECTED_USER_TOPIC',
)<IQTMUserTopics>();

function selectedTaskAction(task: IQTMTasksv2) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(selectedTaskAsync(task));
    } catch (error) {
      console.log(error);
      console.log('Unable to get the task at the moment');
    }
  };
}

const selectedTaskAsync = createAction('QTM_SELECTED_TASK')<IQTMTasksv2>();

function selectedMemberAction(member: IQTMMembers) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(selectedMemberAsync(member));
    } catch (error) {
      console.log(error);
      console.log('Unable to get the member at the moment');
    }
  };
}

const selectedMemberAsync = createAction('QTM_SELECTED_MEMBER')<IQTMMembers>();

function selectedSubTaskAction(subTask: IQTMSubTasks) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(selectedSubTaskAsync(subTask));
    } catch (error) {
      console.log(error);
      console.log('Unable to get the subtask at the moment');
    }
  };
}

const selectedSubTaskAsync = createAction(
  'QTM_SELECTED_SUBTASK',
)<IQTMSubTasks>();

function updateSubTaskStatusAction(statusData: IQTMSubTaskStatusUpdate) {
  return async (disptach: Dispatch) => {
    try {
      const response = await updateSubTaskStatus(statusData);
      if (response) {
        disptach(updateSubTaskStatusAsync(response));
      } else {
        console.log('Unable to update the sub task status');
      }
    } catch (error) {
      console.log(error);
    }
  };
}

const updateSubTaskStatusAsync = createAction(
  'QTM_SUBTASK_UPDATE_STATUS',
)<IQTMSubTaskStatusUpdate>();

function getTopicAttachmentsAction(topicId: number) {
  return async (disptach: Dispatch) => {
    try {
      const response = await getTopicAttachments(topicId);
      if (response) {
        disptach(getTopicAttachmentsAsync(response));
      } else {
        console.log('Unable to get the topic attachments');
      }
    } catch (error) {
      console.log(error);
    }
  };
}

const getTopicAttachmentsAsync = createAction('QTM_TOPIC_ATTACHMENTS')<
  IQTMAttachments[]
>();

function getTaskAttachmentsAction(taskId: number) {
  return async (disptach: Dispatch) => {
    try {
      const response = await getTaskAttachments(taskId);
      if (response) {
        disptach(getTaskAttachmentsAsync(response));
      } else {
        console.log('Unable to get the topic attachments');
      }
    } catch (error) {
      console.log(error);
    }
  };
}

const getTaskAttachmentsAsync = createAction('QTM_TASK_ATTACHMENTS')<
  IQTMAttachments[]
>();

function getSubTaskAttachmentsAction(subTaskId: number) {
  return async (disptach: Dispatch) => {
    try {
      const response = await getSubTaskAttachments(subTaskId);
      if (response) {
        disptach(getSubTaskAttachmentsAsync(response));
      } else {
        console.log('Unable to get the topic attachments');
      }
    } catch (error) {
      console.log(error);
    }
  };
}

const getSubTaskAttachmentsAsync = createAction('QTM_SUBTASK_ATTACHMENTS')<
  IQTMAttachments[]
>();

function getAllTasksV2Action() {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(getAllTasksV2Async.request());
      const response: any = await getAllTasksV2();
      if (response) {
        dispatch(getAllTasksV2Async.success(response));
      } else {
        dispatch(
          getAllTasksV2Async.failure('Unable to get tasks at the moment'),
        );
      }
    } catch (error) {
      console.log(error);
      dispatch(getAllTasksV2Async.failure('Unable to get tasks at the moment'));
    }
  };
}

const getAllTasksV2Async = createAsyncAction(
  'QTM_GET_TASKS',
  'QTM_GET_TASKS_SUCCESS',
  'QTM_GET_TASKS_FAILURE',
)<void, IQTMTasksv2[], string>();

function refreshAllAction() {
  return async (dispatch: any) => {
    try {
      const taskId = Store.getState().qtmState.selectedTask?.id;
      const memberId = Store.getState().qtmState.selectedMember?.userQTMId;
      const subTaskId = Store.getState().qtmState.selectedSubTask?.id;
      if (taskId && memberId) {
        await dispatch(getAllTasksV2Action());
        await dispatch(getMembersByTaskIdAction(taskId));
        await dispatch(getSubTasksByMemberIdAndTaskIdAction(memberId, taskId));
        await dispatch(getTaskDetailsByTaskIdAction(taskId));
        subTaskId &&
          (await dispatch(getSubTaskDetailsBySubTaskIdAction(subTaskId)));
      }
    } catch (error) {
      console.log(error);
    }
  };
}

function removeQTMTaskByTaskIdAction(taskId: number) {
  return async (dispatch: any) => {
    try {
      const response: any = await removeQTMTaskByTaskId(taskId);
      if (response) {
        dispatch(removeQTMTaskByTaskIdAsync(response));
        dispatch(getAllTasksV2Action());
      }
    } catch (error) {
      console.log(error);
    }
  };
}

const removeQTMTaskByTaskIdAsync = createAction(
  'DELETE_TASK_BY_TASK_ID',
)<any>();

function removeQTMSubTaskBySubTaskIdAction(subTaskId: number) {
  return async (dispatch: any) => {
    try {
      const response: any = await removeQTMSubTaskBySubTaskId(subTaskId);
      if (response) {
        dispatch(removeQTMSubTaskBySubTaskIdAsync(response));
        dispatch(refreshAllAction());
      }
    } catch (error) {
      console.log(error);
    }
  };
}

const removeQTMSubTaskBySubTaskIdAsync = createAction(
  'DELETE_SUBTASK_BY_SUBTASK_ID',
)<any>();

function getTaskDetailsByTaskIdAction(taskId: number) {
  return async (dispatch: Dispatch) => {
    dispatch(getTaskDetailsByTaskIdAsync.request());
    try {
      const response: any = await getTaskDetailsByTaskId(taskId);
      if (response) {
        dispatch(getTaskDetailsByTaskIdAsync.success(response));
      } else {
        dispatch(
          getTaskDetailsByTaskIdAsync.failure(
            'Unable to get the task details at the moment',
          ),
        );
      }
    } catch (error) {
      dispatch(
        getTaskDetailsByTaskIdAsync.failure(
          'Unable to get the task details at the moment',
        ),
      );
    }
  };
}

const getTaskDetailsByTaskIdAsync = createAsyncAction(
  'GET_TASK_DETAILS_BY_TASK_ID',
  'GET_TASK_DETAILS_BY_TASK_ID_SUCCESS',
  'GET_TASK_DETAILS_BY_TASK_ID_FAILURE',
)<void, any, string>();

function getSubTaskDetailsBySubTaskIdAction(subTaskId: number) {
  return async (dispatch: Dispatch) => {
    dispatch(getSubTaskDetailsBySubTaskIdAsync.request());
    try {
      const response: any = await getSubTaskDetailsBySubTaskId(subTaskId);
      if (response) {
        dispatch(getSubTaskDetailsBySubTaskIdAsync.success(response));
      } else {
        dispatch(
          getSubTaskDetailsBySubTaskIdAsync.failure(
            'Unable to get the subtask details at the moment',
          ),
        );
      }
    } catch (error) {
      dispatch(
        getSubTaskDetailsBySubTaskIdAsync.failure(
          'Unable to get the subtask details at the moment',
        ),
      );
    }
  };
}

const getSubTaskDetailsBySubTaskIdAsync = createAsyncAction(
  'GET_SUBTASK_DETAILS_BY_TASK_ID',
  'GET_SUBTASK_DETAILS_BY_TASK_ID_SUCCESS',
  'GET_SUBTASK_DETAILS_BY_TASK_ID_FAILURE',
)<void, any, string>();

function updateSubTaskDetailsAction(
  subTaskId: number,
  subtask: IQTMSubTasksRequest,
) {
  return async (disptach: Dispatch) => {
    try {
      const response: any = await updateSubTaskDetails(subTaskId, subtask);
      if (response) {
        disptach(updateSubTaskDetailsAsync(response));
      }
    } catch (error) {
      console.log(error);
    }
  };
}

const updateSubTaskDetailsAsync = createAction(
  'UPDATE_SUBTASK_DETAILS_BY_ID',
)<IQTMSubTasksRequest>();

function updateTaskDetailsAction(taskId: number, task: IQTMTasksv2) {
  return async (disptach: Dispatch) => {
    try {
      const response: any = await updateTaskDetails(taskId, task);
      if (response) {
        disptach(updateTaskDetailsAsync(response));
      }
    } catch (error) {
      console.log(error);
    }
  };
}

const updateTaskDetailsAsync = createAction(
  'UPDATE_TASK_DETAILS_BY_ID',
)<IQTMTasksv2>();

function removeTaskMembersByTaskIdAndMemberIdAction(
  taskId: number,
  memberId: number,
) {
  return async (dispatch: any) => {
    try {
      const response: any = await removeTaskMembersByTaskIdAndMemberId(
        taskId,
        memberId,
      );
      if (response) {
        dispatch(removeTaskMembersByTaskIdAndMemberIdAsync(response));
        dispatch(getMembersByTaskIdAction(taskId));
      }
    } catch (error) {
      console.log(error);
    }
  };
}

const removeTaskMembersByTaskIdAndMemberIdAsync = createAction(
  'REMOVE_TASK_MEMBERS_BY_TASK_ID_AND_MEMBER_ID',
)<any>();

function updateMemberRoleAction(
  taskId: number,
  memberId: number,
  role: string,
) {
  return async (disptach: any) => {
    try {
      const response: any = await updateMemberRole(taskId, memberId, role);
      if (response) {
        disptach(updateMemberRoleAsync(response));
        disptach(getMembersByTaskIdAction(taskId));
      }
    } catch (error) {
      console.log(error);
    }
  };
}

const updateMemberRoleAsync = createAction('UPDATE_MEMBER_ROLE_BY_ID')<any>();

function pinTaskAction(taskId: number) {
  return async (dispatch: Dispatch) => {
    try {
      const response: any = await pinTaskToHome(taskId);
      if (response) {
        dispatch(pinTaskAsync(response));
      }
    } catch (error) {
      console.log(error);
    }
  };
}
const pinTaskAsync = createAction('PIN_TASK_TO_HOME')<any>();

function removeTaskPinAction(taskId: number) {
  return async (dispatch: Dispatch) => {
    try {
      const response: any = await removeTaskPin(taskId);
      if (response) {
        dispatch(removeTaskPinAsync(response));
      }
    } catch (error) {
      console.log(error);
    }
  };
}
const removeTaskPinAsync = createAction('REMOVE_TASK_PIN')<any>();

function registerQTMUserAction() {
  return async (dispatch: Dispatch) => {
    try {
      const response: any = await registerQTMUser();
      if (response) {
        dispatch(registerQTMUserAsync(response));
      }
    } catch (error) {
      console.log(error);
    }
  };
}

const registerQTMUserAsync = createAction('REGISTER_QTM_USER')<any>();

function createUserTopicAction(topic: IQTMUserTopics) {
  return async (dispatch: Dispatch) => {
    dispatch(createUserTopicAsync.request());
    try {
      const response = await createUserTopic(topic);
      if (response) {
        dispatch(createUserTopicAsync.success(response));
      } else {
        dispatch(
          createUserTopicAsync.failure(
            'Unable to create new topic at the moment',
          ),
        );
      }
    } catch (error) {
      dispatch(
        createUserTopicAsync.failure(
          'Unable to create new topic at the moment',
        ),
      );
    }
  };
}

const createUserTopicAsync = createAsyncAction(
  'CREATE_USER_TOPIC',
  'CREATE_USER_TOPIC_SUCCESS',
  'CREATE_USER_TOPIC_FAILURE',
)<void, IQTMUserTopics, string>();

function getAllUserTopicsAction() {
  return async (dispatch: Dispatch) => {
    dispatch(getAllUserTopicAsync.request());
    try {
      const response = await getUserTopics();
      if (response) {
        dispatch(getAllUserTopicAsync.success(response));
      } else {
        dispatch(
          getAllUserTopicAsync.failure(
            'Unable to get all topics at the moment',
          ),
        );
      }
    } catch (error) {
      console.log(error);
      dispatch(
        getAllUserTopicAsync.failure('Unable to get all topics at the moment'),
      );
    }
  };
}

const getAllUserTopicAsync = createAsyncAction(
  'QTM_GET_ALL_USER_TOPICS',
  'QTM_GET_ALL_USER_TOPICS_SUCCESS',
  'QTM_GET_ALL_USER_TOPICS_FAILURE',
)<void, IQTMUserTopics[], string>();

function updateUserTopicAction(topic: IQTMUserTopics) {
  return async (dispatch: Dispatch) => {
    try {
      const topicId = topic?.id;
      if (topicId) {
        const response = await updateUserTopic(topic, topicId);
        dispatch(updateUserTopicAsync(response));
      }
    } catch (error) {
      console.log(error);
    }
  };
}

const updateUserTopicAsync =
  createAction('UPDATE_USER_TOPIC')<IQTMUserTopics>();

function removeUserTopicAction(userTopicId: number) {
  return async (dispatch: any) => {
    try {
      const response = await removeUserTopic(userTopicId);
      await dispatch(removeUserTopicAsync(response));
      await dispatch(getAllUserTopicsAction());
    } catch (error) {
      console.log(error);
    }
  };
}

const removeUserTopicAsync =
  createAction('REMOVE_USER_TOPIC')<IQTMUserTopics>();

function moveTaskToTopicAction(userTopicId: number, taskId: number) {
  return async (dispatch: any) => {
    try {
      const response = await moveTaskToTopic(userTopicId, taskId);
      await dispatch(moveTaskToTopicAsync(response));
      await dispatch(getAllUserTopicsAction());
    } catch (error) {
      console.log(error);
    }
  };
}

const moveTaskToTopicAsync =
  createAction('MOVE_TASK_TO_TOPIC')<IQTMUserTopics>();

function removeTaskFromTopicAction(userTopicId: number, taskId: number) {
  return async (dispatch: any) => {
    try {
      const response = await removeTaskFromTopic(userTopicId, taskId);
      if (response) {
        dispatch(removeTaskFromTopicAsync(response));
        await dispatch(getTasksFromUserTopicAction(userTopicId));
        await dispatch(getAllUserTopicsAction());
      }
    } catch (error) {
      console.log(error);
    }
  };
}

const removeTaskFromTopicAsync = createAction(
  'REMOVE_TASK_FROM_TOPIC',
)<IQTMUserTopics>();

function addNewTaskToTopicAction(taskData: IQTMTasksv2) {
  return async (dispatch: any) => {
    try {
      const response: IQTMTasksv2 = await AddNewTask(taskData);
      const topicId = Store.getState().qtmState.selectedUserTopic?.id;
      if (response?.id && topicId) {
        await dispatch(moveTaskToTopicAction(topicId, response?.id));
        await dispatch(getAllTasksV2Action());
        await dispatch(getTasksFromUserTopicAction(topicId));
      }
    } catch (error) {
      console.log('Unable to add new task at the moment');
    }
  };
}

function getTasksFromUserTopicAction(userTopicId: number) {
  return async (dispatch: Dispatch) => {
    dispatch(getTasksFromUserTopicAsync.request());
    try {
      const response = await getTasksFromTopic(userTopicId);
      if (response) {
        dispatch(getTasksFromUserTopicAsync.success(response));
      } else {
        dispatch(
          getTasksFromUserTopicAsync.failure(
            'Unable to get all tasks at the moment',
          ),
        );
      }
    } catch (error) {
      dispatch(
        getTasksFromUserTopicAsync.failure(
          'Unable to get all tasks at the moment',
        ),
      );
    }
  };
}

const getTasksFromUserTopicAsync = createAsyncAction(
  'QTM_GET_TASKS_FOR_USER_TOPICS',
  'QTM_GET_TASKS_FOR_USER_TOPICS_SUCCESS',
  'QTM_GET_TASKS_FOR_USER_TOPICS_FAILURE',
)<void, IQTMTasksv2[], string>();

// GROUP CHAT :

function sendChatMessageAction(
  chatMessage: IQTMChatMessageRequestBody,
  taskId: number,
) {
  return async (dispatch: any) => {
    dispatch(sendChatMessageAsync.request());
    try {
      const response = await sendChatMessageForTask(chatMessage, taskId);
      if (response) {
        dispatch(sendChatMessageAsync.success(response));
        if (chatMessage?.message === 'MEDIA') {
          if (response.id) {
            await dispatch(getChatMessageDetailsByIdAction(response.id));
          }
        }
      } else {
        dispatch(
          sendChatMessageAsync.failure(
            'Unable to send chat message at the moment',
          ),
        );
      }
    } catch (error) {
      dispatch(
        sendChatMessageAsync.failure(
          'Unable to send chat message at the moment',
        ),
      );
    }
  };
}

const sendChatMessageAsync = createAsyncAction(
  'QTM_SEND_CHAT_MESSAGE',
  'QTM_SEND_CHAT_MESSAGE_SUCCESS',
  'QTM_SEND_CHAT_MESSAGE_FAILURE',
)<void, IQTMGroupChat, string>();

function getChatMessageAction(taskId: number) {
  return async (dispatch: Dispatch) => {
    dispatch(getChatMessageAsync.request());
    try {
      const response = await getChatsForTask(taskId);
      if (response) {
        dispatch(getChatMessageAsync.success(response));
      } else {
        dispatch(
          getChatMessageAsync.failure(
            'Unable to get chat message at the moment',
          ),
        );
      }
    } catch (error) {
      dispatch(
        getChatMessageAsync.failure('Unable to get chat message at the moment'),
      );
    }
  };
}

const getChatMessageAsync = createAsyncAction(
  'QTM_GET_CHAT_MESSAGE',
  'QTM_GET_CHAT_MESSAGE_SUCCESS',
  'QTM_GET_CHAT_MESSAGE_FAILURE',
)<void, IQTMGroupChat[], string>();

function getChatMessageDetailsByIdAction(messageId: number) {
  return async (dispatch: Dispatch) => {
    dispatch(getChatMessageDetailsByIdAsync.request());
    try {
      const response = await getQTMChatMessageDetailById(messageId);
      if (response) {
        const isPresent = Store.getState().qtmState?.chats?.filter(
          chat => chat.id === response.id,
        );
        isPresent.length === 0 &&
          dispatch(getChatMessageDetailsByIdAsync.success(response));
      } else {
        dispatch(
          getChatMessageDetailsByIdAsync.failure(
            'Unable to get chat message at the moment',
          ),
        );
      }
    } catch (error) {
      dispatch(
        getChatMessageAsync.failure('Unable to get chat message at the moment'),
      );
    }
  };
}

const getChatMessageDetailsByIdAsync = createAsyncAction(
  'QTM_GET_CHAT_MESSAGE_DETAILS',
  'QTM_GET_CHAT_MESSAGE_DETAILS_SUCCESS',
  'QTM_GET_CHAT_MESSAGE_DETAILS_FAILURE',
)<void, IQTMGroupChat, string>();

function addChatMessageToQueueAction(queue: IQTMChatMessageRequestBody[]) {
  return async (dispatch: Dispatch) => {
    dispatch(addChatMessageToQueueAsync(queue));
    try {
    } catch (error) {
      console.log(error);
    }
  };
}

const addChatMessageToQueueAsync = createAction(
  'ADD_QTM_CHAT_MESSAGE_TO_QUEUE',
)<any[]>();

function clearChatMessageQueueAction(chatMessage: IQTMChatMessageRequestBody) {
  return async (dispatch: Dispatch) => {
    try {
      const queue = Store.getState().qtmState.chatMessageQueue;
      const _index = queue.findIndex(message => message == chatMessage);
      const newQueue = queue.filter((message, index) => index == _index);
      dispatch(clearChatMessageQueueAsync(newQueue));
    } catch (error) {
      console.log('Unable to clear the queue at the moment');
    }
  };
}

const clearChatMessageQueueAsync = createAction(
  'CLEAR_QTM_CHAT_MESSAGE_TO_QUEUE',
)<IQTMChatMessageRequestBody[]>();

// DATE EXTENSION REQUEST :

function getAllDERequestsAction() {
  return async (dispatch: Dispatch) => {
    dispatch(getAllDERequestsAsync.request());
    try {
      const response = await getAllDERequests();
      if (response) {
        dispatch(getAllDERequestsAsync.success(response));
      } else {
        dispatch(
          getAllDERequestsAsync.failure(
            'Unable to get the date extension requests at the moment',
          ),
        );
      }
    } catch (error) {
      dispatch(
        getAllDERequestsAsync.failure(
          'Unable to get the date extension requests at the moment',
        ),
      );
    }
  };
}

const getAllDERequestsAsync = createAsyncAction(
  'GET_ALL_DATE_EXTENSION_REQUESTS',
  'GET_ALL_DATE_EXTENSION_REQUESTS_SUCCESS',
  'GET_ALL_DATE_EXTENSION_REQUESTS_FAILURE',
)<void, IQTMDERequest[], string>();

function requestDEAction(requestData: IQTMSubTaskDERequest) {
  return async (dispatch: Dispatch) => {
    dispatch(requestDEAsync.request());
    try {
      const response = await requestDERequest(requestData);
      if (response) {
        dispatch(requestDEAsync.success(response));
      } else {
        dispatch(
          requestDEAsync.failure(
            'Unable to create date extension requests at the moment',
          ),
        );
      }
    } catch (error) {
      dispatch(
        requestDEAsync.failure(
          'Unable to create date extension requests at the moment',
        ),
      );
    }
  };
}

const requestDEAsync = createAsyncAction(
  'REQUEST_DATE_EXTENSION',
  'REQUEST_DATE_EXTENSION_SUCCESS',
  'REQUEST_DATE_EXTENSION_FAILURE',
)<void, IQTMSubTaskDERequest, string>();

function updateDEAction(selectedId: number, type: ExtensionType) {
  return async (disptach: any) => {
    try {
      const request: IQTMUpdateDERequest = {
        subTaskExtensionId: selectedId,
        status: type,
      };
      const response = await updateDERequest(request);
      if (response) {
        disptach(updateDEAsync(response));
        disptach(getAllDERequestsAction());
      } else {
        console.log(
          'Unable to approve the date extension request at the moment',
        );
      }
    } catch (error) {
      console.log(
        'Unable to approve the date extension request at the moment',
        error,
      );
    }
  };
}

const updateDEAsync = createAction('APPROVE_DATE_EXTENSION')<any>();

// REAL TIME SYNCING :

function UpdateQTMByFCMTokenAction(
  subType: IQTMNotificationSubType,
  taskId: number,
) {
  return async (dispatch: any) => {
    try {
      const memberId = Store.getState().qtmState.selectedMember?.userQTMId;
      const subTaskId = Store.getState().qtmState.selectedSubTask?.id;
      switch (subType) {
        case 'TASK':
          await dispatch(getAllTasksV2Action());
          break;
        case 'SUBTASK':
          await dispatch(getAllTasksV2Action());
          await dispatch(getAllDERequestsAction());
          await dispatch(getTaskDetailsByTaskIdAction(taskId));
          await dispatch(getMembersByTaskIdAction(taskId));
          memberId &&
            (await dispatch(
              getSubTasksByMemberIdAndTaskIdAction(memberId, taskId),
            ));
          subTaskId &&
            (await dispatch(getSubTaskDetailsBySubTaskIdAction(subTaskId)));
          break;
        case 'MEMBER':
          await dispatch(getAllTasksV2Action());
          await dispatch(getAllDERequestsAction());
          await dispatch(getTaskDetailsByTaskIdAction(taskId));
          await dispatch(getMembersByTaskIdAction(taskId));
          break;
        case 'EXTENSION':
          break;
        default:
          break;
      }
    } catch (error) {
      console.log('Unable to update the QTM state at the moment', error);
    }
  };
}

// CLEAR THE QTM STATE :

const resetQTMState = createAction('RESET_QTM_STATE')<void>();

// CREATE SUBTASK FOR MEMBER WHILE CREATING TASK :

function addNewSubTaskInQueueForTaskAction(subTask: IQTMSubTasksRequest) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(addNewSubTaskInQueueForTaskAsync(subTask));
    } catch (error) {
      console.log('Unable to add subtasks for member to queue', error);
    }
  };
}

const addNewSubTaskInQueueForTaskAsync = createAction(
  'ADD_SUBTASK_TO_QUEUE_FOR_TASK',
)<IQTMSubTasksRequest>();

const removeSubTaskInQueueForTaskAsync = createAction(
  'REMOVE_SUBTASK_TO_QUEUE_FOR_TASK',
)<IQTMSubTasksRequest[]>();

const clearSubTaskQueueAsync = createAction(
  'CLEAR_SUBTASK_QUEUE_FOR_TASK',
)<void>();

function createSubTaskAfterCreatingTaskAction(taskId: number) {
  return async (dispatch: any) => {
    try {
      const _allSubTasks = Store.getState().qtmState?.draftedSubTasksForMember;
      _allSubTasks?.forEach(async cItem => {
        let _subTask: IQTMSubTasksRequest = {
          ...cItem,
          taskId: taskId,
        };
        await dispatch(addNewSubTaskAction(_subTask));
      });
      dispatch(clearSubTaskQueueAsync());
    } catch (error) {
      console.log('Unable to create subtasks for member at the moment', error);
    }
  };
}

export {
  UpdateQTMByFCMTokenAction,
  addChatMessageToQueueAction,
  addChatMessageToQueueAsync,
  addNewSubTaskAction,
  addNewSubTaskAsync,
  addNewSubTaskInQueueForTaskAction,
  addNewSubTaskInQueueForTaskAsync,
  addNewTaskActions,
  addNewTaskAsync,
  addNewTaskToTopicAction,
  addNewTopicActions,
  addNewTopicAsync,
  assignedMembersAction,
  assignedMembersAsync,
  clearChatMessageQueueAction,
  clearChatMessageQueueAsync,
  clearSubTaskQueueAsync,
  createSubTaskAfterCreatingTaskAction,
  createUserTopicAction,
  createUserTopicAsync,
  getAllContactsAction,
  getAllContactsAsync,
  getAllDERequestsAction,
  getAllDERequestsAsync,
  getAllTasksV2Action,
  getAllTasksV2Async,
  getAllTopicAsync,
  getAllTopicsAction,
  getAllUserTopicAsync,
  getAllUserTopicsAction,
  getChatMessageAction,
  getChatMessageAsync,
  getChatMessageDetailsByIdAction,
  getChatMessageDetailsByIdAsync,
  getMembersByTaskIdAction,
  getMembersByTaskIdAsync,
  getOwnerDetailsAction,
  getOwnerDetailsAsync,
  getSubTaskAttachmentsAction,
  getSubTaskAttachmentsAsync,
  getSubTaskDetailsBySubTaskIdAction,
  getSubTaskDetailsBySubTaskIdAsync,
  getSubTasksByMemberIdAndTaskIdAction,
  getSubTasksByMemberIdAndTaskIdAsync,
  getSubTasksByTaskIdAction,
  getSubTasksByTaskIdAsync,
  getTaskAttachmentsAction,
  getTaskAttachmentsAsync,
  getTaskDetailsByTaskIdAction,
  getTaskDetailsByTaskIdAsync,
  getTasksByTopicIdAction,
  getTasksByTopicIdAsync,
  getTasksFromUserTopicAction,
  getTasksFromUserTopicAsync,
  getTopicAttachmentsAction,
  getTopicAttachmentsAsync,
  moveTaskToTopicAction,
  moveTaskToTopicAsync,
  pinTaskAction,
  pinTaskAsync,
  refreshAllAction,
  registerQTMUserAction,
  registerQTMUserAsync,
  removeQTMSubTaskBySubTaskIdAction,
  removeQTMSubTaskBySubTaskIdAsync,
  removeQTMTaskByTaskIdAction,
  removeQTMTaskByTaskIdAsync,
  removeSubTaskInQueueForTaskAsync,
  removeTaskFromTopicAction,
  removeTaskFromTopicAsync,
  removeTaskMembersByTaskIdAndMemberIdAction,
  removeTaskMembersByTaskIdAndMemberIdAsync,
  removeTaskPinAction,
  removeTaskPinAsync,
  removeUserTopicAction,
  removeUserTopicAsync,
  requestDEAction,
  requestDEAsync,
  resetQTMState,
  selectedMemberAction,
  selectedMemberAsync,
  selectedSubTaskAction,
  selectedSubTaskAsync,
  selectedTaskAction,
  selectedTaskAsync,
  selectedTopicAction,
  selectedTopicAsync,
  selectedUserTopicAction,
  selectedUserTopicAsync,
  sendChatMessageAction,
  sendChatMessageAsync,
  syncContactsAction,
  syncContactsAsync,
  updateDEAction,
  updateDEAsync,
  updateMemberRoleAction,
  updateMemberRoleAsync,
  updateSubTaskDetailsAction,
  updateSubTaskDetailsAsync,
  updateSubTaskStatusAction,
  updateSubTaskStatusAsync,
  updateTaskDetailsAction,
  updateTaskDetailsAsync,
  updateUserTopicAction,
  updateUserTopicAsync,
};
