import axios from 'axios';
import Contacts from 'react-native-contacts';
import {base_qtm_url, qtmEndPoints} from '../Config/apiEnv';
import {
  IQTMAttachments,
  IQTMChatMessageRequestBody,
  IQTMContacts,
  IQTMContactsUploadType,
  IQTMDERequest,
  IQTMGroupChat,
  IQTMMembers,
  IQTMSubTaskDERequest,
  IQTMSubTaskStatusUpdate,
  IQTMSubTasks,
  IQTMSubTasksRequest,
  IQTMTasksv2,
  IQTMTopics,
  IQTMUpdateDERequest,
  IQTMUser,
  IQTMUserTopics,
  IUploadFile,
  IUploadFileResponse,
} from '../models/IQTM';
import {refreshJWT} from './ApiActions';
import {getTokenPair} from './StorageUtils';

interface ApiOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  data?: any;
  params?: any;
  headers?: any;
}

function serverSecuredCall(options: ApiOptions): Promise<any> {
  return new Promise(function (resolve, reject) {
    let _authToken: any = null;
    let _refreshToken: any = null;

    getTokenPair()
      .then(response => {
        if (response.authToken && response.refreshToken) {
          _authToken = response.authToken;
          _refreshToken = response.refreshToken;
          options.headers = {...options, authorization: _authToken};
          return axios({...options});
        } else {
          reject('Unable to get the token pair');
        }
      })
      .then(apiResponse => {
        resolve(apiResponse);
      })
      .catch(error => {
        if (error?.response?.status == 401) {
          refreshJWT(_refreshToken)
            .then(async () => {
              return serverSecuredCall(options);
            })
            .then(apiResult => {
              resolve(apiResult);
            })
            .catch(error => {
              reject(error);
            });
        } else {
          reject(error);
        }
      });
  });
}

export function registerQTMUser() {
  return new Promise(function (resolve, reject) {
    serverSecuredCall({
      method: 'GET',
      url: base_qtm_url + qtmEndPoints.registerUser,
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function getAllTopics() {
  return new Promise(function (resolve, reject) {
    serverSecuredCall({
      method: 'GET',
      url: base_qtm_url + qtmEndPoints.getTopics,
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function AddNewTopic(data: IQTMTopics) {
  return new Promise(function (resolve, reject) {
    serverSecuredCall({
      method: 'POST',
      url: base_qtm_url + qtmEndPoints.createTopic,
      data,
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function UploadAttachments(
  data: IUploadFile,
): Promise<IUploadFileResponse> {
  return new Promise(function (resolve, reject) {
    serverSecuredCall({
      method: 'POST',
      url: base_qtm_url + qtmEndPoints.uploadFile,
      data,
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function AddNewTask(data: IQTMTasksv2): Promise<IQTMTasksv2> {
  return new Promise(function (resolve, reject) {
    serverSecuredCall({
      method: 'POST',
      url: base_qtm_url + qtmEndPoints.createTask,
      data,
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function getTasksByTopicId(topicId: number) {
  return new Promise(async function (resolve, reject) {
    await serverSecuredCall({
      method: 'GET',
      url: `${base_qtm_url}${qtmEndPoints.getTaskByTopicId}/${topicId}`,
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function syncContacts(contacts: IQTMContactsUploadType[]): Promise<any> {
  return new Promise(async function (resolve, reject) {
    await serverSecuredCall({
      method: 'POST',
      url: base_qtm_url + qtmEndPoints.syncContacts,
      data: {
        contacts: contacts,
      },
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function fetchContacts(): Promise<Contacts.Contact[]> {
  return new Promise(async function (resolve, reject) {
    await Contacts.getAll()
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function getUserContacts(): Promise<IQTMContacts[]> {
  return new Promise(async function (resolve, reject) {
    await serverSecuredCall({
      method: 'GET',
      url: base_qtm_url + qtmEndPoints.getContacts,
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function AddNewSubTask(
  data: IQTMSubTasksRequest,
): Promise<IQTMSubTasksRequest> {
  return new Promise(async function (resolve, reject) {
    await serverSecuredCall({
      method: 'POST',
      url: base_qtm_url + qtmEndPoints.createSubTask,
      data,
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function getSubTasksByTaskId(taskId: number) {
  return new Promise(async function (resolve, reject) {
    await serverSecuredCall({
      method: 'GET',
      url: `${base_qtm_url}${qtmEndPoints.getSubTaskByTaskId}/${taskId}`,
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function getMembersByTaskId(taskId: number): Promise<IQTMMembers[]> {
  return new Promise(async function (resolve, reject) {
    await serverSecuredCall({
      method: 'GET',
      url: `${base_qtm_url}${qtmEndPoints.getMembersByTaskId}/${taskId}`,
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function getSubTasksByMemberIdAndTaskId(
  memberId: number,
  taskId: number,
): Promise<IQTMSubTasks[]> {
  return new Promise(async function (resolve, reject) {
    await serverSecuredCall({
      method: 'GET',
      url:
        base_qtm_url +
        qtmEndPoints.getSubTasksByMemberIdAndTaskId
          .replace('{taskId}', taskId.toString())
          .replace('{userId}', memberId.toString()),
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function updateSubTaskStatus(
  statusData: IQTMSubTaskStatusUpdate,
): Promise<any> {
  return new Promise(async function (resolve, reject) {
    await serverSecuredCall({
      method: 'POST',
      url: base_qtm_url + qtmEndPoints.updateSubTaskStatus,
      data: statusData,
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function getTopicAttachmentCount(topicId: number): Promise<number> {
  return new Promise(async function (resolve, reject) {
    await serverSecuredCall({
      method: 'GET',
      url:
        base_qtm_url +
        qtmEndPoints.topicAttachmentCount.replace(
          '{topicId}',
          topicId.toString(),
        ),
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function getTaskAttachmentCount(taskId: number): Promise<number> {
  return new Promise(async function (resolve, reject) {
    await serverSecuredCall({
      method: 'GET',
      url:
        base_qtm_url +
        qtmEndPoints.taskAttachmentCount.replace('{taskId}', taskId.toString()),
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function getTopicAttachments(
  topicId: number,
): Promise<IQTMAttachments[]> {
  return new Promise(async function (resolve, reject) {
    await serverSecuredCall({
      method: 'GET',
      url:
        base_qtm_url +
        qtmEndPoints.getTopicAttachments.replace(
          '{topicId}',
          topicId.toString(),
        ),
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function getTaskAttachments(taskId: number): Promise<IQTMAttachments[]> {
  return new Promise(async function (resolve, reject) {
    await serverSecuredCall({
      method: 'GET',
      url:
        base_qtm_url +
        qtmEndPoints.getTaskAttachments.replace('{taskId}', taskId.toString()),
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function getSubTaskAttachments(
  subTaskId: number,
): Promise<IQTMAttachments[]> {
  return new Promise(async function (resolve, reject) {
    await serverSecuredCall({
      method: 'GET',
      url:
        base_qtm_url +
        qtmEndPoints.getSubTaskAttachments.replace(
          '{subTaskId}',
          subTaskId.toString(),
        ),
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

// NEW TASKS API :

export function getAllTasksV2(): Promise<IQTMTasksv2[]> {
  return new Promise(function (resolve, reject) {
    serverSecuredCall({
      method: 'GET',
      url: base_qtm_url + qtmEndPoints.getAllTasks,
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function getQTMUserDetails(): Promise<IQTMUser> {
  return new Promise(function (resolve, reject) {
    serverSecuredCall({
      method: 'GET',
      url: base_qtm_url + qtmEndPoints.getUserDetails,
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function getTaskDetailsByTaskId(taskId: number): Promise<IQTMTasksv2> {
  return new Promise(function (resolve, reject) {
    serverSecuredCall({
      method: 'GET',
      url:
        base_qtm_url +
        qtmEndPoints.getTaskDetailsById.replace('{taskId}', taskId.toString()),
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function getSubTaskDetailsBySubTaskId(subTaskId: number) {
  return new Promise(function (resolve, reject) {
    serverSecuredCall({
      method: 'GET',
      url:
        base_qtm_url +
        qtmEndPoints.getSubTaskDetailsById.replace(
          '{subTaskId}',
          subTaskId.toString(),
        ),
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

// ROLE INDUCED ACTIONS :

export function removeQTMTaskByTaskId(taskId: number): Promise<IQTMTasksv2> {
  return new Promise(function (resolve, reject) {
    serverSecuredCall({
      method: 'GET',
      url:
        base_qtm_url +
        qtmEndPoints.removeTask.replace('{taskId}', taskId.toString()),
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function removeQTMSubTaskBySubTaskId(
  subTaskId: number,
): Promise<IQTMSubTasks> {
  return new Promise(function (resolve, reject) {
    serverSecuredCall({
      method: 'GET',
      url:
        base_qtm_url +
        qtmEndPoints.removeSubTask.replace('{subTaskId}', subTaskId.toString()),
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function updateSubTaskDetails(
  subTaskId: number,
  data: IQTMSubTasksRequest,
): Promise<IQTMSubTasksRequest> {
  return new Promise(function (resolve, reject) {
    serverSecuredCall({
      method: 'POST',
      data,
      url:
        base_qtm_url +
        qtmEndPoints.updateSubTask.replace('{subTaskId}', subTaskId.toString()),
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function updateTaskDetails(
  taskId: number,
  data: IQTMTasksv2,
): Promise<IQTMTasksv2> {
  return new Promise(function (resolve, reject) {
    serverSecuredCall({
      method: 'POST',
      data,
      url:
        base_qtm_url +
        qtmEndPoints.updateTask.replace('{taskId}', taskId.toString()),
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function removeTaskMembersByTaskIdAndMemberId(
  taskId: number,
  memberId: number,
): Promise<IQTMMembers> {
  return new Promise(function (resolve, reject) {
    serverSecuredCall({
      method: 'GET',
      url:
        base_qtm_url +
        qtmEndPoints.removeMember
          .replace('{userId}', memberId.toString())
          .replace('{taskId}', taskId.toString()),
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function updateMemberRole(
  taskId: number,
  userId: number,
  role: string,
): Promise<any> {
  return new Promise(function (resolve, reject) {
    serverSecuredCall({
      method: 'POST',
      data: {role},
      url:
        base_qtm_url +
        qtmEndPoints.updateRole
          .replace('{userId}', userId.toString())
          .replace('{taskId}', taskId.toString()),
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function pinTaskToHome(taskId: number): Promise<any> {
  return new Promise(function (resolve, reject) {
    serverSecuredCall({
      method: 'POST',
      data: {
        taskId,
      },
      url:
        base_qtm_url +
        qtmEndPoints.pinTask.replace('{taskId}', taskId.toString()),
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function removeTaskPin(taskId: number): Promise<any> {
  return new Promise(function (resolve, reject) {
    serverSecuredCall({
      method: 'GET',
      url:
        base_qtm_url +
        qtmEndPoints.removeTaskPin.replace('{taskId}', taskId.toString()),
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function createUserTopic(data: IQTMUserTopics): Promise<IQTMUserTopics> {
  return new Promise(function (resolve, reject) {
    serverSecuredCall({
      method: 'POST',
      data,
      url: base_qtm_url + qtmEndPoints.createUserTopic,
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function getUserTopics(): Promise<IQTMUserTopics[]> {
  return new Promise(function (resolve, reject) {
    serverSecuredCall({
      method: 'GET',
      url: base_qtm_url + qtmEndPoints.getUserTopics,
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function updateUserTopic(
  data: IQTMUserTopics,
  topicId: number,
): Promise<IQTMUserTopics> {
  return new Promise(function (resolve, reject) {
    serverSecuredCall({
      method: 'POST',
      data: {
        ...data,
        topicId,
      },
      url: base_qtm_url + qtmEndPoints.updateUserTopic,
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function removeUserTopic(userTopicId: number): Promise<IQTMUserTopics> {
  return new Promise(function (resolve, reject) {
    serverSecuredCall({
      method: 'GET',
      url:
        base_qtm_url +
        qtmEndPoints.deleteUserTopic.replace(
          '{userTopicId}',
          userTopicId.toString(),
        ),
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function moveTaskToTopic(
  userTopicId: number,
  taskId: number,
): Promise<any> {
  return new Promise(function (resolve, reject) {
    serverSecuredCall({
      method: 'POST',
      url: base_qtm_url + qtmEndPoints.moveSingleTask,
      data: {
        topicId: userTopicId,
        taskId,
      },
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function removeTaskFromTopic(
  userTopicId: number,
  taskId: number,
): Promise<IQTMUserTopics> {
  return new Promise(function (resolve, reject) {
    serverSecuredCall({
      method: 'POST',
      url: base_qtm_url + qtmEndPoints.removeSingleTask,
      data: {
        taskId,
        topicId: userTopicId,
      },
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function getTasksFromTopic(userTopicId: number): Promise<IQTMTasksv2[]> {
  return new Promise(function (resolve, reject) {
    serverSecuredCall({
      method: 'GET',
      url:
        base_qtm_url +
        qtmEndPoints.getTaskForUserTopic.replace(
          '{topicId}',
          userTopicId?.toString(),
        ),
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function getChatsForTask(taskId: number): Promise<IQTMGroupChat[]> {
  return new Promise(function (resolve, reject) {
    serverSecuredCall({
      method: 'GET',
      url:
        base_qtm_url +
        qtmEndPoints.getChatMessage.replace('{taskId}', taskId?.toString()),
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function sendChatMessageForTask(
  chatMessage: IQTMChatMessageRequestBody,
  taskId: number,
): Promise<IQTMGroupChat> {
  return new Promise(function (resolve, reject) {
    serverSecuredCall({
      method: 'POST',
      url:
        base_qtm_url +
        qtmEndPoints.sendChatMessage.replace('{taskId}', taskId.toString()),
      data: {
        message: chatMessage.message,
        type: chatMessage.type,
        payload: chatMessage.payload,
      },
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function getQTMChatMessageDetailById(
  messageId: number,
): Promise<IQTMGroupChat> {
  return new Promise(function (resolve, reject) {
    serverSecuredCall({
      method: 'GET',
      url:
        base_qtm_url +
        qtmEndPoints.getMessageDetailsById.replace(
          '{messageId}',
          messageId?.toString(),
        ),
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function getAllDERequests(): Promise<IQTMDERequest[]> {
  return new Promise(function (resolve, reject) {
    serverSecuredCall({
      method: 'GET',
      url: base_qtm_url + qtmEndPoints.getAllDERequests,
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function requestDERequest(
  requestData: IQTMSubTaskDERequest,
): Promise<any> {
  return new Promise(function (resolve, reject) {
    serverSecuredCall({
      method: 'POST',
      data: requestData,
      url: base_qtm_url + qtmEndPoints.requestDateExtension,
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function updateDERequest(data: IQTMUpdateDERequest): Promise<any> {
  return new Promise(function (resolve, reject) {
    serverSecuredCall({
      method: 'POST',
      data,
      url: base_qtm_url + qtmEndPoints.updateDERequest,
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function DeleteQTMUserAccount(): Promise<any> {
  return new Promise(function (resolve, reject) {
    serverSecuredCall({
      method: 'GET',
      url: base_qtm_url + qtmEndPoints.deleteQTMUser,
    })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}
